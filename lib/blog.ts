// ============================================================================
// BLOG (SEO) — Upcore AI · español e inglés
//
// Cada objeto es un artículo en /blog/[slug] y /en/blog/[slug]. El sitemap, el
// índice, el `hreflang` y el enlace del menú se actualizan solos.
//
// El texto vive en `t: Record<Idioma, TextoArticulo>`: TypeScript obliga a que los
// dos idiomas tengan las mismas claves. Publicar un artículo en español sin su
// versión inglesa NO COMPILA.
//
// ⚠️ REGLA DE CIFRAS (la de la casa). Este contenido es público y con firma, así que
// solo van números con fuente comprobada:
//   · 60–70% de los prospectos se pierden por seguimiento tardío
//   · 48% de los asesores no da un segundo contacto
//   · responder en menos de 1 hora → 7× más probable calificar al lead
//   · el sector convierte entre 0.4% y 2.4%
//   · 52% de las compras de preventa en el sur de Florida son de extranjeros;
//     ~86% de esos compradores internacionales son latinoamericanos
// Lo que NO se hace: inventar precios de competidores que no hemos comprobado, ni
// prometer un número de ventas. Los precios propios sí se dicen, porque son nuestros
// — y hay guardián que los compara contra `lib/calc.ts`, que es su único dueño.
// ============================================================================

import type { Idioma } from "./idioma";

export type SeccionArticulo = {
  h2: string;
  parrafos: string[];
  /** Bullets opcionales que van después de los párrafos */
  lista?: string[];
};

export type TextoArticulo = {
  /** Título SEO SIN "| Upcore AI" — el layout agrega la marca */
  title: string;
  metaDescription: string;
  h1: string;
  /** Entradilla: se muestra en el índice y bajo el h1 */
  resumen: string;
  secciones: SeccionArticulo[];
  faqs?: { q: string; a: string }[];
};

export type Articulo = {
  /** El slug ESPAÑOL, que hace además de identificador interno del artículo. */
  slug: string;
  /** El slug INGLÉS, el que se publica bajo `/en/blog/…`. Obligatorio: un
   *  artículo nuevo sin su slug traducido no compila. Ver la nota larga en
   *  `Solucion.slugEn` (lib/soluciones.ts). */
  slugEn: string;
  /** ISO "2026-07-22" — alimenta JSON-LD y sitemap (solo fechas reales) */
  fechaPublicado: string;
  fechaActualizado?: string;
  /** Slugs de lib/soluciones.ts → enlaces internos al final del artículo */
  solucionesRelacionadas?: string[];
  t: Record<Idioma, TextoArticulo>;
};

export const ARTICULOS: Articulo[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "prospectos-que-se-enfrian-seguimiento-inmobiliario",
    slugEn: "leads-lost-to-late-follow-up",
    fechaPublicado: "2026-08-19",
    fechaActualizado: "2026-08-22",
    solucionesRelacionadas: [
      "seguimiento-de-leads-inmobiliarios",
      "chatbot-whatsapp-para-inmobiliarias",
      "automatizacion-para-inmobiliarias",
    ],
    t: {
      es: {
        title: "60–70% de prospectos perdidos por seguimiento tardío",
        metaDescription:
          "No es que no lleguen prospectos: es que nadie les da seguimiento. Los números del sector, por qué pasa aunque el equipo sea bueno y qué se puede automatizar.",
        h1: "El 60–70% de tus prospectos se pierde por seguimiento tardío",
        resumen:
          "La mayoría de las inmobiliarias no tiene un problema de generación de leads: tiene un problema de seguimiento. Aquí van los números del sector, la razón por la que pasa incluso con equipos buenos, y qué parte de esto se puede resolver sin contratar a nadie.",
        secciones: [
          {
            h2: "Los tres números que describen el problema",
            parrafos: [
              "Hay tres cifras del sector inmobiliario que, juntas, explican casi todo lo que pasa entre que alguien pregunta y alguien firma:",
            ],
            lista: [
              "Entre el 60% y el 70% de los prospectos se pierden por falta de seguimiento oportuno.",
              "El 48% de los asesores no vuelve a contactar después de la primera llamada.",
              "Solo entre el 0.4% y el 2.4% de los leads acaba en venta.",
            ],
          },
          {
            h2: "Por qué pasa aunque tu equipo sea bueno",
            parrafos: [
              "La lectura fácil es que los asesores no hacen su trabajo. La lectura correcta es otra: el volumen gana cuando no hay un sistema detrás.",
              "Un asesor con treinta conversaciones abiertas atiende bien las cinco más calientes. Las otras veinticinco no se pierden por desinterés: se pierden porque nadie tiene en la cabeza que al prospecto del 14 de marzo le tocaba un mensaje el 2 de mayo. Y la preventa es justo el negocio donde eso importa más, porque entre la primera pregunta y la firma pueden pasar meses.",
              "El segundo motivo es el horario. Si tu comprador está en otro país, escribe a su hora, no a la tuya. El mensaje que entra a las once de la noche compite con el proyecto que sí contestó.",
            ],
          },
          {
            h2: "La primera hora es la que decide",
            parrafos: [
              "Quien responde un lead en menos de una hora tiene siete veces más probabilidad de calificarlo. La mayoría de los equipos tarda veinticuatro horas o más.",
              "No es magia: es que a los sesenta minutos la persona sigue en el mismo estado mental en el que preguntó. Al día siguiente ya miró otros tres proyectos y la conversación arranca de cero, si es que arranca.",
              "Esto es lo primero que conviene arreglar, y no requiere reorganizar a nadie: requiere que alguien —o algo— conteste siempre.",
            ],
          },
          {
            h2: "Qué se puede automatizar sin que se sienta automático",
            parrafos: [
              "No todo el seguimiento se automatiza, ni conviene. Lo que sí, y sin que el comprador lo note:",
            ],
            lista: [
              "La primera respuesta, a cualquier hora y en el idioma en que le escriban.",
              "La calificación básica: qué busca, en qué zona, con qué presupuesto y en qué plazo.",
              "El agendado de la visita o la videollamada, contra tu calendario real.",
              "Los recordatorios de cada etapa de pago y los avisos de avance de obra.",
              "El toque de reactivación al que dejó de contestar hace tres meses.",
            ],
          },
          {
            h2: "Lo que no se automatiza",
            parrafos: [
              "La conversación de cierre. La visita. La llamada donde el comprador te dice que su esposa no está convencida. Ahí es donde tu asesor gana su comisión, y ahí no debe haber un robot.",
              "El punto de automatizar lo anterior no es reemplazar al asesor: es que llegue a esa conversación con el prospecto ya calificado y todavía caliente, en vez de gastar el día contestando dudas que se repiten y si se puede comprar desde el extranjero.",
            ],
          },
        ],
        faqs: [
          {
            q: "¿Cuántas ventas más voy a cerrar con esto?",
            a: "No se puede saber sin tu CRM y tu tasa de cierre, y desconfía de quien te dé un número. Lo que sí se puede garantizar es que ningún prospecto se quede sin su siguiente toque.",
          },
          {
            q: "¿Mis compradores van a notar que les escribe un sistema?",
            a: "Si los mensajes van con tu tono, su nombre y el dato que le toca a esa persona, no. Lo que sí se nota es la plantilla igual para todos — por eso los textos los apruebas tú antes de que salga el primero.",
          },
        ],
      },
      en: {
        title: "60–70% of your leads are lost to late follow-up",
        metaDescription:
          "It is not that leads are not arriving: nobody follows up. The industry numbers, why it happens even with good teams, and what can be automated.",
        h1: "60–70% of your leads are lost to late follow-up",
        resumen:
          "Most real estate firms do not have a lead generation problem: they have a follow-up problem. Here are the industry numbers, the reason it happens even to good teams, and which part of it can be solved without hiring anyone.",
        secciones: [
          {
            h2: "The three numbers that describe the problem",
            parrafos: [
              "There are three industry figures that, taken together, explain almost everything that happens between someone asking and someone signing:",
            ],
            lista: [
              "Between 60% and 70% of leads are lost for lack of timely follow-up.",
              "48% of agents never follow up after the first call.",
              "Only 0.4% to 2.4% of leads end in a sale.",
            ],
          },
          {
            h2: "Why it happens even when your team is good",
            parrafos: [
              "The easy reading is that the agents are not doing their job. The correct reading is a different one: volume wins when there is no system behind it.",
              "An agent with thirty open conversations handles the five hottest ones well. The other twenty-five are not lost to indifference: they are lost because nobody is carrying around the fact that the lead from March 14 was due a message on May 2. And preconstruction is exactly the business where that matters most, because months can pass between the first question and the signature.",
              "The second reason is the clock. If your buyer is in another country, they write on their time, not yours. The message that lands at eleven at night is competing with the project that did answer.",
            ],
          },
          {
            h2: "The first hour is the one that decides",
            parrafos: [
              "Whoever answers a lead within an hour is seven times more likely to qualify them. Most teams take twenty-four hours or more.",
              "It is not magic: sixty minutes in, the person is still in the same frame of mind they asked in. By the next day they have looked at three other projects and the conversation starts from zero, if it starts at all.",
              "This is the first thing worth fixing, and it does not require reorganizing anybody: it requires that someone — or something — always answers.",
            ],
          },
          {
            h2: "What can be automated without feeling automated",
            parrafos: [
              "Not all follow-up should be automated, nor is that wise. What should be, without the buyer noticing:",
            ],
            lista: [
              "The first reply, at any hour and in whatever language they write in.",
              "Basic qualification: what they are looking for, which area, what budget and what timeline.",
              "Booking the visit or the video call, against your real calendar.",
              "Reminders for every payment milestone and construction progress updates.",
              "The re-engagement touch to whoever stopped replying three months ago.",
            ],
          },
          {
            h2: "What does not get automated",
            parrafos: [
              "The closing conversation. The site visit. The call where the buyer tells you their spouse is not convinced. That is where your agent earns their commission, and there should be no robot there.",
              "The point of automating everything before it is not to replace the agent: it is that they reach that conversation with the lead already qualified and still warm, instead of spending the day answering the same recurring questions and whether you can buy from abroad.",
            ],
          },
        ],
        faqs: [
          {
            q: "How many more sales will I close with this?",
            a: "It cannot be known without your CRM and your close rate, and be suspicious of anyone who hands you a number. What can be guaranteed is that no lead is left without its next touch.",
          },
          {
            q: "Will my buyers notice a system is writing to them?",
            a: "If the messages carry your tone, their name and the detail that belongs to that person, no. What does show is one template for everybody — which is why you approve the copy before the first one goes out.",
          },
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "comprador-latinoamericano-preventa-miami",
    slugEn: "latin-american-buyer-miami-preconstruction",
    fechaPublicado: "2026-08-19",
    fechaActualizado: "2026-08-22",
    solucionesRelacionadas: [
      "vender-preventa-en-miami-a-compradores-latinos",
      "chatbot-whatsapp-para-inmobiliarias",
      "seguimiento-de-leads-inmobiliarios",
    ],
    t: {
      es: {
        title: "Atender al comprador latinoamericano en Miami",
        metaDescription:
          "Más de la mitad de las compras de preventa en el sur de Florida son de extranjeros, casi todos latinoamericanos. Qué cambia cuando ese es tu comprador.",
        h1: "Cómo atender a un comprador latinoamericano que compra en Miami sin visitarla",
        resumen:
          "Compra desde otro país, decide en familia, pregunta en español y muchas veces firma sin haber pisado la unidad. Este perfil ya es la mayoría del mercado de preventa en el sur de Florida, y atiende distinto a como está montada la mayoría de las operaciones.",
        secciones: [
          {
            h2: "Quién compra hoy la preventa de Miami",
            parrafos: [
              "En nueva construcción y preconstrucción del sur de Florida, los compradores globales representan alrededor del 52% de las compras. Y dentro de ese segmento internacional, cerca del 86% son latinoamericanos.",
              "Dicho simple: si vendes preventa en Miami, es más probable que tu próximo comprador sea de Bogotá, Buenos Aires o Ciudad de México que de Florida.",
            ],
          },
          {
            h2: "Tres cosas que cambian cuando tu comprador está afuera",
            parrafos: [
              "No es el mismo proceso con el acento cambiado. Cambian tres cosas de fondo:",
            ],
            lista: [
              "El horario. Tu comprador pregunta a su hora. Tu oficina abre a la tuya. Esa diferencia se come los primeros mensajes, que son los que más valen.",
              "El idioma. El español suele ser el idioma del primer contacto y el de la decisión familiar. Atender bien en inglés y regular en español pierde justo donde más pesa.",
              "La distancia. Muchos compran sin visitar. Eso significa que la confianza no se construye enseñando el departamento, sino contestando bien y rápido durante meses.",
            ],
          },
          {
            h2: "Las preguntas que llegan y que no son del proyecto",
            parrafos: [
              "Un comprador local pregunta por la unidad. Uno que compra desde afuera pregunta, además, cosas que no tienen que ver con el edificio: cómo se paga desde su país, si necesita residencia, a nombre de quién conviene escriturar, qué pasa con los impuestos al vender.",
              "Aquí hay una regla que conviene tener clarísima: esas preguntas se derivan, no se improvisan. Un asesor —o un asistente— que contesta a la ligera sobre impuestos, FIRPTA o condiciones de crédito le puede costar dinero real a esa persona. Lo correcto es decir con naturalidad que eso lo ve su abogado o su contador, y ofrecer conectarlo.",
              "Curiosamente, admitir lo que no sabes construye más confianza que responder todo. Sobre todo con alguien que va a mandar un anticipo a un país donde no vive.",
            ],
          },
          {
            h2: "Qué se puede hacer distinto sin contratar a nadie",
            parrafos: [
              "Lo que casi siempre falta no es un equipo más grande: es cobertura fuera de horario y memoria a largo plazo.",
            ],
            lista: [
              "Atención inmediata en español, a la hora que escriban, con la información real de tus proyectos.",
              "Calificación básica antes de que llegue al asesor: zona, presupuesto, plazo y si necesita financiamiento.",
              "Agendado de visita o videollamada, recordando que tus horarios son de Miami y los suyos no.",
              "Seguimiento que aguante los meses que dura la preventa, con los recordatorios de cada etapa.",
            ],
          },
        ],
        faqs: [
          {
            q: "¿Sirve si vendo unidades listas y no preventa?",
            a: "Sí. El seguimiento largo pesa menos, pero la atención inmediata y la calificación funcionan igual.",
          },
          {
            q: "¿Y si mi equipo ya habla español?",
            a: "Mejor todavía. El problema que esto resuelve no es de idioma sino de horario y de volumen: nadie puede contestar a las once de la noche todos los días, ni acordarse de trescientos prospectos.",
          },
        ],
      },
      en: {
        title: "Serving the Latin American buyer in Miami",
        metaDescription:
          "More than half of South Florida preconstruction purchases come from foreign buyers, most of them Latin American. What changes when that is your buyer.",
        h1: "How to serve a Latin American buyer purchasing in Miami sight unseen",
        resumen:
          "They buy from another country, decide as a family, ask in Spanish and often sign without ever setting foot in the unit. This profile is already the majority of the South Florida preconstruction market, and it needs to be served differently from how most operations are set up.",
        secciones: [
          {
            h2: "Who is buying Miami preconstruction today",
            parrafos: [
              "In South Florida new construction and preconstruction, global buyers account for roughly 52% of purchases. And within that international segment, close to 86% are Latin American.",
              "Put simply: if you sell preconstruction in Miami, your next buyer is more likely to be from Bogotá, Buenos Aires or Mexico City than from Florida.",
            ],
          },
          {
            h2: "Three things that change when your buyer is abroad",
            parrafos: [
              "It is not the same process with a different accent. Three things change at the root:",
            ],
            lista: [
              "The clock. Your buyer asks on their time. Your office opens on yours. That gap eats the first messages, which are the ones worth most.",
              "The language. Spanish tends to be the language of the first contact and of the family decision. Being good in English and merely passable in Spanish loses exactly where it weighs most.",
              "The distance. Many buy without visiting. That means trust is not built by showing the apartment, but by answering well and fast for months.",
            ],
          },
          {
            h2: "The questions that arrive and are not about the project",
            parrafos: [
              "A local buyer asks about the unit. Someone buying from abroad also asks things that have nothing to do with the building: how to pay from their country, whether they need residency, whose name should go on the deed, what happens with taxes when they sell.",
              "There is a rule here worth being absolutely clear about: those questions get handed over, not improvised. An agent — or an assistant — who answers carelessly about taxes, FIRPTA or financing terms can cost that person real money. The right move is to say plainly that their attorney or accountant handles that, and offer to connect them.",
              "Oddly enough, admitting what you do not know builds more trust than answering everything. Especially with someone about to wire a deposit to a country they do not live in.",
            ],
          },
          {
            h2: "What can be done differently without hiring anyone",
            parrafos: [
              "What is almost always missing is not a bigger team: it is after-hours coverage and long-term memory.",
            ],
            lista: [
              "Immediate coverage in Spanish, whatever hour they write, with the real information about your projects.",
              "Basic qualification before it reaches the agent: area, budget, timeline and whether they need financing.",
              "Booking a visit or video call, remembering that your hours are Miami time and theirs are not.",
              "Follow-up that lasts the months a preconstruction sale takes, with the reminders for each milestone.",
            ],
          },
        ],
        faqs: [
          {
            q: "Does it help if I sell finished units rather than preconstruction?",
            a: "Yes. The long follow-up matters less, but immediate response and qualification work just the same.",
          },
          {
            q: "What if my team already speaks Spanish?",
            a: "Even better. The problem this solves is not language but hours and volume: nobody can answer at eleven at night every day, or remember three hundred leads.",
          },
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "cuanto-cuesta-automatizar-atencion-inmobiliaria",
    slugEn: "cost-to-automate-real-estate-inbound",
    fechaPublicado: "2026-08-19",
    fechaActualizado: "2026-08-22",
    solucionesRelacionadas: [
      "automatizacion-para-inmobiliarias",
      "chatbot-whatsapp-para-inmobiliarias",
      "agente-de-voz-para-inmobiliarias",
    ],
    t: {
      es: {
        title: "¿Cuánto cuesta automatizar una inmobiliaria? (2026)",
        metaDescription:
          "Qué determina el precio de automatizar la atención, los tres modelos de cobro, los costos de APIs que casi nadie menciona y cómo detectar letra chica.",
        h1: "¿Cuánto cuesta automatizar la atención de una inmobiliaria?",
        resumen:
          "La mayoría de los proveedores te hace \"solicitar cotización\" para averiguarlo. Aquí va cómo se forma ese precio de verdad, los tres modelos de cobro que te vas a topar, los costos de APIs que suelen quedar fuera de la propuesta, y las preguntas que conviene hacer antes de firmar.",
        secciones: [
          {
            h2: "Primero, lo que decide el precio",
            parrafos: [
              "El precio no lo decide el tamaño de tu firma: lo deciden dos cosas. Cuántas piezas montas, y quién lo opera después.",
              "Las piezas suelen ser cinco: un asistente para WhatsApp, un agente que conteste el teléfono, un sitio con la ficha de cada desarrollo y agenda en línea, el seguimiento automático de la preventa, y la reactivación de prospectos viejos. Encima puede ir un panel para el director comercial.",
              "Una pieza suelta cuesta una fracción del sistema completo. Y el sistema completo rinde más que la suma de sus partes, porque comparten la misma información y no se contradicen entre ellas.",
            ],
          },
          {
            h2: "Los tres modelos de cobro que te vas a topar",
            parrafos: [
              "Detrás de cualquier cotización hay uno de estos tres modelos, y conviene reconocerlos porque cambian por completo lo que acabas pagando a dos años:",
              "1) Renta mensual. Pagas poco para entrar, y para siempre. El sistema nunca es tuyo: el día que dejas de pagar, se apaga. Es el modelo favorito del mercado porque asegura ingreso recurrente al proveedor.",
              "2) Pago único. Se construye, se entrega y es tuyo. Sale más caro el primer mes y mucho más barato al segundo año. El riesgo es quedarte solo si el proveedor desaparece — por eso importa que todo quede a tu nombre.",
              "3) Pago único más mensualidad opcional de operación. Lo construyes una vez y decides si lo operas tú o si alguien lo mantiene por ti. Es el modelo que usamos: la propiedad siempre es tuya, y la mensualidad es por el servicio, nunca por el software.",
            ],
          },
          {
            h2: "Los costos que casi nadie menciona en la propuesta",
            parrafos: [
              "Un asistente con inteligencia artificial consume APIs, y esas APIs cuestan. Es un costo real, mensual y variable según tu volumen. Que no aparezca en una cotización no significa que no exista: significa que va escondido en la mensualidad, con margen encima.",
              "La forma honesta de manejarlo es que esas cuentas se abran a tu nombre, con tope de gasto activado, y que pagues el consumo directo al proveedor. Así ves exactamente cuánto gastas y nadie le agrega margen.",
              "Ojo con una pieza en particular: el agente de voz se cobra por minuto hablado, así que escala casi lineal con tus llamadas. Es la pieza con el costo por uso más alto de todas, y quien no te lo diga de frente te lo va a cobrar de todos modos.",
            ],
          },
          {
            h2: "Cinco preguntas antes de firmar",
            parrafos: [
              "Da igual con quién trabajes. Estas cinco preguntas separan una propuesta seria de una que va a doler después:",
            ],
            lista: [
              "¿A nombre de quién quedan las cuentas, el número y el sitio? Si la respuesta no es \"tuyo\", estás rentando.",
              "¿Cuánto cuestan las APIs al mes con mi volumen, y a quién se las pago?",
              "¿Qué pasa el día que quiera irme? ¿Se apaga algo?",
              "¿Se integra a mi CRM actual o tengo que migrar? Una migración forzada es un costo oculto enorme.",
              "¿Qué exactamente está incluido en el precio y qué se cobra aparte?",
            ],
          },
          {
            h2: "Y nuestros precios, ya que estamos",
            parrafos: [
              "Sería raro escribir esto y no decir los nuestros. Son cerrados, no rangos: el asistente de WhatsApp son $6,000 USD —con una versión esencial de $3,000 que atiende solo en español—, el agente de voz $6,500, el sitio con agenda $4,500, el seguimiento automático $3,500 y la reactivación $3,000. El panel, si lo quieres, $3,000. De la segunda pieza en adelante hay 15% menos.",
              "Todo es pago único y queda a tu nombre. Si prefieres que nosotros lo operemos, hay una mensualidad aparte por ese servicio — nunca por el software.",
            ],
          },
        ],
        faqs: [
          {
            q: "¿Por qué no publican rangos de la competencia?",
            a: "Porque no los hemos comprobado en este mercado, y aquí no escribimos cifras sin fuente. Cuando tengamos ese dato verificado, lo publicamos.",
          },
          {
            q: "¿Puedo empezar con una sola pieza?",
            a: "Sí, y a veces es lo correcto. En el diagnóstico se ve qué ataca tu dolor real; lo demás se lista aparte, con su precio y el motivo por el que puede esperar.",
          },
        ],
      },
      en: {
        title: "What it costs to automate a real estate firm (2026)",
        metaDescription:
          "What determines the price of automating your inbound, the three billing models, the API costs almost nobody mentions, and how to spot the fine print.",
        h1: "What does it cost to automate a real estate firm's inbound?",
        resumen:
          "Most vendors make you \"request a quote\" to find out. Here is how that price is actually built, the three billing models you will run into, the API costs that usually stay out of the proposal, and the questions worth asking before you sign.",
        secciones: [
          {
            h2: "First, what decides the price",
            parrafos: [
              "The price is not decided by the size of your firm: it is decided by two things. How many pieces you build, and who runs it afterwards.",
              "There are usually five pieces: an assistant for WhatsApp, an agent that answers the phone, a site with a page for each development and online booking, automated follow-up through the preconstruction cycle, and re-engagement of old leads. On top of those there can be a dashboard for the sales director.",
              "A single piece costs a fraction of the full system. And the full system is worth more than the sum of its parts, because the pieces share the same information and never contradict each other.",
            ],
          },
          {
            h2: "The three billing models you will run into",
            parrafos: [
              "Behind any quote sits one of these three models, and it is worth recognizing them because they completely change what you end up paying over two years:",
              "1) Monthly rental. You pay little to get in, and you pay forever. The system is never yours: the day you stop paying, it switches off. It is the market's favorite model because it locks in recurring revenue for the vendor.",
              "2) One-time payment. It gets built, handed over, and it is yours. More expensive in month one and far cheaper by year two. The risk is being left on your own if the vendor disappears — which is why it matters that everything is in your name.",
              "3) One-time payment plus an optional monthly operating fee. You build it once and decide whether you run it or someone maintains it for you. It is the model we use: ownership is always yours, and the monthly fee is for the service, never for the software.",
            ],
          },
          {
            h2: "The costs almost nobody mentions in the proposal",
            parrafos: [
              "An AI assistant consumes APIs, and those APIs cost money. It is a real cost, monthly and variable with your volume. Its absence from a quote does not mean it does not exist: it means it is buried in the monthly fee, with margin on top.",
              "The honest way to handle it is for those accounts to be opened in your name, with a spending cap turned on, and for you to pay usage directly to the provider. That way you see exactly what you spend and nobody adds margin to it.",
              "Watch one piece in particular: the voice agent is billed per minute spoken, so it scales almost linearly with your call volume. It is the piece with the highest usage cost of them all, and whoever does not tell you that up front will charge you for it anyway.",
            ],
          },
          {
            h2: "Five questions before you sign",
            parrafos: [
              "It does not matter who you work with. These five questions separate a serious proposal from one that will hurt later:",
            ],
            lista: [
              "Whose name are the accounts, the number and the site in? If the answer is not \"yours\", you are renting.",
              "What do the APIs cost per month at my volume, and who do I pay them to?",
              "What happens the day I want to leave? Does anything switch off?",
              "Does it integrate with my current CRM or do I have to migrate? A forced migration is an enormous hidden cost.",
              "What exactly is included in the price and what is billed separately?",
            ],
          },
          {
            h2: "And our prices, while we are at it",
            parrafos: [
              "It would be odd to write all this and not state ours. They are fixed, not ranges: the WhatsApp assistant is $6,000 USD —with an essential version at $3,000 that answers in Spanish only—, the voice agent $6,500, the site with booking $4,500, automated follow-up $3,500 and re-engagement $3,000. The dashboard, if you want it, $3,000. From the second piece onward there is 15% off.",
              "It is all one-time payment and it all stays in your name. If you would rather we ran it, there is a separate monthly fee for that service — never for the software.",
            ],
          },
        ],
        faqs: [
          {
            q: "Why do you not publish competitors' ranges?",
            a: "Because we have not verified them in this market, and we do not write figures without a source. When we have that verified, we will publish it.",
          },
          {
            q: "Can I start with a single piece?",
            a: "Yes, and sometimes that is the right call. The assessment shows what actually attacks your real pain; everything else is listed separately, with its price and the reason it can wait.",
          },
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "whatsapp-business-api-inmobiliarias-guia",
    slugEn: "whatsapp-business-api-real-estate-guide",
    fechaPublicado: "2026-08-19",
    fechaActualizado: "2026-08-22",
    solucionesRelacionadas: [
      "chatbot-whatsapp-para-inmobiliarias",
      "asistente-virtual-para-inmobiliarias",
      "automatizacion-para-inmobiliarias",
    ],
    t: {
      es: {
        title: "WhatsApp Business API para inmobiliarias: guía clara",
        metaDescription:
          "Qué es la API oficial de WhatsApp, en qué se diferencia de la app, por qué importa para una inmobiliaria y los riesgos reales de usar conexiones no oficiales.",
        h1: "WhatsApp Business API para inmobiliarias: guía sin tecnicismos",
        resumen:
          "Si vas a poner un asistente en tu WhatsApp, esta es la parte que conviene entender antes: qué es la vía oficial, en qué cambia tu operación diaria, y por qué las conexiones piratas ponen en riesgo el número por el que te contacta todo el mundo.",
        secciones: [
          {
            h2: "Tres WhatsApp distintos, y solo uno sirve para esto",
            parrafos: [
              "WhatsApp normal es la app personal. WhatsApp Business es la app para negocios chicos, con catálogo y respuestas rápidas, pero sigue viviendo en un teléfono. La API oficial (Cloud API) es otra cosa: no vive en un teléfono, vive en la nube, y es la única que permite que un sistema conteste por ti de forma autorizada.",
              "Esa diferencia tiene una consecuencia práctica que hay que saber antes: cuando conectas tu número a la API, sale de la app del teléfono. Tu equipo pasa a responder desde una bandeja en la computadora. No es peor — de hecho es mejor para un equipo — pero es un cambio de hábito y conviene decidirlo a conciencia.",
            ],
          },
          {
            h2: "La decisión: tu número de siempre o uno nuevo",
            parrafos: ["Las dos opciones son válidas y dependen de tu operación:"],
            lista: [
              "Tu número actual: tus compradores ya lo conocen y no lo mandan a spam. El detalle es el que acabamos de ver — sale de la app del teléfono.",
              "Un número nuevo: tu línea de siempre se queda intacta en el celular y el asistente estrena la suya. Cuesta poco y se anuncia donde ya publicas.",
            ],
          },
          {
            h2: "Por qué las conexiones no oficiales son mala idea",
            parrafos: [
              "Existen formas de conectar un bot a WhatsApp sin pasar por Meta. Son más baratas y más rápidas de montar, y por eso mucha gente las usa.",
              "El problema es que violan los términos de WhatsApp, y la sanción no es una multa: es que el número deja de funcionar. Perder de golpe el número por el que te escriben todos tus prospectos, y toda la conversación histórica con ellos, no compensa el ahorro.",
              "Hay un matiz que conviene conocer: la API oficial no puede escribirle primero a alguien con quien no has hablado, salvo con plantillas previamente aprobadas. Eso es una limitación real y es a propósito — es lo que evita que WhatsApp se llene de spam. Si un proveedor te ofrece \"mandar mensajes masivos a quien quieras\", te está ofreciendo justo lo que hace que tumben números.",
            ],
          },
          {
            h2: "Qué necesitas de tu lado",
            parrafos: [
              "Aquí hay una sola cosa que no se puede delegar, y conviene decirla de frente: el activo de WhatsApp tiene que salir del Facebook personal del dueño del negocio. Meta lo exige, y automatizar ese paso hace que restrinjan la cuenta.",
              "En la práctica son unos diez minutos en videollamada, con alguien dictándote cada clic. Todo lo demás —abrir las cuentas, configurar, conectar, probar— no requiere que toques nada.",
            ],
          },
        ],
        faqs: [
          {
            q: "¿Pierdo mis conversaciones anteriores al migrar?",
            a: "El historial de la app no se transfiere a la bandeja nueva. Conviene saberlo antes y, si hay conversaciones que importan, exportarlas.",
          },
          {
            q: "¿Cuánto cuesta la API oficial?",
            a: "Meta cobra por conversación, con un tramo gratuito mensual. Para el volumen de una inmobiliaria suelen ser unas decenas de dólares al mes, y se paga directo a Meta desde tu cuenta.",
          },
        ],
      },
      en: {
        title: "WhatsApp Business API for real estate: a clear guide",
        metaDescription:
          "What the official WhatsApp API is, how it differs from the app, why it matters for a real estate firm, and the real risks of using unofficial connections.",
        h1: "WhatsApp Business API for real estate: a guide without the jargon",
        resumen:
          "If you are going to put an assistant on your WhatsApp, this is the part worth understanding first: what the official route is, how it changes your daily operation, and why unofficial connections put at risk the number everyone contacts you on.",
        secciones: [
          {
            h2: "Three different WhatsApps, and only one works for this",
            parrafos: [
              "Regular WhatsApp is the personal app. WhatsApp Business is the app for small businesses, with a catalog and quick replies, but it still lives on a phone. The official API (Cloud API) is a different thing: it does not live on a phone, it lives in the cloud, and it is the only one that lets a system answer on your behalf in an authorized way.",
              "That difference has a practical consequence worth knowing in advance: when you connect your number to the API, it leaves the phone app. Your team starts replying from an inbox on the computer. It is not worse — it is actually better for a team — but it is a change of habit and worth deciding on deliberately.",
            ],
          },
          {
            h2: "The decision: your usual number or a new one",
            parrafos: ["Both options are valid and it depends on your operation:"],
            lista: [
              "Your current number: your buyers already know it and do not send it to spam. The catch is the one we just covered — it leaves the phone app.",
              "A new number: your usual line stays untouched on the phone and the assistant gets its own. It costs little and you advertise it where you already publish.",
            ],
          },
          {
            h2: "Why unofficial connections are a bad idea",
            parrafos: [
              "There are ways to connect a bot to WhatsApp without going through Meta. They are cheaper and quicker to set up, which is why plenty of people use them.",
              "The problem is that they violate WhatsApp's terms, and the penalty is not a fine: it is that the number stops working. Losing, all at once, the number every one of your leads writes to — and the entire conversation history with them — does not make up for the savings.",
              "There is a nuance worth knowing: the official API cannot write first to someone you have not spoken with, except through pre-approved templates. That is a real limitation and it is deliberate — it is what keeps WhatsApp from filling up with spam. If a vendor offers you \"mass messaging to whoever you want\", they are offering you exactly what gets numbers taken down.",
            ],
          },
          {
            h2: "What is needed on your side",
            parrafos: [
              "There is exactly one thing here that cannot be delegated, and it is worth saying plainly: the WhatsApp asset has to come from the business owner's personal Facebook. Meta requires it, and automating that step gets the account restricted.",
              "In practice it is about ten minutes on a video call, with someone dictating every click. Everything else — opening the accounts, configuring, connecting, testing — requires nothing from you.",
            ],
          },
        ],
        faqs: [
          {
            q: "Do I lose my previous conversations when migrating?",
            a: "The app's history does not transfer to the new inbox. Worth knowing beforehand and, if there are conversations that matter, exporting them.",
          },
          {
            q: "What does the official API cost?",
            a: "Meta bills per conversation, with a free monthly tier. For a real estate firm's volume it usually runs to a few tens of dollars a month, paid directly to Meta from your account.",
          },
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "llamadas-perdidas-inmobiliaria-quien-contesta",
    slugEn: "missed-calls-real-estate-who-answers",
    fechaPublicado: "2026-08-19",
    fechaActualizado: "2026-08-22",
    solucionesRelacionadas: [
      "agente-de-voz-para-inmobiliarias",
      "asistente-virtual-para-inmobiliarias",
      "chatbot-whatsapp-para-inmobiliarias",
    ],
    t: {
      es: {
        title: "Quién contesta tu teléfono a las 8 de la noche",
        metaDescription:
          "En preventa, quien llama suele ser quien ya decidió comprar. Qué pasa con las llamadas fuera de horario y por qué un menú de opciones espanta.",
        h1: "Las llamadas que se van al buzón: quién contesta tu teléfono a las 8 de la noche",
        resumen:
          "El WhatsApp se lleva la atención, pero en inmobiliario el teléfono sigue siendo el canal del comprador serio. Y es el que peor se cubre fuera de horario. Esto es lo que pasa con esas llamadas y qué se puede hacer.",
        secciones: [
          {
            h2: "Quien llama, casi siempre, va más en serio",
            parrafos: [
              "Escribir un mensaje cuesta poco: se hace en la fila del súper y se olvida. Marcar cuesta más — hay que decidir hablar con alguien.",
              "Por eso, en una operación de preventa, la llamada suele venir de quien ya recorrió el sitio, ya vio los planos y quiere resolver dudas concretas. Perder esa llamada duele más que perder un mensaje.",
            ],
          },
          {
            h2: "Y sin embargo, es lo peor cubierto",
            parrafos: [
              "Casi todas las operaciones tienen a alguien atento al WhatsApp. Muy pocas tienen a alguien atento al teléfono fuera del horario de oficina.",
              "Si tu comprador está en otro país, esto se agrava: marca a su hora. Y a la hora en que a él le queda bien llamar, tu oficina está cerrada.",
              "El resultado es un buzón de voz. Y un buzón de voz, para alguien que está comparando tres proyectos, es una señal de que ahí no lo van a atender bien.",
            ],
          },
          {
            h2: "Por qué un menú de opciones no arregla nada",
            parrafos: [
              "La solución tradicional es una centralita: \"marque 1 para ventas, marque 2 para administración\". Funciona para clasificar llamadas, no para atender a alguien que va a poner cientos de miles de dólares.",
              "Un menú comunica exactamente lo contrario de lo que quieres comunicar en una compra grande: que del otro lado hay un proceso, no una persona. Y aun así, al final del menú, sigue sin haber nadie a las ocho de la noche.",
            ],
          },
          {
            h2: "Las tres alternativas reales",
            parrafos: ["Puestas de frente, con sus costos y sus contras:"],
            lista: [
              "Un servicio de contestación humano. Contestan, pero no conocen tus proyectos: toman el recado y el prospecto queda igual de sin resolver.",
              "Guardias rotativas en tu equipo. Funciona un mes y luego nadie quiere el turno del domingo. Y se paga con desgaste.",
              "Un agente de voz con IA. Contesta hablando, conoce tus proyectos, agenda en tu calendario y avisa al asesor. Tu número de siempre no cambia: se configura un desvío para cuando nadie contesta.",
            ],
          },
          {
            h2: "Lo que hay que saber antes de elegir la tercera",
            parrafos: [
              "Dos cosas, y las decimos porque nos las preguntarías después.",
              "La primera: la voz se cobra por minuto hablado. Es la pieza con el costo por uso más alto de todas, y sube con tus llamadas. Se contrata con tope de gasto y ves tu consumo tú mismo.",
              "La segunda: un agente de voz no debe intentar cerrar la venta ni improvisar sobre impuestos, financiamiento o escrituración. Su trabajo es atender bien, resolver lo que sí sabe, y dejar la visita agendada para que un humano haga el resto.",
            ],
          },
        ],
        faqs: [
          {
            q: "¿Tengo que cambiar mi número de teléfono?",
            a: "No. Se configura un desvío y quien te llama marca el mismo número de siempre. También puedes darle línea propia al asistente si lo prefieres.",
          },
          {
            q: "¿Se nota que es una IA?",
            a: "Se nota si le preguntas. Está construido para decirlo cuando le preguntan, no para fingir que es humano. Lo que no se nota es la incomodidad de un menú: contesta hablando y entiende lo que le dices.",
          },
        ],
      },
      en: {
        title: "Who answers your phone at 8 p.m.?",
        metaDescription:
          "In preconstruction, whoever calls is usually already decided. What happens to after-hours calls, why phone menus scare buyers off, and the alternatives.",
        h1: "The calls that go to voicemail: who answers your phone at 8 p.m.",
        resumen:
          "WhatsApp gets all the attention, but in real estate the phone is still the serious buyer's channel. And it is the one worst covered after hours. Here is what happens to those calls and what can be done.",
        secciones: [
          {
            h2: "Whoever calls is almost always more serious",
            parrafos: [
              "Sending a message costs little: you do it in the supermarket line and forget about it. Dialing costs more — you have to decide to talk to someone.",
              "That is why, in a preconstruction operation, the call usually comes from someone who has already been through the site, already seen the floor plans, and wants concrete answers. Losing that call hurts more than losing a message.",
            ],
          },
          {
            h2: "And yet it is the worst covered",
            parrafos: [
              "Almost every operation has somebody watching WhatsApp. Very few have somebody watching the phone outside office hours.",
              "If your buyer is in another country this gets worse: they dial on their clock. And at the hour that suits them to call, your office is closed.",
              "The result is voicemail. And voicemail, to someone comparing three projects, is a signal that they will not be well looked after there.",
            ],
          },
          {
            h2: "Why a phone menu fixes nothing",
            parrafos: [
              "The traditional answer is a switchboard: \"press 1 for sales, press 2 for administration\". It works for sorting calls, not for looking after someone about to put down hundreds of thousands of dollars.",
              "A menu communicates exactly the opposite of what you want to communicate in a large purchase: that on the other side there is a process, not a person. And even so, at the end of the menu there is still nobody there at eight at night.",
            ],
          },
          {
            h2: "The three real alternatives",
            parrafos: ["Laid out plainly, with their costs and their downsides:"],
            lista: [
              "A human answering service. They pick up, but they do not know your projects: they take a message and the lead is left just as unresolved.",
              "Rotating on-call shifts in your team. It works for a month and then nobody wants the Sunday shift. And it is paid for in burnout.",
              "An AI voice agent. It answers by talking, knows your projects, books on your calendar and notifies the agent. Your usual number does not change: forwarding is set up for when nobody picks up.",
            ],
          },
          {
            h2: "What to know before choosing the third",
            parrafos: [
              "Two things, and we say them because you would ask us later.",
              "First: voice is billed per minute spoken. It is the piece with the highest usage cost of them all, and it rises with your call volume. It is set up with a spending cap and you watch your own usage.",
              "Second: a voice agent should not try to close the sale or improvise about taxes, financing or closing. Its job is to look after the caller well, resolve what it does know, and leave the appointment booked so a human can do the rest.",
            ],
          },
        ],
        faqs: [
          {
            q: "Do I have to change my phone number?",
            a: "No. Forwarding is set up and whoever calls dials the same number as always. You can also give the assistant its own line if you prefer.",
          },
          {
            q: "Can you tell it is an AI?",
            a: "You can if you ask it. It is built to say so when asked, not to pretend it is human. What you do not notice is the awkwardness of a menu: it answers by talking and understands what you say to it.",
          },
        ],
      },
    },
  },
];

export const HAY_BLOG = ARTICULOS.length > 0;

/** Busca un artículo por el slug del idioma pedido. Estricto a propósito: ver
 *  la nota de `getSolucion()` en lib/soluciones.ts. */
export function getArticulo(slug: string, idioma: Idioma = "es"): Articulo | undefined {
  return ARTICULOS.find((a) => (idioma === "en" ? a.slugEn : a.slug) === slug);
}

// ── Enlazado interno DERIVADO (SEO) ─────────────────────────────────────────
// Los dos salen del campo `solucionesRelacionadas` que ya existe: nada que
// mantener a mano. Al publicar un artículo nuevo, sus enlaces aparecen solos
// en las páginas de solución y en los artículos hermanos.

/** Artículos que declaran esta solución como relacionada — el enlace inverso
 *  (solución → blog), que antes no existía. */
export function articulosDeSolucion(slugSolucion: string): Articulo[] {
  return ARTICULOS.filter((a) =>
    (a.solucionesRelacionadas ?? []).includes(slugSolucion)
  );
}

/** Artículos hermanos: comparten al menos una solución relacionada. */
export function articulosRelacionados(slug: string): Articulo[] {
  const propio = ARTICULOS.find((a) => a.slug === slug);
  if (!propio) return [];
  const mias = new Set(propio.solucionesRelacionadas ?? []);
  return ARTICULOS.filter(
    (a) =>
      a.slug !== slug &&
      (a.solucionesRelacionadas ?? []).some((s) => mias.has(s))
  );
}

/** La fecha, escrita como la escribe cada idioma. En inglés se pone el mes primero:
 *  "August 19, 2026", no "19 de agosto". Es de lo primero que delata una traducción. */
export function fechaBonita(iso: string, idioma: Idioma = "es") {
  return new Intl.DateTimeFormat(idioma === "en" ? "en-US" : "es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}
