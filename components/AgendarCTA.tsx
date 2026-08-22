"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { contenido } from "@/lib/site-textos";
import { ruta, type Idioma } from "@/lib/idioma";

// Botón único "Haz tu diagnóstico": al hacer clic abre los caminos para empezar.
// Decisión de Yael (2026-07-23): SIN opciones de llamada en el embudo de diagnóstico
// (los leads que llegan ya nos conocen) — solo el diagnóstico instantáneo y la demo.
export function AgendarCTA({
  idioma = "es",
  label,
  className = "",
}: {
  idioma?: Idioma;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const t = contenido(idioma).cta;
  const texto = label ?? contenido(idioma).nav.cta;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {texto}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center px-5"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative w-full max-w-md rounded-[28px] p-7 md:p-9"
          >
            <div className="glass-body">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.cerrar}
                className="absolute right-1 top-0 flex h-9 w-9 items-center justify-center rounded-full text-xl text-mocha transition-colors hover:text-sand"
              >
                ×
              </button>
              <h3 className="mb-1 pr-8 text-xl font-semibold tracking-tight text-sand">
                {t.titulo}
              </h3>
              <p className="mb-6 text-sm font-light text-mocha">{t.sub}</p>

              <div className="flex flex-col gap-3">
                {t.opciones.map((o) => (
                  <a
                    key={o.href}
                    href={ruta(idioma, o.href)}
                    className="card-soft group flex items-center gap-4 rounded-2xl p-4 text-left"
                  >
                    <span className="text-2xl">{o.emoji}</span>
                    <span className="flex-1">
                      <span className="block font-semibold text-sand">{o.titulo}</span>
                      <span className="block text-xs font-light leading-relaxed text-mocha">
                        {o.sub}
                      </span>
                    </span>
                    <span className="text-clay transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
