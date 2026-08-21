import { supabaseAdmin } from "./supabase";

const BUCKET = "match-videos";

const EXT_BY_CONTENT_TYPE: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

export function extForContentType(contentType: string): string | null {
  return EXT_BY_CONTENT_TYPE[contentType] ?? null;
}

export function buildVideoPath(matchId: string, gameId: string, registrationId: string, ext: string): string {
  return `matches/${matchId}/${gameId}/${registrationId}.${ext}`;
}

export async function createUploadTarget(path: string) {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path, { upsert: true });
  if (error) throw error;
  return { path: data.path, token: data.token };
}
