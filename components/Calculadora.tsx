"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { OptionBtn, ProgressDots, StepHeader, Field, NavBtns } from "./WizardUI";
import {
  CLINICA_OPTIONS,
  PRODUCTO_OPTIONS,
  MODO_OPTIONS,
  OPERACION_OPTIONS,
  calculate,
  emptyState,
  opcionEn,
  type CalcState,
} from "@/lib/calc";
import { paginas } from "@/lib/paginas-textos";
import type { Idioma } from "@/lib/idioma";
import { AgendarCTA } from "./AgendarCTA";

type Step = 1 | 2 | 3 | 4 | 5 | "email" | "results";
const ease = [0.22, 1, 0.36, 1] as const;
const panelAnim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease },
};

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
      <div className="text-base font-semibold leading-tight text-clay-bright">{value}</div>
      {usd && (
        <div className="mt-0.5 text-[0.68rem] font-medium leading-tight text-mocha/85">{usd}</div>
      )}
      {note && <div className="mt-1 text-[0.68rem] leading-tight text-mocha/80">{note}</div>}
    </div>
  );
}

export function Calculadora({ idioma = "es" }: { idioma?: Idioma }) {
  const t = paginas(idioma).calculadora;
  const [step, setStep] = useState<Step>(1);
  // ⚠️ El idioma va DENTRO del estado del cálculo: `calculate()` emite sus notas
  // en él. Si se quedara fuera, los números saldrían en inglés y las frases que
  // los explican en español — que es peor que no traducir nada.
  const [s, setS] = useState<CalcState>({ ...emptyState, idioma });

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
    setS({ ...emptyState, idioma });
    setStep(1);
  };

  const nav = { backLabel: t.atras };

  return (
    <section id="calculadora" className="px-[6%] py-24 md:px-[10%] md:py-32">
      <Reveal>
        <h2 className="mb-3 text-center text-[clamp(2rem,5vw,3.1rem)] font-semibold tracking-[-0.03em]">
          {t.h2}
        </h2>
        <p className="mb-14 text-center font-light text-mocha">{t.sub}</p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mx-auto max-w-[760px]">
          {step !== "results" && (
            <ProgressDots
              step={step === "email" ? 6 : (step as number)}
              total={5}
              label={step === "email" ? t.ultimoPaso : t.paso(step as number, 5)}
            />
          )}

          <div className="glass glass-liquid rounded-[36px] p-8 md:p-12">
            <div className="glass-body">
              {step === 1 && (
                <motion.div key="s1" {...panelAnim}>
                  <StepHeader q={t.q1} hint={t.hint1} />
                  <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {CLINICA_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={opcionEn(o, idioma)}
                        selected={s.clinica === o.val}
                        onClick={() => set({ clinica: o.val })}
                      />
                    ))}
                  </div>
                  <NavBtns
                    {...nav}
                    onNext={() => setStep(2)}
                    nextEnabled={!!s.clinica}
                    nextLabel={t.siguiente}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" {...panelAnim}>
                  <StepHeader q={t.q2} hint={t.hint2} />
                  <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {PRODUCTO_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={opcionEn(o, idioma)}
                        selected={s.productos.includes(o.val)}
                        onClick={() => toggleProducto(o.val)}
                      />
                    ))}
                  </div>
                  <NavBtns
                    {...nav}
                    onBack={() => setStep(1)}
                    onNext={() => setStep(3)}
                    nextEnabled={s.productos.length > 0}
                    nextLabel={t.siguiente}
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" {...panelAnim}>
                  <StepHeader q={t.q3} hint={t.hint3} />
                  <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {MODO_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={opcionEn(o, idioma)}
                        selected={s.modo === o.val}
                        onClick={() => set({ modo: o.val as CalcState["modo"] })}
                      />
                    ))}
                  </div>
                  <NavBtns
                    {...nav}
                    onBack={() => setStep(2)}
                    onNext={() => setStep(4)}
                    nextEnabled={!!s.modo}
                    nextLabel={t.siguiente}
                  />
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="s4" {...panelAnim}>
                  <StepHeader q={t.q4} hint={t.hint4} />
                  <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {OPERACION_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={opcionEn(o, idioma)}
                        selected={s.operacion === o.val}
                        onClick={() => set({ operacion: o.val as CalcState["operacion"] })}
                      />
                    ))}
                  </div>
                  <NavBtns
                    {...nav}
                    onBack={() => setStep(3)}
                    onNext={() => setStep(5)}
                    nextEnabled={!!s.operacion}
                    nextLabel={t.siguiente}
                  />
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="s5" {...panelAnim}>
                  <StepHeader q={t.q5} hint={t.hint5} />
                  <div className="mb-8 flex flex-col gap-5">
                    <Field
                      label={t.campoMensajes}
                      value={s.msgs}
                      placeholder={t.ejemploMensajes}
                      onChange={(v) => set({ msgs: v })}
                    />
                    <Field
                      label={t.campoLeads}
                      value={s.leads}
                      placeholder={t.ejemploLeads}
                      onChange={(v) => set({ leads: v })}
                    />
                  </div>
                  <NavBtns
                    {...nav}
                    onBack={() => setStep(4)}
                    onNext={() => setStep("email")}
                    nextEnabled={volumeReady}
                    nextLabel={t.verEstimado}
                  />
                </motion.div>
              )}

              {step === "email" && (
                <motion.div key="email" {...panelAnim}>
                  <StepHeader q={t.qEmail} hint={t.hintEmail} />
                  <div className="mb-8 flex flex-col items-center gap-3">
                    <input
                      type="email"
                      value={s.email}
                      onChange={(e) => set({ email: e.target.value })}
                      placeholder={t.placeholderEmail}
                      className="w-full max-w-[380px] rounded-full border border-[rgba(242,231,219,0.2)] bg-[rgba(242,231,219,0.03)] px-6 py-3 text-center text-sand outline-none transition-all focus:border-clay focus:bg-[rgba(200,98,61,0.05)]"
                    />
                    <button
                      type="button"
                      onClick={() => setStep("results")}
                      className="text-xs text-mocha/85 underline transition-colors hover:text-mocha"
                    >
                      {t.omitir}
                    </button>
                  </div>
                  <NavBtns
                    {...nav}
                    onBack={() => setStep(5)}
                    onNext={() => setStep("results")}
                    nextEnabled
                    nextLabel={t.verEstimado}
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
                    <h3 className="text-2xl font-semibold tracking-tight">{t.tuEstimacion}</h3>
                    <p className="mt-1 text-sm font-light text-mocha">
                      {result.complejidad} · {t.basadoEn}
                    </p>
                  </div>

                  <div className="mb-3 grid gap-3 sm:grid-cols-3">
                    <MetricCard
                      label={t.inversion}
                      value={result.inversion.principal}
                      usd={result.inversion.equivalente}
                      note={result.inversionNota}
                    />
                    <MetricCard
                      label={t.costosTuyos}
                      value={result.costosCliente.principal}
                      usd={result.costosCliente.equivalente}
                      note={result.costosNota}
                    />
                    <MetricCard
                      label={t.mensualidadUpcore}
                      value={result.mensualidadUpcore.principal}
                      usd={result.mensualidadUpcore.equivalente}
                      note={result.upcoreNota}
                    />
                  </div>

                  <div className="mb-6 grid gap-3 sm:grid-cols-2">
                    <MetricCard
                      label={t.ahorro}
                      value={result.ahorro.principal}
                      usd={result.ahorro.equivalente}
                      note={result.ahorroNota}
                      accent
                    />
                    <MetricCard
                      label={t.retorno}
                      value={result.roi}
                      note={result.roiNota}
                      accent
                    />
                  </div>

                  {result.recomendacion && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[rgba(138,154,133,0.32)] bg-[rgba(138,154,133,0.08)] p-5">
                      <span className="shrink-0 text-lg leading-none">💡</span>
                      <p className="text-sm font-light leading-relaxed text-sand/90">
                        <span className="font-medium text-sand">{t.consejo}</span>{" "}
                        {result.recomendacion}
                      </p>
                    </div>
                  )}

                  <div className="mb-8 rounded-3xl border border-dashed border-[rgba(200,98,61,0.35)] bg-[rgba(200,98,61,0.03)] p-7">
                    <h4 className="mb-4 text-sm font-semibold text-clay-bright">{t.construiriamos}</h4>
                    <ul className="space-y-2">
                      {result.incluye.map((x) => (
                        <li key={x} className="flex items-start gap-2 text-sm font-light text-sand">
                          <span className="shrink-0 font-semibold text-clay-bright">→</span>
                          {x}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-xs font-light leading-relaxed text-mocha/85">
                      {t.notaFinal}
                    </p>
                  </div>

                  <div className="text-center">
                    <AgendarCTA
                      idioma={idioma}
                      label={t.cta}
                      className="btn-shine inline-block animate-pulse-ring rounded-full bg-clay px-8 py-3.5 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright"
                    />
                    <button
                      type="button"
                      onClick={reset}
                      className="mx-auto mt-5 block text-xs text-mocha/80 underline transition-colors hover:text-mocha"
                    >
                      {t.calcularOtra}
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
