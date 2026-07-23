// ============================================================================
// Genera el set completo de íconos desde app/icon.svg. Correr UNA vez:
//   node scripts/generar-iconos.mjs
// Usa el `sharp` que ya vive en node_modules (dependencia de Next). Si algún
// día faltara: npm i -D --no-save sharp
// TODO se escribe con fs.writeFileSync — NUNCA generar binarios con la
// redirección ">" de PowerShell (los corrompe).
// ============================================================================
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const svgTexto = readFileSync(path.join(raiz, "app", "icon.svg"), "utf8");

// Apple: mismo dibujo pero SIN esquinas redondeadas (iOS aplica su propia máscara).
const svgApple = svgTexto.replace('rx="13"', 'rx="0"');

// Maskable (Android): fondo clay a sangre completa y la taza al ~66% (zona segura).
const dibujoInterno = svgTexto
  .replace(/<svg[^>]*>/, "")
  .replace("</svg>", "")
  .replace(/<rect[^>]*\/>/, "");
const svgMaskable =
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">' +
  '<rect width="48" height="48" fill="#C8623D"/>' +
  `<g transform="translate(24 24) scale(0.66) translate(-24 -24)">${dibujoInterno}</g>` +
  "</svg>";

// density alta para que el SVG (viewBox 48) se rasterice nítido antes del resize.
function png(fuente, tam) {
  return sharp(Buffer.from(fuente), { density: 768 }).resize(tam, tam).png().toBuffer();
}

// ICO con entradas PNG ("PNG-in-ICO"): header (6B) + 16B por entrada + los PNG.
// Lo leen todos los navegadores modernos y el crawler de favicons de Google.
function ico(entradas) {
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0); // reservado
  cabecera.writeUInt16LE(1, 2); // tipo: ícono
  cabecera.writeUInt16LE(entradas.length, 4);
  const dirs = [];
  let offset = 6 + 16 * entradas.length;
  for (const { tam, buf } of entradas) {
    const d = Buffer.alloc(16);
    d.writeUInt8(tam >= 256 ? 0 : tam, 0); // ancho (0 = 256)
    d.writeUInt8(tam >= 256 ? 0 : tam, 1); // alto
    d.writeUInt8(0, 2); // sin paleta
    d.writeUInt8(0, 3); // reservado
    d.writeUInt16LE(1, 4); // planos de color
    d.writeUInt16LE(32, 6); // bits por pixel
    d.writeUInt32LE(buf.length, 8); // tamaño en bytes
    d.writeUInt32LE(offset, 12); // offset del PNG
    dirs.push(d);
    offset += buf.length;
  }
  return Buffer.concat([cabecera, ...dirs, ...entradas.map((e) => e.buf)]);
}

const [p16, p32, p48, p180, p192, p512, mask512] = await Promise.all([
  png(svgTexto, 16),
  png(svgTexto, 32),
  png(svgTexto, 48),
  png(svgApple, 180),
  png(svgTexto, 192),
  png(svgTexto, 512),
  png(svgMaskable, 512),
]);

writeFileSync(
  path.join(raiz, "app", "favicon.ico"),
  ico([
    { tam: 16, buf: p16 },
    { tam: 32, buf: p32 },
    { tam: 48, buf: p48 }, // la talla que Google exige (≥48px) para resultados
  ])
);
writeFileSync(path.join(raiz, "app", "apple-icon.png"), p180);
writeFileSync(path.join(raiz, "public", "icon-192.png"), p192);
writeFileSync(path.join(raiz, "public", "icon-512.png"), p512);
writeFileSync(path.join(raiz, "public", "icon-maskable-512.png"), mask512);

console.log(
  "Listo: app/favicon.ico (16+32+48), app/apple-icon.png (180), public/icon-192.png, public/icon-512.png, public/icon-maskable-512.png"
);
