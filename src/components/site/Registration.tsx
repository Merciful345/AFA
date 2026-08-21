import { ShieldCheck, Video, ThumbsUp } from "lucide-react";
import RegistrationForm from "./RegistrationForm";
import { formatArs } from "@/lib/prizes";

const nextSteps = [
  { icon: ShieldCheck, text: "Pagás y quedás anotado en el bracket." },
  { icon: Video, text: "Te avisamos por WhatsApp cuándo y contra quién te toca — subís tu video ahí." },
  { icon: ThumbsUp, text: "El público vota. Si avanzás, repetís hasta la gran final." },
];

export default function Registration({ fee, paidCount }: { fee: number; paidCount: number }) {
  return (
    <section id="inscripcion" className="border-t border-border bg-bg1/60">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_420px] lg:items-start">
          <div>
            <h2 className="font-display text-3xl font-bold text-t1 sm:text-4xl">Inscribite</h2>
            <p className="mt-4 text-t2">
              Tu lugar en el bracket por{" "}
              <span className="font-semibold text-accent">{formatArs(fee)}</span>.
            </p>

            {paidCount > 0 && (
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-t3">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                {paidCount} {paidCount === 1 ? "persona ya se anotó" : "personas ya se anotaron"}
              </p>
            )}

            <ol className="mt-10 space-y-5">
              {nextSteps.map((step) => (
                <li key={step.text} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent">
                    <step.icon className="h-4 w-4" />
                  </span>
                  <p className="pt-1.5 text-sm text-t2">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-border bg-bg2 p-6 sm:p-8">
            <RegistrationForm fee={fee} />
          </div>
        </div>
      </div>
    </section>
  );
}
