import { supabaseAdmin } from "@/lib/supabase";
import { buildVideoPath, extForContentType } from "@/lib/storage";

export async function POST(request: Request, { params }: { params: Promise<{ registrationId: string }> }) {
  const { registrationId } = await params;
  const body = await request.json().catch(() => null);
  const gameId = typeof body?.gameId === "string" ? body.gameId : null;
  const contentType = typeof body?.contentType === "string" ? body.contentType : null;

  if (!gameId || !contentType) {
    return Response.json({ error: "Body inválido" }, { status: 400 });
  }

  const ext = extForContentType(contentType);
  if (!ext) {
    return Response.json({ error: "Formato de video no soportado" }, { status: 400 });
  }

  const { data: game, error: gameError } = await supabaseAdmin
    .from("games")
    .select("id, status, match_id, video_a_path, video_b_path, matches!inner(participant_a, participant_b)")
    .eq("id", gameId)
    .maybeSingle();
  if (gameError) throw gameError;

  const match = game?.matches as unknown as { participant_a: string; participant_b: string | null } | undefined;
  if (!game || !match) {
    return Response.json({ error: "No encontramos ese cupo" }, { status: 404 });
  }

  const side = match.participant_a === registrationId ? "a" : match.participant_b === registrationId ? "b" : null;
  if (!side) {
    return Response.json({ error: "No encontramos ese cupo" }, { status: 404 });
  }

  // Recalculamos el path nosotros — nunca confiamos en lo que mande el
  // cliente sobre dónde quedó subido el archivo.
  const expectedPath = buildVideoPath(game.match_id, gameId, registrationId, ext);

  const { error: updateError } = await supabaseAdmin
    .from("games")
    .update(side === "a" ? { video_a_path: expectedPath } : { video_b_path: expectedPath })
    .eq("id", gameId);
  if (updateError) throw updateError;

  return Response.json({ ok: true });
}
