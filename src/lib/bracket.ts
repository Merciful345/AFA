import { supabaseAdmin } from "./supabase";

export type MatchStatus = "pending" | "in_progress" | "complete" | "bye";
export type GameStatus = "pending" | "submitting" | "voting" | "closed";
export type Side = "a" | "b";

export interface Match {
  id: string;
  round: number;
  slot: number;
  participant_a: string;
  participant_b: string | null;
  winner_id: string | null;
  status: MatchStatus;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  match_id: string;
  game_number: 1 | 2 | 3;
  status: GameStatus;
  video_a_path: string | null;
  video_b_path: string | null;
  votes_a: number;
  votes_b: number;
  winner_side: Side | null;
  voting_opened_at: string | null;
  voting_closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParticipantInfo {
  id: string;
  full_name: string;
  apodo: string | null;
}

export interface MatchWithGames extends Match {
  games: Game[];
  participantAInfo: ParticipantInfo | null;
  participantBInfo: ParticipantInfo | null;
}

export function videoPublicUrl(path: string | null): string | null {
  if (!path) return null;
  const { data } = supabaseAdmin.storage.from("match-videos").getPublicUrl(path);
  return data.publicUrl;
}

export async function getAllRounds(): Promise<Record<number, MatchWithGames[]>> {
  const { data: matches, error } = await supabaseAdmin
    .from("matches")
    .select("*")
    .order("round", { ascending: true })
    .order("slot", { ascending: true });
  if (error) throw error;

  const matchIds = (matches ?? []).map((m) => m.id);
  const participantIds = Array.from(
    new Set((matches ?? []).flatMap((m) => [m.participant_a, m.participant_b]).filter(Boolean)),
  ) as string[];

  const [{ data: games, error: gamesError }, { data: participants, error: participantsError }] =
    await Promise.all([
      matchIds.length
        ? supabaseAdmin.from("games").select("*").in("match_id", matchIds).order("game_number")
        : Promise.resolve({ data: [] as Game[], error: null }),
      participantIds.length
        ? supabaseAdmin.from("registrations").select("id, full_name, apodo").in("id", participantIds)
        : Promise.resolve({ data: [] as ParticipantInfo[], error: null }),
    ]);
  if (gamesError) throw gamesError;
  if (participantsError) throw participantsError;

  const participantsById = new Map((participants ?? []).map((p) => [p.id, p]));
  const gamesByMatch = new Map<string, Game[]>();
  for (const g of games ?? []) {
    const list = gamesByMatch.get(g.match_id) ?? [];
    list.push(g);
    gamesByMatch.set(g.match_id, list);
  }

  const rounds: Record<number, MatchWithGames[]> = {};
  for (const m of matches ?? []) {
    const withExtras: MatchWithGames = {
      ...m,
      games: gamesByMatch.get(m.id) ?? [],
      participantAInfo: participantsById.get(m.participant_a) ?? null,
      participantBInfo: m.participant_b ? (participantsById.get(m.participant_b) ?? null) : null,
    };
    rounds[m.round] = [...(rounds[m.round] ?? []), withExtras];
  }
  return rounds;
}

export async function getMatchWithGames(matchId: string): Promise<MatchWithGames | null> {
  const { data: match, error } = await supabaseAdmin.from("matches").select("*").eq("id", matchId).maybeSingle();
  if (error) throw error;
  if (!match) return null;

  const participantIds = [match.participant_a, match.participant_b].filter(Boolean) as string[];
  const [{ data: games, error: gamesError }, { data: participants, error: participantsError }] = await Promise.all([
    supabaseAdmin.from("games").select("*").eq("match_id", matchId).order("game_number"),
    supabaseAdmin.from("registrations").select("id, full_name, apodo").in("id", participantIds),
  ]);
  if (gamesError) throw gamesError;
  if (participantsError) throw participantsError;

  const participantsById = new Map((participants ?? []).map((p) => [p.id, p]));

  return {
    ...match,
    games: games ?? [],
    participantAInfo: participantsById.get(match.participant_a) ?? null,
    participantBInfo: match.participant_b ? (participantsById.get(match.participant_b) ?? null) : null,
  };
}

/** El match activo (no completo) donde este inscripto es participante A o B, si existe. */
export async function getActiveMatchForRegistration(registrationId: string): Promise<MatchWithGames | null> {
  const { data, error } = await supabaseAdmin
    .from("matches")
    .select("*")
    .or(`participant_a.eq.${registrationId},participant_b.eq.${registrationId}`)
    .neq("status", "complete")
    .order("round", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return getMatchWithGames(data.id);
}

export function currentOpenGame(match: MatchWithGames): Game | null {
  return match.games.find((g) => g.status === "submitting" || g.status === "voting") ?? null;
}

/** Predicciones de este votante para varios juegos a la vez (una sola query, para no await-ear adentro de un map). */
export async function getPredictionsForVoter(gameIds: string[], voterId: string): Promise<Map<string, Side>> {
  if (gameIds.length === 0) return new Map();
  const { data, error } = await supabaseAdmin
    .from("predictions")
    .select("game_id, predicted_side")
    .eq("voter_id", voterId)
    .in("game_id", gameIds);
  if (error) throw error;
  return new Map((data ?? []).map((p) => [p.game_id, p.predicted_side as Side]));
}

/** Todos los matches de este inscripto, ronda más reciente primero. */
export async function getMatchesForRegistration(registrationId: string): Promise<MatchWithGames[]> {
  const { data, error } = await supabaseAdmin
    .from("matches")
    .select("id")
    .or(`participant_a.eq.${registrationId},participant_b.eq.${registrationId}`)
    .order("round", { ascending: false });
  if (error) throw error;

  const matches = await Promise.all((data ?? []).map((m) => getMatchWithGames(m.id)));
  return matches.filter((m): m is MatchWithGames => m !== null);
}
