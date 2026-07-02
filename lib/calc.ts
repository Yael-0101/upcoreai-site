// ============================================================================
// Calculadora de ROI para clínicas — configura tu solución + estimado aterrizado
// Números basados en costos y precios reales de mercado (investigados, 2025-2026).
// Cálculo interno en USD; se muestra en pesos (MXN) + equivalente en dólares.
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

// Tipo de cambio aproximado (solo para mostrar; se avisa que es aprox.)
const FX = 18.5;

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
  alcance: string; // qué incluye concretamente (para dejar claro el alcance)
};

// setup = construcción (pago único, USD). var = costo que corre al mes (USD, a nombre del cliente).
// Cifras alineadas al mercado real: entrada accesible en el piso, realista de mercado en el techo.
export const PRODUCTO_OPTIONS: Producto[] = [
  { val: "agente", label: "Agente de WhatsApp 24/7", desc: "Responde, atiende y agenda solo", icon: "💬", setupMin: 1000, setupMax: 3000, varMin: 5, varMax: 16, hrs: 14, alcance: "responde WhatsApp 24/7, agenda, confirma citas y califica pacientes" },
  { val: "web", label: "Sitio web con agenda", desc: "Una web que agenda y responde", icon: "🌐", setupMin: 800, setupMax: 2500, varMin: 0, varMax: 10, hrs: 6, alcance: "sitio con agenda online que responde y capta pacientes" },
  { val: "auto", label: "Automatizaciones", desc: "Recordatorios y seguimiento", icon: "🔄", setupMin: 700, setupMax: 2200, varMin: 6, varMax: 12, hrs: 10, alcance: "recordatorios, confirmaciones y seguimientos que corren solos" },
  { val: "reactivacion", label: "Reactivación de pacientes", desc: "Recupera pacientes que no vuelven", icon: "📈", setupMin: 500, setupMax: 2000, varMin: 6, varMax: 20, hrs: 8, alcance: "campaña para recuperar pacientes que dejaron de venir" },
];

export const MODO_OPTIONS: Option[] = [
  { val: "sistema", label: "Con sistema completo", desc: "Dashboard + todo integrado", icon: "🧩" },
  { val: "normal", label: "Solo la pieza", desc: "Lo esencial, sin dashboard", icon: "⚡" },
];

export const OPERACION_OPTIONS: Option[] = [
  { val: "yo", label: "Yo lo opero", desc: "Pago único, sin mensualidad (Llave en Mano)", icon: "🔑" },
  { val: "upcore", label: "Que Upcore lo opere", desc: "Mensualidad, nos encargamos de todo (Gestionado)", icon: "🛠️" },
];

// --- Redondeo bonito por moneda -------------------------------------------
function roundMXN(n: number): number {
  if (n < 1000) return Math.round(n / 50) * 50;
  if (n < 10000) return Math.round(n / 100) * 100;
  if (n < 100000) return Math.round(n / 500) * 500;
  return Math.round(n / 1000) * 1000;
}
function roundUSD(n: number): number {
  if (n < 100) return Math.round(n / 5) * 5;
  if (n < 1000) return Math.round(n / 25) * 25;
  if (n < 10000) return Math.round(n / 100) * 100;
  return Math.round(n / 500) * 500;
}
const fmt = (n: number) => n.toLocaleString("en-US");

export type Money = { mxn: string; usd: string };

// Convierte un rango en USD a strings en ambas monedas (pesos principal, dólares equivalente).
function money(loUSD: number, hiUSD: number, perMonth = false): Money {
  const suf = perMonth ? "/mes" : "";
  const mxnLo = roundMXN(loUSD * FX);
  const mxnHi = roundMXN(hiUSD * FX);
  const usdLo = roundUSD(loUSD);
  const usdHi = roundUSD(hiUSD);
  const mxn =
    mxnLo === mxnHi
      ? `$${fmt(mxnLo)} MXN${suf}`
      : `$${fmt(mxnLo)} – $${fmt(mxnHi)} MXN${suf}`;
  const usd =
    usdLo === usdHi
      ? `≈ $${fmt(usdLo)} USD${suf}`
      : `≈ $${fmt(usdLo)} – $${fmt(usdHi)} USD${suf}`;
  return { mxn, usd };
}

export type CalcResult = {
  inversion: Money;
  inversionNota: string;
  costosCliente: Money;
  costosNota: string;
  mensualidadUpcore: Money;
  upcoreNota: string;
  ahorro: Money;
  ahorroNota: string;
  roi: string;
  roiNota: string;
  recomendacion: string;
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
    setupMin += 1500;
    setupMax += 4000;
    varMax += 10; // dashboard: hosting/BD si escala; el piso suele ser $0
  }

  const msgs = Math.max(parseInt(s.msgs) || 15, 0);
  const leads = Math.max(parseInt(s.leads) || 30, 0);

  // Factor de volumen SUAVE (los costos reales casi no escalan: responder es gratis).
  // ~1.3x en volumen bajo → ~2.6x en muy alto. Los mensajes pesan más; los pacientes
  // algo (marketing/reactivación sí escala con envíos).
  const volFactor =
    1 + Math.min(msgs / 70, 1.2) + Math.min(leads / 250, 0.4);
  const varLoUSD = varMin * volFactor;
  const varHiUSD = varMax * volFactor;

  // --- Ahorro (conservador y honesto) ---------------------------------------
  const has = (v: string) => list.some((p) => p.val === v);
  const capta24_7 = has("agente") || has("web"); // responde e invita a agendar al instante
  const hasReact = has("reactivacion");

  const HORA_USD = 3.5; // sueldo de recepción en México (~$65 MXN/h)
  const CITA_USD = 85; // cita recuperada / no-show (~$1,570 MXN, conservador)
  const NUEVO_USD = 150; // paciente NUEVO captado — MUY por debajo del real ($400-500)

  // Horas liberadas al mes (aprox), con tope realista (~1 día/semana en volumen alto).
  const minutosMes = msgs * 30 + leads * 8;
  const hoursSaved = Math.min(Math.round(minutosMes / 60), 80);
  const timeValue = hoursSaved * HORA_USD;

  // No-shows evitados por recordatorios (−22% conservador).
  const noShowsSaved = leads * 0.06;
  // Pacientes NUEVOS captados 24/7 (el mayor valor del agente/web: responder al instante).
  const nuevosCaptados = leads * (capta24_7 ? 0.1 : 0.03);
  // Pacientes que regresan si hay reactivación.
  const reactivados = hasReact ? leads * 0.1 : 0;

  const citasGanadas = noShowsSaved + nuevosCaptados + reactivados;
  const ahorroUSD =
    timeValue +
    noShowsSaved * CITA_USD +
    nuevosCaptados * NUEVO_USD +
    reactivados * CITA_USD;

  // --- Mensualidad de Upcore (solo Gestionado) ------------------------------
  const n = list.length;
  const upLoUSD = gestionado ? 120 + n * 40 + (sistema ? 30 : 0) : 0;
  const upHiUSD = gestionado ? 220 + n * 70 + (sistema ? 90 : 0) : 0;
  const upAvg = (upLoUSD + upHiUSD) / 2;

  const varAvg = (varLoUSD + varHiUSD) / 2;
  const setupAvg = (setupMin + setupMax) / 2;

  // ROI sobre el costo RECURRENTE (variable + mensualidad), con tope para no verse irreal.
  const recurringUSD = varAvg + upAvg;
  const roiNum = recurringUSD > 0 ? ahorroUSD / recurringUSD : 0;
  const roi = roiNum >= 10 ? "10x+" : `${Math.round(roiNum * 10) / 10}x`;

  // Asesor honesto: si a este volumen no sale bien rentable, recomendar la opción ligera
  // en vez de empujar el plan caro. Nunca forzamos la venta.
  const netRatio = recurringUSD > 0 ? ahorroUSD / recurringUSD : 99;
  const gananciaNetaUSD = Math.max(ahorroUSD - recurringUSD, 0);
  const combo = sistema && gestionado; // el combo más caro: solo rinde con buen volumen
  let recomendacion = "";
  if (netRatio < 1) {
    recomendacion = gestionado
      ? "A tu volumen de ahora, el plan Gestionado todavía no se paga solo. Te conviene empezar en Llave en Mano (sin mensualidad) o con solo la pieza esencial, y pasar a Gestionado cuando crezca tu volumen."
      : "A tu volumen de ahora los números salen justos. En tu diagnóstico gratis vemos si te conviene arrancar más ligero o esperar a tener un poco más de movimiento.";
  } else if (combo && netRatio < 2) {
    recomendacion =
      "El sistema completo + Gestionado rinde de verdad cuando ya tienes buen volumen. A tu nivel de ahora te conviene empezar más ligero (solo el agente, o Llave en Mano) y crecer hacia el sistema gestionado cuando el volumen lo pida — así te sale rentable desde el primer día.";
  } else if (gestionado && netRatio < 1.6) {
    recomendacion =
      "Ya es rentable, pero a tu volumen quizá te convenga empezar en Llave en Mano (sin mensualidad) y subir a Gestionado más adelante.";
  }

  // Payback: meses para recuperar la inversión con el ahorro neto de la mensualidad.
  const netMensual = Math.max(ahorroUSD - upAvg, ahorroUSD * 0.15);
  const paybackMeses = Math.max(1, Math.min(Math.round(setupAvg / netMensual), 36));
  const mesesTxt = paybackMeses === 1 ? "mes" : "meses";

  // Reencuadre del retorno: además del múltiplo, la ganancia neta al mes y (si es Gestionado)
  // el valor de que Upcore lo opere.
  const netaMXN = `$${roundMXN(gananciaNetaUSD * FX).toLocaleString("en-US")} MXN`;
  let roiNota: string;
  if (netRatio < 1) {
    roiNota = `A tu volumen de ahora tardaría ~${paybackMeses} ${mesesTxt} en recuperarse.`;
  } else {
    const neta =
      gananciaNetaUSD > 0 ? ` Te quedan ~${netaMXN} limpios al mes.` : "";
    const manos = gestionado ? " Y nosotros lo operamos por ti." : "";
    roiNota = `Recuperas tu inversión en ~${paybackMeses} ${mesesTxt}.${neta}${manos}`;
  }

  const complejidad =
    setupMax <= 2500
      ? "Solución esencial"
      : setupMax <= 6000
      ? "Sistema a la medida"
      : "Infraestructura completa";

  const incluye = list.map((p) => `${p.label} — ${p.alcance}`);
  if (sistema)
    incluye.push("Dashboard + sistema integrado — todo operando junto, con tu ROI a la vista");

  return {
    inversion: money(setupMin, setupMax),
    inversionNota: gestionado
      ? "Pago único (o repartido en tu mensualidad)"
      : "Pago único",
    costosCliente: money(varLoUSD, varHiUSD, true),
    costosNota:
      "APIs, IA y hosting — van directo a los proveedores, a tu nombre. Upcore no les agrega margen.",
    mensualidadUpcore: gestionado
      ? money(upLoUSD, upHiUSD, true)
      : { mxn: "$0", usd: "" },
    upcoreNota: gestionado
      ? "Operación, mantenimiento y mejoras"
      : "Plan Llave en Mano · tú lo operas, sin mensualidad",
    ahorro: money(ahorroUSD, ahorroUSD, true),
    ahorroNota: `≈ ${Math.max(1, Math.round(citasGanadas))} cita(s)/mes recuperadas + el tiempo de tu equipo`,
    roi,
    roiNota,
    recomendacion,
    complejidad,
    incluye,
  };
}
