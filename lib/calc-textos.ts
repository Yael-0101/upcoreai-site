// Las notas que produce lib/calc.ts, en los dos idiomas.
//
// ⚠️ VIVE APARTE Y SIN NINGÚN IMPORT, A PROPÓSITO. `lib/calc.ts` se ESPEJA al panel
// (hay guardián: upcore-panel/scripts/verificar-calc-espejo.mjs), así que todo lo que
// calc importe tiene que poder espejarse también. Al meter estas notas dentro de
// lib/propuesta-textos.ts —que sí tiene dependencias— el panel dejó de compilar.
// Un archivo que se copia a otro proyecto no puede arrastrar media librería.

export type TextosCalc = {
    precioCerrado: string;
    conDescuento: string;
    mitades: string;
    mitadesGestionado: string;
    sinMensualidad: string;
    operacion: string;
    costosApis: string;
    costosApisVoz: string;
    costosNota: string;
    costosNotaVoz: string;
    complejidad: Record<string, string>;
    ahorroNota: (k: number) => string;
    roiTardaria: (meses: string) => string;
    roiRecupera: (a: { meses: string; neta: string; manos: boolean }) => string;
    mes: string;
    meses: string;
    netaTexto: (monto: string) => string;
    conManos: string;
    recomiendaLlave: string;
    recomiendaEsperar: string;
    recomiendaLigero: string;
    recomiendaSubirDespues: string;
    /** Etiqueta y alcance de cada pieza, por su `val`. Alimenta la lista
     *  "esto construiríamos para ti" y los selectores de la calculadora. */
    piezas: Record<string, { label: string; desc: string; alcance: string }>;
    /** Etiquetas de los selectores de modo y de operación, por su `val`. */
    opciones: Record<string, { label: string; desc: string }>;
    /** Los giros del nicho, por su `key` (lib/nicho.json solo trae el español). */
    giros: Record<string, string>;
    panelIncluye: string;
    /**
     * LA CONSOLA: los mandos que van INCLUIDOS con cada pieza.
     *
     * No es el panel. El panel se cobra aparte ($3,000) y es el tablero de quien
     * DIRIGE —cada asesor con su acceso, el embudo hasta la venta, el retorno
     * real—; la consola sirve para MANDAR sobre el asistente, y va incluida
     * porque sin ella el cliente estaría comprando algo que no puede controlar.
     * Esa fue exactamente su objeción.
     *
     * ⚠️ 2026-08-25: la frase del panel decía "cómo va cada comprador, a quién hay
     * que llamar hoy y tu retorno a la vista" — y esas TRES cosas ya salen en la
     * consola incluida (pantallas Resumen, Compradores y Pendientes). O sea que
     * cobrábamos $3,000 por lo que ya entregábamos, en el documento donde le
     * pedimos al cliente que confíe. Lo que el panel añade tiene que ser algo que
     * la consola NO haga; hay guardián que lo comprueba (probar-consola.mjs §6).
     *
     * `mandos` se arma con las piezas que compró (ver MANDOS_DE_PIEZA en calc.ts):
     * un cliente de solo-web no lee que puede tomar un chat que nunca va a tener.
     */
    consola: {
      /** El renglón entero. `lista` ya viene unida y sin punto final. */
      frase: (lista: string) => string;
      mandos: Record<MandoKey, string>;
      /** Une la lista: "a, b y c" en español, "a, b and c" en inglés. */
      une: (partes: string[]) => string;
    };
  };

/** Los cuatro mandos posibles. El orden de esta lista es el orden en que se leen. */
export const MANDOS: readonly MandoKey[] = ["conversaciones", "desarrollos", "asistente", "textos"];

export type MandoKey = "conversaciones" | "desarrollos" | "asistente" | "textos";

export const CALC_TEXTOS: Record<"es" | "en", TextosCalc> = {
  es: {
    precioCerrado: "Precio cerrado",
    conDescuento: "Precio cerrado, ya con descuento por paquete",
    mitades: "mitad para arrancar y mitad al entregar",
    mitadesGestionado: "mitad para arrancar y mitad al entregar (o repartido en tu mensualidad)",
    sinMensualidad: "Plan Llave en Mano · tú lo operas, sin mensualidad",
    operacion: "Operación, mantenimiento y mejoras",
    costosApis: "Directo a los proveedores, a tu nombre — sin margen de Upcore",
    costosApisVoz: "Directo a los proveedores, a tu nombre — la voz se cobra por minuto hablado",
    costosNota:
      "APIs, IA y hosting — van directo a los proveedores, a tu nombre. Upcore no les agrega margen.",
    costosNotaVoz:
      "APIs, IA y hosting — van directo a los proveedores, a tu nombre. Upcore no les agrega margen. " +
      "El agente de voz se cobra por minuto hablado, así que sube con tus llamadas: se contrata con " +
      "tope de gasto y ves tu consumo tú mismo.",
    complejidad: {
      "Solución esencial": "Solución esencial",
      "Sistema a la medida": "Sistema a la medida",
      "Infraestructura completa": "Infraestructura completa",
    },
    ahorroNota: (k) =>
      `≈ ${k} ${k === 1 ? "prospecto rescatado" : "prospectos rescatados"} al mes + el tiempo de tu equipo`,
    roiTardaria: (meses) => `A tu volumen de ahora tardaría ~${meses} en recuperarse.`,
    roiRecupera: (a) =>
      `Recuperas tu inversión en ~${a.meses}.${a.neta}${a.manos ? " Y nosotros lo operamos por ti." : ""}`,
    mes: "mes",
    meses: "meses",
    netaTexto: (monto) => ` Te quedan ~${monto} limpios al mes.`,
    conManos: " Y nosotros lo operamos por ti.",
    recomiendaLlave:
      "A tu volumen de ahora, el plan Gestionado todavía no se paga solo. Te conviene empezar en " +
      "Llave en Mano (sin mensualidad) o con solo la pieza esencial, y pasar a Gestionado cuando " +
      "crezca tu volumen.",
    recomiendaEsperar:
      "A tu volumen de ahora los números salen justos. En tu diagnóstico gratis vemos si te conviene " +
      "arrancar más ligero o esperar a tener un poco más de movimiento.",
    recomiendaLigero:
      "El sistema completo + Gestionado rinde de verdad cuando ya tienes buen volumen. A tu nivel de " +
      "ahora te conviene empezar más ligero (solo el agente, o Llave en Mano) y crecer hacia el " +
      "sistema gestionado cuando el volumen lo pida — así te sale rentable desde el primer día.",
    recomiendaSubirDespues:
      "Ya es rentable, pero a tu volumen quizá te convenga empezar en Llave en Mano (sin mensualidad) " +
      "y subir a Gestionado más adelante.",
    piezas: {
      // ⚠️ ESTA TABLA ES LA QUE GANA. `calculate()` la prefiere sobre el
      // `desc`/`alcance` de PRODUCTO_OPTIONS (lib/calc.ts), que quedan de
      // respaldo. El 2026-08-22 se actualizó allá para decir que los productos
      // atienden en inglés, el guardián salió VERDE —solo comparaba la tabla
      // inglesa— y la propuesta seguía diciendo "responde WhatsApp en español".
      // Se vio IMPRIMIENDO lo que devuelve el motor, no leyendo el código.
      // Ahora `probar-idiomas-producto.mjs` revisa los dos idiomas y además
      // exige que esta tabla y PRODUCTO_OPTIONS digan exactamente lo mismo.
      agente: {
        label: "Agente de WhatsApp 24/7",
        desc: "Contesta en español e inglés, a cualquier hora",
        alcance:
          "responde WhatsApp en español, inglés o portugués según en qué idioma le escriban, a cualquier hora y en cualquier huso horario, resuelve las dudas de siempre, califica al comprador (presupuesto, plazo y si necesita financiamiento) y deja agendada la visita o la videollamada",
      },
      "agente-basico": {
        label: "Agente de WhatsApp esencial",
        desc: "Contesta en español a cualquier hora y agenda",
        alcance:
          "responde WhatsApp únicamente en español, a cualquier hora, resuelve las dudas de siempre —ubicación, qué hay disponible y cómo es el proceso de compra— y deja agendada la visita; no califica al comprador ni se conecta a tu CRM: para eso está el agente completo",
      },
      voz: {
        label: "Agente de voz 24/7",
        desc: "Contesta el teléfono en español e inglés",
        alcance:
          "contesta las llamadas que hoy se pierden, atiende en español o en inglés según quien llame, resuelve dudas hablando, agenda en tu calendario y avisa al asesor — conservando tu número actual",
      },
      web: {
        label: "Sitio web con agenda",
        desc: "En español e inglés; capta y agenda solo",
        alcance:
          "sitio en español e inglés, con la ficha de cada desarrollo, formulario que califica y agenda en línea, listo para recibir tráfico de anuncios",
      },
      auto: {
        label: "Seguimiento automático",
        desc: "Que ningún prospecto se enfríe",
        alcance:
          "seguimiento en el idioma de cada comprador —español o inglés— que aguanta los meses que dura una preventa: recordatorios de cada etapa de pago, avisos de avance de obra y reactivación del prospecto que dejó de contestar",
      },
      reactivacion: {
        label: "Reactivación de prospectos",
        desc: "Recupera a los que nunca cerraron",
        alcance:
          "campaña en español o en inglés para volver a tocar a los prospectos viejos que quedaron en la lista y nunca compraron",
      },
    },
    opciones: {
      sistema: { label: "Con sistema completo", desc: "Dashboard + todo integrado" },
      normal: { label: "Solo la pieza", desc: "Lo esencial, sin dashboard" },
      yo: { label: "Yo lo opero", desc: "Pago único, sin mensualidad (Llave en Mano)" },
      upcore: {
        label: "Que Upcore lo opere",
        desc: "Mensualidad, nos encargamos de todo (Gestionado)",
      },
    },
    giros: {
      comercializadora: "Comercializadora de preventa",
      equipo: "Equipo o asesor independiente",
      desarrolladora: "Desarrolladora",
      masterbroker: "Comercializadora grande / master broker",
      otro: "Otra inmobiliaria",
    },
    panelIncluye:
      "Panel del director comercial — en español e inglés: cada asesor con su propio acceso, cómo va cada uno y el camino de cada comprador hasta la venta, con tu retorno real a la vista",
    consola: {
      // Una sola frase y SIN punto final, para que case con los demás renglones
      // del punto 1 ("Label — alcance"). Se vio imprimiendo la lista completa: el
      // único renglón que terminaba en punto delataba que lo había añadido otro.
      frase: (lista) =>
        `Tus controles, incluidos — desde tu celular puedes ${lista}, sin llamarnos y sin esperar a nadie`,
      mandos: {
        conversaciones: "ver cada conversación y tomar el chat cuando quieras",
        desarrollos: "elegir qué desarrollos se ofrecen",
        asistente: "apagar el asistente en un toque",
        textos: "aprobar los textos antes del primer envío",
      },
      une: (partes) => {
        if (partes.length <= 1) return partes[0] ?? "";
        const ultima = partes[partes.length - 1];
        // En español la "y" se vuelve "e" delante del sonido /i/ ("apagar e
        // informar"), salvo en "hie-" (hielo, hierba). Nada de la lista de hoy
        // empieza así, pero la regla va escrita para que siga bien mañana.
        const nexo = /^(i|hi(?![ae]))/i.test(ultima) ? "e" : "y";
        return `${partes.slice(0, -1).join(", ")} ${nexo} ${ultima}`;
      },
    },
  },
  en: {
    precioCerrado: "Fixed price",
    conDescuento: "Fixed price, package discount already applied",
    mitades: "half to start and half on delivery",
    mitadesGestionado: "half to start and half on delivery (or spread across your monthly fee)",
    sinMensualidad: "Turnkey plan · you run it, no monthly fee",
    operacion: "Operation, maintenance and improvements",
    costosApis: "Straight to the providers, in your name — no Upcore margin",
    costosApisVoz: "Straight to the providers, in your name — voice is billed per minute spoken",
    costosNota:
      "APIs, AI and hosting — they go straight to the providers, in your name. Upcore adds no margin.",
    costosNotaVoz:
      "APIs, AI and hosting — they go straight to the providers, in your name. Upcore adds no margin. " +
      "The voice agent is billed per minute spoken, so it rises with your call volume: it is set up " +
      "with a spending cap and you can see your usage yourself.",
    complejidad: {
      "Solución esencial": "Essential solution",
      "Sistema a la medida": "Custom system",
      "Infraestructura completa": "Complete infrastructure",
    },
    ahorroNota: (k) => `≈ ${k} ${k === 1 ? "prospect" : "prospects"} recovered per month + your team's time`,
    roiTardaria: (meses) => `At your current volume it would take about ${meses} to pay for itself.`,
    roiRecupera: (a) =>
      `You recover your investment in about ${a.meses}.${a.neta}${a.manos ? " And we run it for you." : ""}`,
    mes: "month",
    meses: "months",
    netaTexto: (monto) => ` You keep about ${monto} net per month.`,
    conManos: " And we run it for you.",
    recomiendaLlave:
      "At your current volume the Managed plan does not yet pay for itself. You are better off " +
      "starting with Turnkey (no monthly fee) or with just the essential component, and moving to " +
      "Managed once your volume grows.",
    recomiendaEsperar:
      "At your current volume the numbers come out tight. In your free assessment we look at whether " +
      "it is better to start lighter or wait until you have a little more movement.",
    recomiendaLigero:
      "The complete system + Managed really pays off once you already have good volume. At your " +
      "current level you are better off starting lighter (just the agent, or Turnkey) and growing " +
      "into the managed system when the volume calls for it — that way it is profitable from day one.",
    recomiendaSubirDespues:
      "It is already profitable, but at your volume it may be worth starting with Turnkey (no monthly " +
      "fee) and moving up to Managed later on.",
    piezas: {
      agente: {
        label: "24/7 WhatsApp agent",
        desc: "Replies in Spanish and English, at any hour",
        alcance:
          "answers WhatsApp in Spanish, English or Portuguese depending on the language they write in, at any hour and in any time zone, handles the usual questions, qualifies the buyer (budget, timeline and whether they need financing) and leaves the visit or video call booked",
      },
      "agente-basico": {
        label: "Essential WhatsApp agent",
        desc: "Replies in Spanish at any hour and books",
        alcance:
          "answers WhatsApp in Spanish only, at any hour, handles the usual questions —location, what is available and how the buying process works— and leaves the visit booked; it does not qualify the buyer and does not connect to your CRM: the full agent is there for that",
      },
      voz: {
        label: "24/7 voice agent",
        desc: "Answers the phone in Spanish and English",
        alcance:
          "answers the calls that are lost today, handles them in Spanish or English depending on who calls, resolves questions out loud, books on your calendar and notifies the agent — while you keep your current number",
      },
      web: {
        label: "Website with booking",
        desc: "In Spanish and English; captures and books on its own",
        alcance:
          "a site in Spanish and English, with a page for each development, a form that qualifies and books online, ready to receive ad traffic",
      },
      auto: {
        label: "Automated follow-up",
        desc: "So no lead goes cold",
        alcance:
          "follow-up in each buyer's own language — Spanish or English — that lasts the months a preconstruction sale takes: reminders for every payment milestone, construction progress updates and re-engagement of the lead who stopped replying",
      },
      reactivacion: {
        label: "Lead re-engagement",
        desc: "Recover the ones who never closed",
        alcance:
          "a campaign in Spanish or English to go back to the old leads sitting on your list who never bought",
      },
    },
    opciones: {
      sistema: { label: "With the complete system", desc: "Dashboard + everything integrated" },
      normal: { label: "Just the component", desc: "The essentials, no dashboard" },
      yo: { label: "I run it", desc: "One-time payment, no monthly fee (Turnkey)" },
      upcore: {
        label: "Upcore runs it",
        desc: "Monthly fee, we take care of everything (Managed)",
      },
    },
    giros: {
      comercializadora: "Preconstruction sales brokerage",
      equipo: "Team or independent agent",
      desarrolladora: "Developer",
      masterbroker: "Large brokerage / master broker",
      otro: "Other real estate firm",
    },
    panelIncluye:
      "Sales director's dashboard — in Spanish and English: every agent with their own login, how each one is doing and every buyer's path all the way to the sale, with your real return in plain view",
    consola: {
      frase: (lista) =>
        `Your controls, included — from your phone you can ${lista}, without calling us and without waiting on anyone`,
      mandos: {
        conversaciones: "see every conversation and take over any chat",
        desarrollos: "choose which developments are offered",
        asistente: "switch the assistant off with one tap",
        textos: "approve the texts before the first send",
      },
      une: (partes) => {
        if (partes.length <= 1) return partes[0] ?? "";
        if (partes.length === 2) return `${partes[0]} and ${partes[1]}`;
        return `${partes.slice(0, -1).join(", ")}, and ${partes[partes.length - 1]}`;
      },
    },
  },
};
