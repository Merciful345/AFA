import RegistrationForm from "./RegistrationForm";
import { formatArs } from "@/lib/prizes";

export default function Registration({ fee }: { fee: number }) {
  return (
    <section id="inscripcion" className="border-t border-border bg-bg1/60">
      <div className="mx-auto max-w-lg px-6 py-20 sm:py-28">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-t1 sm:text-4xl">
            Inscribite
          </h2>
          <p className="mt-4 text-t2">
            Tu lugar en el bracket por{" "}
            <span className="font-semibold text-accent">{formatArs(fee)}</span>.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-bg2 p-6 sm:p-8">
          <RegistrationForm fee={fee} />
        </div>
      </div>
    </section>
  );
}
