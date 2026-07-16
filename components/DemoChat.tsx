"use client";

// Chat de demostración del agente, estilo WhatsApp, dentro de un marco de teléfono.
// El visitante juega a ser el PACIENTE. El saludo se genera local (cero costo);
// cada mensaje del usuario llama a /api/demo, que corre el agente con tools simuladas.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AgendarCTA } from "./AgendarCTA";
import {
  DEMO_LIMITS,
  demoGreeting,
  GIROS,
  type Giro,
} from "@/lib/demo-config";

type Msg = {
  id: number;
  from: "user" | "bot" | "system";
  text: string;
  hora: string;
  leido?: boolean;
};

const horaAhora = () =>
  new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });

let nextId = 1;

export function DemoChat({ clinica, giro }: { clinica: string; giro: Giro }) {
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    { id: 0, from: "bot", text: demoGreeting(clinica), hora: horaAhora() },
  ]);
  const [texto, setTexto] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const [done, setDone] = useState(false);
  const [remateMostrado, setRemateMostrado] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const turnosUsuario = msgs.filter((m) => m.from === "user").length;
  const sinMensajesUsuario = turnosUsuario === 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, escribiendo]);

  const pushSystem = (text: string) =>
    setMsgs((prev) => [...prev, { id: nextId++, from: "system", text, hora: horaAhora() }]);

  const enviar = async (contenido?: string) => {
    const t = (contenido ?? texto).trim().slice(0, DEMO_LIMITS.maxCharsMensaje);
    if (!t || escribiendo || done) return;
    setTexto("");

    const mio: Msg = { id: nextId++, from: "user", text: t, hora: horaAhora() };
    setMsgs((prev) => [...prev, mio]);

    // historial para el servidor: solo texto plano user/assistant
    const historial = [...msgs, mio]
      .filter((m) => m.from !== "system")
      .map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));

    const inicio = Date.now();
    window.setTimeout(() => setEscribiendo(true), 450);

    let reply = "";
    let agendado = false;
    let terminado = false;
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinica, giro, messages: historial }),
      });
      const j = (await res.json()) as { reply?: string; agendado?: boolean; done?: boolean };
      reply = j.reply ?? "";
      agendado = !!j.agendado;
      terminado = !!j.done;
    } catch {
      reply = "";
      terminado = true;
    }
    if (!reply) {
      reply =
        "El asistente de demostración está tomando un descanso 😅 Agenda tu diagnóstico gratis y te lo enseñamos en vivo.";
      terminado = true;
    }

    // Delay natural: mínimo ~1.2s de "escribiendo…" (sustituye al streaming).
    const restante = Math.max(0, 1200 - (Date.now() - inicio));
    await new Promise((r) => setTimeout(r, restante));

    setEscribiendo(false);
    setMsgs((prev) => [
      ...prev.map((m) => (m.from === "user" ? { ...m, leido: true } : m)),
      { id: nextId++, from: "bot", text: reply, hora: horaAhora() },
    ]);

    if (agendado && !remateMostrado) {
      setRemateMostrado(true);
      window.setTimeout(
        () =>
          pushSystem(
            "✨ Cita agendada en menos de un minuto, sin que nadie de la clínica tocara el teléfono. Esto mismo, en TU WhatsApp."
          ),
        900
      );
    }
    if (terminado) setDone(true);
    else inputRef.current?.focus();
  };

  return (
    <div className="glass mx-auto w-full max-w-[400px] rounded-[2.2rem] p-2 md:p-2.5">
      <div className="glass-body flex h-[560px] flex-col overflow-hidden rounded-[1.8rem] bg-[#141310]">
        {/* Header del chat */}
        <div className="flex items-center gap-3 border-b border-white/[0.07] bg-white/[0.03] px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay text-sm font-bold text-obsidian">
            {clinica.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-sand">
              Asistente de {clinica}
            </div>
            <div className="flex items-center gap-1.5 text-[0.68rem] text-sage">
              <span className="h-1.5 w-1.5 rounded-full bg-sage" aria-hidden />
              en línea
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-mocha/30 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-wide text-mocha">
            Demo · datos ficticios
          </span>
        </div>

        {/* Mensajes */}
        <div ref={scrollRef} className="dot-grid flex-1 space-y-2.5 overflow-y-auto px-3 py-4">
          <AnimatePresence initial={false}>
            {msgs.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={
                  m.from === "system"
                    ? "flex justify-center"
                    : m.from === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                {m.from === "system" ? (
                  <div className="max-w-[90%] rounded-2xl border border-sage/40 bg-sage/10 px-4 py-3 text-center">
                    <p className="text-xs leading-relaxed text-sand">{m.text}</p>
                    <AgendarCTA
                      label="Quiero esto en mi clínica →"
                      className="btn-shine mt-2.5 inline-block rounded-full bg-clay px-4 py-2 text-xs font-semibold text-white transition-transform active:scale-95"
                    />
                  </div>
                ) : (
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2 ${
                      m.from === "user"
                        ? "rounded-br-md bg-[rgba(200,98,61,0.22)]"
                        : "rounded-bl-md bg-white/[0.06]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-[0.85rem] leading-relaxed text-sand">
                      {m.text}
                    </p>
                    <div className="mt-0.5 flex items-center justify-end gap-1 text-[0.6rem] text-mocha/70">
                      {m.hora}
                      {m.from === "user" && (
                        <span className={m.leido ? "text-sage" : "text-mocha/50"}>✓✓</span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {escribiendo && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-3">
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-mocha"
                      style={{ animationDelay: `${i * 0.15}s` }}
                      aria-hidden
                    />
                  ))}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Chips de sugerencia (solo al inicio) */}
        {sinMensajesUsuario && !done && (
          <div className="flex flex-wrap gap-2 px-3 pb-2">
            {GIROS[giro].chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => enviar(c)}
                className="rounded-full border border-clay/40 bg-clay/10 px-3 py-1.5 text-xs text-sand transition-all hover:border-clay active:scale-95"
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
          <input
            ref={inputRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviar()}
            maxLength={DEMO_LIMITS.maxCharsMensaje}
            placeholder={done ? "La demo terminó — agenda tu diagnóstico 👆" : "Escribe como paciente…"}
            disabled={escribiendo || done}
            aria-label="Mensaje para el asistente de demostración"
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-obsidian px-4 py-2.5 text-sm text-sand outline-none transition-colors placeholder:text-mocha/50 focus:border-clay/60 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => enviar()}
            disabled={!texto.trim() || escribiendo || done}
            aria-label="Enviar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay text-white transition-all hover:bg-clay-bright disabled:opacity-40 active:scale-90"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
