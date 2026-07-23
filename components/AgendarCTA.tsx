"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// Botón único "Agenda tu diagnóstico": al hacer clic abre los caminos para empezar.
// Decisión de Yael (2026-07-23): SIN opciones de llamada en el embudo de diagnóstico
// (los leads que llegan ya nos conocen) — solo el diagnóstico instantáneo y la demo.
export function AgendarCTA({
  label = "Agenda tu diagnóstico",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
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
                aria-label="Cerrar"
                className="absolute right-1 top-0 flex h-9 w-9 items-center justify-center rounded-full text-xl text-mocha transition-colors hover:text-sand"
              >
                ×
              </button>
              <h3 className="mb-1 pr-8 text-xl font-semibold tracking-tight text-sand">
                Tu diagnóstico gratis, sin llamadas
              </h3>
              <p className="mb-6 text-sm font-light text-mocha">
                Contesta unas preguntas y el resultado aparece al instante, con los números
                de TU clínica.
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href="/empezar"
                  className="card-soft group flex items-center gap-4 rounded-2xl p-4 text-left"
                >
                  <span className="text-2xl">⚡</span>
                  <span className="flex-1">
                    <span className="block font-semibold text-sand">Hacer mi diagnóstico</span>
                    <span className="block text-xs font-light leading-relaxed text-mocha">
                      3 minutos de preguntas y tu diagnóstico al instante — sin agendar nada.
                    </span>
                  </span>
                  <span className="text-clay transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </a>

                <a
                  href="/demo"
                  className="card-soft group flex items-center gap-4 rounded-2xl p-4 text-left"
                >
                  <span className="text-2xl">🤖</span>
                  <span className="flex-1">
                    <span className="block font-semibold text-sand">Prueba el agente</span>
                    <span className="block text-xs font-light leading-relaxed text-mocha">
                      Chatea con una demo del asistente, como si fueras tu paciente.
                    </span>
                  </span>
                  <span className="text-clay transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
