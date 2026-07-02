import { Reveal, type RevealVariant } from "./Reveal";

export function SectionTitle({
  title,
  sub,
  variant = "maskReveal",
  align = "center",
}: {
  title: string;
  sub?: string;
  variant?: RevealVariant;
  align?: "center" | "left";
}) {
  const left = align === "left";
  return (
    <div
      className={`mb-14 ${
        left ? "mx-auto max-w-5xl text-left" : "mx-auto max-w-2xl text-center"
      }`}
    >
      <Reveal variant={variant} duration={0.9}>
        <h2 className="text-[clamp(2rem,5vw,3.1rem)] font-semibold tracking-[-0.03em]">
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-2xl text-lg font-light leading-relaxed text-mocha">
            {sub}
          </p>
        </Reveal>
      )}
    </div>
  );
}
