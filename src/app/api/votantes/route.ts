import { findVoterByEmail, createVoter, verifyPassword, clientIp, VoterLimitError } from "@/lib/voters";
import { createVoterSessionCookieValue, VOTER_COOKIE_NAME, VOTER_COOKIE_MAX_AGE } from "@/lib/voterSession";

function clean(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = clean(body?.name, 80);
  const email = clean(body?.email, 160);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return Response.json({ error: "Nombre, email y contraseña son obligatorios" }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: "La contraseña tiene que tener al menos 6 caracteres" }, { status: 400 });
  }

  let voter = await findVoterByEmail(email);

  if (voter) {
    if (!verifyPassword(password, voter.password_hash)) {
      return Response.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }
  } else {
    try {
      voter = await createVoter({ name, email, password, ip: clientIp(request) });
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
