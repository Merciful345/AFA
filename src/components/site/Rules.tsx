import { formatArs } from "@/lib/prizes";

export default function Rules({ fee }: { fee: number }) {
  const steps = [
    {
      title: "Inscribite",
      text: `Pagás tu entrada (${formatArs(fee)}) y quedás anotado en el bracket del torneo.`,
    },
    {
      title: "Te toca un rival",
      text: "Se arma el bracket y te emparejan 1 contra 1 con otro farmeador.",
    },
    {
      title: "Subís tu video",
      text: "Grabás tu aura y lo subís en tu página personal antes de que cierre la ronda.",
    },
    {
      title: "El público vota",
      text: "La gente mira los dos videos del cruce y vota quién tiene más aura.",
    },
    {
      title: "Mejor de 2",
      text: "Ganás el cruce si te llevás 2 juegos. Si queda 1-1, hay un video extra de desempate.",
    },
    {
      title: "Gran final",
      text: "Así, cruce tras cruce, hasta los dos finalistas. Un ganador, un segundo puesto — los dos se llevan premio.",
    },
  ];

  return (
    <section id="reglas" className="border-y border-border bg-bg1/60">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-t1 sm:text-4xl">
            Cómo se juega
          </h2>
          <p className="mt-4 text-t2">
            Simple, directo, sin vueltas. Así se define quién tiene más aura.
          </p>
        </div>

        <ol className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/50 text-sm font-bold text-accent">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-t1">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-t3">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
