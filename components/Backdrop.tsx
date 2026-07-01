"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function Backdrop() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1400], [0, 160]);
  const y2 = useTransform(scrollY, [0, 1400], [0, -120]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-obsidian"
    >
      <motion.div
        style={{
          y: y1,
          backgroundImage:
            "radial-gradient(620px circle at 14% 6%, rgba(200,98,61,0.22), transparent 60%)",
        }}
        className="absolute inset-0"
      />
      <motion.div
        style={{
          y: y2,
          backgroundImage:
            "radial-gradient(700px circle at 86% 96%, rgba(138,154,133,0.16), transparent 60%)",
        }}
        className="absolute inset-0"
      />
      <div className="dot-grid absolute inset-0 opacity-[0.045]" />
    </div>
  );
}
