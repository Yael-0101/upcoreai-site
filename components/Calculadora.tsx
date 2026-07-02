"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import {
  CLINICA_OPTIONS,
  PRODUCTO_OPTIONS,
  MODO_OPTIONS,
  OPERACION_OPTIONS,
  calculate,
  emptyState,
  type CalcState,
  type Option,
} from "@/lib/calc";
import { CONTACT } from "@/lib/content";

type Step = 1 | 2 | 3 | 4 | 5 | "email" | "results";
const ease = [0.22, 1, 0.36, 1] as const;
const panelAnim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease },
};

function OptionBtn({
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

function ProgressDots({ step }: { step: Step }) {
  const idx = step === "email" ? 6 : step === "results" ? 7 : step;
  const label =
    step === "results"
      ? "Tu estimación personalizada"
      : step === "email"
      ? "Último paso"
      : `Paso ${step} de 5`;
  return (
    <div className="mb-10 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`h-2 rounded-full transition-all duration-500 ${
              n < idx
                ? "w-2 bg-clay/40"
                : n === idx
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

function StepHeader({ q, hint }: { q: string; hint: string }) {
  return (
    <div className="mb-8 text-center">
      <div className="mb-2 text-[1.5rem] font-semibold tracking-tight">{q}</div>
      <div className="text-sm font-light text-mocha">{hint}</div>
    </div>
  );
}

function Field({
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
      <input
        type="number"
        min={0}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[rgba(242,231,219,0.2)] bg-[rgba(242,231,219,0.03)] px-5 py-3 font-semibold text-sand outline-none transition-all focus:border-clay focus:bg-[rgba(200,98,61,0.05)]"
      />
    </div>
  );
}

function NavBtns({
  onBack,
  onNext,
  nextEnabled,
  nextLabel,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextEnabled: boolean;
  nextLabel: string;
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
        disabled={!nextEnabled}
        className="rounded-full bg-clay px-7 py-2.5 text-sm font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
      >
        {nextLabel}
      </button>
    </div>
  );
}

function MetricCard({
  label,
  value,
  usd,
  note,
  accent = false,
}: {
  label: string;
  value: string;
  usd?: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "border-clay/45 bg-[rgba(200,98,61,0.06)]"
          : "border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)]"
      }`}
    >
      <div className="mb-1 text-[0.66rem] font-medium uppercase tracking-wide text-mocha">
        {label}
      </div>
      <div className="text-base font-semibold leading-tight text-clay">{value}</div>
      {usd && (
        <div className="mt-0.5 text-[0.68rem] font-medium leading-tight text-mocha/70">
          {usd}
        </div>
      )}
      {note && <div className="mt-1 text-[0.68rem] leading-tight text-mocha/80">{note}</div>}
    </div>
  );
}

export function Calculadora() {
  const [step, setStep] = useState<Step>(1);
  const [s, setS] = useState<CalcState>(emptyState);

  const set = (patch: Partial<CalcState>) => setS((p) => ({ ...p, ...patch }));
  const toggleProducto = (val: string) =>
    setS((p) => ({
      ...p,
      productos: p.productos.includes(val)
        ? p.productos.filter((x) => x !== val)
        : [...p.productos, val],
    }));

  const volumeReady = !!s.msgs || !!s.leads;
  const result = useMemo(() => (step === "results" ? calculate(s) : null), [step, s]);
  const reset = () => {
    setS(emptyState);
    setStep(1);
  };

  return (
    <section id="calculadora" className="px-[6%] py-24 md:px-[10%] md:py-32">
      <Reveal>
        <h2 className="mb-3 text-center text-[clamp(2rem,5vw,3.1rem)] font-semibold tracking-[-0.03em]">
          ¿Cuánto puedes ahorrar?
        </h2>
        <p className="mb-14 text-center font-light text-mocha">
          Configura tu solución y te damos un estimado honesto en 2 minutos.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mx-auto max-w-[760px]">
          {step !== "results" && <ProgressDots step={step} />}

          <div className="glass glass-liquid rounded-[36px] p-8 md:p-12">
            <div className="glass-body">
              {step === 1 && (
                <motion.div key="s1" {...panelAnim}>
                  <StepHeader
                    q="¿Qué tipo de clínica tienes?"
                    hint="Selecciona la opción que mejor describe tu clínica"
                  />
                  <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {CLINICA_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        selected={s.clinica === o.val}
                        onClick={() => set({ clinica: o.val })}
                      />
                    ))}
                  </div>
                  <NavBtns onNext={() => setStep(2)} nextEnabled={!!s.clinica} nextLabel="Siguiente →" />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" {...panelAnim}>
                  <StepHeader
                    q="¿Qué quieres para tu clínica?"
                    hint="Elige una o varias — armamos lo que necesites"
                  />
                  <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {PRODUCTO_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        selected={s.productos.includes(o.val)}
                        onClick={() => toggleProducto(o.val)}
                      />
                    ))}
                  </div>
                  <NavBtns
                    onBack={() => setStep(1)}
                    onNext={() => setStep(3)}
                    nextEnabled={s.productos.length > 0}
                    nextLabel="Siguiente →"
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" {...panelAnim}>
                  <StepHeader
                    q="¿Cómo lo quieres?"
                    hint="Con todo el sistema, o solo la pieza esencial"
                  />
                  <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {MODO_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        selected={s.modo === o.val}
                        onClick={() => set({ modo: o.val as CalcState["modo"] })}
                      />
                    ))}
                  </div>
                  <NavBtns
                    onBack={() => setStep(2)}
                    onNext={() => setStep(4)}
                    nextEnabled={!!s.modo}
                    nextLabel="Siguiente →"
                  />
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="s4" {...panelAnim}>
                  <StepHeader
                    q="¿Quién lo opera?"
                    hint="Tú mismo, o nosotros nos encargamos de todo"
                  />
                  <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {OPERACION_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        selected={s.operacion === o.val}
                        onClick={() => set({ operacion: o.val as CalcState["operacion"] })}
                      />
                    ))}
                  </div>
                  <NavBtns
                    onBack={() => setStep(3)}
                    onNext={() => setStep(5)}
                    nextEnabled={!!s.operacion}
                    nextLabel="Siguiente →"
                  />
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="s5" {...panelAnim}>
                  <StepHeader
                    q="Cuéntanos tu volumen"
                    hint="Cifras aproximadas son más que suficientes"
                  />
                  <div className="mb-8 flex flex-col gap-5">
                    <Field
                      label="Mensajes o consultas por día"
                      value={s.msgs}
                      placeholder="Ej: 25"
                      onChange={(v) => set({ msgs: v })}
                    />
                    <Field
                      label="Pacientes nuevos por mes"
                      value={s.leads}
                      placeholder="Ej: 40"
                      onChange={(v) => set({ leads: v })}
                    />
                  </div>
                  <NavBtns
                    onBack={() => setStep(4)}
                    onNext={() => setStep("email")}
                    nextEnabled={volumeReady}
                    nextLabel="Ver mi estimado →"
                  />
                </motion.div>
              )}

              {step === "email" && (
                <motion.div key="email" {...panelAnim}>
                  <StepHeader
                    q="Un último paso"
                    hint="Recibe el estimado completo en tu correo — es opcional"
                  />
                  <div className="mb-8 flex flex-col items-center gap-3">
                    <input
                      type="email"
                      value={s.email}
                      onChange={(e) => set({ email: e.target.value })}
                      placeholder="tu@clinica.com"
                      className="w-full max-w-[380px] rounded-full border border-[rgba(242,231,219,0.2)] bg-[rgba(242,231,219,0.03)] px-6 py-3 text-center text-sand outline-none transition-all focus:border-clay focus:bg-[rgba(200,98,61,0.05)]"
                    />
                    <button
                      type="button"
                      onClick={() => setStep("results")}
                      className="text-xs text-mocha/70 underline transition-colors hover:text-mocha"
                    >
                      Omitir y ver mi estimado →
                    </button>
                  </div>
                  <NavBtns
                    onBack={() => setStep(5)}
                    onNext={() => setStep("results")}
                    nextEnabled
                    nextLabel="Ver mi estimado →"
                  />
                </motion.div>
              )}

              {step === "results" && result && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease }}
                >
                  <div className="mb-6 text-center">
                    <h3 className="text-2xl font-semibold tracking-tight">
                      Tu estimación
                    </h3>
                    <p className="mt-1 text-sm font-light text-mocha">
                      {result.complejidad} · basado en clínicas similares
                    </p>
                  </div>

                  <div className="mb-3 grid gap-3 sm:grid-cols-3">
                    <MetricCard
                      label="Inversión (construcción)"
                      value={result.inversion.mxn}
                      usd={result.inversion.usd}
                      note={result.inversionNota}
                    />
                    <MetricCard
                      label="Costos que pagas tú"
                      value={result.costosCliente.mxn}
                      usd={result.costosCliente.usd}
                      note={result.costosNota}
                    />
                    <MetricCard
                      label="Mensualidad de Upcore"
                      value={result.mensualidadUpcore.mxn}
                      usd={result.mensualidadUpcore.usd}
                      note={result.upcoreNota}
                    />
                  </div>

                  <div className="mb-6 grid gap-3 sm:grid-cols-2">
                    <MetricCard
                      label="Ahorro estimado"
                      value={result.ahorro.mxn}
                      usd={result.ahorro.usd}
                      note={result.ahorroNota}
                      accent
                    />
                    <MetricCard
                      label="Retorno estimado"
                      value={result.roi}
                      note={result.roiNota}
                      accent
                    />
                  </div>

                  {result.recomendacion && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[rgba(138,154,133,0.32)] bg-[rgba(138,154,133,0.08)] p-5">
                      <span className="shrink-0 text-lg leading-none">💡</span>
                      <p className="text-sm font-light leading-relaxed text-sand/90">
                        <span className="font-medium text-sand">Nuestro consejo honesto:</span>{" "}
                        {result.recomendacion}
                      </p>
                    </div>
                  )}

                  <div className="mb-8 rounded-3xl border border-dashed border-[rgba(200,98,61,0.35)] bg-[rgba(200,98,61,0.03)] p-7">
                    <h4 className="mb-4 text-sm font-semibold text-clay">
                      Esto construiríamos para ti:
                    </h4>
                    <ul className="space-y-2">
                      {result.incluye.map((x) => (
                        <li key={x} className="flex items-start gap-2 text-sm font-light text-sand">
                          <span className="shrink-0 font-semibold text-clay">→</span>
                          {x}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-xs font-light leading-relaxed text-mocha/70">
                      * Estimaciones para orientarte. Todo (cuentas, APIs, tokens, hosting)
                      queda a tu nombre. El precio final sale de tu diagnóstico gratis.
                      Tipo de cambio aprox. $18.5 MXN/USD.
                    </p>
                  </div>

                  <div className="text-center">
                    <a
                      href={CONTACT.calendly}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-shine inline-block animate-pulse-ring rounded-full bg-clay px-8 py-3.5 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright"
                    >
                      Agenda tu diagnóstico gratis
                    </a>
                    <button
                      type="button"
                      onClick={reset}
                      className="mx-auto mt-5 block text-xs text-mocha/60 underline transition-colors hover:text-mocha"
                    >
                      Calcular de nuevo
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
