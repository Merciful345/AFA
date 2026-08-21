import { findVoterByEmail, createVoter, clientIp, VoterLimitError } from "@/lib/voters";
import { createVoterSessionCookieValue, VOTER_COOKIE_NAME, VOTER_COOKIE_MAX_AGE } from "@/lib/voterSession";

function clean(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = clean(body?.name, 80);
  const email = clean(body?.email, 160);

  if (!name || !email) {
    return Response.json({ error: "Nombre y email son obligatorios" }, { status: 400 });
  }

  let voter = await findVoterByEmail(email);

  if (!voter) {
    try {
      voter = await createVoter({ name, email, ip: clientIp(request) });
    } catch (err) {
      if (err instanceof VoterLimitError) {
        return Response.json({ error: err.message }, { status: 429 });
      }
      throw err;
    }
  }

  const response = Response.json({ id: voter.id, name: voter.name, points: voter.points });
  response.headers.append(
    "Set-Cookie",
    `${VOTER_COOKIE_NAME}=${createVoterSessionCookieValue(voter.id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${VOTER_COOKIE_MAX_AGE}${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  );
  return response;
}
