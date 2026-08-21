import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function StatusPage({
  icon: Icon,
  iconClassName,
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
      <Image src="/afa-logo.png" alt="AFA" width={88} height={88} className="mb-8 h-22 w-22" />
      <div className={`mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full ${iconClassName}`}>
        <Icon className="h-8 w-8" />
      </div>
      <h1 className="font-display text-2xl font-bold text-t1 sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-md text-t2">{text}</p>
      {children}
      <Link
        href="/"
        className="mt-8 rounded-full border border-border2 px-6 py-3 text-sm font-semibold text-t2 transition-colors hover:border-accent hover:text-accent"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
