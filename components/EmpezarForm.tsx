"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { OptionBtn, ProgressDots, StepHeader, Field, TextArea, NavBtns } from "./WizardUI";
import { CLINICA_OPTIONS, PRODUCTO_OPTIONS } from "@/lib/calc";
import { CONTACT } from "@/lib/content";

type Step = 1 | 2 | 3 | 4 | "enviado";

const ease = [0.22, 1, 0.36, 1] as const;
const panelAnim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease },
};

type LeadState = {
  clinicaNombre: string;
  tipoClinica: string | null;
  productos: string[];
  sinPreferencia: boolean;
  volumen: string;
  mensaje: string;
  nombre: string;
  contacto: string;
  correo: string;
  acepta: boolean;
};

const empty: LeadState = {
  clinicaNombre: "",
  tipoClinica: null,
  productos: [],
  sinPreferencia: false,
  volumen: "",
  mensaje: "",
  nombre: "",
  contacto: "",
  correo: "",
  acepta: false,
};

export function EmpezarForm() {
  const [step, setStep] = useState<Step>(1);
  const [s, setS] = useState<LeadState>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const set = (patch: Partial<LeadState>) => setS((p) => ({ ...p, ...patch }));
  const toggleProducto = (val: string) =>
    setS((p) => ({
      ...p,
      sinPreferencia: false,
      productos: p.productos.includes(val)
        ? p.productos.filter((x) => x !== val)
        : [...p.productos, val],
    }));

  const step1Ready = s.clinicaNombre.trim() !== "" && !!s.tipoClinica;
  const step2Ready = s.productos.length > 0 || s.sinPreferencia;
  const step4Ready = s.nombre.trim() !== "" && s.contacto.trim() !== "" && s.acepta;

  const submit = async () => {
    setLoading(true);
    setError(false);
    const productosTxt = s.sinPreferencia
      ? "Sin preferencia — que le recomienden"
      : PRODUCTO_OPTIONS.filter((p) => s.productos.includes(p.val))
          .map((p) => p.label)
          .join(", ");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: s.nombre,
          clinica: s.clinicaNombre,
          tipo_clinica: s.tipoClinica,
          productos: productosTxt,
          volumen: s.volumen,
          mensaje: s.mensaje,
          contacto: s.contacto,
          correo: s.correo,
        }),
      });
      if (!res.ok) throw new Error("fail");
      setStep("enviado");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-[6%] py-24 md:px-[10%] md:py-32">
      <Reveal>
        <h1 className="mb-3 text-center text-[clamp(2rem,5vw,3.1rem)] font-semibold tracking-[-0.03em]">
          Empieza sin llamada
        </h1>
        <p className="mb-14 text-center font-light text-mocha">
          Cuéntanos de tu clínica en 2 minutos. Nosotros te escribimos por WhatsApp con tu
          diagnóstico — sin agendar nada.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mx-auto max-w-[760px]">
          {step !== "enviado" && (
            <ProgressDots step={step as number} total={4} label={`Paso ${step} de 4`} />
          )}

          <div className="card-soft rounded-[36px] p-8 md:p-12">
            {step === 1 && (
              <motion.div key="s1" {...panelAnim}>
                <StepHeader
                  q="Cuéntanos de tu clínica"
                  hint="Así sabemos con quién estamos hablando"
                />
                <div className="mb-6">
                  <Field
                    label="Nombre de tu clínica"
                    type="text"
                    value={s.clinicaNombre}
                    placeholder="Ej: Clínica Dental Sonrisa"
                    onChange={(v) => set({ clinicaNombre: v })}
                  />
                </div>
                <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {CLINICA_OPTIONS.map((o) => (
                    <OptionBtn
                      key={o.val}
                      opt={o}
                      selected={s.tipoClinica === o.val}
                      onClick={() => set({ tipoClinica: o.val })}
                    />
                  ))}
                </div>
                <NavBtns onNext={() => setStep(2)} nextEnabled={step1Ready} nextLabel="Siguiente →" />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" {...panelAnim}>
                <StepHeader
                  q="¿Qué necesitas?"
                  hint="Elige una o varias — o pídenos que te recomendemos"
                />
                <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {PRODUCTO_OPTIONS.map((o) => (
                    <OptionBtn
                      key={o.val}
                      opt={o}
                      selected={s.productos.includes(o.val)}
                      onClick={() => toggleProducto(o.val)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setS((p) => ({ ...p, productos: [], sinPreferencia: !p.sinPreferencia }))
                  }
                  className={`mb-6 w-full rounded-2xl border px-4 py-3 text-center text-sm font-medium transition-all ${
                    s.sinPreferencia
                      ? "border-clay bg-[rgba(200,98,61,0.1)] text-sand"
                      : "border-[rgba(242,231,219,0.14)] bg-[rgba(242,231,219,0.03)] text-mocha"
                  }`}
                >
                  🤔 No estoy seguro — recomiéndenme lo mejor
                </button>
                <div className="mb-8">
                  <Field
                    label="Volumen aproximado (opcional)"
                    type="text"
                    value={s.volumen}
                    placeholder="Ej: 30 pacientes nuevos al mes"
                    onChange={(v) => set({ volumen: v })}
                  />
                </div>
                <NavBtns
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                  nextEnabled={step2Ready}
                  nextLabel="Siguiente →"
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" {...panelAnim}>
                <StepHeader
                  q="Cuéntanos tu situación"
                  hint="Opcional — lo que nos ayude a entender mejor tu clínica"
                />
                <div className="mb-8">
                  <TextArea
                    label="Tu situación (opcional)"
                    value={s.mensaje}
                    placeholder="Ej: Perdemos pacientes porque no alcanzamos a responder WhatsApp fuera de horario..."
                    onChange={(v) => set({ mensaje: v })}
                  />
                </div>
                <NavBtns onBack={() => setStep(2)} onNext={() => setStep(4)} nextEnabled nextLabel="Siguiente →" />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" {...panelAnim}>
                <StepHeader q="Tus datos de contacto" hint="Te escribimos por WhatsApp — sin llamadas" />
                <div className="mb-5 flex flex-col gap-5">
                  <Field
                    label="Tu nombre"
                    type="text"
                    value={s.nombre}
                    placeholder="Ej: Dra. Ana Martínez"
                    onChange={(v) => set({ nombre: v })}
                  />
                  <Field
                    label="WhatsApp o teléfono"
                    type="tel"
                    value={s.contacto}
                    placeholder="Ej: +52 55 1234 5678"
                    onChange={(v) => set({ contacto: v })}
                  />
                  <Field
                    label="Correo (opcional)"
                    type="email"
                    value={s.correo}
                    placeholder="tu@clinica.com"
                    onChange={(v) => set({ correo: v })}
                  />
                </div>
                <label className="mb-6 flex cursor-pointer items-start gap-3 text-xs font-light leading-relaxed text-mocha">
                  <input
                    type="checkbox"
                    checked={s.acepta}
                    onChange={(e) => set({ acepta: e.target.checked })}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-clay"
                  />
                  <span>
                    Acepto que Upcore AI me contacte por WhatsApp y trate mis datos según su{" "}
                    <a href="/privacidad" className="text-clay transition-colors hover:text-clay-bright">
                      Política de Privacidad
                    </a>
                    .
                  </span>
                </label>
                {error && (
                  <p className="mb-4 text-center text-xs text-clay">
                    No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.
                  </p>
                )}
                <NavBtns
                  onBack={() => setStep(3)}
                  onNext={submit}
                  nextEnabled={step4Ready}
                  nextLabel="Enviar →"
                  loading={loading}
                />
              </motion.div>
            )}

            {step === "enviado" && (
              <motion.div
                key="enviado"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="py-6 text-center"
              >
                <div className="mb-5 text-5xl">✅</div>
                <h2 className="mb-3 text-2xl font-semibold tracking-tight">¡Gracias, {s.nombre}!</h2>
                <p className="mx-auto mb-8 max-w-md font-light leading-relaxed text-mocha">
                  Ya tenemos tu información. Te contactamos pronto por WhatsApp con tu diagnóstico —
                  sin compromiso.
                </p>
                <a
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-shine inline-block rounded-full bg-clay px-8 py-3.5 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright"
                >
                  Escríbenos ahora por WhatsApp
                </a>
              </motion.div>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
