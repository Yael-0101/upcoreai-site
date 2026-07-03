"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import {
  OptionBtn,
  ProgressDots,
  StepHeader,
  Field,
  TextArea,
  NavBtns,
  type Option,
} from "./WizardUI";
import { CLINICA_OPTIONS, PRODUCTO_OPTIONS } from "@/lib/calc";
import { CONTACT } from "@/lib/content";

type Step = 1 | 2 | 3 | 4 | "enviado";

const ease = [0.22, 1, 0.36, 1] as const;
const panelAnim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease },
};

// --- Mini-diagnóstico del paso 3 (adaptativo según lo elegido en el paso 2) ---

// Universal: cómo agendan hoy → clave para "integrar antes que reemplazar".
const AGENDA_OPTIONS: Option[] = [
  { val: "whatsapp", label: "WhatsApp a mano", icon: "📱" },
  { val: "telefono", label: "Teléfono", icon: "☎️" },
  { val: "software", label: "Un software o sistema", icon: "💻" },
  { val: "papel", label: "Papel o Excel", icon: "📒" },
];

// Una pregunta específica por producto (una sola, de un toque).
const PREGUNTAS_POR_PRODUCTO: Record<string, { q: string; options: Option[] }> = {
  agente: {
    q: "¿Cuándo pierden más pacientes o mensajes?",
    options: [
      { val: "fuera", label: "Fuera de horario", icon: "🌙" },
      { val: "findes", label: "Fines de semana", icon: "📆" },
      { val: "siempre", label: "A toda hora, no damos abasto", icon: "🔥" },
      { val: "nose", label: "No sé, solo sé que se pierden", icon: "🤷" },
    ],
  },
  web: {
    q: "¿Tienes sitio web hoy?",
    options: [
      { val: "no", label: "No tengo", icon: "❌" },
      { val: "viejo", label: "Tengo, pero viejo o sin agenda", icon: "🕸️" },
      { val: "si", label: "Tengo y funciona, quiero algo mejor", icon: "✅" },
    ],
  },
  auto: {
    q: "¿Cuántas citas pierden a la semana (pacientes que no llegan)?",
    options: [
      { val: "1-2", label: "1 – 2", icon: "🟢" },
      { val: "3-5", label: "3 – 5", icon: "🟠" },
      { val: "5+", label: "Más de 5", icon: "🔴" },
      { val: "nose", label: "No lo medimos", icon: "🤷" },
    ],
  },
  reactivacion: {
    q: "¿Dónde guardan los datos de sus pacientes anteriores?",
    options: [
      { val: "software", label: "En un software", icon: "💻" },
      { val: "excel", label: "Excel o papel", icon: "📒" },
      { val: "no", label: "No tenemos registro ordenado", icon: "🤷" },
    ],
  },
};

// Si eligió "no estoy seguro": preguntamos qué le duele y nosotros recomendamos.
const DOLORES_OPTIONS: Option[] = [
  { val: "noshows", label: "Pacientes que no llegan a su cita", icon: "📉" },
  { val: "whatsapp", label: "WhatsApp sin responder", icon: "💬" },
  { val: "recepcion", label: "Recepción saturada", icon: "😰" },
  { val: "huecos", label: "Huecos en la agenda / no vuelven", icon: "🕳️" },
  { val: "nuevos", label: "Atraer más pacientes nuevos", icon: "🌱" },
];

function BlockLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-sm font-medium text-sand">{children}</p>
  );
}

type LeadState = {
  clinicaNombre: string;
  tipoClinica: string | null;
  productos: string[];
  sinPreferencia: boolean;
  volumen: string;
  agendaHoy: string | null;
  agendaSoftware: string;
  respuestas: Record<string, string>; // producto -> respuesta elegida
  dolores: string[];
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
  agendaHoy: null,
  agendaSoftware: "",
  respuestas: {},
  dolores: [],
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
  const toggleDolor = (val: string) =>
    setS((p) => ({
      ...p,
      dolores: p.dolores.includes(val)
        ? p.dolores.filter((x) => x !== val)
        : [...p.dolores, val],
    }));

  const step1Ready = s.clinicaNombre.trim() !== "" && !!s.tipoClinica;
  const step2Ready = s.productos.length > 0 || s.sinPreferencia;
  const step3Ready = !!s.agendaHoy; // solo la universal es obligatoria
  const step4Ready = s.nombre.trim() !== "" && s.contacto.trim() !== "" && s.acepta;

  // Productos elegidos que tienen pregunta propia (en el orden del catálogo).
  const preguntasActivas = PRODUCTO_OPTIONS.filter(
    (p) => s.productos.includes(p.val) && PREGUNTAS_POR_PRODUCTO[p.val]
  );

  const submit = async () => {
    setLoading(true);
    setError(false);
    const productosTxt = s.sinPreferencia
      ? "Sin preferencia — que le recomienden"
      : PRODUCTO_OPTIONS.filter((p) => s.productos.includes(p.val))
          .map((p) => p.label)
          .join(", ");

    // agenda_hoy legible, con el nombre del software si lo dio.
    const agendaLabel = AGENDA_OPTIONS.find((o) => o.val === s.agendaHoy)?.label ?? "";
    const agendaTxt =
      s.agendaHoy === "software" && s.agendaSoftware.trim()
        ? `${agendaLabel} (${s.agendaSoftware.trim()})`
        : agendaLabel;

    // detalle legible: respuestas por producto, o dolores si pidió recomendación.
    const detalleTxt = s.sinPreferencia
      ? s.dolores.length
        ? "Le duele: " +
          DOLORES_OPTIONS.filter((d) => s.dolores.includes(d.val))
            .map((d) => d.label)
            .join("; ")
        : ""
      : preguntasActivas
          .filter((p) => s.respuestas[p.val])
          .map((p) => {
            const resp = PREGUNTAS_POR_PRODUCTO[p.val].options.find(
              (o) => o.val === s.respuestas[p.val]
            );
            return `${p.label}: ${resp?.label ?? ""}`;
          })
          .join(" · ");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: s.nombre,
          clinica: s.clinicaNombre,
          tipo_clinica: s.tipoClinica,
          productos: productosTxt,
          agenda_hoy: agendaTxt,
          detalle: detalleTxt,
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
                  hint="Un par de toques nos ayudan a darte la mejor solución"
                />

                {/* Universal: cómo agendan hoy */}
                <div className="mb-7">
                  <BlockLabel>¿Cómo manejan las citas hoy?</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {AGENDA_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        selected={s.agendaHoy === o.val}
                        onClick={() => set({ agendaHoy: o.val })}
                      />
                    ))}
                  </div>
                  {s.agendaHoy === "software" && (
                    <div className="mt-4">
                      <Field
                        label="¿Cuál software o sistema? (opcional)"
                        type="text"
                        value={s.agendaSoftware}
                        placeholder="Ej: Dentalink, AgendaPro, Doctoralia…"
                        onChange={(v) => set({ agendaSoftware: v })}
                      />
                    </div>
                  )}
                </div>

                {/* Adaptativo: una pregunta por producto elegido, o dolores si pidió recomendación */}
                {s.sinPreferencia ? (
                  <div className="mb-7">
                    <BlockLabel>¿Qué es lo que más te duele hoy? (elige una o varias)</BlockLabel>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {DOLORES_OPTIONS.map((o) => (
                        <OptionBtn
                          key={o.val}
                          opt={o}
                          selected={s.dolores.includes(o.val)}
                          onClick={() => toggleDolor(o.val)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  preguntasActivas.map((p) => {
                    const preg = PREGUNTAS_POR_PRODUCTO[p.val];
                    return (
                      <div key={p.val} className="mb-7">
                        <BlockLabel>
                          <span className="mr-1.5">{p.icon}</span>
                          {preguntasActivas.length > 1 && (
                            <span className="text-mocha">{p.label} — </span>
                          )}
                          {preg.q}
                        </BlockLabel>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {preg.options.map((o) => (
                            <OptionBtn
                              key={o.val}
                              opt={o}
                              selected={s.respuestas[p.val] === o.val}
                              onClick={() =>
                                setS((prev) => ({
                                  ...prev,
                                  respuestas: { ...prev.respuestas, [p.val]: o.val },
                                }))
                              }
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}

                <div className="mb-8">
                  <TextArea
                    label="¿Algo más que quieras contarnos? (opcional)"
                    value={s.mensaje}
                    placeholder="Ej: Somos 2 doctoras y una recepcionista, abrimos hace un año…"
                    onChange={(v) => set({ mensaje: v })}
                  />
                </div>
                <NavBtns
                  onBack={() => setStep(2)}
                  onNext={() => setStep(4)}
                  nextEnabled={step3Ready}
                  nextLabel="Siguiente →"
                />
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
