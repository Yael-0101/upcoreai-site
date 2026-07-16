import Link from "next/link";
import { Reveal } from "./Reveal";
import { SectionTitle } from "./SectionTitle";

// Teaser de la demo en el home: mini-teléfono ESTÁTICO (no gasta API) + CTA a /demo.
const BURBUJAS: { de: "paciente" | "bot"; texto: string }[] = [
  { de: "paciente", texto: "Hola, ¿tienen cita para limpieza esta semana?" },
  {
    de: "bot",
    texto: "¡Claro! 😊 Tengo estos horarios: 1) jueves 10:00 a. m. 2) jueves 12:30 p. m. 3) viernes 4:30 p. m. ¿Cuál te queda?",
  },
  { de: "paciente", texto: "La del jueves a las 10" },
  {
    de: "bot",
    texto: "Listo, quedó tu cita el jueves a las 10:00 a. m. Un día antes te mando un recordatorio por aquí 🦷",
  },
];

export function DemoTeaser() {
  return (
    <section id="demo" className="px-[6%] py-24 md:px-[10%] md:py-32">
      <SectionTitle
        title="No nos creas. Pruébalo."
        sub="Chatea con una demostración del asistente como si fueras tu propio paciente — pide una cita y mira lo que sentirían los tuyos."
      />

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 md:flex-row md:gap-14">
        {/* Mini-teléfono estático */}
        <Reveal className="w-full md:w-1/2">
          <div className="glass animate-float mx-auto max-w-[330px] rounded-[2rem] p-2">
            <div className="glass-body space-y-2.5 rounded-[1.6rem] bg-[#141310] px-3 py-4">
              <div className="mb-1 flex items-center gap-2 border-b border-white/[0.07] pb-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-clay text-xs font-bold text-obsidian">
                  C
                </span>
                <div>
                  <div className="text-xs font-semibold text-sand">Asistente de tu clínica</div>
                  <div className="text-[0.6rem] text-sage">en línea · responde en segundos</div>
                </div>
              </div>
              {BURBUJAS.map((b, i) => (
                <div key={i} className={b.de === "paciente" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-1.5 text-[0.72rem] leading-relaxed text-sand ${
                      b.de === "paciente"
                        ? "rounded-br-sm bg-[rgba(200,98,61,0.22)]"
                        : "rounded-bl-sm bg-white/[0.06]"
                    }`}
                  >
                    {b.texto}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Copy + CTA */}
        <Reveal delay={0.15} className="w-full text-center md:w-1/2 md:text-left">
          <h3 className="text-2xl font-semibold tracking-tight text-sand">
            Así se siente no perder un solo paciente
          </h3>
          <p className="mt-3 text-base font-light leading-relaxed text-mocha">
            El asistente responde al momento, resuelve dudas y agenda la cita — a las 8 de la
            mañana o a las 11 de la noche. La demo es interactiva: escríbele lo que quieras.
          </p>
          <Link
            href="/demo"
            className="btn-shine mt-6 inline-block rounded-full bg-clay px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
          >
            Pruébalo tú mismo →
          </Link>
          <p className="mt-3 text-xs font-light text-mocha/70">
            Sin registro. Es una demo con datos ficticios.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
