import { randomBytes } from "crypto";

/**
 * Genera el token de un link que se le manda al cliente POR WHATSAPP.
 *
 * ⚠️ SOLO LETRAS Y NÚMEROS. Nada de "_" ni "-", y este es el motivo:
 *
 * LECCIÓN 2026-08-17 — la propuesta de un cliente salió con un token de
 * base64url, que incluye "_" y "-" (era del estilo `vnSKiz2_FjM…-m_`). Al
 * mandarlo por WhatsApp, `_texto_` es el código de CURSIVA: la app se come los
 * guiones bajos y el link llega mutilado. Yael lo abrió desde su celular y le
 * dijo "esta propuesta ya no está disponible".
 *
 * Si eso le pasa al cliente, no hay aviso ni error en ningún lado: ve un
 * documento muerto y piensa que así trabajamos. Es la peor clase de fallo, el
 * que solo se nota del lado de quien no te lo va a decir.
 *
 * 🔴 POR QUÉ EXISTE ESTE ARCHIVO (2026-08-19): la lección estaba escrita y
 * protegida con un guardián… pero SOLO en `upcore-panel/lib/token.ts`. La ruta
 * `app/api/acuerdo-auto/route.ts` de ESTE proyecto seguía usando
 * `randomBytes(18).toString("base64url")`, así que generaba tokens con "_" y "-"
 * para el link del ACUERDO — el documento más importante que se le manda a un
 * cliente. Lo encontró la auditoría de seguridad al revisar el diff antes de
 * publicar. Una lección aprendida en un proyecto no se aplica sola en el de al
 * lado: si dos repos mandan links por WhatsApp, los dos necesitan esto.
 *
 * El alfabeto también deja fuera las confusiones al dictar por teléfono:
 * sin O/0, sin I/l/1. Un token de 22 caracteres de este alfabeto (~113 bits) es
 * tan imposible de adivinar como el de base64url.
 */
const ALFABETO = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function nuevoToken(largo = 22): string {
  // Se descartan los bytes que caerían fuera del múltiplo exacto del alfabeto:
  // sin eso, los primeros caracteres saldrían más veces que los últimos.
  const limite = 256 - (256 % ALFABETO.length);
  let salida = "";
  while (salida.length < largo) {
    for (const b of randomBytes(largo)) {
      if (b >= limite) continue;
      salida += ALFABETO[b % ALFABETO.length];
      if (salida.length === largo) break;
    }
  }
  return salida;
}

/** ¿Este token sobrevive a WhatsApp? Lo usa el guardián del prebuild. */
export const tokenSeguro = (t: string) => /^[a-zA-Z0-9]+$/.test(t);
