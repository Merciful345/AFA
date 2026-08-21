import { cookies } from "next/headers";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import VoterAuthWidget from "@/components/site/VoterAuthWidget";
import RewardCard from "@/components/site/RewardCard";
import { verifyVoterSessionCookie, VOTER_COOKIE_NAME } from "@/lib/voterSession";
import { findVoterById } from "@/lib/voters";
import { getActiveRewards, getVoterRedemptions, getVoterPredictionHistory, rewardImageUrl } from "@/lib/rewards";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const cookieStore = await cookies();
  const voterId = verifyVoterSessionCookie(cookieStore.get(VOTER_COOKIE_NAME)?.value);
  const voter = voterId ? await findVoterById(voterId) : null;

  if (!voter) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-sm px-6 py-24">
          <h1 className="mb-6 text-center font-display text-2xl font-bold text-t1">Iniciá sesión</h1>
          <VoterAuthWidget />
        </main>
        <Footer />
      </>
    );
  }

  const [rewards, redemptions, predictions] = await Promise.all([
    getActiveRewards(),
    getVoterRedemptions(voter.id),
    getVoterPredictionHistory(voter.id),
  ]);

  const correctCount = predictions.filter((p) => p.correct === true).length;
  const decidedCount = predictions.filter((p) => p.correct !== null).length;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Mi perfil</p>
        <h1 className="font-display mt-1 text-3xl font-bold text-t1">{voter.name}</h1>
        <p className="mt-1 text-sm text-t3">{voter.email}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-bg1 p-4 text-center">
            <p className="font-display text-3xl font-bold text-accent">{voter.points}</p>
            <p className="text-xs text-t3">Puntos de aura</p>
          </div>
          <div className="rounded-xl border border-border bg-bg1 p-4 text-center">
            <p className="font-display text-3xl font-bold text-t1">{correctCount}</p>
            <p className="text-xs text-t3">Predicciones acertadas</p>
          </div>
          <div className="rounded-xl border border-border bg-bg1 p-4 text-center">
            <p className="font-display text-3xl font-bold text-t1">{decidedCount}</p>
            <p className="text-xs text-t3">Total definidas</p>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="font-display mb-4 text-xl font-bold text-t1">Premios</h2>
          {rewards.length === 0 ? (
            <p className="text-sm text-t3">Todavía no hay premios cargados.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {rewards.map((r) => (
                <RewardCard
                  key={r.id}
                  reward={{ ...r, imageUrl: rewardImageUrl(r.image_path) }}
                  voterPoints={voter.points}
                />
              ))}
            </div>
          )}
        </section>

        {redemptions.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display mb-4 text-xl font-bold text-t1">Mis canjes</h2>
            <ul className="space-y-2">
              {redemptions.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-bg1 px-4 py-3 text-sm"
                >
                  <span className="text-t1">{r.reward_name}</span>
                  <span className="flex items-center gap-3">
                    <span className="text-t3">{r.points_spent} pts</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                        r.status === "delivered" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      }`}
                    >
                      {r.status === "delivered" ? "Entregado" : "Pendiente"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-14">
          <h2 className="font-display mb-4 text-xl font-bold text-t1">Mis predicciones</h2>
          {predictions.length === 0 ? (
            <p className="text-sm text-t3">Todavía no votaste en ningún juego.</p>
          ) : (
            <ul className="space-y-2">
              {predictions.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-bg1 px-4 py-3 text-sm"
                >
                  <span className="text-t2">
                    Ronda {p.matchRound}, juego {p.gameNumber}: {p.labelA} vs {p.labelB} — elegiste{" "}
                    <span className="font-semibold text-t1">
                      {p.predicted_side === "a" ? p.labelA : p.labelB}
                    </span>
                  </span>
                  {p.correct === null ? (
                    <span className="shrink-0 rounded-md bg-t3/10 px-2 py-0.5 text-xs font-semibold text-t3">
                      Sin definir
                    </span>
                  ) : p.correct ? (
                    <span className="shrink-0 rounded-md bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                      +{p.points_awarded} pts
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-md bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">
                      Fallaste
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
