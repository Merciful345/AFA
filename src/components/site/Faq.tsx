import { Plus } from "lucide-react";

const items = [
  {
    q: "¿Cómo subo mi video?",
    a: "Cuando te toca jugar te avisamos por WhatsApp con tu link personal (\"mi cupo\"). Ahí ves contra quién te toca y subís el video de esa ronda.",
  },
  {
    q: "¿Quién decide quién gana cada cruce?",
    a: "El público vota. Cada cruce se juega a mejor de 2 videos — si queda 1-1, hay un video extra de desempate.",
  },
  {
    q: "¿Qué pasa si mi rival no sube su video?",
    a: "Se resuelve a favor de quien sí cumplió con el plazo, para que el bracket no quede trabado esperando.",
  },
  {
    q: "¿Puedo participar sin competir?",
    a: "Sí. Te registrás gratis como votante, predecís quién gana cada juego, y sumás puntos de aura que después canjeás por premios.",
  },
  {
    q: "¿Cuándo arranca el torneo?",
    a: "La fecha todavía está a confirmar — te avisamos por Instagram (@afa.tucuman) apenas cierre la inscripción.",
  },
];

export default function Faq() {
  return (
    <section className="border-t border-border bg-bg1/60">
      <div className="mx-auto max-w-2xl px-6 py-20 sm:py-28">
        <h2 className="font-display text-center text-3xl font-bold text-t1 sm:text-4xl">
          Preguntas frecuentes
        </h2>

        <div className="mt-10 space-y-3">
          {items.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-border bg-bg1 px-5 py-4 open:border-accent/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-t1">
                {item.q}
                <Plus className="h-4 w-4 shrink-0 text-accent transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-t3">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
