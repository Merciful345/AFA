import { cookies } from "next/headers";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import VoterAuthWidget from "@/components/site/VoterAuthWidget";
import GameVoting from "@/components/site/GameVoting";
import { getMatchWithGames, getPredictionsForVoter, videoPublicUrl, type Game } from "@/lib/bracket";
import { verifyVoterSessionCookie, VOTER_COOKIE_NAME } from "@/lib/voterSession";

export const dynamic = "force-dynamic";

function name(info: { full_name: string; apodo: string | null } | null) {
  if (!info) return "Bye";
  return info.apodo || info.full_name;
}

export default async function PartidoPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const match = await getMatchWithGames(matchId);

  if (!match) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="font-display text-2xl font-bold text-t1">No encontramos ese cruce</h1>
        </main>
        <Footer />
      </>
    );
  }

  const cookieStore = await cookies();
  const voterId = verifyVoterSessionCookie(cookieStore.get(VOTER_COOKIE_NAME)?.value);
  const predictions = voterId
    ? await getPredictionsForVoter(
        match.games.map((g) => g.id),
        voterId,
      )
    : new Map();

  const labelA = name(match.participantAInfo);
  const labelB = name(match.participantBInfo);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-2xl font-bold text-t1 sm:text-3xl">
          {labelA} vs {labelB}
        </h1>
        <p className="mt-2 text-sm text-t3">Ronda {match.round}</p>

        <div className="mt-10 space-y-8">
          {match.games.map((game) => (
            <GameBlock
              key={game.id}
              game={game}
              labelA={labelA}
              labelB={labelB}
              voterId={voterId}
              existingPrediction={predictions.get(game.id) ?? null}
            />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

function GameBlock({
  game,
  labelA,
  labelB,
  voterId,
  existingPrediction,
}: {
  game: Game;
  labelA: string;
  labelB: string;
  voterId: string | null;
  existingPrediction: "a" | "b" | null;
}) {
  const videoA = videoPublicUrl(game.video_a_path);
  const videoB = videoPublicUrl(game.video_b_path);

  return (
    <div className="rounded-xl border border-border bg-bg1 p-5">
      <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-t3">
        Juego {game.game_number}
        {game.status === "closed" && ` — ganó ${game.winner_side === "a" ? labelA : labelB}`}
      </p>

      {game.status === "pending" && <p className="text-t3">Todavía no se abrió este juego.</p>}

      {(game.status === "submitting" || game.status === "voting" || game.status === "closed") && (
        <div className="grid gap-4 sm:grid-cols-2">
          <VideoSlot url={videoA} label={labelA} />
          <VideoSlot url={videoB} label={labelB} />
        </div>
      )}

      {game.status === "voting" &&
        (voterId ? (
          <div className="mt-5">
            <GameVoting gameId={game.id} labelA={labelA} labelB={labelB} initialPrediction={existingPrediction} />
          </div>
        ) : (
          <div className="mt-5">
            <VoterAuthWidget />
          </div>
        ))}

      {game.status === "closed" && (
        <p className="mt-4 text-sm text-t3">
          Votos: {labelA} {game.votes_a} — {game.votes_b} {labelB}
        </p>
      )}
    </div>
  );
}

function VideoSlot({ url, label }: { url: string | null; label: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-t3">{label}</p>
      {url ? (
        <video src={url} controls className="aspect-video w-full rounded-lg bg-bg2" />
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-lg bg-bg2 text-xs text-t4">
          Esperando video
        </div>
      )}
    </div>
  );
}
