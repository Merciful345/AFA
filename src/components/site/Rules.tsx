import { formatArs } from "@/lib/prizes";

export default function Rules({ fee }: { fee: number }) {
  const steps = [
    {
      title: "Inscribite",
      text: `Pagás tu entrada (${formatArs(fee)}) y quedás anotado en el bracket del torneo.`,
    },
    {
      title: "El día del evento",
      text: "Se arma el cuadro de enfrentamientos: duelos de a uno, cara a cara.",
    },
    {
      title: "Mostrás tu aura",
      text: "Cada duelo es en vivo — bailás, posás, hacés lo tuyo. Sin libreto, sin ensayo.",
    },
    {
      title: "El público decide",
      text: "La reacción de la gente en el momento define quién avanza a la siguiente ronda.",
    },
    {
      title: "Rondas eliminatorias",
      text: "Así, duelo tras duelo, hasta que quedan los dos finalistas.",
    },
    {
      title: "Gran final",
      text: "Un ganador, un segundo puesto. Los dos se llevan premio.",
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
