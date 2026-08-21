import { VOTER_COOKIE_NAME } from "@/lib/voterSession";

export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.append("Set-Cookie", `${VOTER_COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`);
  return response;
}
