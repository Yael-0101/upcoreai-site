// ============================================================================
// Calculadora de ROI para clínicas — configura tu solución + estimado aterrizado
// ============================================================================

export type CalcState = {
  clinica: string | null;
  productos: string[]; // multi-select
  modo: "sistema" | "normal" | null;
  operacion: "yo" | "upcore" | null;
  msgs: string; // mensajes/consultas por día
  leads: string; // pacientes nuevos por mes
  email: string;
};

export const emptyState: CalcState = {
  clinica: null,
  productos: [],
  modo: null,
  operacion: null,
  msgs: "",
  leads: "",
  email: "",
};

export type Option = { val: string; label: string; icon: string; desc?: string };

export const CLINICA_OPTIONS: Option[] = [
  { val: "dental", label: "Dental", icon: "🦷" },
  { val: "estetica", label: "Medicina estética", icon: "✨" },
  { val: "medica", label: "Consultorio médico", icon: "🩺" },
  { val: "spa", label: "Spa / Belleza", icon: "💆" },
  { val: "otro", label: "Otra clínica", icon: "⚕️" },
];

type Producto = Option & {
  setupMin: number;
  setupMax: number;
  varMin: number;
  varMax: number;
  hrs: number;
};

export const PRODUCTO_OPTIONS: Producto[] = [
  { val: "agente", label: "Agente de WhatsApp 24/7", desc: "Responde, atiende y agenda solo", icon: "💬", setupMin: 500, setupMax: 900, varMin: 30, varMax: 120, hrs: 14 },
  { val: "web", label: "Sitio web con agenda", desc: "Una web que agenda y responde", icon: "🌐", setupMin: 600, setupMax: 1300, varMin: 5, varMax: 25, hrs: 6 },
  { val: "auto", label: "Automatizaciones", desc: "Recordatorios y seguimiento", icon: "🔄", setupMin: 300, setupMax: 600, varMin: 10, varMax: 45, hrs: 10 },
  { val: "reactivacion", label: "Reactivación de pacientes", desc: "Recupera pacientes que no vuelven", icon: "📈", setupMin: 250, setupMax: 550, varMin: 15, varMax: 60, hrs: 8 },
];

export const MODO_OPTIONS: Option[] = [
  { val: "sistema", label: "Con sistema completo", desc: "Dashboard + todo integrado", icon: "🧩" },
  { val: "normal", label: "Solo la pieza", desc: "Lo esencial, sin dashboard", icon: "⚡" },
];

export const OPERACION_OPTIONS: Option[] = [
  { val: "yo", label: "Yo lo opero", desc: "Pago único, sin mensualidad (Llave en Mano)", icon: "🔑" },
  { val: "upcore", label: "Que Upcore lo opere", desc: "Mensualidad, nos encargamos de todo (Gestionado)", icon: "🛠️" },
];

function roundNice(n: number): number {
  if (n < 200) return Math.round(n / 25) * 25;
  if (n < 1000) return Math.round(n / 50) * 50;
  if (n < 5000) return Math.round(n / 100) * 100;
  return Math.round(n / 500) * 500;
}

const money = (n: number) => "$" + roundNice(n).toLocaleString();

export type CalcResult = {
  inversion: string;
  inversionNota: string;
  costosCliente: string;
  mensualidadUpcore: string;
  ahorro: string;
  horas: string;
  roi: string;
  complejidad: string;
  incluye: string[];
};

export function calculate(s: CalcState): CalcResult {
  const prods = PRODUCTO_OPTIONS.filter((p) => s.productos.includes(p.val));
  const list = prods.length ? prods : [PRODUCTO_OPTIONS[0]];
  const sistema = s.modo === "sistema";
  const gestionado = s.operacion === "upcore";

  let setupMin = 0,
    setupMax = 0,
    varMin = 0,
    varMax = 0,
    hrs = 0;
  list.forEach((p) => {
    setupMin += p.setupMin;
    setupMax += p.setupMax;
    varMin += p.varMin;
    varMax += p.varMax;
    hrs += p.hrs;
  });
  if (sistema) {
    setupMin += 400;
    setupMax += 900;
    varMin += 10;
    varMax += 30;
  }

  const msgs = Math.max(parseInt(s.msgs) || 15, 0);
  const leads = Math.max(parseInt(s.leads) || 30, 0);

  // Los costos variables (tokens/APIs) crecen con el volumen de mensajes
  const volFactor = 1 + Math.min(msgs / 50, 2);
  const varLo = roundNice(varMin * volFactor);
  const varHi = roundNice(varMax * volFactor);

  // Horas ahorradas al mes (aprox: por leads y por mensajes)
  const minutosMes = leads * 10 + msgs * 26 * 4;
  const hoursSaved = Math.round(minutosMes / 60);
  // Ahorro = valor del tiempo recuperado + pacientes recuperados (no-shows/after-hours)
  const moneySaved = roundNice(hoursSaved * 12 + leads * 40);

  // Mensualidad de Upcore solo si es Gestionado
  const upLo = gestionado ? roundNice(200 + list.length * 70 + (sistema ? 80 : 0)) : 0;
  const upHi = gestionado ? roundNice(400 + list.length * 130 + (sistema ? 150 : 0)) : 0;

  const monthlyAvg = (varLo + varHi) / 2 + (gestionado ? (upLo + upHi) / 2 : 0);
  const roi = monthlyAvg > 0 ? Math.round((moneySaved / monthlyAvg) * 10) / 10 : 0;

  const totalSetup = setupMax + (sistema ? 0 : 0);
  const complejidad =
    totalSetup <= 900
      ? "Solución esencial"
      : totalSetup <= 2000
      ? "Sistema a la medida"
      : "Infraestructura completa";

  const incluye = list.map((p) => p.label);
  if (sistema) incluye.push("Dashboard + sistema integrado");

  return {
    inversion: `${money(setupMin)} – ${money(setupMax)}`,
    inversionNota: gestionado
      ? "Pago único, o repartido en tu mensualidad"
      : "Pago único",
    costosCliente: `${money(varLo)} – ${money(varHi)} /mes`,
    mensualidadUpcore: gestionado
      ? `${money(upLo)} – ${money(upHi)} /mes`
      : "$0 · tú lo operas",
    ahorro: `${money(moneySaved)} /mes`,
    horas: `${hoursSaved} h /mes`,
    roi: `${roi}x`,
    complejidad,
    incluye,
  };
}
