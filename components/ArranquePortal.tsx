"use client";

// Portal de Arranque — el wizard donde el cliente hace TODA su parte del
// onboarding. Clonado del esqueleto de EmpezarForm + WizardUI. Autosave en cada
// "Siguiente" (guarda el estado COMPLETO en n8n vía /api/arranque) y resume
// automático (la página server hidrata con lo guardado).

import { useRef, useState } from "react";
import {
  OptionBtn,
  ProgressDots,
  StepHeader,
  Field,
  TextArea,
  NavBtns,
  type Option,
} from "./WizardUI";
import { CONTACT } from "@/lib/content";
import { TA } from "@/lib/arranque-textos";
import { pegarDesarrollos, MAX_PEGADAS } from "@/lib/pegar-desarrollos";
import { idiomaDe, type Idioma } from "@/lib/acuerdo-textos";
import {
  conciergeListo,
  cuentasRequeridas,
  estadoDe,
  giroDemo,
  pasosVisibles,
  PASOS_EN_ORDEN,
  ROLES_EQUIPO,
  type AsesorItem,
  type ArranqueDatos,
  type PasoId,
  type ServicioItem,
  type TextoItem,
} from "@/lib/arranque";
// TODO el texto que cambia según las piezas vive en un solo archivo. Si algo de
// aquí abajo nombra un producto ("asistente", "tu sitio", "WhatsApp"), tiene que
// salir de ahí — no escrito a mano. Ver el encabezado de arranque-copy.ts.
import {
  copyBienvenida,
  copyCalendario,
  copyFinal,
  copyHorarios,
  copyLinea,
  copyNumero,
  copyServicios,
  copyTextos,
  etiquetaDemo,
  etiquetaNumero,
  hayMensajes,
  hayVoz,
  hayWeb,
  normalizarPiezas,
  pideEscalacion,
  pidePrecios,
} from "@/lib/arranque-copy";

type Step = number | "listo";
// Número de paso ↔ su id (índice + 1).
//
// 🔴 ESTA LISTA ESTABA COPIADA AQUÍ y se desfasó (2026-08-25): al agregar el paso
// del equipo se actualizó `pasosVisibles` y no esta copia, así que `numDePaso`
// devolvía 0 y el paso **no se pintaba nunca** — mientras su fila salía en el
// resumen marcada como esencial. Un portal imposible de terminar, sin un error.
// Ahora se importa de `lib/arranque.ts`, que es su único dueño, y hay guardián que
// comprueba que `pasosVisibles` no devuelva nada que no esté aquí.
const NUM_A_PASO: PasoId[] = PASOS_EN_ORDEN;
const TOTAL_PASOS = NUM_A_PASO.length;
const numDePaso = (id: PasoId) => NUM_A_PASO.indexOf(id) + 1;
/** El número del paso, por su id — para no volver a escribir 5, 6, 7 a mano.
 *  (Meter un paso nuevo en medio ya nos habría desalineado todo el wizard.) */
const N = {
  bienvenida: numDePaso("bienvenida"),
  servicios: numDePaso("servicios"),
  horarios: numDePaso("horarios"),
  numero: numDePaso("numero"),
  linea: numDePaso("linea"),
  cuentas: numDePaso("cuentas"),
  calendario: numDePaso("calendario"),
  demo: numDePaso("demo"),
  textos: numDePaso("textos"),
  equipo: numDePaso("equipo"),
  resumen: numDePaso("resumen"),
};

// ⚠️ Los `val` son los que se GUARDAN (y viajan a n8n): no se traducen nunca. Lo
// único que cambia de idioma es lo que el cliente lee.
const ICONO_TONO: Record<string, string> = {
  calido: "🤗", profesional: "🤝", elegante: "✨", fresco: "😌",
};
const ICONO_VIA: Record<string, string> = {
  whatsapp: "💬", correo: "✉️", ambos: "🔔",
};
const ICONO_PRECIO: Record<string, string> = {
  transfiere: "🤝", publicado: "🌐", "en-vivo": "🔄",
};
const tonoOptions = (idioma: Idioma): Option[] =>
  TA[idioma].tonos.map((t) => ({ val: t.val, label: t.label, icon: ICONO_TONO[t.val] ?? "💬", desc: t.desc }));

// Las opciones del número dependen de la pieza: no es lo mismo un asistente que
// CONVERSA por ese número que unos recordatorios que solo SALEN de él.
const numeroOptions = (piezas: string[], idioma: Idioma): Option[] => {
  const c = copyNumero(piezas, idioma);
  const t = TA[idioma].numero;
  return [
    { val: "actual", label: c.labelActual, icon: "📱", desc: t.descActual },
    { val: "nuevo", label: c.labelNuevo, icon: "🆕", desc: t.descNuevo },
    { val: "asesoria", label: t.noSe, icon: "🤔", desc: t.noSeDesc },
  ];
};

// Solo agente de voz. El desvío va primero: es lo que recomendamos y lo que
// deja intacto el número que la clínica lleva años anunciando.
const lineaOptions = (idioma: Idioma): Option[] => {
  const t = TA[idioma].linea;
  const n = TA[idioma].numero;
  return [
    { val: "desvio", label: t.labelDesvio, icon: "📞", desc: t.descDesvio },
    { val: "nuevo", label: t.labelNuevo, icon: "🆕", desc: t.descNuevo },
    { val: "asesoria", label: n.noSe, icon: "🤔", desc: n.noSeDesc },
  ];
};

// ⛔ Aquí vivían dos botones: "Créenmelas ustedes" y "Yo las creo". Se quitaron
// el 2026-08-16 por decisión de Yael: las cuentas las crea SIEMPRE Upcore. Un
// doctor no puede perder su tarde abriendo cuentas, y ese botón le ofrecía
// justo eso — además de contradecir el arranque concierge del manual.

// ⛔ Aquí vivían las dos opciones de correo ("créenme uno nuevo" / "con un correo
// mío"). Se quitaron el 2026-08-16: el correo del proyecto siempre se crea nuevo,
// porque es más eficiente para los dos lados (ver el comentario del paso 6).

const calendarioOptions = (idioma: Idioma): Option[] => {
  const t = TA[idioma].calendario;
  return [
    { val: "google", label: t.google, icon: "📅" },
    { val: "software", label: t.software, icon: "🖥️" },
    { val: "ninguno", label: t.ninguno, icon: "📓", desc: t.ningunoDesc },
  ];
};



const servicioVacio: ServicioItem = { nombre: "", precio: "", duracion: "" };
// El rol por defecto es el MENOS permisivo: si alguien se olvida de cambiarlo, esa
// persona ve de menos, no de más. Falla cerrado.
const asesorVacio: AsesorItem = { nombre: "", rol: "asesor" };

export function ArranquePortal({
  token,
  datosIniciales,
  estadoInicial,
  idiomaInicial,
}: {
  token: string;
  datosIniciales: ArranqueDatos;
  estadoInicial: string;
  /** El idioma con el que se abre. Sale de `datos.idioma` (lo que eligió la última
   *  vez) y lo puede pisar `?lang=` en la URL. Ver lib/arranque-textos.ts. */
  idiomaInicial: Idioma;
}) {
  const [idioma, setIdioma] = useState<Idioma>(idiomaInicial);
  const T = TA[idioma];
  const en = idioma === "en";
  const [d, setD] = useState<ArranqueDatos>(() => ({
    ...datosIniciales,
    checklist: {
      ...datosIniciales.checklist,
      servicios:
        datosIniciales.checklist.servicios.length > 0
          ? datosIniciales.checklist.servicios
          : [{ ...servicioVacio }],
    },
    // Igual que los desarrollos: siempre al menos una fila en blanco. Sin esto la
    // pantalla saldría vacía y con un solo botón, y quien la abre no sabría que ahí
    // se escribe. (Y `setAsesor` no tendría sobre qué fila trabajar.)
    equipo: {
      ...datosIniciales.equipo,
      asesores:
        datosIniciales.equipo.asesores.length > 0
          ? datosIniciales.equipo.asesores
          : [{ ...asesorVacio }],
    },
  }));
  const [step, setStep] = useState<Step>(() => {
    const p = datosIniciales.progreso.pasoActual;
    let n = p >= 1 && p <= TOTAL_PASOS ? p : 1;
    // Si el paso guardado ya no aplica a sus piezas (ej. "número" en un proyecto
    // de solo-web), se avanza al siguiente que sí aplique.
    const vis = new Set(
      pasosVisibles(datosIniciales.config.productos ?? []).map((id) => numDePaso(id))
    );
    while (n < TOTAL_PASOS && !vis.has(n as Step & number)) n++;
    return n as Step;
  });
  const [save, setSave] = useState<"idle" | "guardando" | "ok" | "error">("idle");
  const [enviando, setEnviando] = useState(false);
  // El estado "alcanzado" no se degrada al re-editar (y n8n solo avisa al CAMBIAR).
  const alcanzado = useRef<string | null>(
    estadoInicial === "parte-inicial-lista" || estadoInicial === "completado"
      ? estadoInicial
      : null
  );

  const patch = (p: Partial<ArranqueDatos>) => setD((prev) => ({ ...prev, ...p }));

  // Qué pasos aplican a este proyecto (por sus piezas). La navegación de abajo
  // sigue usando los números de siempre y aquí se brincan los que no aplican.
  const pasosLista = pasosVisibles(d.config.productos ?? []);
  const visibleNum = new Set(pasosLista.map((id) => numDePaso(id)));
  // Las piezas ya normalizadas (lista vacía = fila vieja = se muestra todo).
  // Todo el texto de abajo se arma con ESTA lista, nunca con d.config.productos
  // a pelo, o una fila vieja leería el texto de un proyecto sin piezas.
  const piezas = normalizarPiezas(d.config.productos);
  const tieneWeb = hayWeb(piezas);
  const tieneMensajes = hayMensajes(piezas);
  const txtHorarios = copyHorarios(piezas, idioma);

  const guardar = async (datos: ArranqueDatos, estado?: string) => {
    setSave("guardando");
    try {
      const res = await fetch("/api/arranque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          datos,
          estado: estado ?? alcanzado.current ?? "en-curso",
        }),
      });
      if (!res.ok) throw new Error("fail");
      setSave("ok");
      return true;
    } catch {
      setSave("error");
      return false;
    }
  };

  const irA = (n: Step) => {
    if (typeof n === "number") {
      // Los botones apuntan al paso vecino de siempre; si ese paso no aplica a
      // las piezas del proyecto, se sigue de largo en la misma dirección.
      // (1 y 9 siempre aplican, así que siempre se aterriza en algo visible.)
      const desde = typeof step === "number" ? step : TOTAL_PASOS;
      const dir = n >= desde ? 1 : -1;
      let destino = n;
      while (destino > 1 && destino < TOTAL_PASOS && !visibleNum.has(destino)) destino += dir;
      const datos = { ...d, progreso: { ...d.progreso, pasoActual: destino } };
      setD(datos);
      setStep(destino as Step);
      void guardar(datos); // autosave — si falla, el aviso queda visible y nada se pierde en pantalla
    } else {
      setStep(n);
    }
  };

  const finalizar = async () => {
    setEnviando(true);
    const estado = estadoDe(d);
    const ahora = new Date().toISOString();
    const datos: ArranqueDatos = {
      ...d,
      progreso: {
        ...d.progreso,
        pasoActual: TOTAL_PASOS,
        parteInicialEl: d.progreso.parteInicialEl ?? ahora,
        ...(estado === "completado" ? { completadoEl: ahora } : {}),
      },
    };
    setD(datos);
    const ok = await guardar(datos, estado);
    setEnviando(false);
    if (ok) {
      alcanzado.current = estado;
      setStep("listo");
    }
  };

  // ── Helpers de secciones ──────────────────────────────────────────────────
  const setChecklist = (p: Partial<ArranqueDatos["checklist"]>) =>
    patch({ checklist: { ...d.checklist, ...p } });
  const setEscalacion = (p: Partial<ArranqueDatos["escalacion"]>) =>
    patch({ escalacion: { ...d.escalacion, ...p } });
  const setPrecios = (p: Partial<ArranqueDatos["precios"]>) =>
    patch({ precios: { ...d.precios, ...p } });
  const setServicio = (i: number, p: Partial<ServicioItem>) =>
    setChecklist({
      servicios: d.checklist.servicios.map((s, j) => (j === i ? { ...s, ...p } : s)),
    });
  // (Se quitó setCuenta: ya no hay casillas de "marcar cuenta como lista" — las
  //  cuentas las abre Upcore. El campo `cuentas` se conserva en los datos para no
  //  perder lo que marcaron las filas viejas.)
  const setConcierge = (p: Partial<ArranqueDatos["concierge"]>) =>
    patch({ concierge: { ...d.concierge, ...p } });
  const setEquipo = (p: Partial<ArranqueDatos["equipo"]>) =>
    patch({ equipo: { ...d.equipo, ...p } });
  const setAsesor = (i: number, p: Partial<AsesorItem>) =>
    setEquipo({ asesores: d.equipo.asesores.map((a, j) => (j === i ? { ...a, ...p } : a)) });
  const setTexto = (id: string, p: Partial<TextoItem>) =>
    patch({ textos: d.textos.map((t) => (t.id === id ? { ...t, ...p } : t)) });

  // ── Pegar la lista de desarrollos de golpe (2026-08-23) ───────────────────
  // Llenarlo de a uno son tres campos y un clic por desarrollo; una firma con quince torres
  // ya tiene esa lista escrita en algún lado. `pegado` guarda lo que escribió y `leido` lo
  // que se entendió, para ENSEÑÁRSELO antes de aplicarlo: aquí no se adivina en silencio.
  const [pegando, setPegando] = useState(false);
  const [pegado, setPegado] = useState("");
  const leido = pegarDesarrollos(pegado);

  const aplicarPegado = () => {
    if (!leido.filas.length) return;
    setChecklist({ servicios: leido.filas });
    setPegando(false);
    setPegado("");
  };

  // ── Validaciones por paso ─────────────────────────────────────────────────
  const step2Ready = d.checklist.servicios.some((s) => s.nombre.trim() !== "");
  // El tono solo se pide si algo de lo suyo le habla a un comprador: exigírselo a
  // un proyecto de solo-panel sería pedirle algo que ni siquiera ve en pantalla.
  //
  // 🔴 La escalación es requisito SOLO con asistente, y por la misma razón: una web
  // sola no conversa ni escala a nadie, así que un cliente de solo-web se quedaría
  // esperando por un dato que su pantalla nunca le pide — un checklist imposible de
  // terminar, en silencio (lección 2026-08-16).
  const escalacionPedida = pideEscalacion(piezas);
  // Qué hace con los precios: mismo criterio que la escalación — solo con asistente,
  // porque una web sola no le contesta a nadie. Y cada modo exige lo suyo: pedirle la
  // frase de su web a quien eligió transferir dejaría su checklist sin poder terminar.
  const preciosPedidos = pidePrecios(piezas);
  const preciosListos =
    !preciosPedidos ||
    (d.precios.modo === "transfiere" ||
      (d.precios.modo === "publicado" && d.precios.publicado.trim() !== "") ||
      (d.precios.modo === "en-vivo" && d.precios.fuente.trim() !== ""));
  const step3Ready =
    d.checklist.horarios.trim() !== "" &&
    (!txtHorarios.pideTono || !!d.checklist.tono) &&
    preciosListos &&
    (!escalacionPedida ||
      (d.escalacion.nombre.trim() !== "" &&
        d.escalacion.telefono.trim() !== "" &&
        !!d.escalacion.via));
  // Si el paso no aplica a sus piezas, no puede ser requisito: sería esperar por
  // una decisión que nadie le va a pedir.
  const stepNumeroReady = !visibleNum.has(N.numero) || !!d.numero.decision;
  const stepLineaReady = !visibleNum.has(N.linea) || !!d.linea.decision;
  // Su equipo: solo con la pieza `panel`, y por la misma razón de siempre. Se pide
  // al menos una persona con nombre y la comisión promedio — sin lo primero el panel
  // sale con todo el equipo en "Sin asignar"; sin lo segundo, una venta marcada sin
  // importe no suma nada y el retorno se queda corto sin que nadie entienda por qué.
  const equipoPedido = visibleNum.has(N.equipo);
  const equipoListo =
    !equipoPedido ||
    (d.equipo.asesores.some((a) => a.nombre.trim() !== "") && d.equipo.comision.trim() !== "");
  const nucleoListo =
    step2Ready && step3Ready && stepNumeroReady && stepLineaReady && equipoListo;

  const cuentas = cuentasRequeridas(d.config, idioma);
  const nombreCorto = (d.config.nombre || "").trim().split(" ")[0];
  const linkDemo = `/demo?c=${encodeURIComponent(d.config.clinica || "Tu Inmobiliaria")}&g=${giroDemo(d.config.giro)}`;

  const chipGuardado =
    save === "guardando"
      ? T.ui.guardando
      : save === "ok"
        ? T.ui.guardado
        : save === "error"
          ? T.ui.errorGuardar
          : "";

  // ── Pantalla final ────────────────────────────────────────────────────────
  if (step === "listo") {
    const completo = alcanzado.current === "completado";
    return (
      <div className="card-soft rounded-[36px] p-8 text-center md:p-12">
        <div className="mb-4 text-5xl">{completo ? "🏆" : "🎉"}</div>
        <h2 className="mb-3 text-2xl font-semibold">
          {completo ? T.resumen.completo : T.resumen.listo(nombreCorto)}
        </h2>
        <p className="mx-auto mb-8 max-w-md font-light text-mocha">
          {completo
            ? T.resumen.noTeFalta
            : copyFinal(piezas, idioma).seguimos}
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={CONTACT.whatsapp}
            className="btn-shine rounded-full bg-clay px-7 py-3 text-sm font-semibold text-obsidian transition-all hover:scale-[1.03] hover:bg-clay-bright"
          >
            💬 Cualquier duda, por WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setStep(N.resumen)}
            className="rounded-full border border-[rgba(242,231,219,0.2)] px-7 py-3 text-sm font-medium text-sand transition-colors hover:border-clay hover:text-clay-bright"
          >
            Volver a mi checklist
          </button>
        </div>
      </div>
    );
  }

  // El contador cuenta SOLO los pasos que aplican a este proyecto (un cliente de
  // solo-web ve "Paso 4 de 7", no un brinco del 3 al 5).
  const posEnLista =
    typeof step === "number" ? pasosLista.indexOf(NUM_A_PASO[step - 1]) + 1 : pasosLista.length;

  /** Cambia el idioma Y LO GUARDA: el cliente vuelve días después con el mismo
   *  link y tiene que encontrarlo como lo dejó. Si el guardado falla no pasa nada
   *  grave —la pantalla ya cambió— y al volver lo elige otra vez. */
  const cambiarIdioma = async () => {
    const otro: Idioma = idioma === "en" ? "es" : "en";
    setIdioma(otro);
    const conIdioma = { ...d, idioma: otro };
    setD(conIdioma);
    await guardar(conIdioma);
  };

  return (
    <div className="card-soft rounded-[36px] p-6 md:p-12">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={cambiarIdioma}
          className="rounded-full border border-sand/25 px-4 py-1.5 text-xs font-semibold text-mocha transition-colors hover:border-clay hover:text-clay-bright"
        >
          {T.ui.verEnOtroIdioma}
        </button>
      </div>
      <ProgressDots
        step={posEnLista}
        total={pasosLista.length}
        label={T.bienvenida.paso(posEnLista, pasosLista.length)}
      />

      {/* 1 · Bienvenida */}
      {step === N.bienvenida && (
        <div>
          <StepHeader
            q={T.bienvenida.titulo(nombreCorto)}
            hint={copyBienvenida(piezas, pasosLista.length, idioma).intro}
          />
          <div className="mx-auto mb-8 grid max-w-md gap-3 text-sm font-light">
            <div className="flex gap-3"><span>⏱️</span><span>{T.prosa.tuParteToma1}<strong className="font-semibold text-sand">{copyBienvenida(piezas, pasosLista.length, idioma).duracion}</strong>{T.prosa.tuParteToma2}</span></div>
            <div className="flex gap-3"><span>🧭</span><span>{T.bienvenida.guiando}</span></div>
            <div className="flex gap-3"><span>🔒</span><span><strong className="font-semibold text-sand">{T.bienvenida.seguridadFuerte}</strong> {T.bienvenida.seguridadResto}</span></div>
          </div>
          <NavBtns onNext={() => irA(N.servicios)} nextEnabled nextLabel={T.bienvenida.empezar} backLabel={T.ui.atras} />
        </div>
      )}

      {/* 2 · Servicios y precios */}
      {step === N.servicios && (
        <div>
          <StepHeader {...copyServicios(piezas, idioma)} />

          {/* Atajo: pegar la lista de golpe. Va ARRIBA de los campos porque el que trae su
              lista lo necesita antes de empezar a teclear; el que no, lo ignora y sigue. */}
          {!pegando ? (
            <button
              type="button"
              onClick={() => setPegando(true)}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(242,231,219,0.2)] px-5 py-2 text-sm font-medium text-sand transition-colors hover:border-clay hover:text-clay-bright"
            >
              📋 {T.desarrollos.pegarAbrir}
            </button>
          ) : (
            <div className="mb-6 rounded-2xl border border-clay/40 bg-[rgba(242,231,219,0.03)] p-4">
              <label htmlFor="pegar-desarrollos" className="mb-1 block text-sm font-medium text-sand">
                {T.desarrollos.pegarTitulo}
              </label>
              <p className="mb-3 text-xs font-light leading-relaxed text-mocha">
                {T.desarrollos.pegarHint}
              </p>
              <textarea
                id="pegar-desarrollos"
                autoFocus
                rows={6}
                value={pegado}
                onChange={(e) => setPegado(e.target.value)}
                placeholder={T.desarrollos.pegarEjemplo}
                className="w-full rounded-xl border border-[rgba(242,231,219,0.15)] bg-obsidian px-3 py-2 font-mono text-sm text-sand outline-none transition-colors placeholder:text-mocha/40 focus:border-clay"
              />

              {/* Lo que se entendió, ANTES de aplicarlo. Si una columna se interpretó mal,
                  el cliente lo ve aquí y lo corrige — no el día de la entrega. */}
              {pegado.trim() !== "" && (
                <div className="mt-3 text-xs font-light text-mocha">
                  {leido.filas.length === 0 ? (
                    <p className="text-clay-bright">{T.desarrollos.pegarNada}</p>
                  ) : (
                    <>
                      <p className="mb-2 text-sage">
                        {leido.filas.length}{" "}
                        {leido.filas.length === 1
                          ? T.desarrollos.labelNombre.toLowerCase()
                          : T.desarrollos.q.toLowerCase()}
                      </p>
                      <ul className="max-h-40 overflow-y-auto">
                        {leido.filas.slice(0, 8).map((f, i) => (
                          // ⚠️ Los valores se sacan a un array ANTES de meterlos en la
                          // cadena: `${f.duracion}` dentro del texto hacía que el guardián
                          // de vocabulario lo leyera como palabra visible del nicho viejo
                          // ("duración" era la de una cita, un condominio no dura). El
                          // campo se sigue llamando así porque es la llave del dato.
                          <li key={i} className="truncate">
                            · <span className="text-sand">{f.nombre}</span>
                            {[f.precio, f.duracion]
                              .filter(Boolean)
                              .map((extra) => ` — ${extra}`)
                              .join("")}
                          </li>
                        ))}
                        {leido.filas.length > 8 && <li>· …+{leido.filas.length - 8}</li>}
                      </ul>
                      {leido.ignorados > 0 && <p className="mt-1">{T.desarrollos.pegarEncabezado}</p>}
                      {leido.recortado && <p className="mt-1">{T.desarrollos.pegarRecortado}</p>}
                      <p className="mt-2">{T.desarrollos.pegarPisa}</p>
                    </>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={aplicarPegado}
                  disabled={leido.filas.length === 0}
                  className="rounded-full bg-clay px-5 py-2 text-sm font-semibold text-obsidian transition-all hover:bg-clay-bright disabled:opacity-40"
                >
                  {T.desarrollos.pegarUsar}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPegando(false);
                    setPegado("");
                  }}
                  className="rounded-full border border-[rgba(242,231,219,0.2)] px-5 py-2 text-sm font-medium text-mocha transition-colors hover:text-sand"
                >
                  {T.desarrollos.pegarCancelar}
                </button>
              </div>
            </div>
          )}

          <div className="mb-4 grid gap-3">
            {d.checklist.servicios.map((s, i) => (
              <div key={i} className="grid gap-2 rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
                {/* ⚠️ Las tres etiquetas eran del nicho de clínicas y se le mostraban
                    tal cual a una firma de Miami (comprobado abriendo el portal, no
                    leyendo el código): "Servicio", "Precio (MXN)" con ejemplo de $800,
                    y "Duración · Ej. 45 min" — un condominio no dura 45 minutos.
                    ⛔ El tercer campo NO puede ser la fecha de entrega: en este nicho
                    las fechas de entrega están prohibidas porque caducan solas. El
                    tamaño no caduca. */}
                <Field label={i === 0 ? T.desarrollos.labelNombre : ""} type="text" value={s.nombre} placeholder={T.desarrollos.ejNombre} onChange={(v) => setServicio(i, { nombre: v })} />
                {/* 🔴 El 2026-08-21 este campo pasó de "Precio (MXN)" a "Precio (USD)" y
                    ahí me quedé: arreglé la moneda sin preguntarme si el campo debía
                    existir. El sitio NO publica precios —línea roja nº1 del producto, y
                    el config ni siquiera tiene dónde escribirlos—, así que el cliente
                    tecleaba precios que nunca iba a ver en su página. El dato sirve (al
                    equipo, para cotizar y calificar), pero hay que DECIR que no se
                    publica: si no, el reclamo llega el día de la entrega. */}
                <Field label={i === 0 ? T.desarrollos.labelPrecio : ""} type="text" value={s.precio} placeholder={T.desarrollos.ejPrecio} onChange={(v) => setServicio(i, { precio: v })} />
                <Field label={i === 0 ? T.desarrollos.labelTamano : ""} type="text" value={s.duracion} placeholder={T.desarrollos.ejTamano} onChange={(v) => setServicio(i, { duracion: v })} />
                <button
                  type="button"
                  aria-label={T.desarrollos.quitar}
                  onClick={() => setChecklist({ servicios: d.checklist.servicios.filter((_, j) => j !== i) })}
                  disabled={d.checklist.servicios.length === 1}
                  className="h-11 rounded-xl border border-[rgba(242,231,219,0.15)] px-3 text-mocha transition-colors hover:border-clay hover:text-clay-bright disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setChecklist({ servicios: [...d.checklist.servicios, { ...servicioVacio }] })}
            className="mb-8 rounded-full border border-[rgba(242,231,219,0.2)] px-5 py-2 text-sm font-medium text-sand transition-colors hover:border-clay hover:text-clay-bright"
          >
            {/* ⚠️ Antes decía "+ Agregar otro desarrollo" escrito a mano: a un cliente con el
                portal en inglés le salía en español. La llave ya existía sin usarse. */}
            {T.desarrollos.agregar}
          </button>
          {/* ⚠️ El botón se apagaba sin decir por qué: el cliente veía "Siguiente"
              muerto y no tenía forma de saber que le faltaba escribir al menos un
              nombre. Un botón deshabilitado y mudo es un callejón sin salida. */}
          {/* El texto también estaba escrito a mano en español; su llave ya existía. */}
          {!step2Ready && (
            <p className="mb-3 text-sm font-light text-mocha">{T.desarrollos.faltan}</p>
          )}
          <NavBtns onBack={() => irA(N.bienvenida)} onNext={() => irA(N.horarios)} nextEnabled={step2Ready} nextLabel={T.ui.siguiente} backLabel={T.ui.atras} />
        </div>
      )}

      {/* 3 · Horarios, tono y extras */}
      {step === N.horarios && (
        <div>
          <StepHeader q={txtHorarios.q} hint={txtHorarios.hint} />
          <div className="mb-6 grid gap-5">
            <TextArea
              label={T.horarios.label}
              value={d.checklist.horarios}
              placeholder={T.horarios.ejemplo}
              onChange={(v) => setChecklist({ horarios: v })}
            />
            {txtHorarios.pideTono && (
              <div>
                <div className="mb-2 text-sm text-mocha">{txtHorarios.tonoLabel}</div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {tonoOptions(idioma).map((o) => (
                    <OptionBtn key={o.val} opt={o} selected={d.checklist.tono === o.val} onClick={() => setChecklist({ tono: o.val })} />
                  ))}
                </div>
              </div>
            )}
            {txtHorarios.pideFaqs && (
              <>
                <TextArea
                  label={txtHorarios.faqsLabel}
                  value={d.checklist.faqs}
                  placeholder={T.horarios.ejFaqs}
                  onChange={(v) => setChecklist({ faqs: v })}
                />
                <TextArea
                  label={T.horarios.indicaciones}
                  value={d.checklist.indicaciones}
                  placeholder={T.horarios.ejIndicaciones}
                  onChange={(v) => setChecklist({ indicaciones: v })}
                />
              </>
            )}
            {txtHorarios.pideLogo && (
              <Field
                label={T.horarios.logo}
                type="text"
                value={d.checklist.logoColores}
                placeholder={T.horarios.ejLogo}
                onChange={(v) => setChecklist({ logoColores: v })}
              />
            )}
            {escalacionPedida && (
              <div className="rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5">
                <div className="mb-1 text-sm font-semibold text-sand">
                  {T.horarios.escalacionTitulo}
                </div>
                <p className="mb-4 text-sm font-light text-mocha">
                  {T.horarios.escalacionHint}
                </p>
                <div className="grid gap-4">
                  <Field
                    label={T.horarios.escalacionNombre}
                    type="text"
                    value={d.escalacion.nombre}
                    placeholder={T.horarios.ejEscalacionNombre}
                    onChange={(v) => setEscalacion({ nombre: v })}
                  />
                  <Field
                    label={T.horarios.escalacionTel}
                    type="tel"
                    value={d.escalacion.telefono}
                    placeholder={T.horarios.ejEscalacionTel}
                    onChange={(v) => setEscalacion({ telefono: v })}
                  />
                  <p className="text-xs font-light leading-relaxed text-mocha">
                    {hayVoz(piezas) ? T.horarios.escalacionAvisoVoz : T.horarios.escalacionAvisoChat}
                  </p>
                  <div>
                    <div className="mb-2 text-sm text-mocha">{T.horarios.escalacionVia}</div>
                    <div className="grid grid-cols-3 gap-3">
                      {T.viasAviso.map((v) => (
                        <OptionBtn
                          key={v.val}
                          opt={{ val: v.val, label: v.label, icon: ICONO_VIA[v.val] ?? "🔔", desc: v.desc }}
                          selected={d.escalacion.via === v.val}
                          onClick={() => setEscalacion({ via: v.val })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 🔄 Qué hace con los precios — lo elige el cliente (2026-08-25).
                Se pregunta de DÓNDE sale el dato, nunca "¿puede decir precios?": con un
                sí/no casi todos dirían que sí sin pensarlo, y acabaríamos con asistentes
                diciendo precios vencidos con total seguridad, que es justo el daño que la
                regla vieja evitaba. Por eso no hay ningún campo donde teclear un número. */}
            {preciosPedidos && (
              <div className="rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5">
                <div className="mb-1 text-sm font-semibold text-sand">
                  {T.horarios.preciosTitulo}
                </div>
                <p className="mb-4 text-sm font-light text-mocha">{T.horarios.preciosHint}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {T.modosPrecio.map((m) => (
                    <OptionBtn
                      key={m.val}
                      opt={{ val: m.val, label: m.label, icon: ICONO_PRECIO[m.val] ?? "💬", desc: m.desc }}
                      selected={d.precios.modo === m.val}
                      onClick={() => setPrecios({ modo: m.val })}
                    />
                  ))}
                </div>
                {/* El campo de detalle sale SOLO con el modo que lo necesita: pedirle la
                    frase de su web a quien eligió transferir es ruido, y un campo vacío
                    que nadie va a usar deja su checklist incompleto para siempre. */}
                {d.precios.modo === "publicado" && (
                  <div className="mt-4">
                    <Field
                      label={T.horarios.preciosPublicadoLabel}
                      type="text"
                      value={d.precios.publicado}
                      placeholder={T.horarios.ejPreciosPublicado}
                      onChange={(v) => setPrecios({ publicado: v })}
                    />
                  </div>
                )}
                {d.precios.modo === "en-vivo" && (
                  <div className="mt-4">
                    <Field
                      label={T.horarios.preciosFuenteLabel}
                      type="text"
                      value={d.precios.fuente}
                      placeholder={T.horarios.ejPreciosFuente}
                      onChange={(v) => setPrecios({ fuente: v })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 🔒 El suelo: lo único que NO puede quitar, y lo VE (decisión de Yael,
                2026-08-25). Enseñárselo es argumento de venta, no letra chica: le dice
                que sabemos lo que hacemos. Escondido, el día que pregunte "¿por qué mi
                asistente dijo eso?" parecería que le ocultamos algo. */}
            {escalacionPedida && (
              <div className="rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5">
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-sand">
                  <span aria-hidden>🔒</span>
                  {T.horarios.sueloTitulo}
                </div>
                <p className="mb-4 text-sm font-light text-mocha">{T.horarios.sueloHint}</p>
                <ul className="grid gap-3">
                  {T.suelo.map((s) => (
                    <li
                      key={s.titulo}
                      className="rounded-xl border border-[rgba(242,231,219,0.1)] bg-[rgba(242,231,219,0.02)] p-4"
                    >
                      <div className="text-sm font-semibold text-sand">{s.titulo}</div>
                      <p className="mt-1 text-sm font-light leading-relaxed text-mocha">{s.que}</p>
                      <p className="mt-1.5 text-xs font-light leading-relaxed text-mocha">
                        <span className="font-semibold text-clay-bright">{T.estilo.porQue}</span>
                        {s.porque}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <NavBtns onBack={() => irA(N.servicios)} onNext={() => irA(N.numero)} nextEnabled={step3Ready} nextLabel={T.ui.siguiente} backLabel={T.ui.atras} />
        </div>
      )}

      {/* 4 · Número de WhatsApp — piezas que escriben por WhatsApp */}
      {step === N.numero && (
        <div>
          <StepHeader q={copyNumero(piezas, idioma).q} hint={copyNumero(piezas, idioma).hint} />
          <div className="mx-auto mb-6 max-w-lg rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5 text-sm font-light text-mocha">
            <p className="mb-2"><strong className="font-semibold text-sand">{T.numero.prefijoActual}</strong> {copyNumero(piezas, idioma).actual}</p>
            <p><strong className="font-semibold text-sand">{T.numero.prefijoNuevo}</strong> {copyNumero(piezas, idioma).nuevo}</p>
          </div>
          <div className="mx-auto mb-8 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
            {numeroOptions(piezas, idioma).map((o) => (
              <OptionBtn key={o.val} opt={o} selected={d.numero.decision === o.val} onClick={() => patch({ numero: { decision: o.val } })} />
            ))}
          </div>
          <NavBtns onBack={() => irA(N.horarios)} onNext={() => irA(N.linea)} nextEnabled={stepNumeroReady} nextLabel={T.ui.siguiente} backLabel={T.ui.atras} />
        </div>
      )}

      {/* 5 · La línea telefónica — solo agente de voz */}
      {step === N.linea && (
        <div>
          <StepHeader q={copyLinea(idioma).q} hint={copyLinea(idioma).hint} />
          <div className="mx-auto mb-6 max-w-lg rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5 text-sm font-light text-mocha">
            <p className="mb-2"><strong className="font-semibold text-sand">{T.linea.prefijoDesvio}</strong> {copyLinea(idioma).desvio}</p>
            <p><strong className="font-semibold text-sand">{T.linea.prefijoNuevo}</strong> {copyLinea(idioma).nuevo}</p>
          </div>
          <div className="mx-auto mb-8 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
            {lineaOptions(idioma).map((o) => (
              <OptionBtn key={o.val} opt={o} selected={d.linea.decision === o.val} onClick={() => patch({ linea: { decision: o.val } })} />
            ))}
          </div>
          <NavBtns onBack={() => irA(N.numero)} onNext={() => irA(N.cuentas)} nextEnabled={stepLineaReady} nextLabel={T.ui.siguiente} backLabel={T.ui.atras} />
        </div>
      )}

      {/* 6 · Cuentas */}
      {step === N.cuentas && (
        <div>
          <StepHeader
            q={T.cuentas.titulo}
            hint={T.cuentas.subtitulo}
          />
          {/* Aviso de seguridad. Dice DOS cosas distintas a propósito:
              (1) las contraseñas no se comparten con nadie, ni con nosotros;
              (2) los códigos SÍ nos los va a dictar, así que hay que decirle
                  por dónde y cómo comprobar que somos nosotros — si no, el día
                  que alguien se haga pasar por Upcore no tiene con qué
                  compararlo. El número va escrito, no solo enlazado. */}
          <div className="mb-5 rounded-2xl border border-clay/40 bg-[rgba(200,98,61,0.07)] p-4 text-sm font-light">
            <p className="mb-2 text-center">
              🔒 <strong className="font-semibold text-sand">{T.prosa.seguridadTitulo}</strong>{T.prosa.seguridadResto2}
            </p>
            <p className="text-center">
              {T.prosa.codigosAntes}
              <strong className="font-semibold text-sand">{T.prosa.codigosFuerte}</strong>{" "}
              {/* El punto va PEGADO al cierre del enlace: en su propia línea,
                  JSX mete un espacio y se lee "…2698 ." */}
              <a href={CONTACT.whatsapp} className="font-semibold text-clay-bright underline">
                {CONTACT.whatsappDisplay}
              </a>{T.prosa.codigosDespues}
              <strong className="font-semibold text-sand">{T.prosa.codigosFuerte2}</strong>{T.prosa.codigosFinal}
            </p>
          </div>

          {/* Ya no se le pregunta quién las crea: las crea Upcore, siempre.
              Lo único que necesitamos es a nombre de quién quedan. */}
          <div className="mb-8">
            <div className="mb-5 rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5 text-sm font-light text-mocha">
                {/* 🔴 Estaba escrito a mano en español y salía tal cual en el
                    portal en inglés (2026-08-25). Ahora viene de la tabla. */}
                <p className="mb-2">
                  {T.cuentas.losClicsAntes}
                  <strong className="font-semibold text-sand">{T.cuentas.losClicsFuerte}</strong>
                  {T.cuentas.losClicsDespues}
                </p>
                <p>
                  {T.cuentas.soloNecesitamosAntes}
                  <strong className="font-semibold text-sand">
                    {T.cuentas.soloNecesitamosFuerte}
                  </strong>
                  {T.cuentas.soloNecesitamosDespues}
                </p>
              </div>
              <div className="mx-auto grid max-w-lg gap-4">
                {/* ⛔ Aquí se elegía entre "créenme uno nuevo" y "con un correo
                    mío". Se quitó el 2026-08-16: el correo del proyecto SIEMPRE
                    se crea nuevo. Con el suyo, cada cuenta le manda códigos a su
                    bandeja y hay que perseguirlo para que nos los lea — lento
                    para él y para nosotros. Con uno nuevo, los códigos llegan a
                    un buzón que administramos y él no hace nada. */}
                <div className="rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5">
                  <p className="mb-2 text-sm font-semibold text-sand">
                    {T.estilo.correoNuevoTitulo}
                  </p>
                  <p className="text-sm font-light text-mocha">
                    {T.prosa.correoAntes}
                    <strong className="font-semibold text-sand">{T.prosa.correoFuerte1}</strong>
                    {T.prosa.correoMedio}
                    <strong className="font-semibold text-sand">{T.prosa.correoFuerte2}</strong>
                    {T.prosa.correoFinal}
                  </p>
                </div>
                <Field
                  label={T.cuentas.comoSeLlame}
                  type="text"
                  value={d.concierge.correoIdea}
                  placeholder="ej. contacto@tuinmobiliaria — si no, te proponemos uno"
                  onChange={(v) => setConcierge({ correoIdea: v })}
                />
                <Field
                  label={T.cuentas.telefonoCodigos}
                  type="tel"
                  value={d.concierge.telefono}
                  placeholder={T.cuentas.hintTelefono}
                  onChange={(v) => setConcierge({ telefono: v })}
                />
                <Field
                  label={T.cuentas.horarioEscribir}
                  type="text"
                  value={d.concierge.horario}
                  placeholder={T.cuentas.ejHorario}
                  onChange={(v) => setConcierge({ horario: v })}
                />
              </div>
            </div>

          {/* Lo que le vamos a crear. Es una LISTA, no una tarea: no hay casillas
              que marcar porque él no abre ninguna. Sirve para dos cosas — que vea
              el trabajo que se le está quitando de encima, y que sepa de antemano
              qué le va a costar al mes. */}
          {cuentas.length > 0 && (
            <div className="mb-8">
              <div className="mb-3 text-sm font-semibold text-sand">
                {T.cuentas.estoTeCreamos}
              </div>
              <div className="grid gap-4">
                {cuentas.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sand">{c.titulo}</span>
                      {c.tusManos && (
                        <span className="rounded-full bg-clay/20 px-3 py-1 text-xs font-semibold text-clay-bright">
                          {T.cuentas.tusManos}
                        </span>
                      )}
                    </div>
                    <div className="mb-3 text-sm font-light text-mocha">{c.para}</div>
                    <ul className="grid gap-1.5 text-sm font-light text-mocha">
                      {c.pasos.map((p) => (
                        <li key={p.slice(0, 30)} className="flex gap-2">
                          <span className="text-clay-bright">→</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                    {c.nota && <p className="mt-3 text-xs font-light text-clay-bright">{c.nota}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <NavBtns
            onBack={() => irA(N.linea)}
            onNext={() => irA(N.calendario)}
            nextEnabled={d.concierge.telefono.trim() !== ""}
            nextLabel={T.ui.siguiente} backLabel={T.ui.atras} />
        </div>
      )}

      {/* 7 · Calendario */}
      {step === N.calendario && (
        <div>
          <StepHeader {...copyCalendario(piezas, idioma)} />
          <div className="mx-auto mb-5 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
            {calendarioOptions(idioma).map((o) => (
              <OptionBtn key={o.val} opt={o} selected={d.calendario.tipo === o.val} onClick={() => patch({ calendario: { ...d.calendario, tipo: o.val } })} />
            ))}
          </div>
          {d.calendario.tipo === "google" && (
            <div className="mx-auto mb-5 max-w-lg rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5 text-sm font-light text-mocha">
              {T.prosa.calAntes}<strong className="font-semibold text-sand">{T.prosa.calFuerte}</strong>{T.prosa.calDespues}
            </div>
          )}
          {d.calendario.tipo === "software" && (
            <div className="mx-auto mb-5 max-w-lg rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5 text-sm font-light text-mocha">
              {T.estilo.calendarioOtroAntes}<strong className="font-semibold text-sand">{T.estilo.calendarioOtroFuerte}</strong>{T.estilo.calendarioOtroDespues}
            </div>
          )}
          {d.calendario.tipo === "ninguno" && (
            <div className="mx-auto mb-5 max-w-lg rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5 text-sm font-light text-mocha">
              {T.prosa.calNingunoAntes}<strong className="font-semibold text-sand">{T.prosa.calNingunoFuerte}</strong>{T.prosa.calNingunoDespues}
            </div>
          )}
          <div className="mx-auto mb-8 max-w-lg">
            <button
              type="button"
              onClick={() => patch({ calendario: { ...d.calendario, compartido: !d.calendario.compartido } })}
              aria-pressed={d.calendario.compartido}
              className={`w-full rounded-full border px-5 py-3 text-sm font-semibold transition-all ${
                d.calendario.compartido
                  ? "border-sage bg-sage/20 text-sand"
                  : "border-[rgba(242,231,219,0.2)] text-mocha hover:border-clay hover:text-sand"
              }`}
            >
              {d.calendario.compartido ? T.calendarioPasos.marcado : T.calendarioPasos.marcar}
            </button>
          </div>
          <NavBtns onBack={() => irA(N.cuentas)} onNext={() => irA(N.demo)} nextEnabled nextLabel={T.ui.siguiente} backLabel={T.ui.atras} />
        </div>
      )}

      {/* 8 · Probar el bot */}
      {step === N.demo && (
        <div>
          <StepHeader q={T.demoUi.titulo} hint={T.demoUi.subtitulo} />
          <div className="mb-5 text-center">
            <a
              href={linkDemo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine inline-block rounded-full bg-clay px-8 py-3.5 font-semibold text-obsidian transition-all hover:scale-[1.03] hover:bg-clay-bright"
            >
              💬 Abrir la demo de {d.config.clinica || "tu inmobiliaria"} →
            </a>
          </div>
          <div className="mx-auto mb-6 max-w-md rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5">
            <div className="mb-2 text-sm font-semibold text-sand">{T.demoUi.ponloAPrueba}</div>
            <ul className="grid gap-1.5 text-sm font-light text-mocha">
              {T.demo.ideas.map((g) => (
                <li key={g} className="flex gap-2"><span className="text-clay-bright">→</span>{g}</li>
              ))}
            </ul>
          </div>
          <div className="mx-auto mb-4 max-w-md">
            <button
              type="button"
              onClick={() => patch({ prueba: { ...d.prueba, hecha: !d.prueba.hecha } })}
              aria-pressed={d.prueba.hecha}
              className={`w-full rounded-full border px-5 py-3 text-sm font-semibold transition-all ${
                d.prueba.hecha
                  ? "border-sage bg-sage/20 text-sand"
                  : "border-[rgba(242,231,219,0.2)] text-mocha hover:border-clay hover:text-sand"
              }`}
            >
              {d.prueba.hecha ? T.demoUi.yaLoProbe : T.demoUi.marcarProbado}
            </button>
          </div>
          <div className="mx-auto mb-8 max-w-md">
            <TextArea
              label={T.demoUi.queTeParecio}
              value={d.prueba.comentarios}
              placeholder={T.demoUi.ejOpinion}
              onChange={(v) => patch({ prueba: { ...d.prueba, comentarios: v } })}
            />
          </div>
          <NavBtns onBack={() => irA(N.calendario)} onNext={() => irA(N.textos)} nextEnabled nextLabel={T.ui.siguiente} backLabel={T.ui.atras} />
        </div>
      )}

      {/* 9 · Aprobar textos (+ estilo del sitio si el proyecto lleva web) */}
      {step === N.textos && (
        <div>
          <StepHeader {...copyTextos(piezas, idioma)} />
          {tieneWeb && (
            <div className="mx-auto mb-8 max-w-md">
              <div className="mb-3 text-sm font-semibold text-sand">{T.estilo.tituloEstilo}</div>
              <p className="mb-4 text-sm font-light text-mocha">
                {T.estilo.opcionalPeroMejor}
              </p>
              <div className="grid gap-4">
                <Field
                  label={T.estilo.paleta}
                  type="text"
                  value={d.web.paleta}
                  placeholder={T.prosa.ejPaleta}
                  onChange={(v) => patch({ web: { ...d.web, paleta: v } })}
                />
                {d.web.referencias.map((r, i) => (
                  <div
                    key={i}
                    className="grid gap-2 rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-4"
                  >
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Field
                          label={T.prosa.paginaQueGusta(i + 1)}
                          type="text"
                          value={r.url}
                          placeholder="https://…"
                          onChange={(v) =>
                            patch({
                              web: {
                                ...d.web,
                                referencias: d.web.referencias.map((x, j) =>
                                  j === i ? { ...x, url: v } : x
                                ),
                              },
                            })
                          }
                        />
                      </div>
                      <button
                        type="button"
                        aria-label={T.estilo.quitarReferencia}
                        onClick={() =>
                          patch({
                            web: {
                              ...d.web,
                              referencias: d.web.referencias.filter((_, j) => j !== i),
                            },
                          })
                        }
                        className="h-11 rounded-xl border border-[rgba(242,231,219,0.15)] px-3 text-mocha transition-colors hover:border-clay hover:text-clay-bright"
                      >
                        ✕
                      </button>
                    </div>
                    <Field
                      label={T.estilo.queTeGusta}
                      type="text"
                      value={r.nota}
                      placeholder={T.estilo.ejQueGusta}
                      onChange={(v) =>
                        patch({
                          web: {
                            ...d.web,
                            referencias: d.web.referencias.map((x, j) =>
                              j === i ? { ...x, nota: v } : x
                            ),
                          },
                        })
                      }
                    />
                  </div>
                ))}
                {d.web.referencias.length < 3 && (
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        web: { ...d.web, referencias: [...d.web.referencias, { url: "", nota: "" }] },
                      })
                    }
                    className="rounded-full border border-[rgba(242,231,219,0.2)] px-5 py-2 text-sm font-medium text-sand transition-colors hover:border-clay hover:text-clay-bright"
                  >
                    {T.estilo.agregarReferencia}
                  </button>
                )}
              </div>
            </div>
          )}
          {d.textos.length === 0 ? (
            // Los borradores de recordatorios solo existen en proyectos con piezas de
            // WhatsApp; a uno de solo-web no se le promete algo que no va a llegar.
            tieneMensajes ? (
              <div className="mx-auto mb-8 max-w-md rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-6 text-center text-sm font-light text-mocha">
                {T.prosa.textosAntes}<strong className="font-semibold text-sand">{T.prosa.textosFuerte}</strong>{T.prosa.textosDespues}
              </div>
            ) : null
          ) : (
            <div className="mb-8 grid gap-4">
              {d.textos.map((t) => (
                <div key={t.id} className="rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold text-sand">{t.titulo}</div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        t.estado === "aprobado"
                          ? "bg-sage/20 text-sage"
                          : t.estado === "con-cambios"
                            ? "bg-clay/20 text-clay-bright"
                            : "bg-[rgba(242,231,219,0.08)] text-mocha"
                      }`}
                    >
                      {t.estado === "aprobado" ? T.estilo.aprobado : t.estado === "con-cambios" ? T.estilo.conCambios : T.estilo.porRevisar}
                    </span>
                  </div>
                  <p className="mb-4 whitespace-pre-wrap rounded-xl bg-[rgba(242,231,219,0.04)] p-4 text-sm font-light italic text-sand">
                    “{t.borrador}”
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setTexto(t.id, { estado: "aprobado", comentario: "" })}
                      className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
                        t.estado === "aprobado"
                          ? "border-sage bg-sage/20 text-sand"
                          : "border-[rgba(242,231,219,0.2)] text-mocha hover:border-sage hover:text-sand"
                      }`}
                    >
                      {T.estilo.meGusta}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTexto(t.id, { estado: "con-cambios" })}
                      className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
                        t.estado === "con-cambios"
                          ? "border-clay bg-clay/20 text-sand"
                          : "border-[rgba(242,231,219,0.2)] text-mocha hover:border-clay hover:text-sand"
                      }`}
                    >
                      ✎ Quiero cambios
                    </button>
                  </div>
                  {t.estado === "con-cambios" && (
                    <div className="mt-3">
                      <TextArea
                        label={T.estilo.queCambiamos}
                        value={t.comentario}
                        placeholder={T.estilo.ejCambio}
                        onChange={(v) => setTexto(t.id, { comentario: v })}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <NavBtns onBack={() => irA(N.demo)} onNext={() => irA(N.equipo)} nextEnabled nextLabel={T.ui.siguiente} backLabel={T.ui.atras} />
        </div>
      )}

      {/* 10 · Su equipo — SOLO con la pieza `panel`.
          🔴 Estos dos datos no se le pedían a NADIE (2026-08-25). El panel del
          director enseña cómo va cada asesor, y sin sus nombres sale con el equipo
          entero en "Sin asignar" el día de la entrega. Era una tarea invisible que
          alguien tendría que acordarse de preguntar. */}
      {step === N.equipo && (
        <div>
          <StepHeader q={T.equipo.q} hint={T.equipo.hint} />
          <div className="mx-auto max-w-md">
            <div className="grid gap-3">
              {d.equipo.asesores.map((a, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Field
                      label={i === 0 ? T.equipo.labelNombre : ""}
                      type="text"
                      value={a.nombre}
                      placeholder={T.equipo.ejNombre}
                      onChange={(v) => setAsesor(i, { nombre: v })}
                    />
                  </div>
                  <div className="w-40">
                    {i === 0 && (
                      <label className="mb-1 block text-xs font-light text-mocha">
                        {T.equipo.labelRol}
                      </label>
                    )}
                    {/* ⚠️ El `value` es la CLAVE que se guarda y acaba en su acceso;
                        lo único traducido es lo que se lee. */}
                    <select
                      aria-label={T.equipo.labelRol}
                      value={a.rol || "asesor"}
                      onChange={(e) => setAsesor(i, { rol: e.target.value })}
                      className="h-11 w-full rounded-xl border border-[rgba(242,231,219,0.15)] bg-[rgba(242,231,219,0.03)] px-3 text-sm text-sand outline-none focus:border-clay"
                    >
                      {ROLES_EQUIPO.map((r) => (
                        <option key={r} value={r}>
                          {T.equipo.roles[r]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    aria-label={T.equipo.quitar}
                    onClick={() =>
                      setEquipo({ asesores: d.equipo.asesores.filter((_, j) => j !== i) })
                    }
                    disabled={d.equipo.asesores.length === 1}
                    className="h-11 rounded-xl border border-[rgba(242,231,219,0.15)] px-3 text-mocha transition-colors hover:border-clay hover:text-clay-bright disabled:opacity-30"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setEquipo({ asesores: [...d.equipo.asesores, { ...asesorVacio }] })
              }
              className="mt-3 min-h-[44px] rounded-xl border border-[rgba(242,231,219,0.15)] px-4 text-sm text-mocha transition-colors hover:border-clay hover:text-clay-bright"
            >
              + {T.equipo.agregar}
            </button>
            <p className="mt-2 text-xs font-light text-mocha">{T.equipo.rolAyuda}</p>

            <div className="mt-7">
              <Field
                label={T.equipo.labelComision}
                type="text"
                value={d.equipo.comision}
                placeholder={T.equipo.ejComision}
                onChange={(v) => setEquipo({ comision: v })}
              />
              <p className="mt-2 text-xs font-light text-mocha">{T.equipo.comisionAyuda}</p>
            </div>

            {/* Cómo le llegan las claves. Va aquí y no en un correo: es justo donde
                está pensando en darnos los nombres de su gente. */}
            <p className="mt-7 rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-4 text-xs font-light text-mocha">
              🔒 {T.equipo.nota}
            </p>
          </div>
          <NavBtns
            onBack={() => irA(N.textos)}
            onNext={() => irA(N.resumen)}
            nextEnabled={equipoListo}
            nextLabel={T.ui.siguiente} backLabel={T.ui.atras} />
        </div>
      )}

      {/* 11 · Resumen y cierre */}
      {step === N.resumen && (
        <div>
          <StepHeader q={T.resumenUi.titulo} hint={T.resumenUi.hint} />
          <div className="mx-auto mb-6 max-w-md rounded-2xl border border-[rgba(242,231,219,0.12)] bg-[rgba(242,231,219,0.03)] p-5">
            {[
              { ok: step2Ready, txt: T.resumenUi.desarrollos, req: true },
              {
                ok: step3Ready,
                txt: txtHorarios.pideTono ? T.resumenUi.horariosYTono : T.resumenUi.horarios,
                req: true,
              },
              // Las filas de pasos que no aplican a sus piezas no se listan: no se
              // le muestra pendiente algo que nadie le va a pedir.
              ...(visibleNum.has(N.numero)
                ? [{ ok: stepNumeroReady, txt: etiquetaNumero(piezas, idioma), req: true }]
                : []),
              ...(visibleNum.has(N.linea)
                ? [{ ok: stepLineaReady, txt: T.resumenUi.llamadas, req: true }]
                : []),
              ...(equipoPedido
                ? [{ ok: equipoListo, txt: T.equipo.q, req: true }]
                : []),
              // Las cuentas las creamos nosotros: es UNA línea, no una por cuenta.
              // Listarle una por una algo que no le toca hacer se lee como tarea.
              {
                ok: conciergeListo(d.concierge),
                txt: conciergeListo(d.concierge)
                  ? T.resumenUi.cuentasListas
                  : T.resumenUi.cuentasFaltan,
                req: false,
              },
              ...(visibleNum.has(N.calendario)
                ? [{ ok: d.calendario.compartido, txt: T.resumenUi.calendario, req: false }]
                : []),
              ...(visibleNum.has(N.demo)
                ? [{ ok: d.prueba.hecha, txt: etiquetaDemo(piezas, idioma), req: false }]
                : []),
              ...(tieneWeb
                ? [
                    {
                      ok:
                        d.web.paleta.trim() !== "" ||
                        d.web.referencias.some((r) => r.url.trim() !== ""),
                      txt: T.resumenUi.estiloSitio,
                      req: false,
                    },
                  ]
                : []),
              ...(d.textos.length > 0
                ? [{ ok: d.textos.every((t) => t.estado === "aprobado"), txt: T.resumenUi.textosAprobados, req: false }]
                : []),
            ].map((r) => (
              <div key={r.txt} className="flex items-center gap-3 border-b border-[rgba(242,231,219,0.07)] py-2 text-sm last:border-none">
                <span className={r.ok ? "text-sage" : "text-mocha/75"}>{r.ok ? "✓" : "○"}</span>
                <span className={`font-light ${r.ok ? "text-sand" : "text-mocha"}`}>
                  {r.txt}
                  {r.req && !r.ok && <span className="ml-2 text-xs text-clay-bright">{T.resumenUi.faltaEsencial}</span>}
                </span>
              </div>
            ))}
          </div>
          {!nucleoListo && (
            <p className="mb-4 text-center text-sm font-light text-clay-bright">
              {T.resumenUi.completaEsenciales}
            </p>
          )}
          <div className="text-center">
            <NavBtns
              onBack={() => irA(N.equipo)}
              onNext={finalizar}
              nextEnabled={nucleoListo}
              nextLabel={T.resumenUi.enviar}
              loading={enviando} backLabel={T.ui.atras} />
          </div>
        </div>
      )}

      {/* Indicador de guardado */}
      <div className="mt-6 text-center text-xs font-light text-mocha/85" aria-live="polite">
        {chipGuardado || T.bienvenida.seGuarda}
      </div>
    </div>
  );
}
