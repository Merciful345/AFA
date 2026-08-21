import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import { getLeaderboard } from "@/lib/voters";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const voters = await getLeaderboard(50);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-xl px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-t1 sm:text-4xl">Ranking de aura</h1>
        <p className="mt-3 text-t2">Los que más aciertan quiénes ganan cada juego.</p>

        {voters.length === 0 ? (
          <p className="mt-10 text-t3">Todavía nadie sumó puntos.</p>
        ) : (
          <ol className="mt-8 space-y-2">
            {voters.map((v, i) => (
              <li
                key={`${v.name}-${i}`}
                className="flex items-center justify-between rounded-lg border border-border bg-bg1 px-4 py-3"
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 text-sm font-semibold text-t3">{i + 1}</span>
                  <span className="text-t1">{v.name}</span>
                </span>
                <span className="font-display font-bold text-accent">{v.points} pts</span>
              </li>
            ))}
          </ol>
        )}
      </main>
      <Footer />
    </>
  );
}
