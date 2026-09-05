"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { linkWhatsApp } from "@/lib/content";
import { contenido } from "@/lib/site-textos";
import type { Idioma } from "@/lib/idioma";
import { CHAT_LIMITES } from "@/lib/chat-web";

// ── Chat del sitio (decisión de Yael, 2026-09-04; construido 2026-09-05) ─────────────────
//
// Es EL MISMO agente que atiende el WhatsApp de Upcore, entrando por otra puerta: el sitio no
// piensa, solo pinta mensajes. Cada texto va a /api/chat → puerta web de n8n → cerebro del bot.
// La sesión vive en el navegador (un id aleatorio); con ella el cerebro lleva el historial.
//
// Diseño (guías de la casa): un solo lanzador flotante (dos burbujas se estorban), objetivo
// táctil ≥ 44 px, texto ≥ 0.75rem, contraste medido con los tokens del sitio, panel a pantalla
// completa en el teléfono y de 380 px en escritorio, Esc cierra, foco al abrir, área viva para
// que un lector de pantalla anuncie las respuestas, sin animaciones que el sistema deba frenar.
// Dentro del panel sigue estando la salida a WhatsApp, que es el canal principal de cierre.

// «yael»: lo que Yael escribe desde el panel cuando toma el chat (takeover, 2026-09-05).
type Mensaje = { rol: "user" | "bot" | "yael"; texto: string };
const SONDEO_MS = 5000;

const RUTAS_PRIVADAS = ["/p/", "/acuerdo/", "/arranque/"];
const CLAVE_SESION = "upcore-chat-sesion";
const CLAVE_MENSAJES = "upcore-chat-mensajes";
const MAX_GUARDADOS = 60;

// Id de sesión del navegador. NO es un token de acceso (no abre nada: solo agrupa el historial
// de esta pestaña), por eso no pasa por lib/token.ts, que es de servidor. Sale del generador
// aleatorio del navegador, 32 caracteres hexadecimales.
function nuevaSesion(): string {
  const ALFABETO = "0123456789abcdef";
  try {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => ALFABETO[b >> 4] + ALFABETO[b & 15]).join("");
  } catch {
    return Array.from({ length: 32 }, () => ALFABETO[Math.floor(Math.random() * 16)]).join("");
  }
}

function leerSesion(): string {
  try {
    const v = localStorage.getItem(CLAVE_SESION);
    if (v && /^[a-zA-Z0-9-]{16,64}$/.test(v)) return v;
    const s = nuevaSesion();
    localStorage.setItem(CLAVE_SESION, s);
    return s;
  } catch {
    return nuevaSesion();
  }
}

function leerMensajes(): Mensaje[] {
  try {
    const v = sessionStorage.getItem(CLAVE_MENSAJES);
    const arr = v ? (JSON.parse(v) as Mensaje[]) : [];
    return Array.isArray(arr) ? arr.filter((m) => m && (m.rol === "user" || m.rol === "bot" || m.rol === "yael") && typeof m.texto === "string").slice(-MAX_GUARDADOS) : [];
  } catch {
    return [];
  }
}

function guardarMensajes(m: Mensaje[]) {
  try {
    sessionStorage.setItem(CLAVE_MENSAJES, JSON.stringify(m.slice(-MAX_GUARDADOS)));
  } catch {}
}

// Los enlaces que manda el asistente (su propuesta, el formulario) se vuelven clicables.
function conEnlaces(texto: string) {
  const partes = texto.split(/(https?:\/\/[^\s<>"')\]]+)/g);
  return partes.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="break-all underline decoration-clay-bright/70 underline-offset-2 hover:decoration-clay-bright">
        {p}
      </a>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export function ChatWeb() {
  const pathname = usePathname() ?? "/";
  const idioma: Idioma = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "es";
  const t = contenido(idioma).chatWeb;

  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  // Takeover: si Yael tomó el chat, el asistente calla y lo que ella escribe llega por sondeo.
  const [pausado, setPausado] = useState(false);
  const ultimoVisto = useRef<number>(-1); // -1 = todavía no se fijó la marca de partida
  const sesion = useRef<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sesion.current = leerSesion();
    setMensajes(leerMensajes());
  }, []);

  useEffect(() => {
    if (!abierto) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [mensajes, enviando, abierto]);

  // Sondeo mientras el panel está abierto: pregunta qué escribió Yael desde el panel. La primera
  // vuelta solo fija la marca (lo que ya hay en el historial no se repite en pantalla).
  useEffect(() => {
    if (!abierto) return;
    let vivo = true;
    const sondear = async () => {
      if (!sesion.current) return;
      try {
        const r = await fetch("/api/chat/sondeo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sesion: sesion.current, desde: Math.max(0, ultimoVisto.current) }),
        });
        const j = (await r.json().catch(() => ({}))) as { pausado?: boolean; ultimo?: number; mensajes?: { id: number; texto: string }[] };
        if (!vivo) return;
        const primeraVez = ultimoVisto.current < 0;
        ultimoVisto.current = Math.max(ultimoVisto.current, Number(j.ultimo) || 0);
        setPausado(j.pausado === true);
        if (!primeraVez && Array.isArray(j.mensajes) && j.mensajes.length) {
          setMensajes((prev) => {
            const nuevos: Mensaje[] = j.mensajes!.map((m) => ({ rol: "yael", texto: String(m.texto) }));
            const todos = [...prev, ...nuevos];
            guardarMensajes(todos);
            return todos;
          });
        }
      } catch {}
    };
    void sondear();
    const id = window.setInterval(() => void sondear(), SONDEO_MS);
    return () => {
      vivo = false;
      window.clearInterval(id);
    };
  }, [abierto]);

  const enviar = useCallback(async () => {
    const limpio = texto.replace(/\s+/g, " ").trim();
    if (!limpio || enviando) return;
    const siguiente: Mensaje[] = [...mensajes, { rol: "user", texto: limpio }];
    setMensajes(siguiente);
    guardarMensajes(siguiente);
    setTexto("");
    setEnviando(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sesion: sesion.current, texto: limpio, idioma }),
      });
      const j = (await r.json().catch(() => ({}))) as { respuesta?: string | null; pausado?: boolean };
      if (j.pausado === true) {
        // Yael tomó el chat: el asistente calla; su mensaje quedó guardado y ella lo ve en el panel.
        setPausado(true);
        return;
      }
      const respuesta = typeof j.respuesta === "string" && j.respuesta.trim() ? j.respuesta.trim() : t.sub;
      const conBot: Mensaje[] = [...siguiente, { rol: "bot", texto: respuesta }];
      setMensajes(conBot);
      guardarMensajes(conBot);
    } catch {
      const conBot: Mensaje[] = [...siguiente, { rol: "bot", texto: t.sub }];
      setMensajes(conBot);
      guardarMensajes(conBot);
    } finally {
      setEnviando(false);
      inputRef.current?.focus();
    }
  }, [texto, enviando, mensajes, idioma, t.sub]);

  if (RUTAS_PRIVADAS.some((r) => pathname.startsWith(r))) return null;

  const abajo = { bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" } as const;

  return (
    <>
      {!abierto && (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label={t.abrir}
          title={t.abrir}
          className="chat-web-lanzador fixed right-4 z-[60] flex h-14 items-center gap-2.5 rounded-full bg-clay pl-4 pr-4 text-obsidian shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98] md:right-6 md:pr-5"
          style={abajo}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.4A8 8 0 1 1 21 12z" />
            <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
          </svg>
          <span className="hidden text-[0.95rem] font-semibold leading-none md:inline">{t.abrir}</span>
        </button>
      )}

      {abierto && (
        <section
          role="dialog"
          aria-label={t.titulo}
          className="chat-web-panel fixed inset-0 z-[70] flex flex-col bg-obsidian text-sand sm:inset-auto sm:right-4 sm:w-[min(92vw,380px)] sm:overflow-hidden sm:rounded-[24px] sm:border sm:border-white/10 sm:shadow-[0_20px_60px_rgba(0,0,0,0.5)] md:right-6"
          style={{ ...abajo, height: undefined }}
          data-alto="sm"
        >
          <style>{`@media (min-width: 640px){ .chat-web-panel { height: min(600px, 80vh); } } @media (max-width: 639.98px){ .chat-web-panel { bottom: 0 !important; } }`}</style>
          <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay text-obsidian" aria-hidden="true">
              <span className="text-[0.95rem] font-bold">U</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.9rem] font-semibold leading-tight">{t.titulo}</p>
              <p className="truncate text-[0.75rem] leading-tight text-mocha">{t.sub}</p>
            </div>
            <a
              href={linkWhatsApp(idioma)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.seguirWa}
              title={t.seguirWa}
              className="flex h-11 items-center gap-1.5 rounded-full bg-[#25D366] px-3 text-[0.8rem] font-semibold text-obsidian"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.23 8.24m4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18l-.55-.27" />
              </svg>
              <span>{t.seguirWaCorto}</span>
            </a>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label={t.cerrar}
              title={t.cerrar}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sand hover:bg-white/10"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            <p className="rounded-2xl bg-white/5 px-3.5 py-2.5 text-[0.8rem] leading-relaxed text-mocha">{t.bienvenida}</p>
            {mensajes.map((m, i) => (
              <div key={i} className={m.rol === "user" ? "flex justify-end" : "flex flex-col items-start"}>
                {m.rol === "yael" && (
                  <span className="mb-0.5 px-1 text-[0.7rem] font-semibold text-clay-bright">{t.etiquetaYael}</span>
                )}
                <p
                  className={
                    m.rol === "user"
                      ? "max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-clay px-3.5 py-2.5 text-[0.9rem] leading-relaxed text-obsidian"
                      : m.rol === "yael"
                      ? "max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-md border border-clay-bright/40 bg-clay/15 px-3.5 py-2.5 text-[0.9rem] leading-relaxed text-sand"
                      : "max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-3.5 py-2.5 text-[0.9rem] leading-relaxed text-sand"
                  }
                >
                  {m.rol === "user" ? m.texto : conEnlaces(m.texto)}
                </p>
              </div>
            ))}
            {pausado && (
              <p className="rounded-2xl border border-clay-bright/30 bg-clay/10 px-3.5 py-2.5 text-[0.8rem] leading-relaxed text-sand" role="status">
                {t.yaelAtiende}
              </p>
            )}
            {enviando && (
              <p className="text-[0.8rem] text-mocha" role="status">
                {t.pensando}
              </p>
            )}
            <div ref={finRef} />
          </div>

          <form
            className="border-t border-white/10 px-3 pb-3 pt-2"
            onSubmit={(e) => {
              e.preventDefault();
              void enviar();
            }}
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    void enviar();
                  }
                }}
                maxLength={CHAT_LIMITES.maxCaracteres}
                placeholder={t.placeholder}
                aria-label={t.placeholder}
                autoComplete="off"
                className="h-11 min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 text-[0.95rem] text-sand placeholder:text-mocha/80 focus:border-clay-bright focus:outline-none"
              />
              <button
                type="submit"
                disabled={enviando || !texto.trim()}
                aria-label={t.enviar}
                title={t.enviar}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay text-obsidian disabled:opacity-50"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <p className="mt-2 px-1 text-[0.72rem] leading-snug text-mocha">{t.privacidad}</p>
          </form>
        </section>
      )}
    </>
  );
}
