"use client";

// Portal de Arranque — el wizard donde el cliente hace TODA su parte del
// onboarding. Clonado del esqueleto de EmpezarForm + WizardUI. Autosave en cada
// "Siguiente" (guarda el estado COMPLETO en n8n vía /api/arranque) y resume
// automático (la página server hidrata con lo guardado).

import { useRef, useState } from "react";
import {
  OptionBtn,
  ProgressDots,
  StepHeader,
  Field,
  TextArea,
  NavBtns,
  type Option,
} from "./WizardUI";
import { CONTACT } from "@/lib/content";
import {
  conciergeListo,
  cuentasRequeridas,
  estadoDe,
  giroDemo,
  pasosVisibles,
  type ArranqueDatos,
  type PasoId,
  type ServicioItem,
  type TextoItem,
} from "@/lib/arranque";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | "listo";
const TOTAL_PASOS = 9;
// Número de paso ↔ su id (índice + 1). El orden es el del wizard de siempre;
// pasosVisibles() decide cuáles aplican a las piezas de ESTE proyecto.
const NUM_A_PASO: PasoId[] = [
  "bienvenida",
  "servicios",
  "horarios",
  "numero",
  "cuentas",
  "calendario",
  "demo",
  "textos",
  "resumen",
];
const numDePaso = (id: PasoId) => (NUM_A_PASO.indexOf(id) + 1) as Step & number;

const TONO_OPTIONS: Option[] = [
  { val: "calido", label: "Cálido y cercano", icon: "🤗", desc: "Como recepción de confianza" },
  { val: "profesional", label: "Profesional y directo", icon: "🤝", desc: "Claro, sin rodeos" },
  { val: "premium", label: "Elegante y discreto", icon: "✨", desc: "Tono de clínica premium" },
  { val: "relajado", label: "Fresco y relajado", icon: "😌", desc: "Juvenil, sin perder respeto" },
];

const NUMERO_OPTIONS: Option[] = [
  {
    val: "actual",
    label: "Mi número actual",
    icon: "📱",
    desc: "El que ya conocen tus pacientes",
  },
  { val: "nuevo", label: "Un número nuevo", icon: "🆕", desc: "Dedicado para el asistente" },
  { val: "asesoria", label: "No sé — asesórenme", icon: "🤔", desc: "Lo vemos juntos" },
];

// Quién le da los clics a las cuentas. "Créenmelas ustedes" va primero a propósito:
// es lo que la propuesta ofrece primero y lo que la mayoría de dueños prefiere.
const CUENTAS_MODO_OPTIONS: Option[] = [
  {
    val: "upcore",
    label: "Créenmelas ustedes",
    icon: "🤝",
    desc: "Nosotros las creamos a tu nombre",
  },
  { val: "yo", label: "Yo las creo", icon: "🙋", desc: "Con nuestra guía y video" },
];

// Las dos NO cuestan lo mismo para el cliente y hay que decírselo: con su correo,
// los códigos le llegan a él y nos los tiene que leer (una ida y vuelta por cuenta);
// con uno nuevo, llegan al buzón que administramos y él no hace nada.
const CORREO_OPTIONS: Option[] = [
  { val: "nuevo", label: "Créenme uno nuevo", icon: "✨", desc: "Recomendado · tú no haces nada" },
  { val: "mio", label: "Con un correo mío", icon: "📧", desc: "Nos lees unos códigos" },
];

const CALENDARIO_OPTIONS: Option[] = [
  { val: "google", label: "Google Calendar", icon: "📅" },
  { val: "software", label: "Mi software de agenda", icon: "🖥️" },
  { val: "ninguno", label: "Aún no uso ninguno", icon: "📓", desc: "Te montamos uno" },
];

const GUION_PRUEBAS = [
  "Pide una cita como paciente nuevo",
  "Pregunta el precio de un servicio",
  "Pide un horario y luego cámbialo",
  "Pregunta algo raro, a ver cómo sale",
  "Di “quiero hablar con una persona”",
];

const servicioVacio: ServicioItem = { nombre: "", precio: "", duracion: "" };

export function ArranquePortal({
  token,
  datosIniciales,
  estadoInicial,
}: {
  token: string;
  datosIniciales: ArranqueDatos;
  estadoInicial: string;
}) {
  const [d, setD] = useState<ArranqueDatos>(() => ({
    ...datosIniciales,
    checklist: {
      ...datosIniciales.checklist,
      servicios:
        datosIniciales.checklist.servicios.length > 0
          ? datosIniciales.checklist.servicios
          : [{ ...servicioVacio }],
    },
  }));
  const [step, setStep] = useState<Step>(() => {
    const p = datosIniciales.progreso.pasoActual;
    let n = p >= 1 && p <= TOTAL_PASOS ? p : 1;
    // Si el paso guardado ya no aplica a sus piezas (ej. "número" en un proyecto
    // de solo-web), se avanza al siguiente que sí aplique.
    const vis = new Set(
      pasosVisibles(datosIniciales.config.productos ?? []).map((id) => numDePaso(id))
    );
    while (n < TOTAL_PASOS && !vis.has(n as Step & number)) n++;
    return n as Step;
  });
  const [save, setSave] = useState<"idle" | "guardando" | "ok" | "error">("idle");
  const [enviando, setEnviando] = useState(false);
  // El estado "alcanzado" no se degrada al re-editar (y n8n solo avisa al CAMBIAR).
  const alcanzado = useRef<string | null>(
    estadoInicial === "parte-inicial-lista" || estadoInicial === "completado"
      ? estadoInicial
      : null
  );

  const patch = (p: Partial<ArranqueDatos>) => setD((prev) => ({ ...prev, ...p }));

  // Qué pasos aplican a este proyecto (por sus piezas). La navegación de abajo
  // sigue usando los números de siempre y aquí se brincan los que no aplican.
  const pasosLista = pasosVisibles(d.config.productos ?? []);
  const visibleNum = new Set(pasosLista.map((id) => numDePaso(id)));
  const tieneWeb = (d.config.productos ?? []).includes("web");

  const guardar = async (datos: ArranqueDatos, estado?: string) => {
    setSave("guardando");
    try {
      const res = await fetch("/api/arranque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          datos,
          estado: estado ?? alcanzado.current ?? "en-curso",
        }),
      });
      if (!res.ok) throw new Error("fail");
      setSave("ok");
      return true;
    } catch {
      setSave("error");
      return false;
    }
  };

  const irA = (n: Step) => {
    if (typeof n === "number") {
      // Los botones apuntan al paso vecino de siempre; si ese paso no aplica a
      // las piezas del proyecto, se sigue de largo en la misma dirección.
      // (1 y 9 siempre aplican, así que siempre se aterriza en algo visible.)
      const desde = typeof step === "number" ? step : TOTAL_PASOS;
      const dir = n >= desde ? 1 : -1;
      let destino = n;
      while (destino > 1 && destino < TOTAL_PASOS && !visibleNum.has(destino)) destino += dir;
      const datos = { ...d, progreso: { ...d.progreso, pasoActual: destino } };
      setD(datos);
      setStep(destino as Step);
      void guardar(datos); // autosave — si falla, el aviso queda visible y nada se pierde en pantalla
    } else {
      setStep(n);
    }
  };

  const finalizar = async () => {
    setEnviando(true);
    const estado = estadoDe(d);
    const ahora = new Date().toISOString();
    const datos: ArranqueDatos = {
      ...d,
      progreso: {
        ...d.progreso,
        pasoActual: TOTAL_PASOS,
        parteInicialEl: d.progreso.parteInicialEl ?? ahora,
        ...(estado === "completado" ? { completadoEl: ahora } : {}),
      },
    };
    setD(datos);
    const ok = await guardar(datos, estado);
    setEnviando(false);
    if (ok) {
      alcanzado.current = estado;
      setStep("listo");
    }
  };

  // ── Helpers de secciones ──────────────────────────────────────────────────
  const setChecklist = (p: Partial<ArranqueDatos["checklist"]>) =>
    patch({ checklist: { ...d.checklist, ...p } });
  const setServicio = (i: number, p: Partial<ServicioItem>) =>
    setChecklist({
      servicios: d.checklist.servicios.map((s, j) => (j === i ? { ...s, ...p } : s)),
    });
  const setCuenta = (id: string, p: Partial<{ lista: boolean; correo: string }>) => {
    const actual = d.cuentas[id] ?? { lista: false, correo: "" };
    patch({ cuentas: { ...d.cuentas, [id]: { ...actual, ...p } } });
  };
  const setConcierge = (p: Partial<ArranqueDatos["concierge"]>) =>
    patch({ concierge: { ...d.concierge, ...p } });
  const setTexto = (id: string, p: Partial<TextoItem>) =>
    patch({ textos: d.textos.map((t) => (t.id === id ? { ...t, ...p } : t)) });

  // ── Validaciones por paso ─────────────────────────────────────────────────
  const step2Ready = d.checklist.servicios.some((s) => s.nombre.trim() !== "");
  const step3Ready = d.checklist.horarios.trim() !== "" && !!d.checklist.tono;
  // Si el paso del número no aplica (proyecto sin piezas de WhatsApp), no puede
  // ser requisito: sería esperar por una decisión que nadie le va a pedir.
  const step4Ready = !visibleNum.has(4) || !!d.numero.decision;
  const nucleoListo = step2Ready && step3Ready && step4Ready;

  const cuentas = cuentasRequeridas(d.config);
  const nombreCorto = (d.config.nombre || "").trim().split(" ")[0];
  const linkDemo = `/demo?c=${encodeURIComponent(d.config.clinica || "Tu Clínica")}&g=${giroDemo(d.config.giro)}`;

  const chipGuardado =
    save === "guardando"
      ? "Guardando…"
      : save === "ok"
        ? "Guardado ✓"
        : save === "error"
          ? "⚠️ No se pudo guardar — revisa tu internet"
          : "";

  // ── Pantalla final ────────────────────────────────────────────────────────
  if (step === "listo") {
    const completo = alcanzado.current === "completado";
    return (
      <div className="card-soft rounded-[36px] p-8 text-center md:p-12">
        <div className="mb-4 text-5xl">{completo ? "🏆" : "🎉"}</div>
        <h2 className="mb-3 text-2xl font-semibold">
          {completo ? "¡Tu arranque está COMPLETO!" : `¡Listo${nombreCorto ? `, ${nombreCorto}` : ""}! Tu parte inicial está hecha`}
        </h2>
        <p className="mx-auto mb-8 max-w-md font-light text-mocha">
          {completo
            ? "No te falta nada. Nosotros seguimos construyendo y aquí mismo verás el avance de tu proyecto."
            : "Ya nos avisó el sistema y nos ponemos a construir. Lo que quede pendiente (cuentas, textos) lo puedes completar aquí mismo cuando quieras — este link es tuyo."}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={CONTACT.whatsapp}
            className="btn-shine rounded-full bg-clay px-7 py-3 text-sm font-semibold text-obsidian transition-all hover:scale-[1.03] hover:bg-clay-bright"
          >
            💬 Cualquier duda, por WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setStep(9)}
            className="rounded-full border border-[rgba(242,231,219,0.2)] px-7 py-3 text-sm font-medium text-sand transition-colors hover:border-clay hover:text-clay"
          >
            Volver a mi checklist
          </button>
        </div>
      </div>
    );
  }

  // El contador cuenta SOLO los pasos que aplican a este proyecto (un cliente de
  // solo-web ve "Paso 4 de 7", no un brinco del 3 al 5).
  const posEnLista =
    typeof step === "number" ? pasosLista.indexOf(NUM_A_PASO[step - 1]) + 1 : pasosLista.length;

  return (
    <div className="card-soft rounded-[36px] p-6 md:p-12">
      <ProgressDots
        step={posEnLista}
        total={pasosLista.length}
        label={`Paso ${posEnLista} de ${pasosLista.length}`}
      />

      {/* 1 · Bienvenida */}
      {step === 1 && (
        <div>
          <StepHeader
            q={`${nombreCorto ? `${nombreCorto}, b` : "B"}ienvenido a tu arranque 🚀`}
            hint="Aquí haces tu parte del proyecto, a tu ritmo — todo se guarda solo."
          />
          <div className="mx-auto mb-8 grid max-w-md gap-3 text-sm font-light">
            <div className="flex gap-3"><span>⏱️</span><span>Tu parte toma <strong className="font-semibold text-sand">~1 hora en total</strong>, y no tiene que ser de corrido: cierra y regresa con este mismo link cuando quieras.</span></div>
            <div className="flex gap-3"><span>🧭</span><span>Te vamos guiando paso por paso — no necesitas saber nada técnico.</span></div>
            <div className="flex gap-3"><span>🔒</span><span><strong className="font-semibold text-sand">Aquí jamás se piden contraseñas ni llaves.</strong> Solo confirmaciones. Si alguien te pide una contraseña por chat, no somos nosotros.</span></div>
          </div>
          <NavBtns onNext={() => irA(2)} nextEnabled nextLabel="Empezar →" />
        </div>
      )}

      {/* 2 · Servicios y precios */}
      {step === 2 && (
        <div>
          <StepHeader
            q="Tus servicios y precios"
            hint="Con esto tu asistente responde con TU información real. Los precios pueden ser aproximados o rangos."
          />
          <div className="mb-4 grid gap-3">
            {d.checklist.servicios.map((s, i) => (
              <div key={i} className="grid gap-2 rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
                <Field label={i === 0 ? "Servicio" : ""} type="text" value={s.nombre} placeholder="Ej. Limpieza dental" onChange={(v) => setServicio(i, { nombre: v })} />
                <Field label={i === 0 ? "Precio (MXN)" : ""} type="text" value={s.precio} placeholder="Ej. 800 o 700–900" onChange={(v) => setServicio(i, { precio: v })} />
                <Field label={i === 0 ? "Duración" : ""} type="text" value={s.duracion} placeholder="Ej. 45 min" onChange={(v) => setServicio(i, { duracion: v })} />
                <button
                  type="button"
                  aria-label="Quitar servicio"
                  onClick={() => setChecklist({ servicios: d.checklist.servicios.filter((_, j) => j !== i) })}
                  disabled={d.checklist.servicios.length === 1}
                  className="h-11 rounded-xl border border-[rgba(242,231,219,0.15)] px-3 text-mocha transition-colors hover:border-clay hover:text-clay disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setChecklist({ servicios: [...d.checklist.servicios, { ...servicioVacio }] })}
            className="mb-8 rounded-full border border-[rgba(242,231,219,0.2)] px-5 py-2 text-sm font-medium text-sand transition-colors hover:border-clay hover:text-clay"
          >
            + Agregar otro servicio
          </button>
          <NavBtns onBack={() => irA(1)} onNext={() => irA(3)} nextEnabled={step2Ready} nextLabel="Siguiente →" />
        </div>
      )}

      {/* 3 · Horarios, tono y extras */}
      {step === 3 && (
        <div>
          <StepHeader q="Horarios y personalidad" hint="Cómo atiende tu clínica y cómo quieres que suene tu asistente." />
          <div className="mb-6 grid gap-5">
            <TextArea
              label="Horarios de atención *"
              value={d.checklist.horarios}
              placeholder={"Ej. Lunes a viernes 9:00–19:00\nSábado 9:00–14:00 · Domingo cerrado"}
              onChange={(v) => setChecklist({ horarios: v })}
            />
            <div>
              <div className="mb-2 text-sm text-mocha">¿Cómo debe sonar tu asistente? *</div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {TONO_OPTIONS.map((o) => (
                  <OptionBtn key={o.val} opt={o} selected={d.checklist.tono === o.val} onClick={() => setChecklist({ tono: o.val })} />
                ))}
              </div>
            </div>
            <TextArea
              label="Preguntas frecuentes de tus pacientes (opcional)"
              value={d.checklist.faqs}
              placeholder="Ej. ¿Aceptan tarjeta? Sí, y meses sin intereses. ¿Atienden niños? Sí, desde 3 años…"
              onChange={(v) => setChecklist({ faqs: v })}
            />
            <TextArea
              label="Indicaciones o datos útiles (opcional)"
              value={d.checklist.indicaciones}
              placeholder="Ej. Estacionamiento en la parte trasera. Llegar 10 min antes en primera cita…"
              onChange={(v) => setChecklist({ indicaciones: v })}
            />
            <Field
              label="Logo y colores de tu marca (opcional)"
              type="text"
              value={d.checklist.logoColores}
              placeholder="Ej. Logo me lo mandas por WhatsApp · azul marino y dorado"
              onChange={(v) => setChecklist({ logoColores: v })}
            />
          </div>
          <NavBtns onBack={() => irA(2)} onNext={() => irA(4)} nextEnabled={step3Ready} nextLabel="Siguiente →" />
        </div>
      )}

      {/* 4 · Número de WhatsApp */}
      {step === 4 && (
        <div>
          <StepHeader q="¿Qué número atenderá tu asistente?" hint="La decisión importante — léela con calma, no hay respuesta incorrecta." />
          <div className="mx-auto mb-6 max-w-lg rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5 text-sm font-light text-mocha">
            <p className="mb-2"><strong className="font-semibold text-sand">📱 Tu número actual:</strong> tus pacientes ya lo conocen — es la mejor opción para la mayoría. El detalle: al conectarlo al asistente <strong className="font-semibold text-sand">sale de la app del teléfono</strong> y tu equipo pasa a responder desde una bandeja en la computadora.</p>
            <p><strong className="font-semibold text-sand">🆕 Un número nuevo:</strong> tu número de siempre se queda como está en tu teléfono, y el asistente estrena línea propia. Cuesta poco y se anuncia a tus pacientes.</p>
          </div>
          <div className="mx-auto mb-8 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
            {NUMERO_OPTIONS.map((o) => (
              <OptionBtn key={o.val} opt={o} selected={d.numero.decision === o.val} onClick={() => patch({ numero: { decision: o.val } })} />
            ))}
          </div>
          <NavBtns onBack={() => irA(3)} onNext={() => irA(5)} nextEnabled={step4Ready} nextLabel="Siguiente →" />
        </div>
      )}

      {/* 5 · Cuentas */}
      {step === 5 && (
        <div>
          <StepHeader
            q="Tus cuentas — tuyas desde el día uno"
            hint="Van A TU NOMBRE siempre: tú eres el dueño. Lo único que decides aquí es quién les da los clics."
          />
          <div className="mb-5 rounded-2xl border border-clay/40 bg-[rgba(200,98,61,0.07)] p-4 text-center text-sm font-light">
            🔒 <strong className="font-semibold text-sand">Nunca nos compartas contraseñas ni llaves</strong> — ni aquí, ni por WhatsApp. Elijas lo que elijas, jamás te vamos a pedir una.
          </div>

          {/* Quién las crea. La propuesta le prometió las dos opciones; aquí se cumplen. */}
          <div className="mx-auto mb-6 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
            {CUENTAS_MODO_OPTIONS.map((o) => (
              <OptionBtn
                key={o.val}
                opt={o}
                selected={d.concierge.modo === o.val}
                onClick={() => setConcierge({ modo: o.val as "upcore" | "yo" })}
              />
            ))}
          </div>

          {/* A) Se las creamos nosotros — solo necesitamos a nombre de quién quedan. */}
          {d.concierge.modo === "upcore" && (
            <div className="mb-8">
              <div className="mb-5 rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5 text-sm font-light text-mocha">
                <p className="mb-2">
                  Perfecto, nosotros les damos los clics. Las cuentas quedan{" "}
                  <strong className="font-semibold text-sand">a tu nombre y son tuyas</strong> — si algún
                  día te vas, se van contigo.
                </p>
                <p>
                  Lo único que necesitamos de ti: decirnos a qué correo y teléfono quedan.{" "}
                  <strong className="font-semibold text-sand">
                    Tu contraseña no nos hace falta para nada
                  </strong>{" "}
                  — las cuentas se abren con un código de un solo uso, y la contraseña de cada una la
                  defines tú al final.
                </p>
              </div>
              <div className="mx-auto grid max-w-lg gap-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-sand">¿Con qué correo las creamos?</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {CORREO_OPTIONS.map((o) => (
                      <OptionBtn
                        key={o.val}
                        opt={o}
                        selected={d.concierge.correoTipo === o.val}
                        onClick={() => setConcierge({ correoTipo: o.val as "mio" | "nuevo" })}
                      />
                    ))}
                  </div>
                  {d.concierge.correoTipo === "mio" && (
                    <p className="mt-3 text-sm font-light text-mocha">
                      Va. Como las cuentas se abren con tu correo, a tu bandeja te van a llegar 2 o 3
                      códigos de confirmación. Te escribimos por WhatsApp y nos los lees — un minuto
                      cada uno. Ojo: se vencen rápido, por eso te preguntamos abajo tu mejor horario.
                    </p>
                  )}
                  {d.concierge.correoTipo === "nuevo" && (
                    <p className="mt-3 text-sm font-light text-mocha">
                      La más cómoda y la que recomendamos: lo creamos nosotros, los códigos llegan
                      ahí y <strong className="font-semibold text-sand">tú no haces nada</strong>.
                      Además deja{" "}
                      <strong className="font-semibold text-sand">
                        todas las cuentas de tu clínica en un solo lugar
                      </strong>
                      , sin revolverse con tu correo personal. Al entregarte el proyecto te pasamos su
                      acceso en persona o por videollamada, y queda tuyo con todo adentro.
                    </p>
                  )}
                </div>
                {d.concierge.correoTipo === "mio" && (
                  <Field
                    label="Tu correo"
                    type="email"
                    value={d.concierge.correo}
                    placeholder="ej. hola@tuclinica.com"
                    onChange={(v) => setConcierge({ correo: v })}
                  />
                )}
                {d.concierge.correoTipo === "nuevo" && (
                  <Field
                    label="¿Cómo te gustaría que se llame? (opcional)"
                    type="text"
                    value={d.concierge.correoIdea}
                    placeholder="ej. contacto@clinicabeauty — si no, te proponemos uno"
                    onChange={(v) => setConcierge({ correoIdea: v })}
                  />
                )}
                <Field
                  label="Teléfono donde te llegan los códigos"
                  type="tel"
                  value={d.concierge.telefono}
                  placeholder="10 dígitos — normalmente el mismo de tu WhatsApp"
                  onChange={(v) => setConcierge({ telefono: v })}
                />
                <Field
                  label="¿Qué horario te queda mejor para que te escribamos? (opcional)"
                  type="text"
                  value={d.concierge.horario}
                  placeholder="ej. martes o jueves después de las 3, que es cuando puedo contestar rápido"
                  onChange={(v) => setConcierge({ horario: v })}
                />
              </div>
            </div>
          )}

          {/* B) Las crea el cliente — la guía de siempre. */}
          {d.concierge.modo === "yo" && (
          <div className="mb-8 grid gap-4">
            {cuentas.map((c) => {
              const est = d.cuentas[c.id] ?? { lista: false, correo: "" };
              return (
                <div key={c.id} className="rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5">
                  <div className="mb-1 font-semibold text-sand">{c.titulo}</div>
                  <div className="mb-3 text-sm font-light text-mocha">{c.para}</div>
                  <ol className="mb-3 grid gap-1.5 pl-5 text-sm font-light text-mocha" style={{ listStyle: "decimal" }}>
                    {c.pasos.map((p) => (
                      <li key={p.slice(0, 30)}>{p}</li>
                    ))}
                  </ol>
                  {c.nota && <p className="mb-3 text-xs font-light text-clay">{c.nota}</p>}
                  <div className="mb-3 rounded-xl border border-dashed border-[rgba(242,231,219,0.2)] p-3 text-center text-xs font-light text-mocha/70">
                    🎬 Video guía paso a paso — en camino
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-end">
                    <button
                      type="button"
                      onClick={() => setCuenta(c.id, { lista: !est.lista })}
                      aria-pressed={est.lista}
                      className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
                        est.lista
                          ? "border-sage bg-sage/20 text-sand"
                          : "border-[rgba(242,231,219,0.2)] text-mocha hover:border-clay hover:text-sand"
                      }`}
                    >
                      {est.lista ? "✓ Ya está lista" : "Marcar como lista"}
                    </button>
                    <Field
                      label=""
                      type="email"
                      value={est.correo}
                      placeholder="Correo con el que la creaste (opcional)"
                      onChange={(v) => setCuenta(c.id, { correo: v })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          )}
          <NavBtns
            onBack={() => irA(4)}
            onNext={() => irA(6)}
            nextEnabled={!!d.concierge.modo}
            nextLabel="Siguiente →"
          />
        </div>
      )}

      {/* 6 · Calendario */}
      {step === 6 && (
        <div>
          <StepHeader q="Tu calendario o agenda" hint="Para que las citas que se agenden — por tu asistente o por tu sitio — caigan donde tú ya trabajas." />
          <div className="mx-auto mb-5 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
            {CALENDARIO_OPTIONS.map((o) => (
              <OptionBtn key={o.val} opt={o} selected={d.calendario.tipo === o.val} onClick={() => patch({ calendario: { ...d.calendario, tipo: o.val } })} />
            ))}
          </div>
          {d.calendario.tipo === "google" && (
            <div className="mx-auto mb-5 max-w-lg rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5 text-sm font-light text-mocha">
              En tu Google Calendar: <strong className="font-semibold text-sand">Configuración del calendario → Compartir con determinadas personas → Añadir</strong>, y agrega el correo que te mandaremos por WhatsApp, con permiso de <em>“Realizar cambios en eventos”</em>.
            </div>
          )}
          {d.calendario.tipo === "software" && (
            <div className="mx-auto mb-5 max-w-lg rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5 text-sm font-light text-mocha">
              Perfecto — <strong className="font-semibold text-sand">tu sistema no se toca</strong>: nos integramos a él. Cuéntanos por WhatsApp cuál usas y te decimos el siguiente paso (suele ser un acceso de solo-agenda o un calendario espejo).
            </div>
          )}
          {d.calendario.tipo === "ninguno" && (
            <div className="mx-auto mb-5 max-w-lg rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5 text-sm font-light text-mocha">
              Sin problema: te dejamos un <strong className="font-semibold text-sand">Google Calendar ordenado y listo</strong> (gratis) como parte del proyecto. Marca la casilla y sigue.
            </div>
          )}
          <div className="mx-auto mb-8 max-w-lg">
            <button
              type="button"
              onClick={() => patch({ calendario: { ...d.calendario, compartido: !d.calendario.compartido } })}
              aria-pressed={d.calendario.compartido}
              className={`w-full rounded-full border px-5 py-3 text-sm font-semibold transition-all ${
                d.calendario.compartido
                  ? "border-sage bg-sage/20 text-sand"
                  : "border-[rgba(242,231,219,0.2)] text-mocha hover:border-clay hover:text-sand"
              }`}
            >
              {d.calendario.compartido ? "✓ Listo, ya quedó" : "Marcar cuando esté listo (puedes volver después)"}
            </button>
          </div>
          <NavBtns onBack={() => irA(5)} onNext={() => irA(7)} nextEnabled nextLabel="Siguiente →" />
        </div>
      )}

      {/* 7 · Probar el bot */}
      {step === 7 && (
        <div>
          <StepHeader q="Juega a ser tu paciente" hint="Prueba un asistente como el tuyo — así se sentirá escribirle a tu clínica." />
          <div className="mb-5 text-center">
            <a
              href={linkDemo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine inline-block rounded-full bg-clay px-8 py-3.5 font-semibold text-obsidian transition-all hover:scale-[1.03] hover:bg-clay-bright"
            >
              💬 Abrir la demo de {d.config.clinica || "tu clínica"} →
            </a>
          </div>
          <div className="mx-auto mb-6 max-w-md rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5">
            <div className="mb-2 text-sm font-semibold text-sand">Ponlo a prueba con esto:</div>
            <ul className="grid gap-1.5 text-sm font-light text-mocha">
              {GUION_PRUEBAS.map((g) => (
                <li key={g} className="flex gap-2"><span className="text-clay">→</span>{g}</li>
              ))}
            </ul>
          </div>
          <div className="mx-auto mb-4 max-w-md">
            <button
              type="button"
              onClick={() => patch({ prueba: { ...d.prueba, hecha: !d.prueba.hecha } })}
              aria-pressed={d.prueba.hecha}
              className={`w-full rounded-full border px-5 py-3 text-sm font-semibold transition-all ${
                d.prueba.hecha
                  ? "border-sage bg-sage/20 text-sand"
                  : "border-[rgba(242,231,219,0.2)] text-mocha hover:border-clay hover:text-sand"
              }`}
            >
              {d.prueba.hecha ? "✓ Ya lo probé" : "Marcar cuando lo hayas probado"}
            </button>
          </div>
          <div className="mx-auto mb-8 max-w-md">
            <TextArea
              label="¿Qué te pareció? ¿Algo que quieras distinto en el tuyo? (opcional)"
              value={d.prueba.comentarios}
              placeholder="Ej. Me gustó, pero quiero que siempre pregunte si es primera visita…"
              onChange={(v) => patch({ prueba: { ...d.prueba, comentarios: v } })}
            />
          </div>
          <NavBtns onBack={() => irA(6)} onNext={() => irA(8)} nextEnabled nextLabel="Siguiente →" />
        </div>
      )}

      {/* 8 · Aprobar textos (+ estilo del sitio si el proyecto lleva web) */}
      {step === 8 && (
        <div>
          <StepHeader
            q={tieneWeb ? "Los textos y el estilo de tu clínica" : "Los textos de tu clínica"}
            hint={
              tieneWeb
                ? "El estilo de tu sitio, y los textos que mandará tu sistema — tú les das el visto bueno."
                : "Recordatorios y confirmaciones que mandará tu sistema — tú les das el visto bueno."
            }
          />
          {tieneWeb && (
            <div className="mx-auto mb-8 max-w-md">
              <div className="mb-3 text-sm font-semibold text-sand">🎨 El estilo de tu sitio</div>
              <p className="mb-4 text-sm font-light text-mocha">
                Todo esto es opcional — pero entre más nos des, más tuyo se va a sentir el
                primer borrador.
              </p>
              <div className="grid gap-4">
                <Field
                  label="Tu paleta de colores (si tienes una)"
                  type="text"
                  value={d.web.paleta}
                  placeholder="Ej. azul marino y dorado · #1B2A4A y #C9A227 · o el link de una página cuyos colores te gusten"
                  onChange={(v) => patch({ web: { ...d.web, paleta: v } })}
                />
                {d.web.referencias.map((r, i) => (
                  <div
                    key={i}
                    className="grid gap-2 rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-4"
                  >
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Field
                          label={`Página que te gusta ${i + 1}`}
                          type="text"
                          value={r.url}
                          placeholder="https://…"
                          onChange={(v) =>
                            patch({
                              web: {
                                ...d.web,
                                referencias: d.web.referencias.map((x, j) =>
                                  j === i ? { ...x, url: v } : x
                                ),
                              },
                            })
                          }
                        />
                      </div>
                      <button
                        type="button"
                        aria-label="Quitar referencia"
                        onClick={() =>
                          patch({
                            web: {
                              ...d.web,
                              referencias: d.web.referencias.filter((_, j) => j !== i),
                            },
                          })
                        }
                        className="h-11 rounded-xl border border-[rgba(242,231,219,0.15)] px-3 text-mocha transition-colors hover:border-clay hover:text-clay"
                      >
                        ✕
                      </button>
                    </div>
                    <Field
                      label="¿Qué te gusta de ella?"
                      type="text"
                      value={r.nota}
                      placeholder="Ej. lo limpio del menú, cómo muestran los precios, las fotos grandes…"
                      onChange={(v) =>
                        patch({
                          web: {
                            ...d.web,
                            referencias: d.web.referencias.map((x, j) =>
                              j === i ? { ...x, nota: v } : x
                            ),
                          },
                        })
                      }
                    />
                  </div>
                ))}
                {d.web.referencias.length < 3 && (
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        web: { ...d.web, referencias: [...d.web.referencias, { url: "", nota: "" }] },
                      })
                    }
                    className="rounded-full border border-[rgba(242,231,219,0.2)] px-5 py-2 text-sm font-medium text-sand transition-colors hover:border-clay hover:text-clay"
                  >
                    + Agregar una página de referencia (máx. 3)
                  </button>
                )}
              </div>
            </div>
          )}
          {d.textos.length === 0 ? (
            // Los borradores de recordatorios solo existen en proyectos con piezas de
            // WhatsApp; a uno de solo-web no se le promete algo que no va a llegar.
            visibleNum.has(4) ? (
              <div className="mx-auto mb-8 max-w-md rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-6 text-center text-sm font-light text-mocha">
                ✍️ Tus textos están <strong className="font-semibold text-sand">en preparación</strong> (los redactamos con tu tono en cuanto tengamos tu checklist). Te avisaremos por WhatsApp cuando estén aquí para tu visto bueno — mientras, continúa.
              </div>
            ) : null
          ) : (
            <div className="mb-8 grid gap-4">
              {d.textos.map((t) => (
                <div key={t.id} className="rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold text-sand">{t.titulo}</div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        t.estado === "aprobado"
                          ? "bg-sage/20 text-sage"
                          : t.estado === "con-cambios"
                            ? "bg-clay/20 text-clay"
                            : "bg-[rgba(242,231,219,0.08)] text-mocha"
                      }`}
                    >
                      {t.estado === "aprobado" ? "Aprobado ✓" : t.estado === "con-cambios" ? "Con cambios" : "Por revisar"}
                    </span>
                  </div>
                  <p className="mb-4 whitespace-pre-wrap rounded-xl bg-[rgba(242,231,219,0.04)] p-4 text-sm font-light italic text-sand">
                    “{t.borrador}”
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setTexto(t.id, { estado: "aprobado", comentario: "" })}
                      className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
                        t.estado === "aprobado"
                          ? "border-sage bg-sage/20 text-sand"
                          : "border-[rgba(242,231,219,0.2)] text-mocha hover:border-sage hover:text-sand"
                      }`}
                    >
                      ✓ Me gusta, apruébalo
                    </button>
                    <button
                      type="button"
                      onClick={() => setTexto(t.id, { estado: "con-cambios" })}
                      className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
                        t.estado === "con-cambios"
                          ? "border-clay bg-clay/20 text-sand"
                          : "border-[rgba(242,231,219,0.2)] text-mocha hover:border-clay hover:text-sand"
                      }`}
                    >
                      ✎ Quiero cambios
                    </button>
                  </div>
                  {t.estado === "con-cambios" && (
                    <div className="mt-3">
                      <TextArea
                        label="¿Qué le cambiamos?"
                        value={t.comentario}
                        placeholder="Ej. Que no diga 'estimado paciente', mejor solo el nombre…"
                        onChange={(v) => setTexto(t.id, { comentario: v })}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <NavBtns onBack={() => irA(7)} onNext={() => irA(9)} nextEnabled nextLabel="Siguiente →" />
        </div>
      )}

      {/* 9 · Resumen y cierre */}
      {step === 9 && (
        <div>
          <StepHeader q="Así va tu parte" hint="Revisa el resumen — lo pendiente lo puedes completar después con este mismo link." />
          <div className="mx-auto mb-6 max-w-md rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5">
            {[
              { ok: step2Ready, txt: "Servicios y precios", req: true },
              { ok: step3Ready, txt: "Horarios y tono", req: true },
              // Las filas de pasos que no aplican a sus piezas no se listan: no se
              // le muestra pendiente algo que nadie le va a pedir.
              ...(visibleNum.has(4)
                ? [{ ok: step4Ready, txt: "Decisión del número de WhatsApp", req: true }]
                : []),
              // Si las creamos nosotros, no tiene sentido listarle una por una algo
              // que no le toca hacer: es una sola línea.
              ...(d.concierge.modo === "upcore"
                ? [
                    {
                      ok: conciergeListo(d.concierge),
                      txt: conciergeListo(d.concierge)
                        ? "Cuentas: las creamos nosotros a tu nombre"
                        : "Cuentas: falta decirnos tu correo y teléfono",
                      req: false,
                    },
                  ]
                : cuentas.map((c) => ({
                    ok: !!d.cuentas[c.id]?.lista,
                    txt: `Cuenta: ${c.titulo}`,
                    req: false,
                  }))),
              ...(visibleNum.has(6)
                ? [{ ok: d.calendario.compartido, txt: "Calendario compartido", req: false }]
                : []),
              ...(visibleNum.has(7)
                ? [{ ok: d.prueba.hecha, txt: "Probaste el asistente", req: false }]
                : []),
              ...(tieneWeb
                ? [
                    {
                      ok:
                        d.web.paleta.trim() !== "" ||
                        d.web.referencias.some((r) => r.url.trim() !== ""),
                      txt: "Estilo de tu sitio: paleta y referencias",
                      req: false,
                    },
                  ]
                : []),
              ...(d.textos.length > 0
                ? [{ ok: d.textos.every((t) => t.estado === "aprobado"), txt: "Textos aprobados", req: false }]
                : []),
            ].map((r) => (
              <div key={r.txt} className="flex items-center gap-3 border-b border-[rgba(242,231,219,0.07)] py-2 text-sm last:border-none">
                <span className={r.ok ? "text-sage" : "text-mocha/50"}>{r.ok ? "✓" : "○"}</span>
                <span className={`font-light ${r.ok ? "text-sand" : "text-mocha"}`}>
                  {r.txt}
                  {r.req && !r.ok && <span className="ml-2 text-xs text-clay">(falta — es esencial)</span>}
                </span>
              </div>
            ))}
          </div>
          {!nucleoListo && (
            <p className="mb-4 text-center text-sm font-light text-clay">
              Para avisarnos que arranquemos, completa lo marcado como esencial.
            </p>
          )}
          <div className="text-center">
            <NavBtns
              onBack={() => irA(8)}
              onNext={finalizar}
              nextEnabled={nucleoListo}
              nextLabel="Mi parte está lista 🚀"
              loading={enviando}
            />
          </div>
        </div>
      )}

      {/* Indicador de guardado */}
      <div className="mt-6 text-center text-xs font-light text-mocha/70" aria-live="polite">
        {chipGuardado || "Tu avance se guarda solo en cada paso."}
      </div>
    </div>
  );
}
