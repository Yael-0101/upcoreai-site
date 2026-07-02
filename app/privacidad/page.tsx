import type { Metadata } from "next";
import { Legal, LegalSection } from "@/components/Legal";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = {
  title: "Política de Privacidad | Upcore AI",
  description:
    "Cómo Upcore AI recopila, usa y protege tus datos. No vendemos ni compartimos tu información.",
};

const EMAIL = "upcoreai.com@gmail.com";

export default function PrivacidadPage() {
  return (
    <Legal
      title="Política de Privacidad"
      updated="julio de 2026"
      intro="En Upcore AI respetamos tu privacidad. Esta política explica qué datos recopilamos cuando visitas nuestro sitio o nos contactas, para qué los usamos y cómo los protegemos. Nunca vendemos ni rentamos tu información."
    >
      <LegalSection title="1. Quiénes somos">
        <p>
          Upcore AI es una agencia que construye automatizaciones, agentes de
          inteligencia artificial, sitios web y paneles para clínicas privadas de
          salud y estética. Somos los responsables del tratamiento de los datos
          que nos proporcionas a través de este sitio.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué información recopilamos">
        <p>
          <strong className="font-medium text-sand">
            Datos que tú nos das:
          </strong>{" "}
          tu nombre, correo, teléfono o WhatsApp, el nombre de tu clínica y los
          detalles que compartas cuando llenas un formulario, agendas una
          videollamada o nos escribes por WhatsApp.
        </p>
        <p>
          <strong className="font-medium text-sand">Datos de uso:</strong>{" "}
          información técnica y estadística anónima del sitio (páginas vistas,
          tipo de dispositivo, aproximación de ubicación), recogida de forma
          agregada para entender y mejorar la web. No te identifican
          personalmente.
        </p>
      </LegalSection>

      <LegalSection title="3. Para qué usamos tus datos">
        <p>Usamos tu información únicamente para:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Responder tu solicitud y darte tu diagnóstico o propuesta.</li>
          <li>Prestarte y dar seguimiento al servicio que contrates.</li>
          <li>Mejorar el sitio y nuestros productos.</li>
        </ul>
        <p>
          <strong className="font-medium text-sand">
            No vendemos, rentamos ni compartimos
          </strong>{" "}
          tus datos con terceros para publicidad.
        </p>
      </LegalSection>

      <LegalSection title="4. Proveedores que nos ayudan">
        <p>
          Nos apoyamos en servicios de confianza para operar, cada uno con su
          propia política de privacidad: alojamiento y estadísticas del sitio
          (Vercel), agendado de citas (Calendly) y mensajería (la API oficial de
          WhatsApp de Meta). Solo comparten con nosotros lo necesario para prestar
          su función.
        </p>
      </LegalSection>

      <LegalSection title="5. Datos de tus pacientes">
        <p>
          Cuando construimos una solución para tu clínica, los datos de tus
          pacientes viven en <strong className="font-medium text-sand">tus
          propias cuentas</strong>, cifrados y aislados. Son tuyos: no los
          vendemos, no los mezclamos con los de otros clientes y solo los tratamos
          para operar el servicio que nos encargas, siguiendo tus instrucciones.
          Tú eres el responsable de esos datos frente a tus pacientes.
        </p>
      </LegalSection>

      <LegalSection title="6. Seguridad">
        <p>
          Tus datos y los de tus pacientes viajan cifrados y se guardan aislados
          en cuentas separadas. Aplicamos buenas prácticas de seguridad y
          limitamos los accesos a lo estrictamente necesario. Ningún sistema es
          100% infalible, pero trabajamos para proteger tu información de forma
          responsable.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          Usamos únicamente cookies esenciales para que el sitio funcione y
          medición estadística anónima. No usamos cookies de publicidad. Puedes
          bloquear o borrar las cookies desde la configuración de tu navegador.
        </p>
      </LegalSection>

      <LegalSection title="8. Tus derechos">
        <p>
          Conforme a la Ley Federal de Protección de Datos Personales en Posesión
          de los Particulares (México), tienes derecho a{" "}
          <strong className="font-medium text-sand">
            acceder, rectificar, cancelar u oponerte
          </strong>{" "}
          (derechos ARCO) al tratamiento de tus datos. Para ejercerlos, escríbenos
          a{" "}
          <a
            href={`mailto:${EMAIL}`}
            className="text-clay transition-colors hover:text-clay-bright"
          >
            {EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. Cuánto tiempo conservamos tus datos">
        <p>
          Conservamos tu información solo durante el tiempo necesario para
          atenderte y prestar el servicio, o el que exija la ley. Después la
          eliminamos o la anonimizamos.
        </p>
      </LegalSection>

      <LegalSection title="10. Cambios a esta política">
        <p>
          Podemos actualizar esta política cuando sea necesario. Publicaremos aquí
          la versión vigente con su fecha de última actualización.
        </p>
      </LegalSection>

      <LegalSection title="11. Contacto">
        <p>
          Para cualquier duda sobre esta política o tus datos, contáctanos por
          WhatsApp al{" "}
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
