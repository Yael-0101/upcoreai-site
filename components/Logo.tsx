export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="4" y="4" width="40" height="40" rx="12" fill="#C8623D" />
      <ellipse
        cx="24"
        cy="24"
        rx="14"
        ry="6"
        fill="none"
        stroke="#F7EFE6"
        strokeOpacity="0.28"
        strokeWidth="1.4"
        transform="rotate(-22 24 24)"
      />
      <path
        d="M16 15.5 V25 a8 8 0 0 0 16 0 V15.5"
        fill="none"
        stroke="#F7EFE6"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <circle cx="24" cy="15.5" r="2.3" fill="#F7EFE6" />
    </svg>
  );
}

export function Logo({
  className = "",
  markClass = "h-8 w-8",
  textClass = "text-[1.35rem]",
}: {
  className?: string;
  markClass?: string;
  textClass?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markClass} />
      <span className={`${textClass} font-semibold tracking-tight`}>
        <span className="text-sand">Upcore</span>{" "}
        <span className="text-clay">AI</span>
      </span>
    </span>
  );
}
