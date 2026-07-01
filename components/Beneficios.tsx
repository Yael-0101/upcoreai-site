import { Reveal } from "./Reveal";
import { GlassCard } from "./GlassCard";

const BENEFICIOS = [
  {
    title: "Eficiencia Directa",
    body: "Eliminamos tareas manuales para reducir gastos operativos drásticamente.",
    points: [
      "Hasta 60% menos carga operativa",
      "Procesos activos 24/7",
      "Enfoque en estrategia pura",
    ],
  },
  {
    title: "Escala Infinita",
    body: "Crece sin que tu estructura colapse. Maneja más clientes sin más personal.",
    points: [
      "Crecimiento sin fricción",
      "Sistemas para alto volumen",
      "Infraestructura de expansión",
    ],
  },
  {
    title: "Lógica de Datos",
    body: "Transformamos datos en acciones automáticas que optimizan el rendimiento.",
    points: [
      "Análisis sin intervención",
      "Decisiones basadas en hechos",
      "Precisión estratégica",
    ],
  },
];

export function Beneficios() {
  return (
    <section id="beneficios" className="px-[6%] py-28 md:px-[10%] md:py-36">
      <Reveal>
        <h2 className="mb-16 text-center text-[clamp(2.2rem,5vw,3.2rem)] font-semibold tracking-[-0.03em]">
          Beneficios
        </h2>
      </Reveal>

      <div className="mx-auto grid max-w-6xl gap-7 md:grid-cols-3">
        {BENEFICIOS.map((b, i) => (
          <Reveal key={b.title} delay={i * 0.12}>
            <GlassCard className="h-full p-9">
              <h3 className="mb-5 text-2xl font-semibold tracking-tight text-clay">
                {b.title}
              </h3>
              <p className="mb-6 font-light text-sand/90">{b.body}</p>
              <ul className="space-y-3">
                {b.points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm text-mocha">
                    <span className="text-clay">✔</span>
                    {p}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
