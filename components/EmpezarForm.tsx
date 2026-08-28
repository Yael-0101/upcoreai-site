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
import { CLINICA_OPTIONS, PRODUCTO_OPTIONS, opcionEn } from "@/lib/calc";
import { linkWhatsApp } from "@/lib/content";
import { empezar, etiqueta, TE, type Etiquetas } from "@/lib/empezar-textos";
import type { Idioma } from "@/lib/idioma";
import { ruta } from "@/lib/rutas";

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
  { val: "6-15", label: "6 a 15 personas", icon: "🏢" },
  { val: "15+", label: "Más de 15 o varias oficinas", icon: "🏙️" },
];

const PROSPECTOS_OPTIONS: Option[] = [
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

// 🔴 Dónde vive su lista de desarrollos y su estado. Es lo que decide a qué nos
// conectamos para que el asistente deje de ofrecer una torre agotada — la objeción
// número uno del producto. Hasta el 2026-08-24 no se preguntaba en ningún lado, ni
// aquí ni en el Portal de Arranque, aunque /precios anuncia "Tus integraciones" como
// uno de los cuatro factores del precio.
const INVENTARIO_OPTIONS: Option[] = [
  { val: "crm", label: "En un CRM", icon: "🗂️" },
  { val: "hoja", label: "En un Excel o Google Sheets", icon: "📊" },
  { val: "desarrollador", label: "Nos la manda el desarrollador", icon: "🏗️" },
  { val: "cabeza", label: "No hay lista fija — la trae el equipo en la cabeza", icon: "🧠" },
];

// Una pregunta específica por producto (multi, de un toque).
const PREGUNTAS_POR_PRODUCTO: Record<string, { q: string; options: Option[] }> = {
  agente: {
    q: "¿Cuándo se les quedan más mensajes sin contestar?",
    options: [
      { val: "fuera", label: "Fuera de horario", icon: "🌙" },
      { val: "findes", label: "Fines de semana", icon: "📆" },
      { val: "siempre", label: "A toda hora, no damos abasto", icon: "🔥" },
      { val: "nose", label: "No sé, solo sé que se pierden", icon: "🤷" },
    ],
  },
  // La misma pregunta que el agente completo: lo que cambia entre las dos piezas es el
  // ALCANCE de lo que construimos, no el dolor que resuelven. Sin esta entrada, quien
  // eligiera el esencial se saltaba la pregunta y el diagnóstico salía con menos datos
  // que el de al lado — una pieza nueva sin su pregunta no da error, solo diagnostica peor.
  "agente-basico": {
    q: "¿Cuándo se les quedan más mensajes sin contestar?",
    options: [
      { val: "fuera", label: "Fuera de horario", icon: "🌙" },
      { val: "findes", label: "Fines de semana", icon: "📆" },
      { val: "siempre", label: "A toda hora, no damos abasto", icon: "🔥" },
      { val: "nose", label: "No sé, solo sé que se pierden", icon: "🤷" },
    ],
  },
  voz: {
    q: "¿Cuántas llamadas dirías que se quedan sin contestar al día?",
    options: [
      { val: "1-3", label: "1 – 3", icon: "🟢" },
      { val: "4-10", label: "4 – 10", icon: "🟠" },
      { val: "10+", label: "Más de 10", icon: "🔴" },
      { val: "nose", label: "No lo medimos (no queda registro)", icon: "🤷" },
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
    q: "¿Cuántos prospectos a la semana se enfrían por falta de seguimiento?",
    options: [
      { val: "1-2", label: "1 – 2", icon: "🟢" },
      { val: "3-5", label: "3 – 5", icon: "🟠" },
      { val: "5+", label: "Más de 5", icon: "🔴" },
      { val: "nose", label: "No lo medimos", icon: "🤷" },
    ],
  },
  reactivacion: {
    q: "¿Dónde guardan los prospectos que nunca cerraron?",
    options: [
      { val: "software", label: "En un software", icon: "💻" },
      { val: "excel", label: "Excel o papel", icon: "📒" },
      { val: "no", label: "No tenemos registro ordenado", icon: "🤷" },
    ],
  },
};

// Si eligió "no estoy seguro": preguntamos qué le duele y nosotros recomendamos.
const DOLORES_OPTIONS: Option[] = [
  { val: "noshows", label: "Prospectos que se enfrían sin seguimiento", icon: "📉" },
  { val: "whatsapp", label: "WhatsApp sin responder", icon: "💬" },
  { val: "llamadas", label: "Llamadas que nadie alcanza a contestar", icon: "📞" },
  { val: "equipo", label: "El equipo comercial saturado", icon: "😰" },
  { val: "huecos", label: "Prospectos viejos que nunca se volvieron a tocar", icon: "🕳️" },
  { val: "nuevos", label: "Atraer más compradores nuevos", icon: "🌱" },
];

const URGENCIA_OPTIONS: Option[] = [
  { val: "ya", label: "Lo antes posible", icon: "🔥" },
  { val: "mes", label: "Este mes", icon: "📅" },
  { val: "1-3m", label: "En 1 a 3 meses", icon: "🗓️" },
  { val: "explorando", label: "Solo estoy explorando", icon: "👀" },
];

const PAPEL_OPTIONS: Option[] = [
  { val: "dueno", label: "Soy el dueño/a", icon: "🔑" },
  { val: "asesor", label: "Soy asesor(a) de ventas", icon: "🤝" },
  { val: "admin", label: "Administración / operaciones", icon: "🗂️" },
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

// 🔴 CORREGIDO 2026-08-22. Estos rangos eran los de CLÍNICAS ($150–$2,000: el ticket
// de un tratamiento) y sobrevivieron a la migración de nicho porque son números, no
// palabras — ningún auditor de vocabulario los ve.
//
// El daño no era cosmético: la comisión que elige aquí es lo que multiplica toda la
// sección "lo que te está costando seguir igual". Con el tope en "$2,000", una firma
// de Miami que contestaba con honestidad salía perdiendo **9 veces menos** de lo real
// — y si NO contestaba, el motor usaba su valor por defecto de $18,000 y acertaba. O
// sea que responder la pregunta empeoraba el diagnóstico. Ahora los rangos son los de
// una comisión de preventa y el valor por defecto cae dentro de la banda de en medio.
const TICKET_OPTIONS: Option[] = [
  { val: "5000-10000", label: "$5,000 – $10,000", icon: "💵" },
  { val: "10000-20000", label: "$10,000 – $20,000", icon: "💰" },
  { val: "20000-40000", label: "$20,000 – $40,000", icon: "💎" },
  { val: "40000-80000", label: "Más de $40,000", icon: "👑" },
  { val: "nose", label: "Varía mucho / no sé", icon: "🤷" },
];

const OBJETIVO_OPTIONS: Option[] = [
  { val: "llenar-agenda", label: "Llenar mi agenda", icon: "📈" },
  { val: "no-perder-citas", label: "Dejar de perder prospectos", icon: "🛑" },
  { val: "recuperar-pacientes", label: "Reactivar prospectos viejos", icon: "🔄" },
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
  inventarioHoy: string[];
  inventarioCrm: string;
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
  inventarioHoy: [],
  inventarioCrm: "",
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

export function EmpezarForm({ idioma = "es" }: { idioma?: Idioma }) {
  const t = empezar(idioma);
  // ⚠️ El payload que se manda a n8n usa SIEMPRE las etiquetas españolas: el panel
  // lo lee Yael, en español. Aquí solo se traduce lo que se ve en pantalla.
  /** La misma opción con su etiqueta en el idioma de la pantalla. El `val` NUNCA
   *  cambia: es lo que se guarda y lo que viaja al webhook. */
  const tr = (mapa: Etiquetas) => (o: Option): Option => ({
    ...o,
    label: mapa[o.val] ?? o.label,
  });
  /** El enunciado y las opciones de la pregunta de un producto, traducidos. */
  const preguntaTr = (val: string) => t.porProducto[val] ?? { q: "", opciones: {} };
  const [step, setStep] = useState<Step>(1);
  const [s, setS] = useState<LeadState>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [propuestaUrl, setPropuestaUrl] = useState<string | null>(null);

  const set = (patch: Partial<LeadState>) => setS((p) => ({ ...p, ...patch }));
  const toggleIn = (key: "canales" | "agendaHoy" | "inventarioHoy" | "dolores" | "productos") => (val: string) =>
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

    // 🔴 Dónde vive su inventario viaja DENTRO de `detalle`, etiquetado.
    //
    // No lleva campo propio a propósito: `/api/lead` filtra la carga por una lista
    // fija de claves y las columnas de las data tables de n8n solo se agregan a mano
    // en su interfaz — una clave nueva se perdería en silencio hasta que alguien la
    // cree y la mapee. Aquí lo lee una PERSONA (Yael, en la ficha del lead) para
    // saber a qué conectarse.
    //
    // ⚠️ El día que este dato tenga que DECIDIR algo (puntuar, filtrar, cotizar),
    // primero se crea la columna en n8n: no se deduce leyendo esta prosa.
    const inventarioTxt = INVENTARIO_OPTIONS.filter((o) => s.inventarioHoy.includes(o.val))
      .map((o) =>
        o.val === "crm" && s.inventarioCrm.trim()
          ? `${o.label} (${s.inventarioCrm.trim()})`
          : o.label
      )
      .join(" + ");

    const detalleFinal = [detalleTxt, inventarioTxt && `Inventario hoy: ${inventarioTxt}`]
      .filter(Boolean)
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
            ? `${labelDe(PROSPECTOS_OPTIONS, s.pacientesSemana)} prospectos/semana`
            : "",
          canales: labelsDe(CANALES_OPTIONS, s.canales).join(", "),
          productos: productosTxt,
          agenda_hoy: agendaTxt,
          detalle: detalleFinal,
          urgencia: labelDe(URGENCIA_OPTIONS, s.urgencia),
          decisor: labelDe(PAPEL_OPTIONS, s.papel),
          horario_contacto: labelDe(HORARIO_OPTIONS, s.horario),
          mensaje: s.mensaje,
          contacto: s.contacto,
          correo: s.correo,
          citas_perdidas:
            s.citasPerdidas && s.citasPerdidas !== "nose" ? `${s.citasPerdidas} por semana` : "",
          ticket_promedio: s.ticket && s.ticket !== "nose" ? `${s.ticket} USD por venta` : "",
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
          {t.h1}
        </h1>
        <p className="mb-14 text-center font-light text-mocha">
          {t.subA}
          <span className="text-sand">{t.subFuerte}</span>
          {t.subB}
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mx-auto max-w-[760px]">
          {step !== "enviado" && (
            <ProgressDots step={step as number} total={6} label={t.paso(step as number, 6)} />
          )}

          <div className="card-soft rounded-[36px] p-8 md:p-12">
            {step === 1 && (
              <motion.div key="s1" {...panelAnim}>
                <StepHeader
                  q={t.q1}
                  hint={t.hint1}
                />
                <div className="mb-6">
                  <Field
                    label={t.campoNombreFirma}
                    type="text"
                    value={s.clinicaNombre}
                    placeholder={t.ejemploNombreFirma}
                    onChange={(v) => set({ clinicaNombre: v })}
                  />
                </div>
                <div className="mb-7">
                  <BlockLabel>{t.bloqueTipo}</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {CLINICA_OPTIONS.map((o0) => opcionEn(o0, idioma)).map((o) => (
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
                  <BlockLabel>{t.bloqueTamano}</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {TAMANO_OPTIONS.map(tr(t.tamano)).map((o) => (
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
                <NavBtns onNext={() => setStep(2)} nextEnabled={step1Ready} nextLabel={t.siguiente}
                  backLabel={t.atras} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" {...panelAnim}>
                <StepHeader
                  q={t.q2}
                  hint={t.hint2}
                />
                <div className="mb-7">
                  <BlockLabel>{t.bloqueProspectos}</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {PROSPECTOS_OPTIONS.map(tr(t.prospectos)).map((o) => (
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
                  <BlockLabel hint={t.hintPerdidos}>{t.bloquePerdidos}</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {CITAS_PERDIDAS_OPTIONS.map(tr(t.citasPerdidas)).map((o) => (
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
                  <BlockLabel hint={t.hintTicket}>{t.bloqueTicket}</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {TICKET_OPTIONS.map(tr(t.ticket)).map((o) => (
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
                  <BlockLabel hint={t.hintVarias}>{t.bloqueCanales}</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {CANALES_OPTIONS.map(tr(t.canales)).map((o) => (
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
                  nextLabel={t.siguiente}
                  backLabel={t.atras}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" {...panelAnim}>
                <StepHeader
                  q={t.q3}
                  hint={t.hint3}
                />
                <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {PRODUCTO_OPTIONS.map((o0) => opcionEn(o0, idioma)).map((o) => (
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
                  {t.sinPreferencia}
                </button>
                <NavBtns
                  onBack={() => setStep(2)}
                  onNext={() => setStep(4)}
                  nextEnabled={step3Ready}
                  nextLabel={t.siguiente}
                  backLabel={t.atras}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" {...panelAnim}>
                <StepHeader
                  q={t.q4}
                  hint={t.hint4}
                />

                <div className="mb-7">
                  <BlockLabel hint={t.hintAgenda}>{t.bloqueAgenda}</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {AGENDA_OPTIONS.map(tr(t.agenda)).map((o) => (
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
                        label={t.campoSoftware}
                        type="text"
                        value={s.agendaSoftware}
                        placeholder={t.ejemploSoftware}
                        onChange={(v) => set({ agendaSoftware: v })}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-7">
                  <BlockLabel hint={t.hintInventario}>{t.bloqueInventario}</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {INVENTARIO_OPTIONS.map(tr(t.inventario)).map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        check
                        selected={s.inventarioHoy.includes(o.val)}
                        onClick={() => toggleIn("inventarioHoy")(o.val)}
                      />
                    ))}
                  </div>
                  {s.inventarioHoy.includes("crm") && (
                    <div className="mt-4">
                      <Field
                        label={t.campoCrm}
                        type="text"
                        value={s.inventarioCrm}
                        placeholder={t.ejemploCrm}
                        onChange={(v) => set({ inventarioCrm: v })}
                      />
                    </div>
                  )}
                </div>

                {s.sinPreferencia ? (
                  <div className="mb-7">
                    <BlockLabel hint={t.hintVarias}>{t.bloqueDolores}</BlockLabel>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {DOLORES_OPTIONS.map(tr(t.dolores)).map((o) => (
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
                        <BlockLabel hint={t.hintVarias}>
                          <span className="mr-1.5">{p.icon}</span>
                          {preguntasActivas.length > 1 && (
                            <span className="text-mocha">{p.label} — </span>
                          )}
                          {preguntaTr(p.val).q || preg.q}
                        </BlockLabel>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {preg.options.map(tr(preguntaTr(p.val).opciones)).map((o) => (
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
                    label={t.campoMensaje}
                    value={s.mensaje}
                    placeholder={t.ejemploMensaje}
                    onChange={(v) => set({ mensaje: v })}
                  />
                </div>
                <NavBtns
                  onBack={() => setStep(3)}
                  onNext={() => setStep(5)}
                  nextEnabled={step4Ready}
                  nextLabel={t.siguiente}
                  backLabel={t.atras}
                />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" {...panelAnim}>
                <StepHeader
                  q={t.q5}
                  hint={t.hint5}
                />
                <div className="mb-7">
                  <BlockLabel hint={t.hintObjetivo}>{t.bloqueObjetivo}</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {OBJETIVO_OPTIONS.map(tr(t.objetivo)).map((o) => (
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
                  <BlockLabel>{t.bloqueUrgencia}</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {URGENCIA_OPTIONS.map(tr(t.urgencia)).map((o) => (
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
                  <BlockLabel>{t.bloquePapel}</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {PAPEL_OPTIONS.map(tr(t.papel)).map((o) => (
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
                  nextLabel={t.siguiente}
                  backLabel={t.atras}
                />
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="s6" {...panelAnim}>
                <StepHeader q={t.q6} hint={t.hint6} />
                <div className="mb-5 flex flex-col gap-5">
                  <Field
                    label={t.campoNombre}
                    type="text"
                    value={s.nombre}
                    placeholder={t.ejemploNombre}
                    onChange={(v) => set({ nombre: v })}
                  />
                  <Field
                    label={t.campoContacto}
                    type="tel"
                    value={s.contacto}
                    placeholder={t.ejemploContacto}
                    onChange={(v) => set({ contacto: v })}
                  />
                  <Field
                    label={t.campoCorreo}
                    type="email"
                    value={s.correo}
                    placeholder={t.ejemploCorreo}
                    onChange={(v) => set({ correo: v })}
                  />
                </div>
                <div className="mb-6">
                  <BlockLabel hint={t.hintHorario}>{t.bloqueHorario}</BlockLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {HORARIO_OPTIONS.map(tr(t.horario)).map((o) => (
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
                    {t.aceptoA}
                    <a
                      href={ruta(idioma, "/privacidad")}
                      className="text-clay-bright transition-colors hover:text-clay-bright"
                    >
                      {t.aceptoEnlace}
                    </a>
                    {t.aceptoB}
                  </span>
                </label>
                {error && (
                  <p className="mb-4 text-center text-xs text-clay-bright">{t.errorEnvio}</p>
                )}
                <NavBtns
                  onBack={() => setStep(5)}
                  onNext={submit}
                  nextEnabled={step6Ready}
                  nextLabel={t.enviar}
                  backLabel={t.atras}
                  loadingLabel={t.enviando}
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
                  {propuestaUrl ? t.listoTitulo(s.nombre) : t.graciasTitulo(s.nombre)}
                </h2>
                {propuestaUrl ? (
                  <>
                    <p className="mx-auto mb-8 max-w-md font-light leading-relaxed text-mocha">
                      {t.listoTexto} {s.correo.trim() ? t.listoTextoCorreo : ""}
                    </p>
                    <a
                      href={propuestaUrl}
                      className="btn-shine inline-block rounded-full bg-clay px-9 py-4 text-lg font-bold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright"
                    >
                      {t.verDiagnostico}
                    </a>
                    <p className="mt-5 text-xs font-light text-mocha">
                      {t.dudasA}
                      <a
                        href={linkWhatsApp(idioma)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sand underline hover:text-clay-bright"
                      >
                        {t.dudasEnlace}
                      </a>
                      {t.dudasB}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mx-auto mb-8 max-w-md font-light leading-relaxed text-mocha">
                      {t.graciasTexto}
                    </p>
                    <a
                      href={linkWhatsApp(idioma)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-shine inline-block rounded-full bg-clay px-8 py-3.5 font-semibold text-obsidian transition-all duration-300 hover:scale-[1.04] hover:bg-clay-bright"
                    >
                      {t.graciasCta}
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
