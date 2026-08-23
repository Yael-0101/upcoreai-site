"use client";

// ============================================================================
// DEMO DE VOZ — el visitante habla por el micrófono con el asistente.
// El costo se controla en /api/demo-voz (tope mensual + límite por visitante);
// aquí solo cuidamos la experiencia: permisos claros, estado visible y colgar.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { paginas } from "@/lib/paginas-textos";
import type { Idioma } from "@/lib/idioma";

type Estado = "listo" | "conectando" | "hablando" | "terminada" | "error";

type Props = {
  /** Nombre de la firma que dirá el asistente (viene de ?c= en la página) */
  clinica?: string;
  /** El giro del nicho (ver lib/nicho.json) */
  giro?: string;
  /** El idioma de la INTERFAZ. El asistente sigue hablando en español: es el
   *  producto que se está enseñando. */
  idioma?: Idioma;
};

export function DemoVoz({ clinica, giro, idioma = "es" }: Props) {
  const t = paginas(idioma).demoVoz;
  const [estado, setEstado] = useState<Estado>("listo");
  const [mensaje, setMensaje] = useState<string>("");
  const [segundos, setSegundos] = useState(0);
  const clienteRef = useRef<{ stopCall: () => void } | null>(null);

  // Contador de duración mientras la llamada está activa
  useEffect(() => {
    if (estado !== "hablando") return;
    const t = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [estado]);

  // Cortar la llamada si el usuario se va de la página (no dejar el micro abierto)
  useEffect(() => {
    return () => {
      try {
        clienteRef.current?.stopCall();
      } catch {
        /* ya estaba cerrada */
      }
    };
  }, []);

  const colgar = useCallback(() => {
    try {
      clienteRef.current?.stopCall();
    } catch {
      /* ya estaba cerrada */
    }
    setEstado("terminada");
  }, []);

  const llamar = useCallback(async () => {
    setEstado("conectando");
    setMensaje("");
    setSegundos(0);
    try {
      const r = await fetch("/api/demo-voz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinica, giro }),
      });
      const data = await r.json();

      if (!r.ok || !data.accessToken) {
        setEstado("error");
        setMensaje(data?.motivo || t.errorInicio);
        return;
      }

      // El SDK se carga solo aquí para no pesarle a quien no usa la demo
      const { RetellWebClient } = await import("retell-client-js-sdk");
      const cliente = new RetellWebClient();
      clienteRef.current = cliente;

      cliente.on("call_started", () => setEstado("hablando"));
      cliente.on("call_ended", () => setEstado("terminada"));
      cliente.on("error", () => {
        setEstado("error");
        setMensaje(t.errorCorte);
        try {
          cliente.stopCall();
        } catch {
          /* ya estaba cerrada */
        }
      });

      await cliente.startCall({ accessToken: data.accessToken });
    } catch {
      setEstado("error");
      setMensaje(t.errorMicro);
    }
  }, [clinica, giro, t]);

  const mmss = `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(
    segundos % 60
  ).padStart(2, "0")}`;

  return (
    <div className="card-soft rounded-2xl p-7 sm:p-8">
      <div className="flex items-start gap-4">
        <div
          className={`relative mt-1 grid h-12 w-12 shrink-0 place-items-center rounded-full transition-colors ${
            estado === "hablando" ? "bg-emerald-500/20" : "bg-[rgba(242,231,219,0.08)]"
          }`}
        >
          <span className="text-2xl" aria-hidden>
            📞
          </span>
          {estado === "hablando" && (
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-sand">{t.titulo}</h3>
          <p className="mt-1 text-sm font-light leading-relaxed text-mocha">{t.intro}</p>

          <AnimatePresence mode="wait">
            {estado === "hablando" && (
              <motion.div
                key="activa"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-3 text-sm"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 font-medium text-emerald-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  {t.enLlamada} {mmss}
                </span>
                <span className="text-mocha">{t.hablaNormal}</span>
              </motion.div>
            )}

            {estado === "terminada" && (
              <motion.p
                key="fin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm font-light text-mocha"
              >
                {t.terminada}
              </motion.p>
            )}

            {estado === "error" && (
              <motion.p
                key="err"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm text-amber-300/90"
              >
                {mensaje}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {estado === "hablando" ? (
              <button
                onClick={colgar}
                className="rounded-full border border-[rgba(242,231,219,0.25)] px-6 py-3 text-sm font-semibold text-sand transition-colors hover:border-clay hover:text-clay-bright"
              >
                {t.colgar}
              </button>
            ) : (
              <button
                onClick={llamar}
                disabled={estado === "conectando"}
                className="rounded-full btn-shine bg-clay px-6 py-3 text-sm font-semibold text-obsidian transition-all duration-300 hover:scale-[1.03] hover:bg-clay-bright disabled:opacity-60"
              >
                {estado === "conectando"
                  ? t.conectando
                  : estado === "terminada" || estado === "error"
                  ? t.otraVez
                  : t.llamar}
              </button>
            )}
            <span className="text-xs text-mocha">{t.limite}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
