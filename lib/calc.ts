// ============================================================================
// Calculadora de retorno — configura tu solución + estimado aterrizado
// Números basados en costos y precios reales de mercado (investigados, 2025-2026).
// Todo el cálculo y el precio corren en la moneda del nicho (lib/nicho.json). Hoy: USD.
// ============================================================================

import nicho from "./nicho.json";
import { CALC_TEXTOS } from "./calc-textos";

/** Idiomas en los que se pueden emitir las notas. Union literal a propósito: este
 *  archivo se espeja al panel y no puede importar de fuera de lo que se espeja. */
export type IdiomaCalc = "es" | "en";

export type CalcState = {
  /** Idioma de las NOTAS que produce el cálculo. Los números no cambian: solo las
   *  palabras que los explican. El snapshot congela las dos versiones. */
  idioma?: IdiomaCalc;
  clinica: string | null;
  productos: string[]; // multi-select
  modo: "sistema" | "normal" | null;
  operacion: "yo" | "upcore" | null;
  msgs: string; // mensajes/consultas por día
  leads: string; // prospectos nuevos por mes
  email: string;
  /**
   * Lo que vale UN prospecto de ESTE cliente, en dólares: su comisión por venta
   * cerrada × la probabilidad de haberlo cerrado. Lo calcula `numerosDeLead()` en
   * propuesta.ts, que es el único lugar donde se hace esa conversión.
   *
   * ⚠️ Antes no existía y aquí se usaba una constante fija de $180 que ignoraba por
   * completo lo que el cliente había declarado. Resultado: la sección "lo que te
   * está costando" y la sección del retorno, en la MISMA propuesta, salían de dos
   * cuentas que no se hablaban — una decía $64,950 al mes y la otra $375.
   *
   * Vacío = no lo sabemos (la calculadora pública del sitio, donde nadie declara su
   * comisión): ahí se usa el valor por defecto del sector.
   */
  valorProspecto?: number | null;
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

// Los giros salen de lib/nicho.json (fuente única del nicho), no se declaran aquí.
// Antes esta era una de cinco copias del mismo concepto y se desfasaban en silencio.
export const CLINICA_OPTIONS: Option[] = nicho.giros
  .filter((g) => g.enSelector)
  .map((g) => ({ val: g.key, label: g.label, icon: g.icon }));

type Producto = Option & {
  /**
   * Precio FIJO de construcción, en DÓLARES (pago único). No es un rango: un rango de 3x
   * no es un precio, es decirle al cliente "no sé cuánto te voy a cobrar" — y el techo
   * espanta. Cada número está anclado a lo que le cuesta al cliente no resolverlo.
   */
  setupUSD: number;
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

// setupUSD = construcción (pago único, DÓLARES). var = costo de APIs que corre al mes
// (USD, a nombre del cliente).
//
// ⚓ El ancla de TODO este nicho es una sola: **una comisión rescatada paga el proyecto
// varias veces.** Un condominio de $800,000 al 3% deja ~$24,000 USD de comisión, y la
// firma promedio pierde entre el 60% y el 70% de sus prospectos por no dar seguimiento a
// tiempo. No hay que explicar el retorno: se explica solo.
//
// ⚠️ Pendiente de investigar: qué cobran las agencias de Miami por esto. Los precios de
// abajo se fijaron por valor entregado, NO comparando contra competidores — todavía no
// tenemos ese dato comprobado y aquí no se escriben cifras sin fuente.
export const PRODUCTO_OPTIONS: Producto[] = [
  { val: "agente", label: "Agente de WhatsApp 24/7", desc: "Contesta en español e inglés, a cualquier hora", icon: "💬", setupUSD: 6000, varMin: 10, varMax: 30, hrs: 14, alcance: "responde WhatsApp en español, inglés o portugués según en qué idioma le escriban, a cualquier hora y en cualquier huso horario, resuelve las dudas de siempre, califica al comprador (presupuesto, plazo y si necesita financiamiento) y deja agendada la visita o la videollamada" },
  { val: "voz", label: "Agente de voz 24/7", desc: "Contesta el teléfono en español e inglés", icon: "📞", setupUSD: 6500, varMin: 25, varMax: 60, hrs: 16, escalaFuerte: true, alcance: "contesta las llamadas que hoy se pierden, atiende en español o en inglés según quien llame, resuelve dudas hablando, agenda en tu calendario y avisa al asesor — conservando tu número actual" },
  { val: "web", label: "Sitio web con agenda", desc: "En español e inglés; capta y agenda solo", icon: "🌐", setupUSD: 4500, varMin: 0, varMax: 15, hrs: 6, alcance: "sitio en español e inglés, con la ficha de cada desarrollo, formulario que califica y agenda en línea, listo para recibir tráfico de anuncios" },
  { val: "auto", label: "Seguimiento automático", desc: "Que ningún prospecto se enfríe", icon: "🔄", setupUSD: 3500, varMin: 8, varMax: 20, hrs: 10, alcance: "seguimiento en el idioma de cada comprador —español o inglés— que aguanta los meses que dura una preventa: recordatorios de cada etapa de pago, avisos de avance de obra y reactivación del prospecto que dejó de contestar" },
  { val: "reactivacion", label: "Reactivación de prospectos", desc: "Recupera a los que nunca cerraron", icon: "📈", setupUSD: 3000, varMin: 8, varMax: 25, hrs: 8, alcance: "campaña en español o en inglés para volver a tocar a los prospectos viejos que quedaron en la lista y nunca compraron" },
];

/** De la SEGUNDA pieza en adelante. No es un descuento inventado: montar la segunda
 *  sobre lo ya construido cuesta menos de verdad. */
export const DESCUENTO_PAQUETE = 0.15;

/** Gestionado: mensualidad fija en dólares. Es por el SERVICIO (operar, mantener, mejorar),
 *  nunca por las APIs — esas van a la tarjeta del cliente, como en todos los planes. */
export const MENSUALIDAD_BASE = 600;
export const MENSUALIDAD_POR_PIEZA_EXTRA = 150;

// El panel/dashboard NO es una pieza: es un añadido que se monta encima de las demás.
// Vive aquí, en un solo lugar, porque su precio se usa en dos partes (el total cuando el
// cliente lo quiere, y el "+$X" del añadido opcional en su propuesta).
//
// En este nicho el panel pesa más que en el anterior: quien firma es el director comercial,
// y lo que esa persona quiere es ver qué pasó con cada prospecto y cómo va su equipo. Aun
// así se OFRECE, no se impone (regla de la casa).
export const PANEL_ADICIONAL = {
  setupUSD: 3000,
  varMax: 15, // hosting/BD si escala; el piso suele ser $0
};

export const MODO_OPTIONS: Option[] = [
  { val: "sistema", label: "Con sistema completo", desc: "Dashboard + todo integrado", icon: "🧩" },
  { val: "normal", label: "Solo la pieza", desc: "Lo esencial, sin dashboard", icon: "⚡" },
];

export const OPERACION_OPTIONS: Option[] = [
  { val: "yo", label: "Yo lo opero", desc: "Pago único, sin mensualidad (Llave en Mano)", icon: "🔑" },
  { val: "upcore", label: "Que Upcore lo opere", desc: "Mensualidad, nos encargamos de todo (Gestionado)", icon: "🛠️" },
];

/**
 * La misma opción, con su etiqueta en el idioma pedido.
 *
 * Las listas de arriba se escriben en español porque son la fuente (y los `val` NUNCA
 * se traducen: son lo que se guarda y lo que viaja al webhook — si cambiaran con el
 * idioma, el cliente elegiría una cosa en inglés y se guardaría otra). La traducción
 * vive en `calc-textos.ts` y se aplica aquí, al pintar.
 */
export function opcionEn<T extends Option>(o: T, idioma: IdiomaCalc = "es"): T {
  if (idioma === "es") return o;
  const T_ = CALC_TEXTOS[idioma];
  const pieza = T_.piezas[o.val];
  if (pieza) return { ...o, label: pieza.label, desc: pieza.desc };
  const otra = T_.opciones[o.val];
  if (otra) return { ...o, label: otra.label, desc: otra.desc };
  const giro = T_.giros[o.val];
  if (giro) return { ...o, label: giro };
  return o;
}

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

/**
 * Un precio ya formateado.
 *
 * ⚠️ Los campos se llamaban `mxn` y `usd`. Se renombraron al pasar el nicho a Miami: dejar
 * un precio en dólares dentro de un campo llamado `mxn` es una trampa — tarde o temprano
 * alguien escribe `${p.mxn} MXN` y sale "$6,000 USD MXN".
 *
 * `principal` = la moneda en la que se cobra (la del nicho, ver lib/nicho.json).
 * `equivalente` = referencia en la otra moneda, o "" si no aplica.
 */
export type Money = { principal: string; equivalente: string };

/** Moneda del nicho activo. Todo lo que Upcore cobra se expresa en ella. */
const MONEDA = nicho.moneda;

// Rango en USD → strings. Se usa para lo que de verdad ES un rango: el consumo de APIs
// del cliente, que depende de su volumen. Exportada porque el motor de propuestas cotiza
// los añadidos con esta misma fórmula, y así un "+$X" nunca se redondea distinto al total.
export function money(
  loUSD: number,
  hiUSD: number,
  perMonth = false,
  idioma: IdiomaCalc = "es"
): Money {
  // ⚠️ El "/mes" también es idioma. Salía pegado a un precio en una propuesta
  // enteramente en inglés ("$90 – $250 USD/mes") y ningún guardián lo veía, porque
  // vive en el módulo del dinero y no en la tabla de textos.
  const suf = perMonth ? (idioma === "en" ? "/month" : "/mes") : "";
  const lo = roundUSD(loUSD);
  const hi = roundUSD(hiUSD);
  const principal =
    lo === hi ? `$${fmt(lo)} USD${suf}` : `$${fmt(lo)} – $${fmt(hi)} USD${suf}`;
  // Con el nicho en USD no hay segunda moneda que enseñar: el cliente de Miami paga en
  // dólares y ver pesos solo lo confunde.
  if (MONEDA === "USD") return { principal, equivalente: "" };
  const mxnLo = roundMXN(loUSD * FX);
  const mxnHi = roundMXN(hiUSD * FX);
  return {
    principal:
      mxnLo === mxnHi
        ? `$${fmt(mxnLo)} MXN${suf}`
        : `$${fmt(mxnLo)} – $${fmt(mxnHi)} MXN${suf}`,
    equivalente: `≈ ${principal}`,
  };
}

// Un precio CERRADO, en la moneda del nicho. Se usa para todo lo que Upcore cobra.
export function precioFijo(monto: number, perMonth = false, idioma: IdiomaCalc = "es"): Money {
  const suf = perMonth ? (idioma === "en" ? "/month" : "/mes") : "";
  if (MONEDA === "USD") {
    return { principal: `$${fmt(monto)} USD${suf}`, equivalente: "" };
  }
  return {
    principal: `$${fmt(monto)} MXN${suf}`,
    equivalente: `≈ $${fmt(roundUSD(monto / FX))} USD${suf}`,
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
  const T = CALC_TEXTOS[s.idioma ?? "es"];
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
  const piezasUSD = list.map((p) => p.setupUSD);
  if (sistema) {
    piezasUSD.push(PANEL_ADICIONAL.setupUSD);
    varMax += PANEL_ADICIONAL.varMax;
  }
  const setupUSD = sumarPiezas(piezasUSD);

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

  // Costo de una hora de asistente comercial en Florida. Antes eran $3.50 (recepción en
  // México); con ese número el retorno en Miami salía absurdamente bajo.
  const HORA_USD = 22;

  /**
   * Valor esperado de UN prospecto rescatado. No es una promesa: es una cuenta que se
   * puede auditar, hecha con cifras verificadas y por el lado bajo.
   *
   *   $600,000 USD  → precio conservador de una unidad en preventa en Miami (el inventario
   *                   publicado por las firmas de la lista arranca en $230k y sube de $3M;
   *                   se toma un valor bajo-medio a propósito)
   *   × 3%          → comisión estándar del lado comprador
   *   × 1%          → conversión de lead a venta. Verificado: el sector convierte entre
   *                   0.4% y 2.4%; se toma el punto medio, no el techo.
   *   = ~$180 USD por prospecto
   *
   * ⚠️ Regla de la casa: esto es un ESTIMADO y así se presenta. Nunca se le promete al
   * cliente un número de ventas, porque no tenemos su CRM.
   */
  // Lo que vale un prospecto. Si el cliente declaró su comisión, `valorProspecto` ya
  // viene convertido desde propuesta.ts (comisión × tasa de cierre) y MANDA sobre el
  // default: si no, esta sección y la de "lo que te está costando" hablarían de dos
  // negocios distintos, que es justo el defecto que se arregló el 2026-08-21.
  //
  // El default ($1,800) es para la calculadora pública, donde nadie declara nada:
  // unidad de $600,000 × 3% de comisión × 10% de cierre.
  const VALOR_PROSPECTO_DEFECTO = 1800;
  const LEAD_USD =
    s.valorProspecto && s.valorProspecto > 0 ? s.valorProspecto : VALOR_PROSPECTO_DEFECTO;
  const NUEVO_USD = LEAD_USD; // un prospecto nuevo captado 24/7 vale lo mismo que uno rescatado

  // Horas liberadas al mes (aprox), con tope realista (~1 día/semana en volumen alto).
  const minutosMes = msgs * 30 + leads * 8;
  const hoursSaved = Math.min(Math.round(minutosMes / 60), 80);
  const timeValue = hoursSaved * HORA_USD;

  // Prospectos que hoy se enfrían y se rescatan con seguimiento. Está MUY por debajo del
  // dolor real: el sector pierde entre el 60% y el 70% de sus prospectos por no dar
  // seguimiento a tiempo, y aquí solo se cuenta rescatar un 6%.
  const rescatados = leads * 0.06;
  // Prospectos NUEVOS captados a cualquier hora — el mayor valor del agente y del sitio.
  // Pesa especialmente aquí: el comprador escribe desde otro país y otro huso horario, así
  // que "responder al instante" es la diferencia entre atenderlo y perderlo.
  const nuevosCaptados = leads * (capta24_7 ? 0.1 : 0.03);
  // Prospectos viejos que vuelven a la conversación si hay campaña de reactivación.
  const reactivados = hasReact ? leads * 0.1 : 0;

  const citasGanadas = rescatados + nuevosCaptados + reactivados;
  const ahorroUSD =
    timeValue +
    rescatados * LEAD_USD +
    nuevosCaptados * NUEVO_USD +
    reactivados * LEAD_USD;

  // --- Mensualidad de Upcore (solo Gestionado) ------------------------------
  // Fija y predecible: base + un extra por cada pieza que hay que operar.
  const nPiezas = piezasUSD.length;
  const upUSD = gestionado
    ? MENSUALIDAD_BASE + MENSUALIDAD_POR_PIEZA_EXTRA * Math.max(nPiezas - 1, 0)
    : 0;
  const upAvg = upUSD; // todo el cálculo de retorno corre en USD, igual que el precio

  const varAvg = (varLoUSD + varHiUSD) / 2;
  const setupAvg = setupUSD;

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
      ? T.recomiendaLlave
      : T.recomiendaEsperar;
  } else if (combo && netRatio < 2) {
    recomendacion = T.recomiendaLigero;
  } else if (gestionado && netRatio < 1.6) {
    recomendacion = T.recomiendaSubirDespues;
  }

  // Payback: meses para recuperar la inversión con el ahorro neto de la mensualidad.
  const netMensual = Math.max(ahorroUSD - upAvg, ahorroUSD * 0.15);
  const paybackMeses = Math.max(1, Math.min(Math.round(setupAvg / netMensual), 36));
  const mesesTxt = paybackMeses === 1 ? T.mes : T.meses;

  // Reencuadre del retorno: además del múltiplo, la ganancia neta al mes y (si es Gestionado)
  // el valor de que Upcore lo opere.
  // ⚠️ Antes esta línea formateaba SIEMPRE en pesos y le enseñaba "$42,500 MXN" a un
  // cliente de Miami que paga en dólares. Ahora usa precioFijo(), que respeta la moneda
  // del nicho. Se cazó corriendo la calculadora de verdad, no leyendo el código.
  const netaMonto = precioFijo(Math.round(gananciaNetaUSD)).principal;
  let roiNota: string;
  if (netRatio < 1) {
    roiNota = T.roiTardaria(`${paybackMeses} ${mesesTxt}`);
  } else {
    const neta = gananciaNetaUSD > 0 ? T.netaTexto(netaMonto) : "";
    roiNota = T.roiRecupera({ meses: `${paybackMeses} ${mesesTxt}`, neta, manos: gestionado });
  }

  // Una sola pieza (la más cara son $6,500) siempre es "esencial": antes el umbral
  // estaba en $5,000 y un solo agente ya salía como "Sistema a la medida".
  const claveComplejidad =
    setupUSD <= 7000
      ? "Solución esencial"
      : setupUSD <= 15000
      ? "Sistema a la medida"
      : "Infraestructura completa";
  // ⚠️ Antes se devolvía `claveComplejidad` tal cual y la tabla `T.complejidad`
  // estaba escrita pero NUNCA se usaba: la calculadora en inglés enseñaba
  // "Solución esencial" arriba del resultado. Una traducción que existe y nadie
  // llama es peor que no tenerla, porque parece hecha.
  const complejidad = T.complejidad[claveComplejidad] ?? claveComplejidad;

  const incluye = list.map((p) => {
    const tp = T.piezas[p.val];
    return `${tp?.label ?? p.label} — ${tp?.alcance ?? p.alcance}`;
  });
  if (sistema) incluye.push(T.panelIncluye);

  return {
    inversion: precioFijo(setupUSD),
    // Se paga en DOS MITADES, y así se dice desde la propuesta (decisión de Yael,
    // 2026-08-16). Antes decía "pago único", que suena a desembolsar todo de golpe
    // y frena al cliente justo donde no debe. Repartirlo protege a los dos: el
    // cliente no paga completo por algo que todavía no ha visto terminado, y
    // Upcore no construye una semana a cuenta de un sí de palabra.
    inversionNota:
      (nPiezas > 1 ? T.conDescuento : T.precioCerrado) +
      " · " +
      (gestionado ? T.mitadesGestionado : T.mitades),
    costosCliente: money(varLoUSD, varHiUSD, true, s.idioma ?? "es"),
    costosNota: has("voz") ? T.costosNotaVoz : T.costosNota,
    mensualidadUpcore: gestionado ? precioFijo(upUSD, true, s.idioma ?? "es") : { principal: "$0", equivalente: "" },
    upcoreNota: gestionado ? T.operacion : T.sinMensualidad,
    ahorro: money(ahorroUSD, ahorroUSD, true, s.idioma ?? "es"),
    // ⚠️ Decía "prospecto(s)/mes rescatados". Ese "(s)" es la confesión de que el
    // texto lo armó una plantilla, en el renglón que resume el beneficio. Y en
    // español el número también arrastra al participio: "1 prospecto rescatado".
    ahorroNota: T.ahorroNota(Math.max(1, Math.round(citasGanadas))),
    roi,
    roiNota,
    recomendacion,
    complejidad,
    incluye,
  };
}
