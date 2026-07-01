import type { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
  interactive = true,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={`glass ${
        interactive ? "glass-interactive" : ""
      } rounded-[28px] ${className}`}
    >
      {children}
    </div>
  );
}
