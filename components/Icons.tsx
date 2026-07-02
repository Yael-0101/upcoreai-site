import type { SVGProps, ReactNode } from "react";

const common: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

type P = { className?: string };
const S = (p: P, children: ReactNode) => (
  <svg className={p.className} {...common}>
    {children}
  </svg>
);

export const IconZap = (p: P) =>
  S(p, <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z" />);

export const IconScale = (p: P) =>
  S(
    p,
    <>
      <polyline points="3 16.5 9.5 10 13.5 14 21 6" />
      <polyline points="15 6 21 6 21 12" />
    </>
  );

export const IconData = (p: P) =>
  S(p, <polyline points="3 12 7 12 10 5 14 19 17 12 21 12" />);

export const IconChip = (p: P) =>
  S(
    p,
    <>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9 6.5V4M15 6.5V4M9 20v-2.5M15 20v-2.5M6.5 9H4M6.5 15H4M20 9h-2.5M20 15h-2.5" />
    </>
  );

export const IconChat = (p: P) =>
  S(
    p,
    <>
      <path d="M4 5.5h16v9H9.5L5 19V5.5z" />
      <circle cx="9.5" cy="10" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="10" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="10" r="0.6" fill="currentColor" stroke="none" />
    </>
  );

export const IconSparkle = (p: P) =>
  S(
    p,
    <>
      <path d="M12 3.5 13.8 8.2 18.5 10 13.8 11.8 12 16.5 10.2 11.8 5.5 10 10.2 8.2z" />
      <path d="M18.5 16.5 19.2 18.3 21 19 19.2 19.7 18.5 21.5 17.8 19.7 16 19 17.8 18.3z" />
    </>
  );

export const IconCalendar = (p: P) =>
  S(
    p,
    <>
      <rect x="4" y="5" width="16" height="16" rx="2.5" />
      <path d="M4 9.5h16M8 3v4M16 3v4" />
    </>
  );

export const IconBell = (p: P) =>
  S(
    p,
    <>
      <path d="M18 8.5a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5" />
      <path d="M10.3 20a1.9 1.9 0 0 0 3.4 0" />
    </>
  );

export const IconRefresh = (p: P) =>
  S(
    p,
    <>
      <path d="M20 11a8 8 0 1 0-1.9 5.4" />
      <polyline points="20 4 20 10 14 10" />
    </>
  );

export const IconStar = (p: P) =>
  S(
    p,
    <path d="M12 3.2l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.4 9.3l5.8-.8z" />
  );

export const IconGauge = (p: P) =>
  S(
    p,
    <>
      <path d="M4 17.5a8 8 0 1 1 16 0" />
      <path d="M12 17.5l3.5-4" />
    </>
  );

export const IconShield = (p: P) =>
  S(
    p,
    <>
      <path d="M12 3l7 3v5.5c0 4.4-3 7.4-7 8.5-4-1.1-7-4.1-7-8.5V6z" />
      <path d="M9.3 11.8l1.9 1.9 3.5-3.7" />
    </>
  );

export const IconLock = (p: P) =>
  S(
    p,
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </>
  );

export const IconClock = (p: P) =>
  S(
    p,
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  );

const ICON_MAP: Record<string, (p: P) => ReactNode> = {
  IconZap,
  IconScale,
  IconData,
  IconChip,
  IconChat,
  IconSparkle,
  IconCalendar,
  IconBell,
  IconRefresh,
  IconStar,
  IconGauge,
  IconShield,
  IconLock,
  IconClock,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = ICON_MAP[name] ?? IconSparkle;
  return <C className={className} />;
}
