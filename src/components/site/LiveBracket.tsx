import Link from "next/link";
import { Radio } from "lucide-react";
import MatchCard from "./MatchCard";
import type { MatchWithGames } from "@/lib/bracket";

export default function LiveBracket({ rounds }: { rounds: Record<number, MatchWithGames[]> }) {
  const roundNumbers = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);
  const latestRound = roundNumbers.at(-1);
  const matches = latestRound ? rounds[latestRound].slice(0, 4) : [];

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border2 bg-bg2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <Radio className="h-3.5 w-3.5" />
            En vivo
          </span>
          <h2 className="font-display text-3xl font-bold text-t1 sm:text-4xl">
            {latestRound ? `Ronda ${latestRound}` : "El bracket arranca pronto"}
          </h2>
          <p className="mt-4 text-t2">
            {latestRound
              ? "Mirá los cruces, vení a ver los videos y votá quién tiene más aura."
              : "En cuanto cierre la inscripción se arma el primer cruce. Anotate para no quedar afuera."}
          </p>
        </div>

        {matches.length > 0 && (
          <div className="mt-12 grid gap-3 sm:grid-cols-2">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/torneo"
            className="rounded-full border border-border2 px-8 py-3 text-sm font-semibold text-t2 transition-colors hover:border-accent hover:text-accent"
          >
            {latestRound ? "Ver el bracket completo" : "Ver el torneo"}
          </Link>
        </div>
      </div>
    </section>
  );
}
