"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

export function GlassCard({
  children,
  className = "",
  variant = "glass",
  tilt = true,
  spotlight = true,
}: {
  children: ReactNode;
  className?: string;
  variant?: "liquid" | "glass" | "soft";
  tilt?: boolean;
  spotlight?: boolean;
}) {
  const soft = variant === "soft";
  const base =
    variant === "liquid" ? "glass glass-liquid" : soft ? "card-soft" : "glass";
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    if (tilt) {
      const rx = (py - 0.5) * -5;
      const ry = (px - 0.5) * 5;
      el.style.transform = `perspective(900px) translateY(-6px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
  };

  const onLeave = () => {
    const el = ref.current;
    if (el && tilt) el.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`${base} ${tilt ? "glass-tilt" : ""} rounded-[28px] ${className}`}
    >
      {spotlight && !soft && <span className="glass-spot" aria-hidden />}
      <div className="glass-body">{children}</div>
    </div>
  );
}
