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

type Step = 1 | 2 | 3 | 4 | 5 | 6 | "enviado";

const ease = [0.22, 1, 0.36, 1] as const;
const panelAnim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease },
};

// --- Catálogos del diagnóstico -------------------------------------------------

const TAMANO_OPTIONS: Option[] = [
  { val: "solo", label: "Solo yo", icon: "👤" },
  { val: "2-5", label: "2 a 5 personas", icon: "👥" },
  { val: "6-15", label: "6 a 15 personas", icon: "🏥" },
  { val: "15+", label: "Más de 15 o sucursales", icon: "🏢" },
];

const PACIENTES_OPTIONS: Option[] = [
  { val: "<20", label: "Menos de 20", icon: "🌱" },
  { val: "20-50", label: "20 a 50", icon: "🌿" },
  { val: "50-150", label: "50 a 150", icon: "🌳" },
  { val: "150+", label: "Más de 150", icon: "🌲" },
  { val: "nose", label: "No lo sé", icon: "🤷" },
];

const CANALES_OPTIONS: Option[] = [
  { val: "recomendacion", label: "Recomendación", icon: "🗣️" },
  { val: "redes", label: "Redes sociales", icon: "📱" },
  { val: "google", label: "Google", icon: "🔍" },
  { val: "anuncios", label: "Anuncios pagados", icon: "📢" },
  { val: "nose", label: "No lo sé", icon: "🤷" },
];

// Universal: cómo agendan hoy → clave para "integrar antes que reemplazar".
const AGENDA_OPTIONS: Option[] = [
  { val: "whatsapp", label: "WhatsApp a mano", icon: "📱" },
  { val: "telefono", label: "Teléfono", icon: "☎️" },
  { val: "software", label: "Un software o sistema", icon: "💻" },
  { val: "papel", label: "Papel o Excel", icon: "📒" },
];

// Una pregunta específica por producto (multi, de un toque).
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

const URGENCIA_OPTIONS: Option[] = [
  { val: "ya", label: "Lo antes posible", icon: "🔥" },
  { val: "mes", label: "Este mes", icon: "📅" },
  { val: "1-3m", label: "En 1 a 3 meses", icon: "🗓️" },
  { val: "explorando", label: "Solo estoy explorando", icon: "👀" },
];

const PAPEL_OPTIONS: Option[] = [
  { val: "dueno", label: "Soy el dueño/a", icon: "🔑" },
  { val: "doctor", label: "Soy doctor(a) del equipo", icon: "🩺" },
  { val: "admin", label: "Administración / recepción", icon: "🗂️" },
  { val: "otro", label: "Otro", icon: "💼" },
];

const HORARIO_OPTIONS: Option[] = [
  { val: "manana", label: "Por la mañana", icon: "🌅" },
  { val: "tarde", label: "Por la tarde", icon: "☀️" },
  { val: "noche", label: "Por la noche", icon: "🌙" },
  { val: "cualquiera", label: "Cualquier hora", icon: "🤙" },
];

// Diagnóstico 2.0: con estas dos preguntas el diagnóstico calcula la pérdida REAL
// (citas perdidas × ticket) en lugar de estimar a ciegas.
const CITAS_PERDIDAS_OPTIONS: Option[] = [
  { val: "0", label: "Casi ninguna", icon: "🟢" },
  { val: "1-2", label: "1 – 2 por semana", icon: "🟡" },
  { val: "3-5", label: "3 – 5 por semana", icon: "🟠" },
  { val: "6-10", label: "6 – 10 o más", icon: "🔴" },
  { val: "nose", label: "No lo medimos", icon: "🤷" },
];

const TICKET_OPTIONS: Option[] = [
  { val: "150-300", label: "$150 – $300", icon: "💵" },
  { val: "300-800", label: "$300 – $800", icon: "💰" },
  { val: "800-2000", label: "$800 – $2,000", icon: "💎" },
  { val: "2000", label: "Más de $2,000", icon: "👑" },
  { val: "nose", label: "Varía mucho / no sé", icon: "🤷" },
];

const OBJETIVO_OPTIONS: Option[] = [
  { val: "llenar-agenda", label: "Llenar mi agenda", icon: "📈" },
  { val: "no-perder-citas", label: "Dejar de perder citas", icon: "🛑" },
  { val: "recuperar-pacientes", label: "Recuperar pacientes", icon: "🔄" },
  { val: "imagen", label: "Verse más profesional", icon: "✨" },
];

function BlockLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-3">
      <p className="text-sm font-medium text-sand">{children}</p>
      {hint && <p className="mt-0.5 text-xs font-light text-mocha/80">{hint}</p>}
    </div>
  );
}

const labelDe = (opts: Option[], val: string | null) =>
  opts.find((o) => o.val === val)?.label ?? "";
const labelsDe = (opts: Option[], vals: string[]) =>
  opts.filter((o) => vals.includes(o.val)).map((o) => o.label);

type LeadState = {
  clinicaNombre: string;
  tipoClinica: string | null;
  tamano: string | null;
  pacientesSemana: string | null;
  citasPerdidas: string | null;
  ticket: string | null;
  objetivo: string | null;
  canales: string[];
  productos: string[];
  sinPreferencia: boolean;
  agendaHoy: string[];
  agendaSoftware: string;
  respuestas: Record<string, string[]>;
  dolores: string[];
  mensaje: string;
  urgencia: string | null;
  papel: string | null;
  horario: string | null;
  nombre: string;
  contacto: string;
  correo: string;
  acepta: boolean;
};

const empty: LeadState = {
  clinicaNombre: "",
  tipoClinica: null,
  tamano: null,
  pacientesSemana: null,
  citasPerdidas: null,
  ticket: null,
  objetivo: null,
  canales: [],
  productos: [],
  sinPreferencia: false,
  agendaHoy: [],
  agendaSoftware: "",
  respuestas: {},
  dolores: [],
  mensaje: "",
  urgencia: null,
  papel: null,
  horario: null,
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
  const [propuestaUrl, setPropuestaUrl] = useState<string | null>(null);

  const set = (patch: Partial<LeadState>) => setS((p) => ({ ...p, ...patch }));
  const toggleIn = (key: "canales" | "agendaHoy" | "dolores" | "productos") => (val: string) =>
    setS((p) => ({
      ...p,
      ...(key === "productos" ? { sinPreferencia: false } : {}),
      [key]: p[key].includes(val)
        ? p[key].filter((x) => x !== val)
        : [...p[key], val],
    }));
  const toggleRespuesta = (producto: string, val: string) =>
    setS((p) => {
      const actual = p.respuestas[producto] ?? [];
      return {
        ...p,
        respuestas: {
          ...p.respuestas,
          [producto]: actual.includes(val)
            ? actual.filter((x) => x !== val)
            : [...actual, val],
        },
      };
    });

  const preguntasActivas = PRODUCTO_OPTIONS.filter(
    (p) => s.productos.includes(p.val) && PREGUNTAS_POR_PRODUCTO[p.val]
  );

  const step1Ready =
    s.clinicaNombre.trim() !== "" && !!s.tipoClinica && !!s.tamano;
  const step2Ready = !!s.pacientesSemana && !!s.citasPerdidas && !!s.ticket;
  const step3Ready = s.productos.length > 0 || s.sinPreferencia;
  // Candado de completitud: las preguntas de dolor/producto dejan de ser opcionales —
  // sin ellas el diagnóstico sale flaco.
  const step4Ready =
    s.agendaHoy.length > 0 &&
    (s.sinPreferencia
      ? s.dolores.length > 0
      : preguntasActivas.every((p) => (s.respuestas[p.val] ?? []).length > 0));
  const step5Ready = !!s.urgencia && !!s.papel && !!s.objetivo;
  const step6Ready = s.nombre.trim() !== "" && s.contacto.trim() !== "" && s.acepta;

  const submit = async () => {
    setLoading(true);
    setError(false);
    const productosTxt = s.sinPreferencia
      ? "Sin preferencia — que le recomienden"
      : PRODUCTO_OPTIONS.filter((p) => s.productos.includes(p.val))
          .map((p) => p.label)
          .join(", ");

    const agendaTxt = AGENDA_OPTIONS.filter((o) => s.agendaHoy.includes(o.val))
      .map((o) =>
        o.val === "software" && s.agendaSoftware.trim()
          ? `${o.label} (${s.agendaSoftware.trim()})`
          : o.label
      )
      .join(" + ");

    const detalleTxt = s.sinPreferencia
      ? s.dolores.length
        ? "Le duele: " + labelsDe(DOLORES_OPTIONS, s.dolores).join("; ")
        : ""
      : preguntasActivas
          .filter((p) => (s.respuestas[p.val] ?? []).length > 0)
          .map((p) => {
            const labels = PREGUNTAS_POR_PRODUCTO[p.val].options
              .filter((o) => s.respuestas[p.val].includes(o.val))
              .map((o) => o.label);
            return `${p.label}: ${labels.join(", ")}`;
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
          tamano: labelDe(TAMANO_OPTIONS, s.tamano),
          volumen: s.pacientesSemana
            ? `${labelDe(PACIENTES_OPTIONS, s.pacientesSemana)} pacientes/semana`
            : "",
          canales: labelsDe(CANALES_OPTIONS, s.canales).join(", "),
          productos: productosTxt,
          agenda_hoy: agendaTxt,
          detalle: detalleTxt,
          urgencia: labelDe(URGENCIA_OPTIONS, s.urgencia),
          decisor: labelDe(PAPEL_OPTIONS, s.papel),
          horario_contacto: labelDe(HORARIO_OPTIONS, s.horario),
          mensaje: s.mensaje,
          contacto: s.contacto,
          correo: s.correo,
          citas_perdidas:
            s.citasPerdidas && s.citasPerdidas !== "nose" ? `${s.citasPerdidas} por semana` : "",
          ticket_promedio: s.ticket && s.ticket !== "nose" ? `${s.ticket} MXN por cita` : "",
          objetivo: s.objetivo ?? "",
        }),
      });
      if (!res.ok) throw new Error("fail");
      const data = (await res.json().catch(() => null)) as { propuesta_url?: string } | null;
      if (data?.propuesta_url?.startsWith("https://upcoreai.com/p/")) {
        setPropuestaUrl(data.propuesta_url);
      }
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
          Cuéntanos de tu clínica en 3 minutos — puro toque de botón. Te escribimos
          por WhatsApp con tu diagnóstico, sin agendar nada.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mx-auto max-w-[760px]">
          {step !== "enviado" && (
            <ProgressDots step={step as number} total={6} label={`Paso ${step} de 6`} />
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
                <div className="mb-7">
                  <BlockLabel>¿Qué tipo de clínica es?</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {CLINICA_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        check
                        selected={s.tipoClinica === o.val}
                        onClick={() => set({ tipoClinica: o.val })}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <BlockLabel>¿Qué tan grande es el equipo?</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {TAMANO_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        check
                        selected={s.tamano === o.val}
                        onClick={() => set({ tamano: o.val })}
                      />
                    ))}
                  </div>
                </div>
                <NavBtns onNext={() => setStep(2)} nextEnabled={step1Ready} nextLabel="Siguiente →" />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" {...panelAnim}>
                <StepHeader
                  q="El movimiento de tu clínica"
                  hint="Cifras aproximadas — con eso calculamos tu potencial"
                />
                <div className="mb-7">
                  <BlockLabel>¿Cuántos pacientes atienden por semana, más o menos?</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {PACIENTES_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        check
                        selected={s.pacientesSemana === o.val}
                        onClick={() => set({ pacientesSemana: o.val })}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-7">
                  <BlockLabel hint="Con esto calculamos cuánto se está yendo — es la pregunta que más vale">
                    ¿Cuántas citas se pierden o no llegan por semana?
                  </BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {CITAS_PERDIDAS_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        check
                        selected={s.citasPerdidas === o.val}
                        onClick={() => set({ citasPerdidas: o.val })}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-7">
                  <BlockLabel hint="Aproximado en pesos — cuánto deja una cita o tratamiento típico">
                    ¿De cuánto es una cita promedio en tu clínica?
                  </BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {TICKET_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        check
                        selected={s.ticket === o.val}
                        onClick={() => set({ ticket: o.val })}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <BlockLabel hint="Puedes elegir varias">
                    ¿De dónde llegan tus pacientes hoy?
                  </BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {CANALES_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        check
                        selected={s.canales.includes(o.val)}
                        onClick={() => toggleIn("canales")(o.val)}
                      />
                    ))}
                  </div>
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
                  q="¿Qué necesitas?"
                  hint="Elige una o varias — o pídenos que te recomendemos"
                />
                <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {PRODUCTO_OPTIONS.map((o) => (
                    <OptionBtn
                      key={o.val}
                      opt={o}
                      check
                      selected={s.productos.includes(o.val)}
                      onClick={() => toggleIn("productos")(o.val)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setS((p) => ({ ...p, productos: [], sinPreferencia: !p.sinPreferencia }))
                  }
                  className={`mb-8 w-full rounded-2xl border px-4 py-3 text-center text-sm font-medium transition-all ${
                    s.sinPreferencia
                      ? "border-clay bg-[rgba(200,98,61,0.1)] text-sand"
                      : "border-[rgba(242,231,219,0.14)] bg-[rgba(242,231,219,0.03)] text-mocha"
                  }`}
                >
                  🤔 No estoy seguro — recomiéndenme lo mejor
                </button>
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
                <StepHeader
                  q="Cuéntanos tu situación"
                  hint="Toca al menos una opción en cada pregunta — de aquí sale tu diagnóstico"
                />

                <div className="mb-7">
                  <BlockLabel hint="Elige todas las que usen — casi nadie usa una sola">
                    ¿Cómo manejan las citas hoy?
                  </BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {AGENDA_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        check
                        selected={s.agendaHoy.includes(o.val)}
                        onClick={() => toggleIn("agendaHoy")(o.val)}
                      />
                    ))}
                  </div>
                  {s.agendaHoy.includes("software") && (
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

                {s.sinPreferencia ? (
                  <div className="mb-7">
                    <BlockLabel hint="Puedes elegir varias">
                      ¿Qué es lo que más te duele hoy?
                    </BlockLabel>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {DOLORES_OPTIONS.map((o) => (
                        <OptionBtn
                          key={o.val}
                          opt={o}
                          check
                          selected={s.dolores.includes(o.val)}
                          onClick={() => toggleIn("dolores")(o.val)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  preguntasActivas.map((p) => {
                    const preg = PREGUNTAS_POR_PRODUCTO[p.val];
                    return (
                      <div key={p.val} className="mb-7">
                        <BlockLabel hint="Puedes elegir varias">
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
                              check
                              selected={(s.respuestas[p.val] ?? []).includes(o.val)}
                              onClick={() => toggleRespuesta(p.val, o.val)}
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
                  onBack={() => setStep(3)}
                  onNext={() => setStep(5)}
                  nextEnabled={step4Ready}
                  nextLabel="Siguiente →"
                />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" {...panelAnim}>
                <StepHeader
                  q="Para cerrar"
                  hint="Tres toques y pasamos a tus datos"
                />
                <div className="mb-7">
                  <BlockLabel hint="Define hacia dónde apuntamos tu diagnóstico">
                    Si esto funciona, ¿qué es lo que más quieres lograr?
                  </BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {OBJETIVO_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        check
                        selected={s.objetivo === o.val}
                        onClick={() => set({ objetivo: o.val })}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-7">
                  <BlockLabel>¿Qué tan pronto te gustaría empezar?</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {URGENCIA_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        check
                        selected={s.urgencia === o.val}
                        onClick={() => set({ urgencia: o.val })}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <BlockLabel>¿Cuál es tu papel en la clínica?</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {PAPEL_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        check
                        selected={s.papel === o.val}
                        onClick={() => set({ papel: o.val })}
                      />
                    ))}
                  </div>
                </div>
                <NavBtns
                  onBack={() => setStep(4)}
                  onNext={() => setStep(6)}
                  nextEnabled={step5Ready}
                  nextLabel="Siguiente →"
                />
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="s6" {...panelAnim}>
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
                <div className="mb-6">
                  <BlockLabel hint="Opcional — para no escribirte a deshoras">
                    ¿Cuándo prefieres que te escribamos?
                  </BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {HORARIO_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        check
                        selected={s.horario === o.val}
                        onClick={() => set({ horario: o.val })}
                      />
                    ))}
                  </div>
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
                  onBack={() => setStep(5)}
                  onNext={submit}
                  nextEnabled={step6Ready}
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
                <div className="mb-5 text-5xl">{propuestaUrl ? "🎉" : "✅"}</div>
                <h2 className="mb-3 text-2xl font-semibold tracking-tight">
                  {propuestaUrl ? `¡Listo, ${s.nombre}! Tu diagnóstico ya existe` : `¡Gracias, ${s.nombre}!`}
                </h2>
                {propuestaUrl ? (
                  <>
                    <p className="mx-auto mb-8 max-w-md font-light leading-relaxed text-mocha">
                      Lo calculamos con tus números en este momento: qué se te está escapando,
                      cuánto vale y cómo lo arreglamos. {s.correo.trim() ? "También te lo mandamos por correo." : ""}
                    </p>
                    <a
                      href={propuestaUrl}
                      className="btn-shine inline-block rounded-full bg-clay px-9 py-4 text-lg font-bold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright"
                    >
                      Ver mi diagnóstico ahora →
                    </a>
                    <p className="mt-5 text-xs font-light text-mocha">
                      ¿Dudas? Escríbenos por{" "}
                      <a
                        href={CONTACT.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sand underline hover:text-clay"
                      >
                        WhatsApp
                      </a>{" "}
                      — te contesta nuestro asistente al momento, a cualquier hora.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mx-auto mb-8 max-w-md font-light leading-relaxed text-mocha">
                      Ya tenemos tu información. Te contactamos pronto por WhatsApp con tu
                      diagnóstico — sin compromiso.
                    </p>
                    <a
                      href={CONTACT.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-shine inline-block rounded-full bg-clay px-8 py-3.5 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright"
                    >
                      Escríbenos ahora por WhatsApp
                    </a>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
