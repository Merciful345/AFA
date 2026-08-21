import Link from "next/link";
import Image from "next/image";
import { Trophy, Gift } from "lucide-react";
import type { Reward } from "@/lib/rewards";

export default function VoterCta({
  rewards,
  topVoters,
}: {
  rewards: (Reward & { imageUrl: string | null })[];
  topVoters: { name: string; points: number }[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold text-t1 sm:text-4xl">
          ¿No vas a competir? <span className="text-gradient-accent">Votá y ganá igual.</span>
        </h2>
        <p className="mt-4 text-t2">
          Te registrás gratis, predecís quién gana cada juego, y sumás puntos
          de aura que después canjeás por premios reales.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_320px]">
        {rewards.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {rewards.slice(0, 3).map((r) => (
              <div key={r.id} className="overflow-hidden rounded-xl border border-border bg-bg1">
                <div className="flex aspect-square items-center justify-center bg-bg2">
                  {r.imageUrl ? (
                    <Image src={r.imageUrl} alt={r.name} width={200} height={200} className="h-full w-full object-cover" />
                  ) : (
                    <Gift className="h-7 w-7 text-t4" />
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-t1">{r.name}</p>
                  <p className="text-xs font-semibold text-accent">{r.point_cost} pts</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border2 p-10 text-center text-sm text-t3">
            Los premios canjeables se van a ir cargando acá.
          </div>
        )}

        <div className="rounded-xl border border-border bg-bg1 p-5">
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-t1">
            <Trophy className="h-4 w-4 text-accent" />
            Top del ranking
          </p>
          {topVoters.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {topVoters.map((v, i) => (
                <li key={`${v.name}-${i}`} className="flex items-center justify-between text-sm">
                  <span className="text-t2">
                    {i + 1}. {v.name}
                  </span>
                  <span className="font-semibold text-accent">{v.points} pts</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-t3">Todavía nadie sumó puntos.</p>
          )}
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/perfil"
          className="rounded-full bg-accent px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-bg0 transition-colors hover:bg-accent-hover"
        >
          Registrarme para votar
        </Link>
      </div>
    </section>
  );
}
