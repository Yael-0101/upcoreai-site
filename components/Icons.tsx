import type { SVGProps } from "react";

const common: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconZap({ className }: { className?: string }) {
  return (
    <svg className={className} {...common}>
      <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z" />
    </svg>
  );
}

export function IconScale({ className }: { className?: string }) {
  return (
    <svg className={className} {...common}>
      <polyline points="3 16.5 9.5 10 13.5 14 21 6" />
      <polyline points="15 6 21 6 21 12" />
    </svg>
  );
}

export function IconData({ className }: { className?: string }) {
  return (
    <svg className={className} {...common}>
      <polyline points="3 12 7 12 10 5 14 19 17 12 21 12" />
    </svg>
  );
}

export function IconChip({ className }: { className?: string }) {
  return (
    <svg className={className} {...common}>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9 6.5V4M15 6.5V4M9 20v-2.5M15 20v-2.5M6.5 9H4M6.5 15H4M20 9h-2.5M20 15h-2.5" />
    </svg>
  );
}

export function IconChat({ className }: { className?: string }) {
  return (
    <svg className={className} {...common}>
      <path d="M4 5.5h16v9H9.5L5 19V5.5z" />
      <circle cx="9.5" cy="10" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="10" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="10" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSparkle({ className }: { className?: string }) {
  return (
    <svg className={className} {...common}>
      <path d="M12 3.5 13.8 8.2 18.5 10 13.8 11.8 12 16.5 10.2 11.8 5.5 10 10.2 8.2z" />
      <path d="M18.5 16.5 19.2 18.3 21 19 19.2 19.7 18.5 21.5 17.8 19.7 16 19 17.8 18.3z" />
    </svg>
  );
}
