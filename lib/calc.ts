export type Area = "ventas" | "atencion" | "marketing" | "operaciones";

export type CalcState = {
  business: string | null;
  area: Area | null;
  problem: string | null;
  leads: string;
  msgs: string;
  emp: string;
  email: string;
};

export const emptyState: CalcState = {
  business: null,
  area: null,
  problem: null,
  leads: "",
  msgs: "",
  emp: "",
  email: "",
};

export type Option = { val: string; label: string; icon: string };

export const BUSINESS_OPTIONS: Option[] = [
  { val: "inmobiliaria", label: "Inmobiliaria", icon: "🏠" },
  { val: "ecommerce", label: "E-commerce", icon: "🛒" },
  { val: "clinica", label: "Clínica", icon: "🏥" },
  { val: "agencia", label: "Agencia", icon: "📊" },
  { val: "otro", label: "Otro", icon: "⚡" },
];

export const AREA_OPTIONS: Option[] = [
  { val: "ventas", label: "Ventas", icon: "💰" },
  { val: "atencion", label: "Atención al Cliente", icon: "💬" },
  { val: "marketing", label: "Marketing", icon: "📣" },
  { val: "operaciones", label: "Operaciones", icon: "⚙️" },
];

type Problem = { id: string; label: string; icon: string; min: number };

export const PROBLEMS: Record<Area, Problem[]> = {
  ventas: [
    { id: "calificar_leads", label: "Calificar leads", icon: "🎯", min: 12 },
    { id: "seguimiento", label: "Seguimiento de clientes", icon: "🔄", min: 10 },
    { id: "propuestas", label: "Enviar propuestas", icon: "📋", min: 15 },
  ],
  atencion: [
    { id: "responder", label: "Responder mensajes", icon: "💬", min: 5 },
    { id: "agendar", label: "Agendar citas", icon: "📅", min: 8 },
    { id: "soporte", label: "Soporte recurrente", icon: "🛠️", min: 10 },
  ],
  marketing: [
    { id: "reportes", label: "Generar reportes", icon: "📊", min: 15 },
    { id: "publicaciones", label: "Publicaciones en redes", icon: "📱", min: 12 },
    { id: "campanas", label: "Gestión de campañas", icon: "🎯", min: 15 },
  ],
  operaciones: [
    { id: "documentos", label: "Procesar documentos", icon: "📄", min: 10 },
    { id: "coordinacion", label: "Coordinación interna", icon: "🔗", min: 8 },
    { id: "inventario", label: "Control de inventario", icon: "📦", min: 12 },
  ],
};

const SUGGESTIONS: Record<string, Record<string, string[]>> = {
  ventas: {
    calificar_leads: [
      "Agente de IA para calificación automática de leads en WhatsApp e Instagram",
      "Pipeline de CRM con scoring inteligente y asignación automática al equipo",
      "Notificaciones en tiempo real cuando un lead está listo para cerrar",
    ],
    seguimiento: [
      "Secuencia multicanal automatizada (Email + WhatsApp) sin intervención humana",
      "Re-engagement automático de leads fríos con IA conversacional",
      "Pipeline con etapas, recordatorios y escalamientos automáticos",
    ],
    propuestas: [
      "Generador automático de propuestas personalizadas desde tu CRM",
      "Sistema de firma electrónica con seguimiento hasta la respuesta",
      "Agente de seguimiento proactivo hasta el cierre o descarte del lead",
    ],
  },
  atencion: {
    responder: [
      "Agente conversacional 24/7 en WhatsApp, Instagram y chat web",
      "Escalamiento inteligente a humanos solo para casos complejos",
      "Base de conocimiento auto-actualizable desde tus procesos internos",
    ],
    agendar: [
      "Bot de agendamiento integrado con Google Calendar y Calendly",
      "Confirmaciones, recordatorios y reagendamientos completamente automáticos",
      "Recopilación de información del cliente antes de cada cita",
    ],
    soporte: [
      "Agente de IA entrenado en tus FAQs, políticas y productos",
      "Resolución automática del 80% de tickets sin intervención humana",
      "Dashboard de satisfacción y seguimiento de casos abiertos",
    ],
  },
  marketing: {
    reportes: [
      "Pipeline que consolida métricas de todos tus canales automáticamente",
      "Reportes semanales generados y distribuidos sin intervención humana",
      "Alertas automáticas cuando KPIs salen del rango objetivo",
    ],
    publicaciones: [
      "Motor de contenido automatizado con revisión y aprobación humana",
      "Programador multi-plataforma con variaciones por canal y audiencia",
      "Reciclaje inteligente de contenido evergreen de alto rendimiento",
    ],
    campanas: [
      "Automatización de audiencias y segmentación dinámica en tiempo real",
      "A/B testing automatizado con optimización continua de creativos",
      "Reportes de rendimiento consolidados y recomendaciones por campaña",
    ],
  },
  operaciones: {
    documentos: [
      "Extracción y clasificación automática de datos desde cualquier documento",
      "Flujo de aprobaciones digitalizado sin emails ni seguimientos manuales",
      "Archivo inteligente con búsqueda avanzada y trazabilidad completa",
    ],
    coordinacion: [
      "Automatización de comunicación y handoffs entre áreas de tu empresa",
      "Sistema de tareas con asignación y seguimiento automático por contexto",
      "Actualizaciones de estado en tiempo real vía Slack, Teams o correo",
    ],
    inventario: [
      "Alertas automáticas de stock bajo con órdenes de reposición pre-aprobadas",
      "Sincronización en tiempo real entre todos tus canales de venta",
      "Reportes de rotación, proyección de demanda y análisis de tendencias",
    ],
  },
};

function roundNice(n: number): number {
  if (n < 200) return Math.round(n / 25) * 25;
  if (n < 1000) return Math.round(n / 50) * 50;
  if (n < 5000) return Math.round(n / 100) * 100;
  return Math.round(n / 500) * 500;
}

function getComplexityScore(s: CalcState): number {
  let score = 0;
  const bizPoints: Record<string, number> = {
    ecommerce: 2,
    agencia: 1,
    clinica: 1,
    inmobiliaria: 1,
    otro: 1,
  };
  const areaPoints: Record<string, number> = {
    ventas: 2,
    operaciones: 2,
    atencion: 1,
    marketing: 1,
  };
  const probPoints: Record<string, number> = {
    calificar_leads: 2,
    seguimiento: 2,
    documentos: 2,
    propuestas: 1,
    responder: 1,
    agendar: 1,
    soporte: 1,
    reportes: 1,
    publicaciones: 1,
    campanas: 1,
    coordinacion: 1,
    inventario: 1,
  };
  score += (s.business && bizPoints[s.business]) || 0;
  score += (s.area && areaPoints[s.area]) || 0;
  score += (s.problem && probPoints[s.problem]) || 0;
  const leads = parseInt(s.leads) || 0;
  const msgs = parseInt(s.msgs) || 0;
  const emp = parseInt(s.emp) || 0;
  if (leads > 100) score += 2;
  if (msgs > 50) score += 2;
  if (emp > 3) score += 1;
  return score;
}

function getComplexityLabel(score: number): string {
  if (score <= 3) return "Automatización básica";
  if (score <= 6) return "Sistema de automatización avanzado";
  return "Infraestructura completa de IA";
}

export type CalcResult = {
  hoursSaved: string;
  moneySaved: string;
  setupRange: string;
  mthRange: string;
  roi: string;
  payback: number;
  complexityLabel: string;
};

export function calculate(s: CalcState): CalcResult {
  const leads = Math.max(parseInt(s.leads) || 30, 0);
  const msgs = Math.max(parseInt(s.msgs) || 15, 0);
  const emp = Math.max(parseInt(s.emp) || 2, 1);

  const score = getComplexityScore(s);

  const probs = (s.area && PROBLEMS[s.area]) || [];
  const prob = probs.filter((p) => p.id === s.problem)[0];
  const tMin = prob ? prob.min : 10;
  const tasks = leads + msgs * 22;
  const hoursSaved = Math.round((tasks * tMin) / 60);
  const moneySaved = Math.round(hoursSaved * 8 * emp);

  const setupMin = roundNice(500 + score * 150);
  const setupMax = roundNice(1000 + score * 400);

  const rawMonthly = Math.max(msgs, 10);
  const mthMin = roundNice(Math.min(50 + rawMonthly * 0.5, 600));
  let mthMax = roundNice(Math.min(100 + rawMonthly * 1.5, 1800));
  if (mthMax <= mthMin) mthMax = roundNice(mthMin * 1.6);

  const mthAvg = (mthMin + mthMax) / 2;
  const roi = mthAvg > 0 ? Math.round((moneySaved / mthAvg) * 10) / 10 : 0;
  const payback = moneySaved > 0 ? Math.round((setupMin / moneySaved) * 30) : 0;

  return {
    hoursSaved: hoursSaved + " hrs",
    moneySaved: "$" + moneySaved.toLocaleString(),
    setupRange: "$" + setupMin.toLocaleString() + " – $" + setupMax.toLocaleString(),
    mthRange: "$" + mthMin.toLocaleString() + " – $" + mthMax.toLocaleString(),
    roi: roi + "x",
    payback,
    complexityLabel: getComplexityLabel(score),
  };
}

export function getSuggestions(s: CalcState): string[] {
  const fallback = [
    "Agente de IA personalizado para tu industria y procesos específicos",
    "Sistema de automatización del flujo de trabajo de principio a fin",
    "Dashboard de métricas e indicadores clave en tiempo real",
  ];
  if (!s.area || !s.problem) return fallback;
  return SUGGESTIONS[s.area]?.[s.problem] ?? fallback;
}
