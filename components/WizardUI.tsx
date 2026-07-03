"use client";

// Piezas visuales compartidas entre la Calculadora y el formulario "Empieza sin llamada" —
// mismo look de asistente por pasos en todo el sitio.

export type Option = { val: string; label: string; icon: string; desc?: string };

export function OptionBtn({
  opt,
  selected,
  onClick,
}: {
  opt: Option;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`glass-interactive flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-5 text-center transition-all ${
        selected
          ? "border-clay bg-[rgba(200,98,61,0.1)]"
          : "border-[rgba(242,231,219,0.14)] bg-[rgba(242,231,219,0.03)]"
      }`}
    >
      <span className="text-2xl">{opt.icon}</span>
      <span className="text-[0.82rem] font-medium leading-tight text-sand">
        {opt.label}
      </span>
      {opt.desc && (
        <span className="text-[0.68rem] leading-tight text-mocha">{opt.desc}</span>
      )}
    </button>
  );
}

export function ProgressDots({
  step,
  total,
  label,
}: {
  step: number;
  total: number;
  label: string;
}) {
  return (
    <div className="mb-10 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className={`h-2 rounded-full transition-all duration-500 ${
              n < step
                ? "w-2 bg-clay/40"
                : n === step
                ? "w-7 bg-clay shadow-[0_0_12px_rgba(200,98,61,0.5)]"
                : "w-2 bg-[rgba(242,231,219,0.2)]"
            }`}
          />
        ))}
      </div>
      <div className="text-xs uppercase tracking-[0.2em] text-mocha">{label}</div>
    </div>
  );
}

export function StepHeader({ q, hint }: { q: string; hint: string }) {
  return (
    <div className="mb-8 text-center">
      <div className="mb-2 text-[1.5rem] font-semibold tracking-tight">{q}</div>
      <div className="text-sm font-light text-mocha">{hint}</div>
    </div>
  );
}

export function Field({
  label,
  value,
  placeholder,
  onChange,
  type = "number",
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  type?: "number" | "text" | "tel" | "email";
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-mocha">{label}</label>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[rgba(242,231,219,0.2)] bg-[rgba(242,231,219,0.03)] px-5 py-3 font-semibold text-sand outline-none transition-all focus:border-clay focus:bg-[rgba(200,98,61,0.05)]"
      />
    </div>
  );
}

export function TextArea({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-mocha">{label}</label>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full resize-none rounded-xl border border-[rgba(242,231,219,0.2)] bg-[rgba(242,231,219,0.03)] px-5 py-3 font-light text-sand outline-none transition-all focus:border-clay focus:bg-[rgba(200,98,61,0.05)]"
      />
    </div>
  );
}

export function NavBtns({
  onBack,
  onNext,
  nextEnabled,
  nextLabel,
  loading = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextEnabled: boolean;
  nextLabel: string;
  loading?: boolean;
}) {
  return (
    <div className={`flex items-center ${onBack ? "justify-between" : "justify-end"}`}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-[rgba(242,231,219,0.2)] px-6 py-2.5 text-sm font-semibold text-mocha transition-all hover:border-[rgba(242,231,219,0.4)] hover:text-sand"
        >
          ← Atrás
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={!nextEnabled || loading}
        className="rounded-full bg-clay px-7 py-2.5 text-sm font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
      >
        {loading ? "Enviando…" : nextLabel}
      </button>
    </div>
  );
}
