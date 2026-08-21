import { supabaseAdmin } from "./supabase";

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  image_path: string | null;
  point_cost: number;
  stock: number;
  active: boolean;
}

export interface Redemption {
  id: string;
  reward_name: string;
  points_spent: number;
  status: "pending" | "delivered";
  created_at: string;
}

export interface PredictionHistoryEntry {
  id: string;
  predicted_side: "a" | "b";
  correct: boolean | null;
  points_awarded: number;
  created_at: string;
  gameNumber: number;
  gameStatus: string;
  matchRound: number;
  labelA: string;
  labelB: string;
}

export function rewardImageUrl(path: string | null): string | null {
  if (!path) return null;
  const { data } = supabaseAdmin.storage.from("reward-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function getActiveRewards(): Promise<Reward[]> {
  const { data, error } = await supabaseAdmin
    .from("rewards")
    .select("*")
    .eq("active", true)
    .order("point_cost", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getVoterRedemptions(voterId: string): Promise<Redemption[]> {
  const { data, error } = await supabaseAdmin
    .from("redemptions")
    .select("id, reward_name, points_spent, status, created_at")
    .eq("voter_id", voterId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function redeemReward(voterId: string, rewardId: string): Promise<void> {
  const { error } = await supabaseAdmin.rpc("redeem_reward", { p_voter_id: voterId, p_reward_id: rewardId });
  if (error) throw error;
}

export async function getVoterPredictionHistory(voterId: string): Promise<PredictionHistoryEntry[]> {
  const { data: predictions, error } = await supabaseAdmin
    .from("predictions")
    .select("id, predicted_side, correct, points_awarded, created_at, game_id")
    .eq("voter_id", voterId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!predictions || predictions.length === 0) return [];

  const gameIds = predictions.map((p) => p.game_id);
  const { data: games, error: gamesError } = await supabaseAdmin
    .from("games")
    .select("id, game_number, status, match_id")
    .in("id", gameIds);
  if (gamesError) throw gamesError;

  const matchIds = Array.from(new Set((games ?? []).map((g) => g.match_id)));
  const { data: matches, error: matchesError } = await supabaseAdmin
    .from("matches")
    .select("id, round, participant_a, participant_b")
    .in("id", matchIds);
  if (matchesError) throw matchesError;

  const participantIds = Array.from(
    new Set((matches ?? []).flatMap((m) => [m.participant_a, m.participant_b]).filter(Boolean)),
  ) as string[];
  const { data: participants, error: participantsError } = await supabaseAdmin
    .from("registrations")
    .select("id, full_name, apodo")
    .in("id", participantIds);
  if (participantsError) throw participantsError;

  const participantsById = new Map((participants ?? []).map((p) => [p.id, p.apodo || p.full_name]));
  const matchesById = new Map((matches ?? []).map((m) => [m.id, m]));
  const gamesById = new Map((games ?? []).map((g) => [g.id, g]));

  return predictions.map((p) => {
    const game = gamesById.get(p.game_id);
    const match = game ? matchesById.get(game.match_id) : null;
    return {
      id: p.id,
      predicted_side: p.predicted_side,
      correct: p.correct,
      points_awarded: p.points_awarded,
      created_at: p.created_at,
      gameNumber: game?.game_number ?? 0,
      gameStatus: game?.status ?? "pending",
      matchRound: match?.round ?? 0,
      labelA: match ? (participantsById.get(match.participant_a) ?? "?") : "?",
      labelB: match?.participant_b ? (participantsById.get(match.participant_b) ?? "?") : "Bye",
    };
  });
}
