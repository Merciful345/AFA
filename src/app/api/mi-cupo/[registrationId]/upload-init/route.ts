import { supabaseAdmin } from "@/lib/supabase";
import { buildVideoPath, createUploadTarget, extForContentType } from "@/lib/storage";

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

  const { data: registration, error: regError } = await supabaseAdmin
    .from("registrations")
    .select("id, status")
    .eq("id", registrationId)
    .maybeSingle();
  if (regError) throw regError;
  if (!registration || registration.status !== "paid") {
    return Response.json({ error: "No encontramos ese cupo" }, { status: 404 });
  }

  const { data: game, error: gameError } = await supabaseAdmin
    .from("games")
    .select("id, status, match_id, matches!inner(participant_a, participant_b)")
    .eq("id", gameId)
    .maybeSingle();
  if (gameError) throw gameError;

  const match = game?.matches as unknown as { participant_a: string; participant_b: string | null } | undefined;
  const isParticipant = match && (match.participant_a === registrationId || match.participant_b === registrationId);

  if (!game || !isParticipant) {
    return Response.json({ error: "No encontramos ese cupo" }, { status: 404 });
  }
  if (game.status !== "submitting") {
    return Response.json({ error: "Este juego no está abierto para subir video" }, { status: 409 });
  }

  const path = buildVideoPath(game.match_id, gameId, registrationId, ext);
  const target = await createUploadTarget(path);

  return Response.json(target);
}
