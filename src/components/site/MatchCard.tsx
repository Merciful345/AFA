import Link from "next/link";
import type { MatchWithGames } from "@/lib/bracket";

function name(info: { full_name: string; apodo: string | null } | null) {
  if (!info) return "Bye";
  return info.apodo || info.full_name;
}

const statusLabel: Record<MatchWithGames["status"], string> = {
  pending: "Esperando videos",
  in_progress: "En juego",
  complete: "Definido",
  bye: "Bye",
};

export default function MatchCard({ match }: { match: MatchWithGames }) {
  const winsA = match.games.filter((g) => g.status === "closed" && g.winner_side === "a").length;
  const winsB = match.games.filter((g) => g.status === "closed" && g.winner_side === "b").length;

  return (
    <Link
      href={`/torneo/partido/${match.id}`}
      className="block rounded-xl border border-border bg-bg1 p-4 transition-colors hover:border-accent/40"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-t3">{statusLabel[match.status]}</p>
      <div className="flex items-center justify-between text-sm">
        <span className={match.winner_id === match.participant_a ? "font-bold text-accent" : "text-t1"}>
          {name(match.participantAInfo)}
        </span>
        <span className="text-t3">{winsA}–{winsB}</span>
        <span className={match.winner_id === match.participant_b ? "font-bold text-accent" : "text-t1"}>
          {name(match.participantBInfo)}
        </span>
      </div>
    </Link>
  );
}
