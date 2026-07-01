"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export type RevealVariant =
  | "fadeUp"
  | "scaleIn"
  | "slideLeft"
  | "slideRight"
  | "blurIn"
  | "maskReveal";

const VARIANTS: Record<RevealVariant, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9, y: 22 },
    show: { opacity: 1, scale: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -64 },
    show: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 64 },
    show: { opacity: 1, x: 0 },
  },
  blurIn: {
    hidden: { opacity: 0, y: 14, filter: "blur(14px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  maskReveal: {
    hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
    show: { opacity: 1, clipPath: "inset(0 0 0% 0)" },
  },
};

export function Reveal({
  children,
  variant = "fadeUp",
  delay = 0,
  duration = 0.7,
  className,
}: {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-70px" }}
      variants={VARIANTS[variant]}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
