import Image from "next/image";
import { Calendar, MapPin, Sparkles } from "lucide-react";
import { REGISTRATION_FEE_ARS, formatArs } from "@/lib/prizes";

export default function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden">
      <div
        className="glow-blob animate-drift -top-20 -left-32 h-96 w-96 bg-accent/20"
        aria-hidden="true"
      />
      <div
        className="glow-blob animate-drift-slow top-40 -right-32 h-[28rem] w-[28rem] bg-aura/25"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pt-20 pb-24 text-center sm:pt-28 sm:pb-32">
        <Image
          src="/afa-logo.png"
          alt="Escudo de la Asociación de Farmeadores de Aura"
          width={176}
          height={176}
          priority
          className="mb-8 h-36 w-36 sm:h-44 sm:w-44"
        />

        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border2 bg-bg2 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          Torneo presencial
        </span>

        <h1 className="font-display text-4xl font-bold leading-[1.1] text-t1 sm:text-6xl">
          Farmeá aura.
          <br />
          <span className="text-gradient-accent">Ganá en vivo.</span>
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base text-t2 sm:text-lg">
          El torneo donde tu presencia, tu flow y tu aura se ponen a prueba
          frente al público. Rondas eliminatorias, el público decide, y los
          dos mejores se llevan el pozo.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="#inscripcion"
            className="animate-pulse-ring rounded-full bg-accent px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-bg0 transition-colors hover:bg-accent-hover"
          >
            Inscribirme — {formatArs(REGISTRATION_FEE_ARS)}
          </a>
          <a
            href="#reglas"
            className="rounded-full border border-border2 px-8 py-3.5 text-sm font-semibold text-t2 transition-colors hover:border-accent hover:text-accent"
          >
            Ver cómo se juega
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-t3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg1 px-3 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-accent" />
            Fecha: a confirmar
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg1 px-3 py-1.5">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            Lugar: a confirmar
          </span>
        </div>
      </div>
    </section>
  );
}
