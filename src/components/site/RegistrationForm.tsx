"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

export default function RegistrationForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/inscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: data.get("full_name"),
          apodo: data.get("apodo"),
          dni: data.get("dni"),
          phone: data.get("phone"),
          instagram: data.get("instagram"),
          email: data.get("email"),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Algo salió mal");

      window.location.href = json.init_point;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Algo salió mal");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium text-t2">
          Nombre completo
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          maxLength={120}
          className="w-full rounded-xl border border-border2 bg-bg2 px-4 py-3 text-t1 outline-none transition-colors placeholder:text-t4 focus:border-accent"
          placeholder="Como te llamás"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dni" className="mb-1.5 block text-sm font-medium text-t2">
            DNI
          </label>
          <input
            id="dni"
            name="dni"
            type="text"
            inputMode="numeric"
            required
            maxLength={20}
            className="w-full rounded-xl border border-border2 bg-bg2 px-4 py-3 text-t1 outline-none transition-colors placeholder:text-t4 focus:border-accent"
            placeholder="Ej: 40123456"
          />
        </div>
        <div>
          <label htmlFor="apodo" className="mb-1.5 block text-sm font-medium text-t2">
            Apodo <span className="text-t4">(opcional)</span>
          </label>
          <input
            id="apodo"
            name="apodo"
            type="text"
            maxLength={60}
            className="w-full rounded-xl border border-border2 bg-bg2 px-4 py-3 text-t1 outline-none transition-colors placeholder:text-t4 focus:border-accent"
            placeholder="Como te van a anunciar"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-t2">
          WhatsApp
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          maxLength={40}
          className="w-full rounded-xl border border-border2 bg-bg2 px-4 py-3 text-t1 outline-none transition-colors placeholder:text-t4 focus:border-accent"
          placeholder="Ej: 381 5 555555"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-t2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={160}
            className="w-full rounded-xl border border-border2 bg-bg2 px-4 py-3 text-t1 outline-none transition-colors placeholder:text-t4 focus:border-accent"
            placeholder="vos@ejemplo.com"
          />
        </div>
        <div>
          <label htmlFor="instagram" className="mb-1.5 block text-sm font-medium text-t2">
            Instagram <span className="text-t4">(opcional)</span>
          </label>
          <input
            id="instagram"
            name="instagram"
            type="text"
            maxLength={60}
            className="w-full rounded-xl border border-border2 bg-bg2 px-4 py-3 text-t1 outline-none transition-colors placeholder:text-t4 focus:border-accent"
            placeholder="@tu_usuario"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-bg0 transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "submitting" ? "Redirigiendo a Mercado Pago…" : "Pagar inscripción — $3.000"}
      </button>

      <p className="text-center text-xs text-t4">
        Vas a pagar de forma segura con Mercado Pago. Fecha y lugar del evento
        se avisan por Instagram una vez confirmados.
      </p>
    </form>
  );
}
