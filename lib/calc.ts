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
  /**
   * Precio FIJO de construcción, en pesos (pago único). Ya no es un rango: un rango
   * de 3x no es un precio, es decirle al cliente "no sé cuánto te voy a cobrar" — y
   * el techo espantaba. Cada número está anclado a lo que cobra el mercado mexicano
   * (jul-2026) y a lo que le cuesta a la clínica no resolverlo.
   */
  setupMXN: number;
  varMin: number;
  varMax: number;
  hrs: number;
  alcance: string; // qué incluye concretamente (para dejar claro el alcance)
  /**
   * true = el costo variable escala casi lineal con el volumen.
   * La voz se cobra POR MINUTO HABLADO (~$0.12–$0.18 USD/min): al doble de llamadas,
   * el doble de costo. El resto de productos casi no escalan (responder un mensaje es
   * gratis dentro de la ventana de 24 h), por eso usan el factor suave.
   */
  escalaFuerte?: boolean;
};

// setupMXN = construcción (pago único, PESOS). var = costo que corre al mes (USD, a
// nombre del cliente). Anclas de mercado MX (jul-2026) detrás de cada precio:
//   agente $24,000 → Simplixy Profesional cobra $21,900 y hace menos; BotHoy renta a
//     $2,990/mes (8 meses); una recepcionista extra cuesta $8-12,000 AL MES.
//   voz $26,000 → Vokey $999/mes (26 meses), Callbeat $1,290/mes (20 meses).
//   web $18,000 → web médica en México va de $14,000 a $45,000.
//   auto $14,000 → implementar n8n arranca en $20,000; esto es más acotado.
//   reactivacion $12,000 → se paga con 2-3 pacientes recuperados.
export const PRODUCTO_OPTIONS: Producto[] = [
  { val: "agente", label: "Agente de WhatsApp 24/7", desc: "Responde, atiende y agenda solo", icon: "💬", setupMXN: 24000, varMin: 5, varMax: 16, hrs: 14, alcance: "responde WhatsApp 24/7, agenda, confirma citas y califica pacientes" },
  { val: "voz", label: "Agente de voz 24/7", desc: "Contesta el teléfono y agenda", icon: "📞", setupMXN: 26000, varMin: 15, varMax: 30, hrs: 16, escalaFuerte: true, alcance: "contesta las llamadas que hoy se pierden, resuelve dudas hablando, agenda en tu agenda y avisa a recepción — conservando tu número actual" },
  { val: "web", label: "Sitio web con agenda", desc: "Una web que agenda y responde", icon: "🌐", setupMXN: 18000, varMin: 0, varMax: 10, hrs: 6, alcance: "sitio con agenda online que responde y capta pacientes" },
  { val: "auto", label: "Automatizaciones", desc: "Recordatorios y seguimiento", icon: "🔄", setupMXN: 14000, varMin: 6, varMax: 12, hrs: 10, alcance: "recordatorios, confirmaciones y seguimientos que corren solos" },
  { val: "reactivacion", label: "Reactivación de pacientes", desc: "Recupera pacientes que no vuelven", icon: "📈", setupMXN: 12000, varMin: 6, varMax: 20, hrs: 8, alcance: "campaña para recuperar pacientes que dejaron de venir" },
];

/** De la SEGUNDA pieza en adelante. No es un descuento inventado: montar la segunda
 *  sobre lo ya construido cuesta menos de verdad. */
export const DESCUENTO_PAQUETE = 0.15;

/** Gestionado: mensualidad fija en pesos (el mercado cobra $2,990-4,497/mes). */
export const MENSUALIDAD_BASE = 3500;
export const MENSUALIDAD_POR_PIEZA_EXTRA = 700;

// El panel/dashboard NO es una pieza: es un añadido que se monta encima de las demás.
// Vive aquí, en un solo lugar, porque su precio se usa en dos partes (el total cuando el
// cliente lo quiere, y el "+$X" del añadido opcional en su propuesta).
// $12,000: los softwares dentales completos (Dentalink, Doctocliq) cuestan $315-536
// AL MES, así que esto equivale a ~2 años de renta — y es suyo. Antes se cotizaba
// hasta en $74,000, que no se sostenía contra esa comparación.
export const PANEL_ADICIONAL = {
  setupMXN: 12000,
  varMax: 10, // hosting/BD si escala; el piso suele ser $0
};

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
// Exportada: el motor de propuestas cotiza los AÑADIDOS opcionales con esta misma fórmula,
// para que un "+$X" de la propuesta nunca se calcule con un redondeo distinto al del total.
export function money(loUSD: number, hiUSD: number, perMonth = false): Money {
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

// Un precio CERRADO en pesos (el dólar se muestra solo como referencia). Se usa para
// todo lo que Upcore cobra; `money()` se queda para lo que de verdad es un rango:
// el consumo de APIs del cliente, que depende de su volumen.
export function precioFijo(mxn: number, perMonth = false): Money {
  const suf = perMonth ? "/mes" : "";
  return {
    mxn: `$${fmt(mxn)} MXN${suf}`,
    usd: `≈ $${fmt(roundUSD(mxn / FX))} USD${suf}`,
  };
}

/** Lee un precio ya formateado ("$24,000 MXN") y devuelve el número. Null si no se puede:
 *  el acuerdo prefiere no generarse a generarse con una cifra inventada. */
export function pesosDe(precio: string): number | null {
  const limpio = (precio || "").replace(/[^0-9]/g, "");
  if (!limpio) return null;
  const n = Number(limpio);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Parte un precio en anticipo (50%) y resto, para el acuerdo. El anticipo se redondea a
 *  centenas y el RESTO se calcula por diferencia — así los dos pagos siempre suman el total
 *  exacto, aunque el precio sea impar. Único dueño de esta cuenta: si el 50% cambia, cambia
 *  aquí y en ningún otro lado. */
export function partirEnDosPagos(
  precioMXN: string
): { total: number; anticipo: Money; resto: Money } | null {
  const total = pesosDe(precioMXN);
  if (total === null) return null;
  const anticipo = Math.round(total / 2 / 100) * 100;
  // Con un total absurdamente bajo el redondeo dejaría el anticipo en $0 (o en el total
  // entero). Antes que emitir un acuerdo que diga "Para arrancar: $0", no se emite.
  if (anticipo <= 0 || anticipo >= total) return null;
  return { total, anticipo: precioFijo(anticipo), resto: precioFijo(total - anticipo) };
}

/** Suma los precios de las piezas aplicando el descuento de paquete: la más cara a
 *  precio completo y el resto con descuento, para que quitar una pieza siempre baje. */
export function sumarPiezas(preciosMXN: number[]): number {
  const orden = [...preciosMXN].sort((a, b) => b - a);
  return orden.reduce(
    (total, p, i) =>
      total + (i === 0 ? p : Math.round((p * (1 - DESCUENTO_PAQUETE)) / 100) * 100),
    0
  );
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

  let varMin = 0,
    varMax = 0,
    // Productos que se cobran por uso real (voz): se escalan aparte, más fuerte.
    varMinUso = 0,
    varMaxUso = 0,
    hrs = 0;
  list.forEach((p) => {
    if (p.escalaFuerte) {
      varMinUso += p.varMin;
      varMaxUso += p.varMax;
    } else {
      varMin += p.varMin;
      varMax += p.varMax;
    }
    hrs += p.hrs;
  });
  const piezasMXN = list.map((p) => p.setupMXN);
  if (sistema) {
    piezasMXN.push(PANEL_ADICIONAL.setupMXN);
    varMax += PANEL_ADICIONAL.varMax;
  }
  const setupMXN = sumarPiezas(piezasMXN);

  const msgs = Math.max(parseInt(s.msgs) || 15, 0);
  const leads = Math.max(parseInt(s.leads) || 30, 0);

  // Factor de volumen SUAVE (los costos reales casi no escalan: responder es gratis).
  // ~1.3x en volumen bajo → ~2.6x en muy alto. Los mensajes pesan más; los pacientes
  // algo (marketing/reactivación sí escala con envíos).
  const volFactor =
    1 + Math.min(msgs / 70, 1.2) + Math.min(leads / 250, 0.4);
  // La voz SÍ escala: se paga por minuto hablado. Al doble de llamadas, el doble de costo.
  // Techo ~6.5x sobre la base (clínica de alto volumen, ~1,200 min/mes).
  const volFactorUso =
    1 + Math.min(msgs / 25, 4) + Math.min(leads / 100, 1.5);
  const varLoUSD = varMin * volFactor + varMinUso * volFactorUso;
  const varHiUSD = varMax * volFactor + varMaxUso * volFactorUso;

  // --- Ahorro (conservador y honesto) ---------------------------------------
  const has = (v: string) => list.some((p) => p.val === v);
  const capta24_7 = has("agente") || has("web") || has("voz"); // responde e invita a agendar al instante
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
  // Fija y predecible: base + un extra por cada pieza que hay que operar.
  const nPiezas = piezasMXN.length;
  const upMXN = gestionado
    ? MENSUALIDAD_BASE + MENSUALIDAD_POR_PIEZA_EXTRA * Math.max(nPiezas - 1, 0)
    : 0;
  const upAvg = upMXN / FX; // el resto del cálculo de retorno corre en USD

  const varAvg = (varLoUSD + varHiUSD) / 2;
  const setupAvg = setupMXN / FX;

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
    setupMXN <= 30000
      ? "Solución esencial"
      : setupMXN <= 60000
      ? "Sistema a la medida"
      : "Infraestructura completa";

  const incluye = list.map((p) => `${p.label} — ${p.alcance}`);
  if (sistema)
    incluye.push("Dashboard + sistema integrado — todo operando junto, con tu ROI a la vista");

  return {
    inversion: precioFijo(setupMXN),
    inversionNota:
      (nPiezas > 1 ? "Precio cerrado, ya con descuento por paquete · " : "Precio cerrado · ") +
      (gestionado ? "pago único (o repartido en tu mensualidad)" : "pago único"),
    costosCliente: money(varLoUSD, varHiUSD, true),
    costosNota: has("voz")
      ? "APIs, IA y hosting — van directo a los proveedores, a tu nombre. Upcore no les agrega margen. El agente de voz se cobra por minuto hablado, así que sube con tus llamadas: se contrata con tope de gasto y ves tu consumo tú mismo."
      : "APIs, IA y hosting — van directo a los proveedores, a tu nombre. Upcore no les agrega margen.",
    mensualidadUpcore: gestionado ? precioFijo(upMXN, true) : { mxn: "$0", usd: "" },
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
