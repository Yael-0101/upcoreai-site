"use client";

import { motion } from "framer-motion";
import { IconSparkle, IconCalendar, IconChat } from "./Icons";
import { HERO, CONTACT } from "@/lib/content";

const ease = [0.22, 1, 0.36, 1] as const;

const CHIPS = [
  { Icon: IconSparkle, className: "left-[8%] top-[24%]", delay: "0s" },
  { Icon: IconCalendar, className: "right-[10%] top-[32%]", delay: "1.2s" },
  { Icon: IconChat, className: "left-[15%] bottom-[20%]", delay: "2.1s" },
];

export function Hero() {
  return (
    <header
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-[8%] text-center"
    >
      {CHIPS.map((c, i) => (
        <div
          key={i}
          aria-hidden
          style={{ animationDelay: c.delay }}
          className={`card-soft animate-float absolute z-0 hidden h-16 w-16 items-center justify-center rounded-3xl text-clay/70 md:flex ${c.className}`}
        >
          <c.Icon className="h-7 w-7" />
        </div>
      ))}

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="relative z-10 mb-6 rounded-full border border-[rgba(242,231,219,0.14)] bg-[rgba(242,231,219,0.04)] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-mocha"
      >
        {HERO.eyebrow}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.95, ease, delay: 0.08 }}
        className="text-gradient relative z-10 text-[clamp(2.7rem,8vw,5.6rem)] font-semibold leading-[1.03] tracking-[-0.04em]"
      >
        {HERO.title1}
        <br />
        {HERO.title2}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.95, ease, delay: 0.26 }}
        className="relative z-10 mt-6 max-w-2xl text-lg font-light text-mocha md:text-xl"
      >
        {HERO.subtitle}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.95, ease, delay: 0.42 }}
        className="relative z-10 mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <a
          href={CONTACT.calendly}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-shine animate-pulse-ring rounded-full bg-clay px-9 py-4 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright"
        >
          {HERO.ctaPrimary}
        </a>
        <a
          href="#calculadora"
          className="rounded-full border border-[rgba(242,231,219,0.2)] px-7 py-4 text-sm font-semibold text-sand transition-all duration-300 hover:border-clay hover:text-clay"
        >
          {HERO.ctaSecondary}
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-mocha/60"
        aria-hidden
      >
        <div className="mx-auto h-9 w-5 rounded-full border border-mocha/40 p-1">
          <div className="mx-auto h-2 w-1 animate-bounce rounded-full bg-mocha/70" />
        </div>
      </motion.div>
    </header>
  );
}
