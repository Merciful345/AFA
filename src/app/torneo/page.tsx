import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import MatchCard from "@/components/site/MatchCard";
import { getAllRounds } from "@/lib/bracket";

export const dynamic = "force-dynamic";

export default async function TorneoPage() {
  const rounds = await getAllRounds();
  const roundNumbers = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-t1 sm:text-4xl">El bracket</h1>
        <p className="mt-3 text-t2">Seguí los cruces en vivo — entrá a cada uno para ver los videos y votar.</p>

        {roundNumbers.length === 0 && (
          <p className="mt-10 text-t3">Todavía no se generó el bracket.</p>
        )}

        {roundNumbers.map((round) => (
          <section key={round} className="mt-10">
            <h2 className="font-display mb-4 text-lg font-semibold text-t1">Ronda {round}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {rounds[round].map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
