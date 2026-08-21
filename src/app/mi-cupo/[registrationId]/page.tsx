import Link from "next/link";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import UploadPanel from "@/components/mi-cupo/UploadPanel";
import { getRegistrationById } from "@/lib/supabase";
import { getMatchesForRegistration, currentOpenGame, type MatchWithGames } from "@/lib/bracket";

export const dynamic = "force-dynamic";

function opponentName(match: MatchWithGames, registrationId: string) {
  const isA = match.participant_a === registrationId;
  const opponent = isA ? match.participantBInfo : match.participantAInfo;
  if (!opponent) return "bye (pasás directo)";
  return opponent.apodo || opponent.full_name;
}

function NotFound() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-t1">No encontramos ese cupo</h1>
        <p className="mt-3 text-t2">Revisá el link que te pasamos, o escribinos si creés que es un error.</p>
      </main>
      <Footer />
    </>
  );
}

export default async function MiCupoPage({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  const { registrationId } = await params;
  const registration = await getRegistrationById(registrationId);

  if (!registration || registration.status !== "paid") {
    return <NotFound />;
  }

  const matches = await getMatchesForRegistration(registrationId);
  const current = matches[0] ?? null;
  const history = matches.slice(1);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Tu cupo</p>
        <h1 className="font-display mt-1 text-3xl font-bold text-t1">{registration.full_name}</h1>

        {!current && (
          <div className="mt-8 rounded-xl border border-border bg-bg1 p-6 text-t2">
            Todavía no se armó el cruce. Te avisamos por WhatsApp apenas te toque jugar.
          </div>
        )}

        {current && current.status === "bye" && (
          <div className="mt-8 rounded-xl border border-success/30 bg-success/10 p-6 text-t1">
            Esta ronda te tocó pasar directo (bye) — no hace falta que subas nada. Esperá el aviso para la próxima
            ronda.
          </div>
        )}

        {current && current.status === "complete" && (
          <div
            className={`mt-8 rounded-xl border p-6 ${
              current.winner_id === registrationId
                ? "border-success/30 bg-success/10 text-t1"
                : "border-border bg-bg1 text-t2"
            }`}
          >
            {current.winner_id === registrationId
              ? `Ganaste tu cruce contra ${opponentName(current, registrationId)}. Esperá el aviso para la próxima ronda.`
              : `Tu participación en el torneo terminó — perdiste el cruce contra ${opponentName(current, registrationId)}. ¡Gracias por farmear!`}
          </div>
        )}

        {current && (current.status === "pending" || current.status === "in_progress") && (
          <div className="mt-8 space-y-4">
            <p className="text-t2">
              Cruce contra <span className="font-semibold text-t1">{opponentName(current, registrationId)}</span>
            </p>
            <CurrentGamePanel match={current} registrationId={registrationId} />
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-12 border-t border-border pt-6">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-t3">Rondas anteriores</p>
            <ul className="space-y-2 text-sm text-t3">
              {history.map((m) => (
                <li key={m.id}>
                  Ronda {m.round}: {m.winner_id === registrationId ? "ganaste" : "perdiste"} contra{" "}
                  {opponentName(m, registrationId)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-10 text-xs text-t4">
          Podés seguir el bracket completo en{" "}
          <Link href="/torneo" className="text-accent hover:underline">
            /torneo
          </Link>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}

function CurrentGamePanel({ match, registrationId }: { match: MatchWithGames; registrationId: string }) {
  const game = currentOpenGame(match);

  if (!game) {
    return (
      <div className="rounded-xl border border-border bg-bg1 p-5 text-t2">
        Esperando a que se abra la subida de video para este juego.
      </div>
    );
  }

  const isA = match.participant_a === registrationId;
  const myPath = isA ? game.video_a_path : game.video_b_path;

  if (game.status === "voting") {
    return (
      <div className="rounded-xl border border-border bg-bg1 p-5 text-t2">
        La votación del juego {game.game_number} ya está abierta.{" "}
        <Link href={`/torneo/partido/${match.id}`} className="text-accent hover:underline">
          Mirá el partido acá
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-t2">Juego {game.game_number} — subí tu video</p>
      {myPath ? (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          Ya subiste tu video para este juego. Esperando a tu rival.
        </div>
      ) : (
        <UploadPanel
          registrationId={registrationId}
          gameId={game.id}
          gameNumber={game.game_number}
          alreadyUploaded={false}
        />
      )}
    </div>
  );
}
