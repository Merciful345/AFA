"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function VoterAuthWidget() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/votantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Algo salió mal");

      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Algo salió mal");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-bg1 p-5">
      <p className="mb-1 text-sm font-semibold text-t1">Registrate o entrá para votar</p>
      <p className="mb-4 text-xs text-t3">Predecí quién gana y sumá puntos de aura si acertás.</p>

      <div className="space-y-3">
        <input
          type="text"
          required
          maxLength={80}
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border2 bg-bg2 px-3 py-2 text-sm text-t1 outline-none focus:border-accent"
        />
        <input
          type="email"
          required
          maxLength={160}
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border2 bg-bg2 px-3 py-2 text-sm text-t1 outline-none focus:border-accent"
        />
        <input
          type="password"
          required
          minLength={6}
          maxLength={100}
          placeholder="Contraseña (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border2 bg-bg2 px-3 py-2 text-sm text-t1 outline-none focus:border-accent"
        />
      </div>

      {error && <p className="mt-3 text-xs text-danger">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {status === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
        Entrar
      </button>
      <p className="mt-3 text-center text-[11px] text-t4">
        Primera vez: se crea tu cuenta. Si ya te registraste, poné la misma contraseña para entrar.
      </p>
    </form>
  );
}
