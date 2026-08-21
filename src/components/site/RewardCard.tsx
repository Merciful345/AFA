"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Gift } from "lucide-react";

export interface RewardWithImage {
  id: string;
  name: string;
  description: string | null;
  point_cost: number;
  stock: number;
  imageUrl: string | null;
}

export default function RewardCard({
  reward,
  voterPoints,
}: {
  reward: RewardWithImage;
  voterPoints: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAfford = voterPoints >= reward.point_cost;
  const inStock = reward.stock > 0;

  async function handleRedeem() {
    if (!confirm(`¿Canjear ${reward.point_cost} puntos por "${reward.name}"?`)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/premios/${reward.id}/canjear`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo canjear");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg1">
      <div className="flex aspect-video items-center justify-center bg-bg2">
        {reward.imageUrl ? (
          <Image
            src={reward.imageUrl}
            alt={reward.name}
            width={400}
            height={225}
            className="h-full w-full object-cover"
          />
        ) : (
          <Gift className="h-8 w-8 text-t4" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-t1">{reward.name}</h3>
        {reward.description && <p className="mt-1 text-xs text-t3">{reward.description}</p>}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-accent">{reward.point_cost} pts</span>
          <span className="text-xs text-t4">{inStock ? `${reward.stock} disponibles` : "Sin stock"}</span>
        </div>

        {error && <p className="mt-2 text-xs text-danger">{error}</p>}

        <button
          onClick={handleRedeem}
          disabled={loading || !canAfford || !inStock}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!inStock ? "Sin stock" : !canAfford ? "Puntos insuficientes" : "Canjear"}
        </button>
      </div>
    </div>
  );
}
