"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_SIZE_BYTES = 200 * 1024 * 1024;

export default function UploadPanel({
  registrationId,
  gameId,
  gameNumber,
  alreadyUploaded,
}: {
  registrationId: string;
  gameId: string;
  gameNumber: number;
  alreadyUploaded: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    alreadyUploaded ? "done" : "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Formato no soportado. Subí un .mp4, .mov o .webm.");
      setStatus("error");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("El video no puede pesar más de 200MB.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setError(null);

    try {
      const initRes = await fetch(`/api/mi-cupo/${registrationId}/upload-init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, contentType: file.type }),
      });
      const init = await initRes.json();
      if (!initRes.ok) throw new Error(init.error || "No se pudo iniciar la subida");

      const { error: uploadError } = await supabaseBrowser.storage
        .from("match-videos")
        .uploadToSignedUrl(init.path, init.token, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const confirmRes = await fetch(`/api/mi-cupo/${registrationId}/confirm-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, contentType: file.type }),
      });
      const confirm = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirm.error || "No se pudo confirmar la subida");

      setStatus("done");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Algo salió mal");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Video del juego {gameNumber} subido. Ya podés cerrar esta página.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border2 bg-bg2 p-5">
      <label
        htmlFor={`video-${gameId}`}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border2 px-4 py-8 text-center transition-colors hover:border-accent"
      >
        {status === "uploading" ? (
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        ) : (
          <UploadCloud className="h-6 w-6 text-t3" />
        )}
        <span className="text-sm font-medium text-t2">
          {status === "uploading" ? "Subiendo…" : "Tocá para elegir tu video"}
        </span>
        <span className="text-xs text-t4">mp4, mov o webm — hasta 200MB</span>
        <input
          id={`video-${gameId}`}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          disabled={status === "uploading"}
          onChange={handleFile}
          className="hidden"
        />
      </label>

      {error && (
        <p className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}
    </div>
  );
}
