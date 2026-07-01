"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import {
  AREA_OPTIONS,
  BUSINESS_OPTIONS,
  PROBLEMS,
  calculate,
  emptyState,
  getSuggestions,
  type Area,
  type CalcState,
  type Option,
} from "@/lib/calc";

type Step = 1 | 2 | 3 | 4 | "email" | "results";

const ease = [0.22, 1, 0.36, 1] as const;

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
      className={`glass-interactive flex flex-col items-center gap-2 rounded-2xl border px-3 py-5 text-center transition-all ${
        selected
          ? "border-clay bg-[rgba(200,98,61,0.1)]"
          : "border-[rgba(242,231,219,0.14)] bg-[rgba(242,231,219,0.03)]"
      }`}
    >
      <span className="text-2xl">{opt.icon}</span>
      <span className="text-[0.8rem] leading-tight text-sand">{opt.label}</span>
    </button>
  );
}

function ProgressDots({ step }: { step: Step }) {
  const idx = step === "email" ? 5 : step === "results" ? 6 : step;
  const label =
    step === "results"
      ? "Tu análisis personalizado"
      : step === "email"
      ? "Último paso"
      : `Paso ${step} de 4`;

  return (
    <div className="mb-10 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`h-2 rounded-full transition-all duration-400 ${
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

const panelAnim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease },
};

export function Calculadora() {
  const [step, setStep] = useState<Step>(1);
  const [s, setS] = useState<CalcState>(emptyState);

  const set = (patch: Partial<CalcState>) => setS((prev) => ({ ...prev, ...patch }));

  const volumeReady = (!!s.leads || !!s.msgs) && !!s.emp;
  const result = useMemo(() => (step === "results" ? calculate(s) : null), [step, s]);
  const suggestions = useMemo(
    () => (step === "results" ? getSuggestions(s) : []),
    [step, s]
  );

  const reset = () => {
    setS(emptyState);
    setStep(1);
  };

  const metrics = result
    ? [
        { ic: "💰", val: result.setupRange, lbl: "Inversión estimada" },
        { ic: "⚙️", val: result.mthRange, lbl: "Costo mensual" },
        { ic: "⏱️", val: result.hoursSaved, lbl: "Horas ahorradas/mes" },
        { ic: "💵", val: result.moneySaved, lbl: "Ahorro mensual" },
        { ic: "🚀", val: result.roi, lbl: "ROI estimado" },
      ]
    : [];

  return (
    <section id="calculadora" className="px-[6%] py-28 md:px-[10%] md:py-36">
      <Reveal>
        <h2 className="mb-3 text-center text-[clamp(2.2rem,5vw,3.2rem)] font-semibold tracking-[-0.03em]">
          ¿Cuánto puedes ahorrar?
        </h2>
        <p className="mb-14 text-center font-light text-mocha">
          Calcula el ROI de automatizar tu negocio con IA en menos de 2 minutos.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mx-auto max-w-[740px]">
          {step !== "results" && <ProgressDots step={step} />}

          <div className="glass rounded-[36px] p-8 md:p-12">
            <div className="relative">
              {step === 1 && (
                <motion.div key="s1" {...panelAnim}>
                  <StepHeader
                    q="¿Qué tipo de negocio tienes?"
                    hint="Selecciona la opción que mejor describe tu empresa"
                  />
                  <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {BUSINESS_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        selected={s.business === o.val}
                        onClick={() => set({ business: o.val })}
                      />
                    ))}
                  </div>
                  <Nav
                    onNext={() => setStep(2)}
                    nextEnabled={!!s.business}
                    nextLabel="Siguiente →"
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" {...panelAnim}>
                  <StepHeader
                    q="¿Qué área quieres automatizar?"
                    hint="Elige el proceso que más tiempo consume en tu equipo"
                  />
                  <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {AREA_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        selected={s.area === o.val}
                        onClick={() =>
                          set({
                            area: o.val as Area,
                            problem: s.area === o.val ? s.problem : null,
                          })
                        }
                      />
                    ))}
                  </div>
                  <Nav
                    onBack={() => setStep(1)}
                    onNext={() => setStep(3)}
                    nextEnabled={!!s.area}
                    nextLabel="Siguiente →"
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" {...panelAnim}>
                  <StepHeader
                    q="¿Cuál es el problema principal?"
                    hint="Selecciona la tarea que más repites sin valor real"
                  />
                  <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {(s.area ? PROBLEMS[s.area] : []).map((p) => (
                      <OptionBtn
                        key={p.id}
                        opt={{ val: p.id, label: p.label, icon: p.icon }}
                        selected={s.problem === p.id}
                        onClick={() => set({ problem: p.id })}
                      />
                    ))}
                  </div>
                  <Nav
                    onBack={() => setStep(2)}
                    onNext={() => setStep(4)}
                    nextEnabled={!!s.problem}
                    nextLabel="Siguiente →"
                  />
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="s4" {...panelAnim}>
                  <StepHeader
                    q="Cuéntanos tu volumen"
                    hint="Cifras aproximadas son más que suficientes"
                  />
                  <div className="mb-8 flex flex-col gap-5">
                    <Field
                      label="Leads o contactos nuevos por mes"
                      value={s.leads}
                      placeholder="Ej: 50"
                      onChange={(v) => set({ leads: v })}
                    />
                    <Field
                      label="Mensajes o consultas por día"
                      value={s.msgs}
                      placeholder="Ej: 20"
                      onChange={(v) => set({ msgs: v })}
                    />
                    <Field
                      label="Personas involucradas en este proceso"
                      value={s.emp}
                      placeholder="Ej: 2"
                      onChange={(v) => set({ emp: v })}
                    />
                  </div>
                  <Nav
                    onBack={() => setStep(3)}
                    onNext={() => setStep("email")}
                    nextEnabled={volumeReady}
                    nextLabel="Ver mi ROI →"
                  />
                </motion.div>
              )}

              {step === "email" && (
                <motion.div key="email" {...panelAnim}>
                  <StepHeader
                    q="Un último paso"
                    hint="Recibe el análisis completo en tu correo — completamente opcional"
                  />
                  <div className="mb-8 flex flex-col items-center gap-3">
                    <input
                      type="email"
                      value={s.email}
                      onChange={(e) => set({ email: e.target.value })}
                      placeholder="tu@empresa.com"
                      className="w-full max-w-[380px] rounded-full border border-[rgba(242,231,219,0.2)] bg-[rgba(242,231,219,0.03)] px-6 py-3 text-center text-sand outline-none transition-all focus:border-clay focus:bg-[rgba(200,98,61,0.05)]"
                    />
                    <button
                      type="button"
                      onClick={() => setStep("results")}
                      className="text-xs text-mocha/70 underline transition-colors hover:text-mocha"
                    >
                      Omitir y ver resultados →
                    </button>
                  </div>
                  <Nav
                    onBack={() => setStep(4)}
                    onNext={() => setStep("results")}
                    nextEnabled
                    nextLabel="Ver mi ROI →"
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
                  <div className="mb-8 text-center">
                    <h3 className="text-2xl font-semibold tracking-tight">
                      Tu estimación de ROI
                    </h3>
                    <p className="mt-1 text-sm font-light text-mocha">
                      Basado en negocios similares al tuyo
                    </p>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                    {metrics.map((m) => (
                      <div
                        key={m.lbl}
                        className="rounded-2xl border border-clay/40 bg-[rgba(242,231,219,0.03)] p-4 text-center"
                      >
                        <div className="mb-1 text-xl">{m.ic}</div>
                        <div className="mb-1 break-words text-sm font-semibold leading-tight text-clay">
                          {m.val}
                        </div>
                        <div className="text-[0.62rem] uppercase leading-tight tracking-wide text-mocha">
                          {m.lbl}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-8 text-center">
                    <span className="mb-2 block text-[0.72rem] uppercase tracking-[0.15em] text-clay">
                      {result.complexityLabel}
                    </span>
                    {result.payback > 0 && (
                      <span className="text-sm font-light text-mocha">
                        Recuperas tu inversión en aproximadamente{" "}
                        <strong className="font-semibold text-clay">
                          {result.payback} días
                        </strong>
                      </span>
                    )}
                  </div>

                  <div className="mb-8 rounded-3xl border border-dashed border-[rgba(200,98,61,0.35)] bg-[rgba(200,98,61,0.03)] p-8">
                    <h4 className="mb-4 text-sm font-semibold text-clay">
                      Basado en tus respuestas, construiríamos:
                    </h4>
                    <ul className="space-y-2">
                      {suggestions.map((x) => (
                        <li key={x} className="flex items-start gap-2 text-sm font-light text-sand">
                          <span className="shrink-0 font-semibold text-clay">→</span>
                          {x}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-xs font-light leading-relaxed text-mocha/70">
                      * Estos resultados son estimaciones basadas en los datos
                      proporcionados. Los valores reales pueden variar según la
                      complejidad del proyecto.
                    </p>
                  </div>

                  <div className="text-center">
                    <a
                      href="#top"
                      className="inline-block animate-pulse-ring rounded-full bg-clay px-8 py-3.5 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright"
                    >
                      Agendar llamada estratégica
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

function StepHeader({ q, hint }: { q: string; hint: string }) {
  return (
    <div className="mb-8 text-center">
      <div className="mb-2 text-[1.6rem] font-semibold tracking-tight">{q}</div>
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

function Nav({
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
