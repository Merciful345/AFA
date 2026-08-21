import { Trophy, Medal } from "lucide-react";
import { formatArs } from "@/lib/prizes";

export default function Prizes({
  paidCount,
  first,
  second,
  secondPlaceEnabled,
}: {
  paidCount: number;
  first: number;
  second: number;
  secondPlaceEnabled: boolean;
}) {
  return (
    <section id="premios" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold text-t1 sm:text-4xl">
          Premios
        </h2>
        <p className="mt-4 text-t2">
          El pozo crece con cada inscripción confirmada. Estos son los montos
          en este momento.
        </p>
      </div>

      <div className={`mt-12 grid gap-6 ${secondPlaceEnabled ? "sm:grid-cols-2" : "mx-auto max-w-sm"}`}>
        <div className="rounded-2xl border border-accent/40 bg-gradient-to-b from-accent-light to-transparent p-8 text-center">
          <Trophy className="mx-auto h-9 w-9 text-accent" />
          <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-t3">
            1er puesto
          </p>
          <p className="text-gradient-accent font-display mt-2 text-4xl font-bold sm:text-5xl">
            {formatArs(first)}
          </p>
        </div>

        {secondPlaceEnabled && (
          <div className="rounded-2xl border border-aura/30 bg-gradient-to-b from-aura-light to-transparent p-8 text-center">
            <Medal className="mx-auto h-9 w-9 text-aura-hover" />
            <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-t3">
              2do puesto
            </p>
            <p className="text-gradient-aura font-display mt-2 text-4xl font-bold sm:text-5xl">
              {formatArs(second)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 text-center">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-t2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          {paidCount} {paidCount === 1 ? "farmeador confirmado" : "farmeadores confirmados"}
        </span>
        <p className="max-w-md text-xs text-t4">
          Los montos se actualizan con cada inscripción paga. El número final
          queda fijo cuando cierre la inscripción.
        </p>
      </div>
    </section>
  );
}
