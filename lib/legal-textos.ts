// ============================================================================
// PÁGINAS LEGALES (/privacidad y /terminos) — español e inglés.
//
// ⚠️ POR QUÉ NO SON JSX SUELTO. Antes cada párrafo vivía dentro de la página, con
// los <strong> y los enlaces incrustados en medio de la frase. Traducir eso a mano
// deja SIEMPRE media frase en el idioma viejo (pasó en la propuesta y en el Portal
// de Arranque). Aquí el texto es DATO: una lista de bloques, y la página solo los
// pinta. Así los dos idiomas tienen la misma forma y el guardián puede compararla
// sección por sección.
//
// ⚠️ LA LEY NO SE ESCRIBE AQUÍ. Se lee de `LEY_POR_IDIOMA` en acuerdo-textos.ts,
// que es su dueña. El acuerdo REMITE a estos Términos, así que si cada documento
// nombrara su ley por su cuenta, el contrato acabaría remitiendo a unos términos
// regidos por otra ley sin dar un solo error.
// ============================================================================

import type { Idioma } from "./idioma";
import { LEY_POR_IDIOMA } from "./acuerdo-textos";

/** Un trozo de frase. `fuerte` es negrita; `enlace` es un vínculo. */
export type Frag =
  | string
  | { fuerte: string }
  | { enlace: string; href: string; externo?: boolean };

export type BloqueLegal = { p: Frag[] } | { ul: Frag[][] };

export type SeccionLegal = { titulo: string; bloques: BloqueLegal[] };

export type DocLegal = {
  metaTitle: string;
  metaDescription: string;
  titulo: string;
  actualizado: string;
  intro: string;
  secciones: SeccionLegal[];
};

export type TextosLegales = {
  volver: string;
  ultimaActualizacion: string;
  aviso: string;
  privacidad: DocLegal;
  terminos: DocLegal;
};

const EMAIL = "upcoreai.com@gmail.com";
const correo = (): Frag => ({ enlace: EMAIL, href: `mailto:${EMAIL}` });

// ────────────────────────────────────────────────────────────────────────────
const ES: TextosLegales = {
  volver: "← Volver al inicio",
  ultimaActualizacion: "Última actualización:",
  aviso:
    "Este documento es informativo y no constituye asesoría legal. Te recomendamos que un profesional del derecho lo revise antes de considerarlo definitivo.",

  privacidad: {
    metaTitle: "Política de Privacidad",
    metaDescription:
      "Cómo Upcore AI recopila, usa y protege tus datos. No vendemos ni compartimos tu información.",
    titulo: "Política de Privacidad",
    actualizado: "agosto de 2026",
    intro:
      "En Upcore AI respetamos tu privacidad. Esta política explica qué datos recopilamos cuando visitas nuestro sitio o nos contactas, para qué los usamos y cómo los protegemos. Nunca vendemos ni rentamos tu información.",
    secciones: [
      {
        titulo: "1. Quiénes somos",
        bloques: [
          {
            p: [
              "Upcore AI es una agencia que construye automatizaciones, agentes de inteligencia artificial, sitios web y paneles para inmobiliarias que venden preventa. Somos los responsables del tratamiento de los datos que nos proporcionas a través de este sitio.",
            ],
          },
          {
            p: [
              { fuerte: "Operamos desde México" },
              " y trabajamos con firmas del sur de Florida y de América Latina. Eso significa que, cuando nos escribes, tus datos salen de tu país: se tratan en México y en los servidores de los proveedores que aparecen en el punto 4. Te lo decimos de frente porque es algo que tienes derecho a saber antes de dejarnos un dato, no después.",
            ],
          },
        ],
      },
      {
        titulo: "2. Qué información recopilamos",
        bloques: [
          {
            p: [
              { fuerte: "Datos que tú nos das:" },
              " tu nombre, correo, teléfono o WhatsApp, el nombre de tu inmobiliaria y los detalles que compartas cuando llenas un formulario, agendas una llamada o nos escribes por WhatsApp.",
            ],
          },
          {
            p: [
              { fuerte: "Datos de uso:" },
              " información técnica y estadística anónima del sitio (páginas vistas, tipo de dispositivo, aproximación de ubicación), recogida de forma agregada para entender y mejorar la web. No te identifican personalmente.",
            ],
          },
        ],
      },
      {
        titulo: "3. Para qué usamos tus datos",
        bloques: [
          { p: ["Usamos tu información únicamente para:"] },
          {
            ul: [
              ["Responder tu solicitud y darte tu diagnóstico o propuesta."],
              ["Prestarte y dar seguimiento al servicio que contrates."],
              ["Mejorar el sitio y nuestros productos."],
            ],
          },
          {
            p: [
              { fuerte: "No vendemos, rentamos ni compartimos" },
              " tus datos con terceros para publicidad.",
            ],
          },
        ],
      },
      {
        titulo: "4. Proveedores que nos ayudan",
        bloques: [
          {
            p: [
              "Nos apoyamos en servicios de confianza para operar, cada uno con su propia política de privacidad: alojamiento y estadísticas del sitio (Vercel), agendado de citas (Cal.com) y mensajería (WhatsApp). Solo comparten con nosotros lo necesario para prestar su función. Son empresas estadounidenses y sus servidores están en Estados Unidos.",
            ],
          },
        ],
      },
      {
        titulo: "5. Datos de tus compradores",
        bloques: [
          {
            p: [
              "Cuando construimos una solución para tu inmobiliaria, los datos de tus compradores viven en ",
              { fuerte: "tus propias cuentas" },
              ", cifrados y aislados. Son tuyos: no los vendemos, no los mezclamos con los de otros clientes y solo los tratamos para operar el servicio que nos encargas, siguiendo tus instrucciones. Tú eres el responsable de esos datos frente a tus compradores.",
            ],
          },
        ],
      },
      {
        titulo: "6. Seguridad",
        bloques: [
          {
            p: [
              "Tus datos y los de tus compradores viajan cifrados y se guardan aislados en cuentas separadas. Aplicamos buenas prácticas de seguridad y limitamos los accesos a lo estrictamente necesario. Ningún sistema es 100% infalible, pero trabajamos para proteger tu información de forma responsable.",
            ],
          },
        ],
      },
      {
        titulo: "7. Cookies",
        bloques: [
          {
            p: [
              "Usamos únicamente cookies esenciales para que el sitio funcione y medición estadística anónima. No usamos cookies de publicidad. Puedes bloquear o borrar las cookies desde la configuración de tu navegador.",
            ],
          },
        ],
      },
      {
        titulo: "8. Tus derechos",
        bloques: [
          {
            p: [
              { fuerte: "Vivas donde vivas" },
              ", contigo aplicamos estos cuatro derechos. No dependen de en qué país estés: son un compromiso nuestro.",
            ],
          },
          {
            ul: [
              ["Saber qué datos tuyos tenemos y pedirnos una copia."],
              ["Corregir lo que esté mal o incompleto."],
              [
                "Pedirnos que los borremos — salvo lo que tengamos que conservar por ley o para seguir prestándote un servicio que contrataste.",
              ],
              ["Retirar tu consentimiento y dejar de recibir nuestros mensajes, cuando tú quieras."],
            ],
          },
          {
            p: [
              "Para ejercer cualquiera de ellos, escríbenos a ",
              correo(),
              ". Te respondemos por el mismo medio y no tardamos más de 30 días.",
            ],
          },
          {
            p: [
              "Como Upcore AI opera desde México, en materia de datos personales nos rige la Ley Federal de Protección de Datos Personales en Posesión de los Particulares. Si la ley de tu estado o de tu país te da derechos adicionales, también puedes ejercerlos con nosotros: ",
              { fuerte: "nunca vamos a usar el lugar donde estamos como excusa para no atenderte" },
              ".",
            ],
          },
        ],
      },
      {
        titulo: "9. Cuánto tiempo conservamos tus datos",
        bloques: [
          {
            p: [
              "Conservamos tu información solo durante el tiempo necesario para atenderte y prestar el servicio, o el que exija la ley. Después la eliminamos o la anonimizamos.",
            ],
          },
        ],
      },
      {
        titulo: "10. Cambios a esta política",
        bloques: [
          {
            p: [
              "Podemos actualizar esta política cuando sea necesario. Publicaremos aquí la versión vigente con su fecha de última actualización.",
            ],
          },
        ],
      },
      {
        titulo: "11. Contacto",
        bloques: [
          {
            p: [
              "Para cualquier duda sobre esta política o tus datos, contáctanos por WhatsApp al ",
              { enlace: "+1 424 447 2698", href: "__WHATSAPP__", externo: true },
              " o al correo ",
              correo(),
              ".",
            ],
          },
        ],
      },
    ],
  },

  terminos: {
    metaTitle: "Términos de Servicio",
    metaDescription:
      "Los términos que rigen el uso del sitio de Upcore AI y la contratación de sus servicios de automatización.",
    titulo: "Términos de Servicio",
    actualizado: "agosto de 2026",
    intro:
      "Estos términos rigen el uso de este sitio y de los servicios de Upcore AI. Al navegar el sitio o contratarnos, aceptas lo aquí descrito. Están escritos para ser claros y justos para ambas partes.",
    secciones: [
      {
        titulo: "1. Quiénes somos y qué ofrecemos",
        bloques: [
          {
            p: [
              "Upcore AI es una agencia que diseña y construye automatizaciones, agentes de inteligencia artificial, sitios web y paneles a la medida, enfocada en inmobiliarias que venden preventa. Este sitio es informativo y un canal de contacto.",
            ],
          },
        ],
      },
      {
        titulo: "2. Propuestas, precios y la calculadora",
        bloques: [
          {
            p: [
              "Los precios, rangos y resultados de la calculadora de este sitio son ",
              { fuerte: "estimaciones orientativas" },
              ", no una oferta vinculante. El precio y el alcance definitivos se acuerdan por escrito en tu propuesta, tras un diagnóstico. Cada proyecto se cotiza de forma personalizada.",
            ],
          },
        ],
      },
      {
        titulo: "3. Todo lo que construimos es tuyo",
        bloques: [
          {
            p: [
              "Lo que desarrollamos para ti vive en ",
              { fuerte: "tus propias cuentas e infraestructura" },
              " (dominio, hosting, servidores, APIs) y es de tu propiedad. Si eliges el plan Gestionado, conservamos un acceso acotado, documentado y revocable únicamente para operarlo y mantenerlo por ti.",
            ],
          },
        ],
      },
      {
        titulo: "4. Pagos y costos",
        bloques: [
          {
            p: [
              "El proyecto se acuerda con un anticipo y el saldo según lo pactado en tu propuesta. Los ",
              { fuerte: "costos variables" },
              " (APIs de inteligencia artificial, mensajería de WhatsApp, hosting y servicios de terceros) corren por cuenta del cliente, a su nombre y con su medio de pago. La mensualidad del plan Gestionado, cuando aplica, corresponde al servicio de operación y mantenimiento, no a esos costos variables.",
            ],
          },
        ],
      },
      {
        titulo: "5. Responsabilidades del cliente",
        bloques: [
          {
            ul: [
              ["Proporcionar información veraz y los accesos necesarios."],
              ["Resguardar sus credenciales de forma segura (nunca se comparten por chat)."],
              [
                "Usar el servicio conforme a la ley, incluyendo el manejo responsable de los datos de sus compradores.",
              ],
            ],
          },
        ],
      },
      {
        titulo: "6. Garantía y resultados",
        bloques: [
          {
            p: [
              "Prestamos nuestros servicios con diligencia profesional. Cuando ofrezcamos una garantía de resultados, quedará por escrito en tu propuesta con sus condiciones. Las estimaciones de ahorro o retorno son proyecciones de buena fe basadas en datos del sector, no una promesa de resultados individuales, que dependen de cada firma.",
            ],
          },
        ],
      },
      {
        titulo: "7. Limitación de responsabilidad",
        bloques: [
          {
            p: [
              "En la medida que permita la ley, Upcore AI no será responsable por daños indirectos o pérdidas derivadas del uso o la imposibilidad de uso del sitio o de servicios de terceros. La parte informativa de este sitio se ofrece “tal cual”, sin garantías de disponibilidad ininterrumpida.",
            ],
          },
        ],
      },
      {
        titulo: "8. Propiedad intelectual del sitio",
        bloques: [
          {
            p: [
              "La marca Upcore AI, el diseño y el contenido de este sitio son de nuestra propiedad. No se permite su reproducción sin autorización. (Esto no afecta lo que construimos para ti, que es tuyo — ver punto 3.)",
            ],
          },
        ],
      },
      {
        titulo: "9. Cambios y disponibilidad",
        bloques: [
          {
            p: [
              "Podemos modificar o descontinuar el sitio, así como actualizar estos términos. Publicaremos aquí la versión vigente con su fecha.",
            ],
          },
        ],
      },
      {
        titulo: "10. Ley aplicable",
        bloques: [
          {
            p: [
              `Estos términos se rigen por ${LEY_POR_IDIOMA.es.ley}. Cualquier controversia se resolverá ante ${LEY_POR_IDIOMA.es.foro}.`,
            ],
          },
        ],
      },
      {
        titulo: "11. Contacto",
        bloques: [
          {
            p: [
              "Para cualquier duda sobre estos términos, contáctanos por WhatsApp al ",
              { enlace: "+1 424 447 2698", href: "__WHATSAPP__", externo: true },
              " o al correo ",
              correo(),
              ".",
            ],
          },
        ],
      },
    ],
  },
};

// ────────────────────────────────────────────────────────────────────────────
const EN: TextosLegales = {
  volver: "← Back to home",
  ultimaActualizacion: "Last updated:",
  aviso:
    "This document is informational and does not constitute legal advice. We recommend having a legal professional review it before treating it as final.",

  privacidad: {
    metaTitle: "Privacy Policy",
    metaDescription:
      "How Upcore AI collects, uses and protects your data. We never sell or share your information.",
    titulo: "Privacy Policy",
    actualizado: "August 2026",
    intro:
      "At Upcore AI we respect your privacy. This policy explains what data we collect when you visit our site or contact us, what we use it for, and how we protect it. We never sell or rent your information.",
    secciones: [
      {
        titulo: "1. Who we are",
        bloques: [
          {
            p: [
              "Upcore AI is an agency that builds automations, artificial intelligence agents, websites and dashboards for real estate firms selling preconstruction. We are the controller of the data you provide to us through this site.",
            ],
          },
          {
            p: [
              { fuerte: "We operate from Mexico" },
              " and work with firms in South Florida and Latin America. That means that when you write to us, your data leaves your country: it is processed in Mexico and on the servers of the providers listed in section 4. We say so plainly because it is something you have a right to know before you leave us a detail, not afterwards.",
            ],
          },
        ],
      },
      {
        titulo: "2. What information we collect",
        bloques: [
          {
            p: [
              { fuerte: "Data you give us:" },
              " your name, email, phone or WhatsApp, your firm's name, and whatever details you share when you fill in a form, book a call or write to us on WhatsApp.",
            ],
          },
          {
            p: [
              { fuerte: "Usage data:" },
              " anonymous technical and statistical information about the site (pages viewed, device type, approximate location), collected in aggregate to understand and improve the site. It does not identify you personally.",
            ],
          },
        ],
      },
      {
        titulo: "3. What we use your data for",
        bloques: [
          { p: ["We use your information solely to:"] },
          {
            ul: [
              ["Respond to your request and give you your assessment or proposal."],
              ["Deliver and follow up on the service you engage us for."],
              ["Improve the site and our products."],
            ],
          },
          {
            p: [
              { fuerte: "We do not sell, rent or share" },
              " your data with third parties for advertising.",
            ],
          },
        ],
      },
      {
        titulo: "4. Providers that help us",
        bloques: [
          {
            p: [
              "We rely on trusted services to operate, each with its own privacy policy: site hosting and analytics (Vercel), appointment booking (Cal.com) and messaging (WhatsApp). They share with us only what is needed to perform their function. They are US companies and their servers are in the United States.",
            ],
          },
        ],
      },
      {
        titulo: "5. Your buyers' data",
        bloques: [
          {
            p: [
              "When we build a solution for your firm, your buyers' data lives in ",
              { fuerte: "your own accounts" },
              ", encrypted and isolated. It is yours: we do not sell it, we do not mix it with other clients' data, and we process it only to operate the service you engage us for, following your instructions. You are the controller of that data toward your buyers.",
            ],
          },
        ],
      },
      {
        titulo: "6. Security",
        bloques: [
          {
            p: [
              "Your data and your buyers' data travel encrypted and are stored isolated in separate accounts. We apply sound security practices and limit access to what is strictly necessary. No system is 100% infallible, but we work to protect your information responsibly.",
            ],
          },
        ],
      },
      {
        titulo: "7. Cookies",
        bloques: [
          {
            p: [
              "We use only essential cookies so the site works, plus anonymous statistical measurement. We do not use advertising cookies. You can block or delete cookies from your browser settings.",
            ],
          },
        ],
      },
      {
        titulo: "8. Your rights",
        bloques: [
          {
            p: [
              { fuerte: "Wherever you live" },
              ", we apply these four rights with you. They do not depend on which country you are in: they are a commitment of ours.",
            ],
          },
          {
            ul: [
              ["Know what data of yours we hold and ask us for a copy."],
              ["Correct anything wrong or incomplete."],
              [
                "Ask us to delete it — except for what we must keep by law or in order to keep delivering a service you engaged us for.",
              ],
              ["Withdraw your consent and stop receiving our messages, whenever you want."],
            ],
          },
          {
            p: [
              "To exercise any of them, write to us at ",
              correo(),
              ". We reply by the same channel and take no longer than 30 days.",
            ],
          },
          {
            p: [
              "Because Upcore AI operates from Mexico, personal data matters are governed for us by Mexico's Federal Law on the Protection of Personal Data Held by Private Parties. If the law of your state or your country gives you additional rights, you can exercise those with us too: ",
              { fuerte: "we will never use where we are located as an excuse not to help you" },
              ".",
            ],
          },
        ],
      },
      {
        titulo: "9. How long we keep your data",
        bloques: [
          {
            p: [
              "We keep your information only for as long as needed to help you and deliver the service, or as long as the law requires. After that we delete it or anonymize it.",
            ],
          },
        ],
      },
      {
        titulo: "10. Changes to this policy",
        bloques: [
          {
            p: [
              "We may update this policy when necessary. We will publish the current version here with its last-updated date.",
            ],
          },
        ],
      },
      {
        titulo: "11. Contact",
        bloques: [
          {
            p: [
              "For any question about this policy or your data, contact us on WhatsApp at ",
              { enlace: "+1 424 447 2698", href: "__WHATSAPP__", externo: true },
              " or by email at ",
              correo(),
              ".",
            ],
          },
        ],
      },
    ],
  },

  terminos: {
    metaTitle: "Terms of Service",
    metaDescription:
      "The terms governing the use of Upcore AI's website and the hiring of its automation services.",
    titulo: "Terms of Service",
    actualizado: "August 2026",
    intro:
      "These terms govern the use of this site and of Upcore AI's services. By browsing the site or engaging us, you accept what is described here. They are written to be clear and fair to both parties.",
    secciones: [
      {
        titulo: "1. Who we are and what we offer",
        bloques: [
          {
            p: [
              "Upcore AI is an agency that designs and builds custom automations, artificial intelligence agents, websites and dashboards, focused on real estate firms selling preconstruction. This site is informational and a contact channel.",
            ],
          },
        ],
      },
      {
        titulo: "2. Proposals, prices and the calculator",
        bloques: [
          {
            p: [
              "The prices, ranges and calculator results on this site are ",
              { fuerte: "indicative estimates" },
              ", not a binding offer. The final price and scope are agreed in writing in your proposal, after an assessment. Every project is quoted individually.",
            ],
          },
        ],
      },
      {
        titulo: "3. Everything we build is yours",
        bloques: [
          {
            p: [
              "What we develop for you lives in ",
              { fuerte: "your own accounts and infrastructure" },
              " (domain, hosting, servers, APIs) and is your property. If you choose the Managed plan, we retain narrow, documented and revocable access solely in order to run and maintain it for you.",
            ],
          },
        ],
      },
      {
        titulo: "4. Payments and costs",
        bloques: [
          {
            p: [
              "The project is agreed with a deposit and the balance as set out in your proposal. ",
              { fuerte: "Variable costs" },
              " (artificial intelligence APIs, WhatsApp messaging, hosting and third-party services) are borne by the client, in the client's name and on the client's payment method. The Managed plan's monthly fee, where applicable, covers the operation and maintenance service, not those variable costs.",
            ],
          },
        ],
      },
      {
        titulo: "5. Client responsibilities",
        bloques: [
          {
            ul: [
              ["Provide accurate information and the necessary access."],
              ["Keep credentials secure (they are never shared over chat)."],
              [
                "Use the service in accordance with the law, including responsible handling of their buyers' data.",
              ],
            ],
          },
        ],
      },
      {
        titulo: "6. Warranty and results",
        bloques: [
          {
            p: [
              "We provide our services with professional diligence. Where we offer a results guarantee, it is set out in writing in your proposal along with its conditions. Savings or return estimates are good-faith projections based on industry data, not a promise of individual results, which depend on each firm.",
            ],
          },
        ],
      },
      {
        titulo: "7. Limitation of liability",
        bloques: [
          {
            p: [
              "To the extent permitted by law, Upcore AI shall not be liable for indirect damages or losses arising from the use of, or inability to use, the site or third-party services. The informational part of this site is provided “as is”, without warranties of uninterrupted availability.",
            ],
          },
        ],
      },
      {
        titulo: "8. Site intellectual property",
        bloques: [
          {
            p: [
              "The Upcore AI brand, the design and the content of this site are our property. Reproduction without authorization is not permitted. (This does not affect what we build for you, which is yours — see section 3.)",
            ],
          },
        ],
      },
      {
        titulo: "9. Changes and availability",
        bloques: [
          {
            p: [
              "We may modify or discontinue the site, and may update these terms. We will publish the current version here with its date.",
            ],
          },
        ],
      },
      {
        titulo: "10. Governing law",
        bloques: [
          {
            p: [
              `These terms are governed by ${LEY_POR_IDIOMA.en.ley}. Any dispute shall be resolved before ${LEY_POR_IDIOMA.en.foro}.`,
            ],
          },
        ],
      },
      {
        titulo: "11. Contact",
        bloques: [
          {
            p: [
              "For any question about these terms, contact us on WhatsApp at ",
              { enlace: "+1 424 447 2698", href: "__WHATSAPP__", externo: true },
              " or by email at ",
              correo(),
              ".",
            ],
          },
        ],
      },
    ],
  },
};

export const TL: Record<Idioma, TextosLegales> = { es: ES, en: EN };

export const legal = (idioma: Idioma): TextosLegales => TL[idioma];

/** El marcador que la página cambia por el link real de WhatsApp del idioma. */
export const MARCA_WHATSAPP = "__WHATSAPP__";
