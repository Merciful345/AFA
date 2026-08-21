import crypto from "node:crypto";

export const VOTER_COOKIE_NAME = "afa_voter_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 días

function sign(payload: string): string {
  return crypto.createHmac("sha256", process.env.VOTER_SESSION_SECRET!).update(payload).digest("hex");
}

export function createVoterSessionCookieValue(voterId: string): string {
  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const payload = `${voterId}.${issuedAt}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyVoterSessionCookie(value: string | undefined): string | null {
  if (!value) return null;
  const [voterId, issuedAt, sig] = value.split(".");
  if (!voterId || !issuedAt || !sig) return null;

  const payload = `${voterId}.${issuedAt}`;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    return null;
  }

  const age = Math.floor(Date.now() / 1000) - Number(issuedAt);
  if (age < 0 || age >= MAX_AGE_SECONDS) return null;

  return voterId;
}

export const VOTER_COOKIE_MAX_AGE = MAX_AGE_SECONDS;
