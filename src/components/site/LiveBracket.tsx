import Link from "next/link";
import { Radio, Play } from "lucide-react";
import MatchCard from "./MatchCard";
import { videoPublicUrl, type MatchWithGames, type Game } from "@/lib/bracket";

function name(info: { full_name: string; apodo: string | null } | null) {
  if (!info) return "Bye";
  return info.apodo || info.full_name;
}

function findFeatured(rounds: Record<number, MatchWithGames[]>): { match: MatchWithGames; game: Game } | null {
  const allMatches = Object.values(rounds).flat();

  // Preferimos un juego con votación abierta (con al menos un video) —
  // eso es lo más "mirá esto ahora" que hay. Si no hay, el último cerrado
  // con video, para no mostrar nunca una sección vacía.
  const voting = allMatches
    .flatMap((match) => match.games.map((game) => ({ match, game })))
    .find(({ game }) => game.status === "voting" && (game.video_a_path || game.video_b_path));
  if (voting) return voting;

  const closed = allMatches
    .flatMap((match) => match.games.map((game) => ({ match, game })))
    .filter(({ game }) => game.status === "closed" && (game.video_a_path || game.video_b_path))
    .sort((a, b) => (a.game.created_at < b.game.created_at ? 1 : -1))[0];
  return closed ?? null;
}

export default function LiveBracket({ rounds }: { rounds: Record<number, MatchWithGames[]> }) {
  const roundNumbers = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);
  const latestRound = roundNumbers.at(-1);
  const matches = latestRound ? rounds[latestRound].slice(0, 4) : [];
  const featured = findFeatured(rounds);

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

        {featured && (
          <Link
            href={`/torneo/partido/${featured.match.id}`}
            className="mx-auto mt-12 block max-w-2xl overflow-hidden rounded-2xl border border-accent/30 bg-bg1 transition-colors hover:border-accent/60"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <p className="text-sm font-semibold text-t1">
                {name(featured.match.participantAInfo)} vs {name(featured.match.participantBInfo)}
              </p>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                  featured.game.status === "voting" ? "bg-accent/15 text-accent" : "bg-t3/15 text-t3"
                }`}
              >
                {featured.game.status === "voting" ? "Votación abierta" : "Definido"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-border">
              {[featured.game.video_a_path, featured.game.video_b_path].map((path, i) => {
                const url = videoPublicUrl(path);
                return (
                  <div key={i} className="relative flex aspect-video items-center justify-center bg-bg2">
                    {url ? (
                      <video src={url} preload="metadata" muted playsInline className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs text-t4">Sin video</span>
                    )}
                    {url && (
                      <span className="absolute inset-0 flex items-center justify-center bg-bg0/20">
                        <Play className="h-8 w-8 fill-white text-white drop-shadow" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="px-5 py-3 text-center text-sm font-semibold text-accent">
              {featured.game.status === "voting" ? "Mirar y votar →" : "Ver el resultado →"}
            </p>
          </Link>
        )}

        {matches.length > 0 && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
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
