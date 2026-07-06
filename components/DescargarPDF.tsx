"use client";

// Botón "Descargar PDF" de la propuesta: usa la impresión nativa del navegador
// (el cliente elige "Guardar como PDF"). Los estilos @media print de globals.css
// convierten la página oscura en un documento claro imprimible.
export function DescargarPDF() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-full border border-[rgba(242,231,219,0.25)] px-6 py-2.5 text-sm font-semibold text-mocha transition-colors hover:border-clay hover:text-clay"
    >
      📄 Descargar en PDF
    </button>
  );
}
