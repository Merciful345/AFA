"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRound, LogOut } from "lucide-react";
import VoterAuthWidget from "./VoterAuthWidget";

export default function NavAccountWidget({
  voter,
}: {
  voter: { name: string; points: number } | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/votantes/logout", { method: "POST" });
    router.refresh();
  }

  if (voter) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Link href="/perfil" className="hidden text-t2 transition-colors hover:text-accent sm:inline">
          <span className="font-semibold text-t1">{voter.name}</span> · {voter.points} pts
        </Link>
        <button
          onClick={handleLogout}
          title="Salir"
          className="rounded-full p-1.5 text-t3 transition-colors hover:text-accent"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-border2 px-3 py-1.5 text-sm font-medium text-t2 transition-colors hover:border-accent hover:text-accent"
      >
        <UserRound className="h-4 w-4" />
        Registrarme para votar
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-72">
            <VoterAuthWidget />
          </div>
        </>
      )}
    </div>
  );
}
