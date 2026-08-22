// Lector mínimo de PNG, para poder meter la firma dentro del PDF del acuerdo.
//
// POR QUÉ A MANO. El PDF del acuerdo se escribe sin dependencias (ver lib/acuerdo-pdf.ts)
// y meter una librería de imágenes por una sola firma no se paga. Un PDF sabe llevar la
// imagen ya comprimida, pero NO sabe qué hacer con el canal de transparencia de un PNG:
// hay que separarlo. Y como la hoja del contrato es blanca, la transparencia se resuelve
// **pintando la firma sobre blanco**, que da exactamente el mismo resultado a la vista.
//
// Cubre lo que de verdad usamos: 8 bits por canal, sin entrelazar. Cualquier otra cosa
// falla RUIDOSO en vez de devolver una imagen rota — una firma torcida en un contrato es
// peor que un error en el build.

import zlib from "node:zlib";

export type Imagen = { ancho: number; alto: number; rgb: Buffer };

/** Deshace el filtro de una línea de PNG. `bpp` = bytes por píxel. */
function desfiltrar(
  filtro: number,
  linea: Buffer,
  previa: Buffer | null,
  bpp: number
): Buffer {
  const out = Buffer.allocUnsafe(linea.length);
  for (let i = 0; i < linea.length; i++) {
    const a = i >= bpp ? out[i - bpp] : 0; // izquierda
    const b = previa ? previa[i] : 0; // arriba
    const c = previa && i >= bpp ? previa[i - bpp] : 0; // arriba-izquierda
    let valor: number;
    switch (filtro) {
      case 0:
        valor = linea[i];
        break;
      case 1:
        valor = linea[i] + a;
        break;
      case 2:
        valor = linea[i] + b;
        break;
      case 3:
        valor = linea[i] + ((a + b) >> 1);
        break;
      case 4: {
        // Paeth: elige el vecino que menos se aleja de la predicción.
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        valor = linea[i] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
        break;
      }
      default:
        throw new Error(`PNG: filtro de línea desconocido (${filtro})`);
    }
    out[i] = valor & 0xff;
  }
  return out;
}

/**
 * Lee un PNG (data URI o base64 pelado) y devuelve sus píxeles en RGB,
 * con la transparencia ya pintada sobre BLANCO.
 */
export function leerPng(fuente: string): Imagen {
  const b64 = fuente.replace(/^data:image\/[a-z+]+;base64,/, "").trim();
  const b = Buffer.from(b64, "base64");

  if (b.length < 33 || b.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("PNG: no es un PNG (falta la firma del archivo)");
  }

  const ancho = b.readUInt32BE(16);
  const alto = b.readUInt32BE(20);
  const profundidad = b[24];
  const tipoColor = b[25];
  const entrelazado = b[28];

  if (profundidad !== 8) throw new Error(`PNG: solo 8 bits por canal (viene ${profundidad})`);
  if (entrelazado !== 0) throw new Error("PNG: entrelazado (Adam7) no soportado");
  if (![0, 2, 4, 6].includes(tipoColor)) {
    throw new Error(`PNG: tipo de color ${tipoColor} no soportado (falta paleta)`);
  }
  if (!ancho || !alto || ancho > 4000 || alto > 4000) {
    throw new Error(`PNG: tamaño fuera de rango (${ancho}x${alto})`);
  }

  // Juntar TODOS los IDAT: un PNG los puede partir en varios trozos y quedarse con el
  // primero da una imagen cortada a la mitad, sin dar error.
  const trozos: Buffer[] = [];
  let off = 8;
  while (off + 8 <= b.length) {
    const largo = b.readUInt32BE(off);
    const tag = b.subarray(off + 4, off + 8).toString("latin1");
    if (tag === "IDAT") trozos.push(b.subarray(off + 8, off + 8 + largo));
    if (tag === "IEND") break;
    off += 12 + largo;
  }
  if (!trozos.length) throw new Error("PNG: no trae datos de imagen (sin IDAT)");

  const crudo = zlib.inflateSync(Buffer.concat(trozos));

  const canales = tipoColor === 0 ? 1 : tipoColor === 2 ? 3 : tipoColor === 4 ? 2 : 4;
  const bpp = canales; // 8 bits por canal
  const porLinea = ancho * bpp;
  const esperado = (porLinea + 1) * alto;
  if (crudo.length < esperado) {
    throw new Error(`PNG: faltan datos (esperaba ${esperado} bytes, hay ${crudo.length})`);
  }

  const rgb = Buffer.allocUnsafe(ancho * alto * 3);
  let previa: Buffer | null = null;
  let cursor = 0;

  for (let y = 0; y < alto; y++) {
    const filtro = crudo[cursor];
    const linea = crudo.subarray(cursor + 1, cursor + 1 + porLinea);
    cursor += 1 + porLinea;
    const plana = desfiltrar(filtro, linea, previa, bpp);
    previa = plana;

    for (let x = 0; x < ancho; x++) {
      const i = x * bpp;
      let r: number, g: number, azul: number, alfa: number;
      if (tipoColor === 0) {
        r = g = azul = plana[i];
        alfa = 255;
      } else if (tipoColor === 2) {
        r = plana[i];
        g = plana[i + 1];
        azul = plana[i + 2];
        alfa = 255;
      } else if (tipoColor === 4) {
        r = g = azul = plana[i];
        alfa = plana[i + 1];
      } else {
        r = plana[i];
        g = plana[i + 1];
        azul = plana[i + 2];
        alfa = plana[i + 3];
      }
      // Sobre BLANCO: la hoja del contrato es blanca, así que el resultado a la vista
      // es idéntico al del PNG con transparencia, sin tener que meter una máscara.
      const o = (y * ancho + x) * 3;
      rgb[o] = Math.round((r * alfa + 255 * (255 - alfa)) / 255);
      rgb[o + 1] = Math.round((g * alfa + 255 * (255 - alfa)) / 255);
      rgb[o + 2] = Math.round((azul * alfa + 255 * (255 - alfa)) / 255);
    }
  }

  return { ancho, alto, rgb };
}

/** Los píxeles listos para meter en el PDF: comprimidos con deflate. */
export function comprimir(rgb: Buffer): Buffer {
  return zlib.deflateSync(rgb, { level: 9 });
}
