// Convierte una lista PEGADA en filas de desarrollos.
//
// 🔴 POR QUÉ EXISTE (2026-08-23, pedido de Yael)
// El paso 2 del Portal se llenaba desarrollo por desarrollo: tres campos y un clic en
// "+ Agregar otro" por cada uno. Una comercializadora con quince torres son 45 campos y 15
// clics — y esa lista YA la tiene escrita en una hoja de cálculo, un correo o su web. Pegar
// es el camino corto: el trabajo ya está hecho, solo hay que dejarlo entrar.
//
// ⚠️ ESTA FUNCIÓN NO ADIVINA EN SILENCIO. Devuelve lo que entendió para que la pantalla se
// lo ENSEÑE al cliente antes de aplicarlo. Es la regla de la casa de no deducir datos de
// texto libre: si aquí se interpreta mal una columna, el cliente lo ve y lo corrige — no se
// entera el día de la entrega.
//
// ⚠️ Vive FUERA del componente a propósito: una función que decide lo que acaba escrito en
// los datos del cliente tiene que poder probarse sin abrir un navegador (lección 2026-08-18).
// Su prueba: scripts/probar-pegar-desarrollos.mjs, en el prebuild.

export type FilaPegada = { nombre: string; precio: string; duracion: string };

/** Tope sano: nadie llena su portal con 200 unidades, y evita que un pegado raro cuelgue la vista. */
export const MAX_PEGADAS = 60;

// Separadores de columna, en orden de confianza:
//   · TAB      → viene de una hoja de cálculo. Es inequívoco.
//   · | ; — ·  → listas escritas a mano.
// ⛔ La COMA NO separa columnas: los precios la llevan dentro ("desde 480,000") y partir por
// ella convertiría un precio en dos columnas. Es justo el tipo de error que se ve bonito y
// mete basura.
const SEPARADORES = [/\t/, /\s*\|\s*/, /\s*;\s*/, /\s+—\s+/, /\s+·\s+/];

/** Viñetas y numeración al principio del renglón: "- ", "• ", "1. ", "3) ". */
const VINETA = /^\s*(?:[-*•–—]|\d{1,3}[.)])\s+/;

/** Palabras que delatan un renglón de ENCABEZADO copiado junto con la tabla. */
const ENCABEZADOS = [
  "desarrollo",
  "unidad",
  "proyecto",
  "precio",
  "rango",
  "recamara",
  "recámara",
  "tamano",
  "tamaño",
  "development",
  "unit",
  "project",
  "price",
  "range",
  "bedroom",
  "size",
];

const limpiar = (s: string) => s.replace(/\s+/g, " ").trim();

/** ¿Este renglón es el encabezado de la tabla y no un desarrollo? */
function esEncabezado(celdas: string[]): boolean {
  const conTexto = celdas.filter((c) => c);
  if (!conTexto.length) return false;
  // Solo se descarta si NINGUNA celda trae un número: "Torre 1" es un desarrollo de verdad,
  // "Desarrollo | Precio | Recámaras" no lo es. Sin esta condición se tiraría una fila buena.
  if (conTexto.some((c) => /\d/.test(c))) return false;
  return conTexto.every((c) => ENCABEZADOS.some((h) => c.toLowerCase().includes(h)));
}

/**
 * Parte una lista pegada en filas.
 *
 * Un renglón SIN separador se toma entero como el nombre — que es el caso más común (una
 * lista de nombres a secas) y el único en el que no hay nada que interpretar mal.
 */
export function pegarDesarrollos(texto: string): {
  filas: FilaPegada[];
  /** Cuántos renglones se ignoraron por venir vacíos o ser el encabezado. */
  ignorados: number;
  /** True si se llegó al tope y quedaron renglones fuera. */
  recortado: boolean;
} {
  const renglones = String(texto || "").split(/\r?\n/);
  const filas: FilaPegada[] = [];
  let ignorados = 0;
  let recortado = false;

  for (const crudo of renglones) {
    const sinVineta = crudo.replace(VINETA, "");
    if (!limpiar(sinVineta)) {
      if (limpiar(crudo)) ignorados++;
      continue;
    }
    if (filas.length >= MAX_PEGADAS) {
      recortado = true;
      break;
    }

    const sep = SEPARADORES.find((r) => r.test(sinVineta));
    const celdas = (sep ? sinVineta.split(sep) : [sinVineta]).map(limpiar);

    if (esEncabezado(celdas)) {
      ignorados++;
      continue;
    }

    const [nombre = "", precio = "", duracion = ""] = celdas;
    if (!nombre) {
      ignorados++;
      continue;
    }
    filas.push({ nombre, precio, duracion });
  }

  return { filas, ignorados, recortado };
}
