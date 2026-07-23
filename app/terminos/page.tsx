import type { Metadata } from "next";
import { Legal, LegalSection } from "@/components/Legal";
import { CONTACT } from "@/lib/content";
import { metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  title: "Términos de Servicio",
  description:
    "Los términos que rigen el uso del sitio y los servicios de Upcore AI.",
  path: "/terminos",
});

const EMAIL = "upcoreai.com@gmail.com";

export default function TerminosPage() {
  return (
    <Legal
      title="Términos de Servicio"
      updated="julio de 2026"
      intro="Estos términos rigen el uso de este sitio y de los servicios de Upcore AI. Al navegar el sitio o contratarnos, aceptas lo aquí descrito. Están escritos para ser claros y justos para ambas partes."
    >
      <LegalSection title="1. Quiénes somos y qué ofrecemos">
        <p>
          Upcore AI es una agencia que diseña y construye automatizaciones,
          agentes de inteligencia artificial, sitios web y paneles a la medida,
          enfocada en clínicas privadas de salud y estética. Este sitio es
          informativo y un canal de contacto.
        </p>
      </LegalSection>

      <LegalSection title="2. Propuestas, precios y la calculadora">
        <p>
          Los precios, rangos y resultados de la calculadora de este sitio son{" "}
          <strong className="font-medium text-sand">
            estimaciones orientativas
          </strong>
          , no una oferta vinculante. El precio y el alcance definitivos se
          acuerdan por escrito en tu propuesta, tras un diagnóstico. Cada proyecto
          se cotiza de forma personalizada.
        </p>
      </LegalSection>

      <LegalSection title="3. Todo lo que construimos es tuyo">
        <p>
          Lo que desarrollamos para ti vive en{" "}
          <strong className="font-medium text-sand">tus propias cuentas e
          infraestructura</strong>{" "}
          (dominio, hosting, servidores, APIs) y es de tu propiedad. Si eliges el
          plan Gestionado, conservamos un acceso acotado, documentado y revocable
          únicamente para operarlo y mantenerlo por ti.
        </p>
      </LegalSection>

      <LegalSection title="4. Pagos y costos">
        <p>
          El proyecto se acuerda con un anticipo y el saldo según lo pactado en tu
          propuesta. Los{" "}
          <strong className="font-medium text-sand">costos variables</strong>{" "}
          (APIs de inteligencia artificial, mensajería de WhatsApp, hosting y
          servicios de terceros) corren por cuenta del cliente, a su nombre y con
          su medio de pago. La mensualidad del plan Gestionado, cuando aplica,
          corresponde al servicio de operación y mantenimiento, no a esos costos
          variables.
        </p>
      </LegalSection>

      <LegalSection title="5. Responsabilidades del cliente">
        <ul className="list-disc space-y-1 pl-5">
          <li>Proporcionar información veraz y los accesos necesarios.</li>
          <li>
            Resguardar sus credenciales de forma segura (nunca se comparten por
            chat).
          </li>
          <li>
            Usar el servicio conforme a la ley, incluyendo el manejo responsable
            de los datos de sus pacientes.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Garantía y resultados">
        <p>
          Prestamos nuestros servicios con diligencia profesional. Cuando ofrezcamos
          una garantía de resultados, quedará por escrito en tu propuesta con sus
          condiciones. Las estimaciones de ahorro o retorno son proyecciones de
          buena fe basadas en datos del sector, no una promesa de resultados
          individuales, que dependen de cada clínica.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitación de responsabilidad">
        <p>
          En la medida que permita la ley, Upcore AI no será responsable por daños
          indirectos o pérdidas derivadas del uso o la imposibilidad de uso del
          sitio o de servicios de terceros. La parte informativa de este sitio se
          ofrece “tal cual”, sin garantías de disponibilidad ininterrumpida.
        </p>
      </LegalSection>

      <LegalSection title="8. Propiedad intelectual del sitio">
        <p>
          La marca Upcore AI, el diseño y el contenido de este sitio son de nuestra
          propiedad. No se permite su reproducción sin autorización. (Esto no
          afecta lo que construimos para ti, que es tuyo — ver punto 3.)
        </p>
      </LegalSection>

      <LegalSection title="9. Cambios y disponibilidad">
        <p>
          Podemos modificar o descontinuar el sitio, así como actualizar estos
          términos. Publicaremos aquí la versión vigente con su fecha.
        </p>
      </LegalSection>

      <LegalSection title="10. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de los Estados Unidos Mexicanos.
          Cualquier controversia se resolverá ante los tribunales competentes de
          México.
        </p>
      </LegalSection>

      <LegalSection title="11. Contacto">
        <p>
          Para cualquier duda sobre estos términos, contáctanos por WhatsApp al{" "}
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="text-clay transition-colors hover:text-clay-bright"
          >
            {CONTACT.whatsappDisplay}
          </a>{" "}
          o al correo{" "}
          <a
            href={`mailto:${EMAIL}`}
            className="text-clay transition-colors hover:text-clay-bright"
          >
            {EMAIL}
          </a>
          .
        </p>
      </LegalSection>
    </Legal>
  );
}
