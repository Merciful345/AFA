import { Users, Swords, MicVocal } from "lucide-react";

const cards = [
  {
    icon: Users,
    title: "Presencial",
    text: "Nada de rankings ni pantallas. Todo pasa cara a cara, frente a la gente, el día del evento.",
  },
  {
    icon: Swords,
    title: "Por rondas",
    text: "Eliminación directa. Cada duelo tiene un ganador que avanza, hasta llegar a la gran final.",
  },
  {
    icon: MicVocal,
    title: "El público manda",
    text: "Vos mostrás tu aura. La reacción de la gente en el momento decide quién sigue en el bracket.",
  },
];

export default function About() {
  return (
    <section id="que-es" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold text-t1 sm:text-4xl">
          ¿Qué es esto?
        </h2>
        <p className="mt-4 text-t2">
          AFA es la asociación que le pone reglas a algo que todos hacemos sin
          darnos cuenta: farmear aura. Este es el torneo donde eso se
          convierte en una competencia real — con inscripción, rondas,
          público y premio en plata.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {cards.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-bg1 p-6 transition-colors hover:border-accent/40"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent-light text-accent">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold text-t1">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-t3">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
