"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <header
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-[8%] text-center"
    >
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="mb-6 rounded-full border border-[rgba(242,231,219,0.14)] bg-[rgba(242,231,219,0.04)] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-mocha"
      >
        Automatización con IA
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.08 }}
        className="text-gradient text-[clamp(3rem,9vw,6rem)] font-semibold leading-[1.02] tracking-[-0.04em]"
      >
        Tu negocio.
        <br />
        Operando solo.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.24 }}
        className="mt-6 max-w-xl text-lg font-light text-mocha md:text-xl"
      >
        Automatización inteligente que ejecuta, optimiza y escala tu empresa 24/7.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.4 }}
        className="mt-10"
      >
        <a
          href="#calculadora"
          className="inline-block animate-pulse-ring rounded-full bg-clay px-9 py-4 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright"
        >
          Agendar una llamada
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-mocha/60"
        aria-hidden
      >
        <div className="mx-auto h-9 w-5 rounded-full border border-mocha/40 p-1">
          <div className="mx-auto h-2 w-1 animate-bounce rounded-full bg-mocha/70" />
        </div>
      </motion.div>
    </header>
  );
}
