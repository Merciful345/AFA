import { supabaseAdmin } from "@/lib/supabase";
import { verifyVoterSessionCookie, VOTER_COOKIE_NAME } from "@/lib/voterSession";

function getCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  const match = header.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return match?.slice(name.length + 1);
}

export async function POST(request: Request) {
  const voterId = verifyVoterSessionCookie(getCookie(request, VOTER_COOKIE_NAME));
  if (!voterId) {
    return Response.json({ error: "Tenés que registrarte para votar" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const gameId = typeof body?.gameId === "string" ? body.gameId : null;
  const side = body?.side === "a" || body?.side === "b" ? body.side : null;

  if (!gameId || !side) {
    return Response.json({ error: "Body inválido" }, { status: 400 });
  }

  const { data: game, error: gameError } = await supabaseAdmin
    .from("games")
    .select("id, status")
    .eq("id", gameId)
    .maybeSingle();
  if (gameError) throw gameError;
  if (!game) {
    return Response.json({ error: "No encontramos ese juego" }, { status: 404 });
  }
  if (game.status !== "voting") {
    return Response.json({ error: "La votación de este juego no está abierta" }, { status: 409 });
  }

  const { error: upsertError } = await supabaseAdmin
    .from("predictions")
    .upsert({ game_id: gameId, voter_id: voterId, predicted_side: side }, { onConflict: "game_id,voter_id" });
  if (upsertError) throw upsertError;

  return Response.json({ ok: true });
}
