// ============================================================================
// Genera las imágenes del kit de redes sociales en Upcore-AI/redes/.
// Correr UNA vez desde upcoreai-site/:  node scripts/generar-redes.mjs
// Usa el sharp de node_modules. Todo con fs.writeFileSync (nunca ">" de PS).
// ============================================================================
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const sitio = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const redes = path.join(path.dirname(sitio), "redes");
mkdirSync(redes, { recursive: true });

// 1) Foto de perfil: el ícono maskable (fondo clay a sangre completa) recorta
//    perfecto en círculo en LinkedIn/Instagram/Facebook.
copyFileSync(
  path.join(sitio, "public", "icon-maskable-512.png"),
  path.join(redes, "foto-perfil-512.png")
);

// 2) Portada 1584×396 (medida de LinkedIn; Facebook la escala bien).
//    Solo formas (sin texto) — así librsvg no depende de fuentes del sistema.
const icono = readFileSync(path.join(sitio, "app", "icon.svg"), "utf8");
const dibujo = icono
  .replace(/<svg[^>]*>/, "")
  .replace("</svg>", "")
  .replace(/<rect[^>]*\/>/, ""); // la taza sin el fondo redondeado

const portada =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1584" height="396" viewBox="0 0 1584 396">' +
  '<defs>' +
  '<radialGradient id="glow" cx="0.82" cy="0.0" r="0.9">' +
  '<stop offset="0" stop-color="#C8623D" stop-opacity="0.35"/>' +
  '<stop offset="1" stop-color="#C8623D" stop-opacity="0"/>' +
  '</radialGradient>' +
  '</defs>' +
  '<rect width="1584" height="396" fill="#1A1512"/>' +
  '<rect width="1584" height="396" fill="url(#glow)"/>' +
  // taza centrada, con su tile redondeado, 160px
  '<g transform="translate(712,118)">' +
  '<svg width="160" height="160" viewBox="0 0 48 48">' +
  '<rect width="48" height="48" rx="13" fill="#C8623D"/>' +
  dibujo +
  "</svg>" +
  "</g>" +
  // línea sand sutil abajo
  '<rect x="692" y="312" width="200" height="3" rx="1.5" fill="#F2E7DB" fill-opacity="0.35"/>' +
  "</svg>";

const png = await sharp(Buffer.from(portada), { density: 144 })
  .resize(1584, 396)
  .png()
  .toBuffer();
writeFileSync(path.join(redes, "portada-1584x396.png"), png);

console.log("Kit en:", redes);
for (const f of ["foto-perfil-512.png", "portada-1584x396.png"]) {
  const meta = await sharp(path.join(redes, f)).metadata();
  console.log(` - ${f}: ${meta.width}x${meta.height}`);
}
