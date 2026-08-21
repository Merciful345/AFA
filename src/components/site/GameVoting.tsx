"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import type { Side } from "@/lib/bracket";

export default function GameVoting({
  gameId,
  labelA,
  labelB,
  initialPrediction,
}: {
  gameId: string;
  labelA: string;
  labelB: string;
  initialPrediction: Side | null;
}) {
  const [prediction, setPrediction] = useState<Side | null>(initialPrediction);
  const [loading, setLoading] = useState<Side | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function vote(side: Side) {
    setLoading(side);
    setError(null);
    try {
      const res = await fetch("/api/votos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, side }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Algo salió mal");
      setPrediction(side);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {(["a", "b"] as const).map((side) => {
          const label = side === "a" ? labelA : labelB;
          const isPicked = prediction === side;
          return (
            <button
              key={side}
              onClick={() => vote(side)}
              disabled={loading !== null}
              className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
                isPicked ? "bg-accent text-white" : "bg-bg2 text-t2 hover:text-t1"
              }`}
            >
              {loading === side && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPicked && <Check className="h-4 w-4" />}
              {label}
            </button>
          );
        })}
      </div>
      {prediction && <p className="mt-2 text-center text-xs text-t3">Tu predicción quedó guardada.</p>}
      {error && <p className="mt-2 text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
