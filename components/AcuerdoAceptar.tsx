"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Aceptación del acuerdo. El cliente escribe su nombre y marca la casilla; al enviar,
// queda registrado con la fecha y hora del servidor. Esa evidencia de consentimiento
// es la que sustituye a la firma de puño y letra.
//
// Escribe a través de /api/acuerdo (nunca directo a n8n: el secreto vive en el servidor).

export function AcuerdoAceptar({ token, clinica }: { token: string; clinica: string }) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [leido, setLeido] = useState(false);
  const [estado, setEstado] = useState<"idle" | "enviando" | "error">("idle");

  const listo = nombre.trim().length >= 3 && leido && estado !== "enviando";

  const aceptar = async () => {
    if (!listo) return;
    setEstado("enviando");
    try {
      const res = await fetch("/api/acuerdo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nombre: nombre.trim() }),
      });
      if (!res.ok) throw new Error("fail");
      // El sello lo pinta el servidor con lo que quedó guardado, no el navegador.
      router.refresh();
    } catch {
      setEstado("error");
    }
  };

  return (
    <div>
      <div className="flex h-20 items-end pb-2">
        <p className="text-sm font-light text-mocha">
          Para aceptar, escribe tu nombre completo:
        </p>
      </div>

      <div className="border-t border-sand/40 pt-3">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre completo"
          autoComplete="name"
          className="w-full rounded-xl border border-sand/25 bg-sand/5 px-4 py-3 text-sand outline-none transition-colors placeholder:text-mocha/50 focus:border-clay"
        />
        <p className="mt-2 text-sm font-light text-mocha">{clinica}</p>

        <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm font-light text-mocha">
          <input
            type="checkbox"
            checked={leido}
            onChange={(e) => setLeido(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-clay"
          />
          <span>Leí el acuerdo completo y estoy de acuerdo con lo que dice.</span>
        </label>

        <button
          type="button"
          onClick={aceptar}
          disabled={!listo}
          className="mt-5 w-full rounded-full bg-clay px-6 py-3.5 font-semibold text-obsidian transition-colors hover:bg-clay-bright disabled:cursor-not-allowed disabled:bg-sand/15 disabled:text-mocha/60"
        >
          {estado === "enviando" ? "Registrando…" : "Acepto el acuerdo"}
        </button>

        {estado === "error" && (
          <p className="mt-3 text-sm font-light text-clay">
            ⚠️ No se pudo registrar. Revisa tu internet e inténtalo otra vez — si sigue
            fallando, escríbenos por WhatsApp y lo resolvemos.
          </p>
        )}

        <p className="mt-4 text-xs font-light leading-relaxed text-mocha/60">
          Al aceptar queda registrada la fecha y la hora. No te compromete a pagar en ese
          momento: el anticipo lo haces cuando tú decidas arrancar.
        </p>
      </div>
    </div>
  );
}
