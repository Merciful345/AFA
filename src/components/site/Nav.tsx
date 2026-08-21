import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import NavAccountWidget from "./NavAccountWidget";
import { verifyVoterSessionCookie, VOTER_COOKIE_NAME } from "@/lib/voterSession";
import { findVoterById } from "@/lib/voters";

const anchorLinks = [
  { href: "/#que-es", label: "Qué es" },
  { href: "/#reglas", label: "Cómo se juega" },
  { href: "/#premios", label: "Premios" },
];

const pageLinks = [
  { href: "/torneo", label: "Torneo" },
  { href: "/ranking", label: "Ranking" },
];

export default async function Nav() {
  const cookieStore = await cookies();
  const voterId = verifyVoterSessionCookie(cookieStore.get(VOTER_COOKIE_NAME)?.value);
  const voter = voterId ? await findVoterById(voterId) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg0/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/#top" className="flex items-center gap-3">
          <Image src="/afa-logo.png" alt="AFA" width={40} height={40} className="h-10 w-10" priority />
          <span className="font-display text-lg font-semibold tracking-wide text-t1">
            AFA
          </span>
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {anchorLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-t2 transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          {pageLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-t2 transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <NavAccountWidget voter={voter ? { name: voter.name, points: voter.points } : null} />
          <Link
            href="/#inscripcion"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-bg0 transition-colors hover:bg-accent-hover"
          >
            Inscribirme
          </Link>
        </div>
      </div>
    </header>
  );
}
