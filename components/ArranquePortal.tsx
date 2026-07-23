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
  cuentasRequeridas,
  estadoDe,
  giroDemo,
  type ArranqueDatos,
  type ServicioItem,
  type TextoItem,
} from "@/lib/arranque";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | "listo";
const TOTAL_PASOS = 9;

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
    return (p >= 1 && p <= TOTAL_PASOS ? p : 1) as Step;
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
      const datos = { ...d, progreso: { ...d.progreso, pasoActual: n } };
      setD(datos);
      setStep(n);
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
  const setTexto = (id: string, p: Partial<TextoItem>) =>
    patch({ textos: d.textos.map((t) => (t.id === id ? { ...t, ...p } : t)) });

  // ── Validaciones por paso ─────────────────────────────────────────────────
  const step2Ready = d.checklist.servicios.some((s) => s.nombre.trim() !== "");
  const step3Ready = d.checklist.horarios.trim() !== "" && !!d.checklist.tono;
  const step4Ready = !!d.numero.decision;
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

  return (
    <div className="card-soft rounded-[36px] p-6 md:p-12">
      <ProgressDots step={step} total={TOTAL_PASOS} label={`Paso ${step} de ${TOTAL_PASOS}`} />

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
            hint="Todo se crea A TU NOMBRE con tus propios clics. Marca las que ya tengas; puedes seguir sin terminarlas y volver después."
          />
          <div className="mb-5 rounded-2xl border border-clay/40 bg-[rgba(200,98,61,0.07)] p-4 text-center text-sm font-light">
            🔒 <strong className="font-semibold text-sand">Nunca nos compartas contraseñas ni llaves</strong> — ni aquí, ni por WhatsApp. Solo necesitamos saber que la cuenta existe.
          </div>
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
          <NavBtns onBack={() => irA(4)} onNext={() => irA(6)} nextEnabled nextLabel="Siguiente →" />
        </div>
      )}

      {/* 6 · Calendario */}
      {step === 6 && (
        <div>
          <StepHeader q="Tu calendario o agenda" hint="Para que las citas que agende tu asistente caigan donde tú ya trabajas." />
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

      {/* 8 · Aprobar textos */}
      {step === 8 && (
        <div>
          <StepHeader
            q="Los textos de tu clínica"
            hint="Recordatorios y confirmaciones que mandará tu sistema — tú les das el visto bueno."
          />
          {d.textos.length === 0 ? (
            <div className="mx-auto mb-8 max-w-md rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-6 text-center text-sm font-light text-mocha">
              ✍️ Tus textos están <strong className="font-semibold text-sand">en preparación</strong> (los redactamos con tu tono en cuanto tengamos tu checklist). Te avisaremos por WhatsApp cuando estén aquí para tu visto bueno — mientras, continúa.
            </div>
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
              { ok: step4Ready, txt: "Decisión del número de WhatsApp", req: true },
              ...cuentas.map((c) => ({ ok: !!d.cuentas[c.id]?.lista, txt: `Cuenta: ${c.titulo}`, req: false })),
              { ok: d.calendario.compartido, txt: "Calendario compartido", req: false },
              { ok: d.prueba.hecha, txt: "Probaste el asistente", req: false },
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
