"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEXTOS, type Idioma } from "@/lib/acuerdo-textos";

// Aceptación del acuerdo. El cliente escribe su nombre y su correo y marca la casilla;
// al enviar, queda registrado con la fecha y hora del servidor, su correo y su IP. Esa
// evidencia de consentimiento es la que sustituye a la firma de puño y letra (ley E-SIGN
// y UETA de Florida).
//
// Escribe a través de /api/acuerdo (nunca directo a n8n: el secreto vive en el servidor).
//
// ⚠️ Los textos salen de lib/acuerdo-textos.ts, no escritos aquí: si el cliente está
// leyendo el contrato en inglés, un formulario en español lo deja a medio traducir —
// justo debajo del botón más importante del negocio.

/** Correo con forma de correo. No valida que exista — eso lo dice el rebote. */
const correoValido = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function AcuerdoAceptar({
  token,
  clinica,
  idioma = "es",
}: {
  token: string;
  clinica: string;
  idioma?: Idioma;
}) {
  const t = TEXTOS[idioma] ?? TEXTOS.es;
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [leido, setLeido] = useState(false);
  const [estado, setEstado] = useState<"idle" | "enviando" | "error">("idle");

  const listo =
    nombre.trim().length >= 3 && correoValido(correo) && leido && estado !== "enviando";

  const aceptar = async () => {
    if (!listo) return;
    setEstado("enviando");
    try {
      const res = await fetch("/api/acuerdo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          nombre: nombre.trim(),
          correo: correo.trim(),
          // El idioma en que lo leyó y aceptó: es el que se le manda por correo.
          idioma,
        }),
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
        <p className="text-sm font-light text-mocha">{t.ui.paraAceptar}</p>
      </div>

      <div className="border-t border-sand/40 pt-3">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder={t.ui.tuNombre}
          autoComplete="name"
          className="w-full rounded-xl border border-sand/25 bg-sand/5 px-4 py-3 text-sand outline-none transition-colors placeholder:text-mocha/50 focus:border-clay"
        />
        <p className="mt-2 text-sm font-light text-mocha">{clinica}</p>

        {/* El correo es a DÓNDE le llega su copia en PDF. Antes no se pedía, y el
            cliente aceptaba y no recibía nada: se quedaba con un link secreto y ya.
            De paso, el correo es lo que ata la aceptación a una persona. */}
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder={t.ui.tuCorreo}
          autoComplete="email"
          inputMode="email"
          className="mt-3 w-full rounded-xl border border-sand/25 bg-sand/5 px-4 py-3 text-sand outline-none transition-colors placeholder:text-mocha/50 focus:border-clay"
        />
        <p className="mt-2 text-xs font-light text-mocha/60">{t.ui.correoNota}</p>

        <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm font-light text-mocha">
          <input
            type="checkbox"
            checked={leido}
            onChange={(e) => setLeido(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-clay"
          />
          <span>{t.ui.leiTodo}</span>
        </label>

        <button
          type="button"
          onClick={aceptar}
          disabled={!listo}
          className="mt-5 w-full rounded-full bg-clay px-6 py-3.5 font-semibold text-obsidian transition-colors hover:bg-clay-bright disabled:cursor-not-allowed disabled:bg-sand/15 disabled:text-mocha/60"
        >
          {estado === "enviando" ? t.ui.registrando : t.ui.aceptar}
        </button>

        {estado === "error" && (
          <p className="mt-3 text-sm font-light text-clay">⚠️ {t.ui.errorAceptar}</p>
        )}

        <p className="mt-4 text-xs font-light leading-relaxed text-mocha/60">{t.ui.notaFinal}</p>
      </div>
    </div>
  );
}
