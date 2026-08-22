// El acuerdo, en PDF. FUENTE ÚNICA del documento que se descarga y del que se
// manda por correo al aceptar.
//
// POR QUÉ EXISTE (2026-08-21). La página del acuerdo ya es una firma válida —la ley
// E-SIGN federal y la UETA de Florida (Fla. Stat. §668.50) dicen que escribir tu
// nombre y aceptar ES firmar—, pero el cliente se quedaba **sin copia**: un link
// secreto y nada más. Si perdía el link, o el sitio se caía, no tenía contrato. Esto
// es el respaldo: un archivo que él guarda, le manda a su contador y archiva.
//
// SIN DEPENDENCIAS, A PROPÓSITO. Se escribe el PDF a mano (formato 1.4, fuentes
// base-14 Helvetica con WinAnsiEncoding). Meter una librería de 3 MB en el sitio por
// una sola ruta no se paga, y este archivo es **puro**: no toca la red ni el disco,
// así que se puede probar entero sin montar nada — la lección de la función que
// decide escondida en un script que sale a la red.
//
// ⚠️ WinAnsi cubre el español completo (á é í ó ú ü ñ ¿ ¡ — “ ” ·) pero NO todo:
// "≈" no existe, y el documento lo usa en los plazos ("≈ 4 días"). Por eso hay un
// mapa de sustitución y un guardián que TRUENA si aparece un carácter que no se
// puede escribir — antes que imprimir un cuadrito en un contrato.

import type { DatosAcuerdo, Bloque } from "./acuerdo";
import { TEXTOS, type Textos } from "./acuerdo-textos";
import { leerPng, comprimir } from "./png";

// ── Codificación ──────────────────────────────────────────────────────────────

/** Caracteres que WinAnsi no tiene y su equivalente legible. */
const SUSTITUCIONES: Record<string, string> = {
  "≈": "aprox. ",
  "→": "->",
  "⛔": "",
  "⚠": "",
  "✅": "",
  "🔴": "",
};

/** Los que no están en Latin-1 pero sí en WinAnsi, con su código. */
const WINANSI_EXTRA: Record<string, number> = {
  "€": 0x80, "‚": 0x82, "ƒ": 0x83, "„": 0x84, "…": 0x85, "†": 0x86, "‡": 0x87,
  "ˆ": 0x88, "‰": 0x89, "Š": 0x8a, "‹": 0x8b, "Œ": 0x8c, "Ž": 0x8e, "‘": 0x91,
  "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97, "˜": 0x98,
  "™": 0x99, "š": 0x9a, "›": 0x9b, "œ": 0x9c, "ž": 0x9e, "Ÿ": 0x9f,
};

/** El byte WinAnsi de un carácter, o null si no se puede escribir. */
export function byteWinAnsi(ch: string): number | null {
  const c = ch.codePointAt(0) ?? 0;
  if (c >= 0x20 && c <= 0x7e) return c;
  if (WINANSI_EXTRA[ch] !== undefined) return WINANSI_EXTRA[ch];
  if (c >= 0xa0 && c <= 0xff) return c;
  return null;
}

/** Aplica las sustituciones conocidas. Lo que quede sin representar lo caza `revisar`. */
export function normalizar(s: string): string {
  let out = s;
  for (const [de, a] of Object.entries(SUSTITUCIONES)) out = out.split(de).join(a);
  return out.replace(/\s+/g, " ").trim();
}

/** Los caracteres del texto que NO se podrían escribir. Para el guardián. */
export function noRepresentables(s: string): string[] {
  const malos = new Set<string>();
  for (const ch of normalizar(s)) {
    if (ch === "\n") continue;
    if (byteWinAnsi(ch) === null) malos.add(ch);
  }
  return [...malos];
}

// ── Anchos de las fuentes (AFM de Helvetica, milésimas de em) ─────────────────
// Solo lo que hace falta para medir y partir renglones. Las vocales acentuadas
// miden lo mismo que su letra base en Helvetica, que es correcto.

const W_REG: Record<string, number> = {};
const W_BOLD: Record<string, number> = {};
{
  const reg =
    "278 278 355 556 556 889 667 191 333 333 389 584 278 333 278 278 " + // sp ! " # $ % & ' ( ) * + , - . /
    "556 556 556 556 556 556 556 556 556 556 278 278 584 584 584 556 " + // 0-9 : ; < = > ?
    "1015 667 667 722 722 667 611 778 722 278 500 667 556 833 722 778 " + // @ A-O
    "667 778 722 667 611 722 667 944 667 667 611 278 278 278 469 556 " + // P-Z [ \ ] ^ _
    "333 556 556 500 556 556 278 556 556 222 222 500 222 833 556 556 " + // ` a-o
    "556 556 333 500 278 556 500 722 500 500 500 334 260 334 584"; // p-z { | } ~
  const bold =
    "278 333 474 556 556 889 722 238 333 333 389 584 278 333 278 278 " +
    "556 556 556 556 556 556 556 556 556 556 333 333 584 584 584 611 " +
    "975 722 722 722 722 667 611 778 722 278 556 722 611 833 722 778 " +
    "667 778 722 667 611 722 667 944 667 667 611 333 278 333 584 556 " +
    "333 556 611 556 611 556 333 611 611 278 278 556 278 889 611 611 " +
    "611 611 389 556 333 611 556 778 556 556 500 389 280 389 584";
  const r = reg.split(" ").map(Number);
  const b = bold.split(" ").map(Number);
  for (let i = 0; i < r.length; i++) {
    const ch = String.fromCharCode(0x20 + i);
    W_REG[ch] = r[i];
    W_BOLD[ch] = b[i];
  }
  // Acentuadas y signos del español: miden como su letra base.
  const como: Array<[string, string]> = [
    ["á", "a"], ["é", "e"], ["í", "i"], ["ó", "o"], ["ú", "u"], ["ü", "u"],
    ["ñ", "n"], ["Á", "A"], ["É", "E"], ["Í", "I"], ["Ó", "O"], ["Ú", "U"],
    ["Ñ", "N"], ["ç", "c"],
  ];
  for (const [acc, base] of como) {
    W_REG[acc] = W_REG[base];
    W_BOLD[acc] = W_BOLD[base];
  }
  const fijos: Array<[string, number, number]> = [
    ["¿", 611, 611], ["¡", 333, 333], ["—", 1000, 1000], ["–", 556, 556],
    ["“", 333, 500], ["”", 333, 500], ["‘", 222, 278], ["’", 222, 278],
    ["·", 278, 278], ["•", 350, 350], ["…", 1000, 1000], ["€", 556, 556],
    ["°", 400, 400], ["ª", 370, 300], ["º", 365, 330], ["§", 556, 556],
  ];
  for (const [ch, a, b2] of fijos) {
    W_REG[ch] = a;
    W_BOLD[ch] = b2;
  }
}

const anchoChar = (ch: string, negrita: boolean) =>
  (negrita ? W_BOLD[ch] : W_REG[ch]) ?? (negrita ? 611 : 556);

/** Ancho de un texto en puntos. */
export function ancho(texto: string, tam: number, negrita = false): number {
  let t = 0;
  for (const ch of texto) t += anchoChar(ch, negrita);
  return (t * tam) / 1000;
}

// ── Texto con **negritas** → trozos ───────────────────────────────────────────

export type Trozo = { t: string; b: boolean };

/** Parte `hola **mundo** ya` en trozos con su marca de negrita. */
export function trozos(texto: string): Trozo[] {
  const out: Trozo[] = [];
  for (const p of normalizar(texto).split(/(\*\*[^*]+\*\*)/g)) {
    if (!p) continue;
    if (p.startsWith("**") && p.endsWith("**")) out.push({ t: p.slice(2, -2), b: true });
    else out.push({ t: p, b: false });
  }
  return out;
}

/** Parte los trozos en renglones que quepan en `max` puntos. */
export function renglones(ts: Trozo[], max: number, tam: number): Trozo[][] {
  const salida: Trozo[][] = [];
  let linea: Trozo[] = [];
  let usado = 0;
  for (const tr of ts) {
    for (const palabra of tr.t.split(" ")) {
      if (!palabra) continue;
      const conEspacio = linea.length ? " " + palabra : palabra;
      const w = ancho(conEspacio, tam, tr.b);
      if (usado + w > max && linea.length) {
        salida.push(linea);
        linea = [{ t: palabra, b: tr.b }];
        usado = ancho(palabra, tam, tr.b);
      } else {
        const ult = linea[linea.length - 1];
        if (ult && ult.b === tr.b) ult.t += conEspacio;
        else linea.push({ t: conEspacio, b: tr.b });
        usado += w;
      }
    }
  }
  if (linea.length) salida.push(linea);
  return salida;
}

// ── Escritura del PDF ─────────────────────────────────────────────────────────

const ANCHO_PAGINA = 612;
const ALTO_PAGINA = 792;
const MARGEN = 56;
const ANCHO_TEXTO = ANCHO_PAGINA - MARGEN * 2;
const PIE = 56;

const TINTA = "0.10 0.08 0.07 rg";
const TINTA_SUAVE = "0.42 0.38 0.34 rg";
const ACENTO = "0.78 0.38 0.24 rg";

/** Escapa un texto para meterlo en un string literal de PDF. */
function pdfTexto(s: string): string {
  let out = "";
  for (const ch of s) {
    const b = byteWinAnsi(ch);
    if (b === null) continue; // ya lo cazó el guardián; nunca imprimir un cuadrito
    if (ch === "(" || ch === ")" || ch === "\\") out += "\\" + ch;
    else if (b < 32 || b > 126) out += "\\" + b.toString(8).padStart(3, "0");
    else out += ch;
  }
  return out;
}

type Meta = {
  fecha: string;
  aceptadoPor?: string;
  aceptadoEl?: string;
  correo?: string;
  ip?: string;
  /** La firma de Yael en PNG (data URI). Si no viene, va la línea de firma sola. */
  firmaPng?: string;
};

type Firma = { ancho: number; alto: number; datos: Buffer };

/**
 * Prepara la firma para el PDF. Si el PNG viene roto se sigue SIN firma en vez de
 * tumbar la generación: un contrato que no se puede descargar es peor que uno con
 * el nombre mecanografiado. El guardián del prebuild ya prueba que la firma buena
 * se lee bien, así que llegar aquí significa que alguien cambió la imagen.
 */
function prepararFirma(png?: string): Firma | null {
  if (!png) return null;
  try {
    const img = leerPng(png);
    return { ancho: img.ancho, alto: img.alto, datos: comprimir(img.rgb) };
  } catch {
    return null;
  }
}

/**
 * Arma el PDF completo. Devuelve los bytes.
 * `doc` es el acuerdo YA congelado — aquí no se calcula ni se redacta nada.
 */
export function pdfDeAcuerdo(doc: DatosAcuerdo, meta: Meta): Uint8Array {
  // El idioma sale del propio documento congelado. Los acuerdos de antes del
  // 2026-08-22 no traen el campo y son español — de ahí el respaldo.
  const t: Textos = TEXTOS[doc.idioma ?? "es"] ?? TEXTOS.es;
  const paginas: string[] = [];
  let buf = "";
  let y = ALTO_PAGINA - MARGEN;

  const nueva = () => {
    paginas.push(buf);
    buf = "";
    y = ALTO_PAGINA - MARGEN;
  };
  const sitio = (alto: number) => {
    if (y - alto < PIE) nueva();
  };
  const escribir = (txt: string, x: number, tam: number, negrita: boolean, color = TINTA) => {
    buf += `BT ${color} /${negrita ? "FB" : "FR"} ${tam} Tf 1 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)} Tm (${pdfTexto(txt)}) Tj ET\n`;
  };
  /** Un párrafo con negritas, partido en renglones. `sangria` para las viñetas. */
  const parrafo = (
    texto: string,
    tam: number,
    interlinea: number,
    sangria = 0,
    color = TINTA
  ) => {
    for (const linea of renglones(trozos(texto), ANCHO_TEXTO - sangria, tam)) {
      sitio(interlinea);
      let x = MARGEN + sangria;
      for (const tr of linea) {
        escribir(tr.t, x, tam, tr.b, color);
        x += ancho(tr.t, tam, tr.b);
      }
      y -= interlinea;
    }
  };
  const linea = (grosor = 0.6, color = "0.85 0.80 0.75 RG") => {
    sitio(10);
    buf += `${color} ${grosor} w ${MARGEN} ${y.toFixed(1)} m ${ANCHO_PAGINA - MARGEN} ${y.toFixed(1)} l S\n`;
    y -= 14;
  };

  // ── Encabezado ──────────────────────────────────────────────────────────
  escribir("UPCORE AI", MARGEN, 9, true, ACENTO);
  y -= 26;
  parrafo(t.documento, 20, 26);
  y -= 2;
  parrafo(`**${doc.clinica}**`, 13, 18);
  parrafo(
    `${doc.contacto}${doc.puesto ? ", " + doc.puesto : ""} · ${meta.fecha} · ${t.aDistancia}`,
    9.5,
    14,
    0,
    TINTA_SUAVE
  );
  y -= 6;
  linea();
  parrafo(doc.intro, 10, 14, 0, TINTA_SUAVE);
  y -= 8;

  // ── Secciones ───────────────────────────────────────────────────────────
  for (const sec of doc.secciones) {
    sitio(46); // no dejar un título huérfano al pie de la hoja
    y -= 6;
    parrafo(`**${sec.n}. ${sec.titulo}**`, 12.5, 17);
    y -= 3;
    for (const b of sec.bloques) volcar(b);
    y -= 4;
  }

  function volcar(b: Bloque) {
    if (b.tipo === "texto") {
      parrafo(b.texto, 10, 13.6);
      y -= 5;
      return;
    }
    if (b.tipo === "lista") {
      for (const item of b.items) {
        sitio(13.6);
        const yViñeta = y;
        parrafo(item, 10, 13.6, 16);
        // La viñeta se dibuja en el renglón donde empezó el punto.
        buf += `BT ${ACENTO} /FR 10 Tf 1 0 0 1 ${MARGEN + 4} ${yViñeta.toFixed(1)} Tm (\\225) Tj ET\n`;
        y -= 3;
      }
      y -= 4;
      return;
    }
    for (const [concepto, monto] of b.filas) {
      sitio(20);
      escribir(normalizar(concepto), MARGEN + 4, 10, false);
      const m = normalizar(monto);
      escribir(m, ANCHO_PAGINA - MARGEN - 4 - ancho(m, 10, true), 10, true);
      y -= 6;
      buf += `0.90 0.86 0.82 RG 0.5 w ${MARGEN} ${y.toFixed(1)} m ${ANCHO_PAGINA - MARGEN} ${y.toFixed(1)} l S\n`;
      y -= 12;
    }
    y -= 4;
  }

  // ── Firmas ──────────────────────────────────────────────────────────────
  sitio(120);
  y -= 14;
  linea(1, "0.75 0.70 0.65 RG");
  y -= 8;
  parrafo(`**${t.firmas}**`, 12.5, 18);
  y -= 6;

  // La firma va ENCIMA de la línea del nombre, como en un papel. Se dibuja con la
  // altura fija de 34 pt y el ancho proporcional, para que no se deforme.
  const firma = prepararFirma(meta.firmaPng);
  if (firma) {
    const alto = 34;
    const anchoF = Math.round((firma.ancho / firma.alto) * alto);
    sitio(alto + 8);
    buf += `q ${anchoF} 0 0 ${alto} ${MARGEN} ${(y - 2).toFixed(1)} cm /IMFIRMA Do Q\n`;
    y -= alto + 4;
    buf += `0.75 0.70 0.65 RG 0.6 w ${MARGEN} ${y.toFixed(1)} m ${MARGEN + 200} ${y.toFixed(1)} l S\n`;
    y -= 13;
  }

  escribir("Yael López", MARGEN, 10.5, true);
  y -= 14;
  escribir("Upcore AI · upcoreai.com", MARGEN, 9.5, false, TINTA_SUAVE);
  y -= 13;
  escribir(meta.fecha, MARGEN, 9.5, false, TINTA_SUAVE);
  y -= 24;

  if (meta.aceptadoPor) {
    escribir(normalizar(meta.aceptadoPor), MARGEN, 10.5, true);
    y -= 14;
    escribir(normalizar(doc.clinica), MARGEN, 9.5, false, TINTA_SUAVE);
    y -= 13;
    parrafo(
      t.aceptadoLinea({
        fecha: meta.aceptadoEl || "",
        correo: meta.correo || "",
        ip: meta.ip || "",
      }),
      9.5,
      13,
      0,
      TINTA_SUAVE
    );
    y -= 6;
    parrafo(t.notaLegalFirma, 8.5, 11.5, 0, TINTA_SUAVE);
  } else {
    escribir(t.pendiente, MARGEN, 10.5, false, TINTA_SUAVE);
    y -= 14;
    parrafo(t.pendienteNota, 9.5, 13, 0, TINTA_SUAVE);
  }

  paginas.push(buf);

  // ── Ensamblado ──────────────────────────────────────────────────────────
  return ensamblar(paginas, doc.clinica, firma, t);
}

/** Convierte los flujos de cada página en un archivo PDF válido. */
function ensamblar(
  paginas: string[],
  titulo: string,
  firma: Firma | null,
  t: Textos
): Uint8Array {
  const n = paginas.length;
  // Numeración al pie, ya sabiendo cuántas hay. El ancho del "Página X de Y" se mide
  // en vez de restar un número fijo: "Page 4 of 4" y "Página 4 de 4" no miden igual,
  // y con el número quemado el pie en inglés se salía del margen.
  const conPie = paginas.map((p, i) => {
    const num = t.pagina(i + 1, n);
    const xNum = ANCHO_PAGINA - MARGEN - ancho(num, 8);
    return (
      p +
      `BT ${TINTA_SUAVE} /FR 8 Tf 1 0 0 1 ${MARGEN} ${(PIE - 22).toFixed(1)} Tm ` +
      `(${pdfTexto(t.pie(normalizar(titulo)))}) Tj ET\n` +
      `BT ${TINTA_SUAVE} /FR 8 Tf 1 0 0 1 ${xNum.toFixed(1)} ${(PIE - 22).toFixed(1)} Tm ` +
      `(${pdfTexto(num)}) Tj ET\n`
    );
  });

  const objetos: string[] = [];
  const add = (s: string) => objetos.push(s) && objetos.length;

  // 1 catálogo, 2 páginas, 3 fuente regular, 4 fuente negrita, luego páginas y flujos.
  add("<< /Type /Catalog /Pages 2 0 R >>");
  add("PLACEHOLDER_PAGES");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");

  // La firma, como imagen del PDF. Los píxeles van en RGB ya comprimidos con deflate
  // (la transparencia se pintó sobre blanco al leer el PNG, ver lib/png.ts).
  let recursoImagen = "";
  if (firma) {
    const idImg = add(
      `<< /Type /XObject /Subtype /Image /Width ${firma.ancho} /Height ${firma.alto} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode ` +
        `/Length ${firma.datos.length} >>\nstream\n${firma.datos.toString("latin1")}\nendstream`
    );
    recursoImagen = ` /XObject << /IMFIRMA ${idImg} 0 R >>`;
  }

  const idsPagina: number[] = [];
  for (const flujo of conPie) {
    const idFlujo = add(`<< /Length ${flujo.length} >>\nstream\n${flujo}endstream`);
    const idPag = add(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ANCHO_PAGINA} ${ALTO_PAGINA}] ` +
        `/Resources << /Font << /FR 3 0 R /FB 4 0 R >>${recursoImagen} >> /Contents ${idFlujo} 0 R >>`
    );
    idsPagina.push(idPag);
  }
  objetos[1] =
    `<< /Type /Pages /Count ${n} /Kids [${idsPagina.map((i) => `${i} 0 R`).join(" ")}] >>`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objetos.forEach((cuerpo, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${cuerpo}\nendobj\n`;
  });
  const inicioXref = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  pdf +=
    `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\n` +
    `startxref\n${inicioXref}\n%%EOF\n`;

  // Latin-1: cada carácter del texto que armamos es un byte. Nunca UTF-8 aquí —
  // los acentos ya viajan escapados en octal dentro de los strings del PDF.
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return bytes;
}

/** Todo el texto que el PDF va a imprimir. Para el guardián de caracteres. */
export function textoDelPdf(doc: DatosAcuerdo): string {
  const partes = [doc.clinica, doc.contacto, doc.puesto, doc.intro, doc.planLabel];
  for (const sec of doc.secciones) {
    partes.push(sec.titulo);
    for (const b of sec.bloques) {
      if (b.tipo === "texto") partes.push(b.texto);
      else if (b.tipo === "lista") partes.push(...b.items);
      else for (const f of b.filas) partes.push(...f);
    }
  }
  return partes.join("\n");
}
