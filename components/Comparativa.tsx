import { SectionTitle } from "./SectionTitle";
import { Reveal } from "./Reveal";

// Comparación por CATEGORÍA (sin nombrar marcas): las 3 formas reales de
// resolver el WhatsApp de una clínica. Cifras = rangos públicos del mercado
// MX 2026 (ver Upcore-AI/competencia/informe-competencia-2026-07.md).
const OPCIONES = [
  {
    title: "Contratar más recepción",
    sub: "La solución tradicional",
    destacado: false,
    puntos: [
      { ok: true, texto: "Trato humano de principio a fin" },
      { ok: false, texto: "Cubre solo su turno — noches y domingos quedan solos" },
      { ok: false, texto: "En horas pico igual se satura" },
      { ok: false, texto: "Vacaciones, permisos y rotación" },
    ],
    costo: "Desde ~$10,000 MXN/mes por turno",
  },
  {
    title: "Software de gestión “con IA”",
    sub: "Las plataformas todo-en-uno",
    destacado: false,
    puntos: [
      { ok: true, texto: "Ordena expediente, agenda y facturación" },
      { ok: true, texto: "Recordatorios de cita por plantilla" },
      { ok: false, texto: "Su IA escribe notas médicas — no atiende pacientes" },
      { ok: false, texto: "El chat lo contesta tu equipo, a mano" },
      { ok: false, texto: "Te mudas a SU plataforma, con módulos que se cobran aparte" },
    ],
    costo: "$1,400–5,500 MXN/mes + extras",
  },
  {
    title: "Agente de IA de Upcore",
    sub: "La capa que contesta",
    destacado: true,
    puntos: [
      { ok: true, texto: "Contesta al instante, 24/7, también en domingo" },
      { ok: true, texto: "Conversa de verdad: entiende lenguaje natural" },
      { ok: true, texto: "Agenda solo, en TU calendario real" },
      { ok: true, texto: "Se integra a lo que ya usas — incluido tu software de gestión" },
      { ok: true, texto: "Todo queda a tu nombre, lo operes tú o nosotros" },
    ],
    costo: "Tu precio exacto: diagnóstico gratis en 3 min",
  },
];

export function Comparativa() {
  return (
    <section className="px-[6%] py-20 md:px-[10%] md:py-24">
      <SectionTitle
        title="Las 3 formas de resolver tu WhatsApp"
        sub="Comparación honesta — porque contratar gente o usar un software de gestión también son opciones reales."
        variant="maskReveal"
      />
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {OPCIONES.map((o, i) => (
          <Reveal key={o.title} delay={i * 0.08}>
            <div
              className={`card-soft h-full rounded-2xl p-7 ${
                o.destacado ? "border border-clay/50" : ""
              }`}
            >
              <div className="glass-body flex h-full flex-col">
                <div
                  className={`mb-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                    o.destacado ? "text-clay" : "text-mocha/70"
                  }`}
                >
                  {o.sub}
                </div>
                <h3 className="mb-4 text-lg font-semibold text-sand">{o.title}</h3>
                <ul className="mb-6 space-y-2.5">
                  {o.puntos.map((p) => (
                    <li key={p.texto} className="flex gap-2.5 text-sm font-light leading-snug">
                      <span
                        aria-hidden
                        className={`mt-0.5 shrink-0 ${p.ok ? "text-sage" : "text-mocha/50"}`}
                      >
                        {p.ok ? "✓" : "✗"}
                      </span>
                      <span className={p.ok ? "text-mocha" : "text-mocha/70"}>{p.texto}</span>
                    </li>
                  ))}
                </ul>
                <div
                  className={`mt-auto border-t border-[rgba(242,231,219,0.1)] pt-4 text-sm ${
                    o.destacado ? "font-medium text-clay" : "font-light text-mocha"
                  }`}
                >
                  {o.costo}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.25}>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm font-light leading-relaxed text-mocha">
          No es “uno u otro”: el agente se lleva bien con tu equipo y con tu
          software — es la capa que contesta cuando ellos no pueden.{" "}
          <a href="/demo" className="font-medium text-clay transition-colors hover:text-clay-bright">
            Pruébalo tú mismo en la demo →
          </a>
        </p>
      </Reveal>
    </section>
  );
}
