import { redeemReward } from "@/lib/rewards";
import { verifyVoterSessionCookie, VOTER_COOKIE_NAME } from "@/lib/voterSession";

function getCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  const match = header.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return match?.slice(name.length + 1);
}

export async function POST(request: Request, { params }: { params: Promise<{ rewardId: string }> }) {
  const { rewardId } = await params;
  const voterId = verifyVoterSessionCookie(getCookie(request, VOTER_COOKIE_NAME));
  if (!voterId) {
    return Response.json({ error: "Tenés que iniciar sesión para canjear" }, { status: 401 });
  }

  try {
    await redeemReward(voterId, rewardId);
    return Response.json({ ok: true });
  } catch (err) {
    // El RPC lanza errores de Postgres (objetos planos con .message, no
    // instancias de Error) — los leemos igual para mostrar el motivo real
    // ("Sin stock", "No tenés puntos suficientes") en vez de un genérico.
    const message =
      err && typeof err === "object" && "message" in err && typeof err.message === "string"
        ? err.message
        : "No se pudo canjear";
    return Response.json({ error: message }, { status: 400 });
  }
}
