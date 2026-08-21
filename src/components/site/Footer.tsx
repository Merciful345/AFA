import Image from "next/image";
import { AtSign, Calendar, Globe2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex flex-col items-center gap-5 text-center">
        <Image src="/afa-logo.png" alt="AFA" width={56} height={56} className="h-14 w-14" />

        <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-t3">
          Enfoque · Disciplina · Aura
        </p>

        <a
          href="https://instagram.com/afa.tucuman"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-t2 transition-colors hover:text-accent"
        >
          <AtSign className="h-4 w-4" />
          @afa.tucuman
        </a>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-t4">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Fecha: a confirmar
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Globe2 className="h-3.5 w-3.5" />
            Torneo 100% virtual
          </span>
        </div>

        <p className="text-xs text-t4">
          © {new Date().getFullYear()} AFA — Asociación de Farmeadores de Aura
        </p>
      </div>
    </footer>
  );
}
