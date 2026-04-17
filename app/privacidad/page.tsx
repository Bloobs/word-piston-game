import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Política de Privacidad - PalabraMaster",
  description: "Política de privacidad y uso de cookies en PalabraMaster",
}

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="text-primary hover:underline text-sm font-medium">
          &larr; Volver al juego
        </Link>
        
        <h1 className="text-3xl font-bold tracking-tight mt-6">Política de Privacidad y Cookies</h1>
        <p className="text-muted-foreground text-sm">Última actualización: Abril de 2026</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Información General</h2>
            <p>
              En PalabraMaster (en adelante, "el sitio web" o "la aplicación"), respetamos tu privacidad y estamos comprometidos a proteger los datos de nuestros usuarios. Esta política explica cómo recopilamos, usamos y protegemos la información cuando visitas nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Datos que recopilamos</h2>
            <p>
              PalabraMaster no requiere registro ni recopila datos personales directamente (como nombres, correos electrónicos o direcciones). Todo el progreso del juego se guarda de forma local en tu navegador (Local Storage).
            </p>
            <p className="mt-2">
              Sin embargo, utilizamos servicios de terceros que pueden recopilar información anónima sobre tu dispositivo, dirección IP, y comportamiento de navegación:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Vercel Analytics:</strong> Para medir el tráfico y rendimiento del sitio de forma anónima.</li>
              <li><strong>Google AdSense:</strong> Para mostrar anuncios publicitarios que financian el mantenimiento del juego.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Uso de Cookies y Google AdSense</h2>
            <p>
              Nuestro sitio web utiliza cookies (pequeños archivos de texto que se guardan en tu navegador) para mejorar la experiencia de usuario y mostrar publicidad relevante.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Los proveedores de terceros, incluido Google, utilizan cookies para mostrar anuncios relevantes basándose en las visitas anteriores de un usuario a este sitio web o a otros sitios web.</li>
              <li>El uso de cookies de publicidad permite a Google y a sus socios mostrar anuncios basados en las visitas realizadas por los usuarios a este sitio o a otros sitios web de Internet.</li>
              <li>Puedes inhabilitar la publicidad personalizada en cualquier momento visitando la <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Configuración de anuncios de Google</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Derechos del usuario (RGPD)</h2>
            <p>
              Si te encuentras en el Espacio Económico Europeo (EEE), tienes derecho a aceptar, rechazar o configurar el uso de cookies no esenciales a través del banner de consentimiento que aparece al entrar en la web. Puedes cambiar tus preferencias en cualquier momento borrando las cookies de tu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Contacto</h2>
            <p>
              Si tienes alguna duda sobre esta Política de Privacidad o sobre el funcionamiento del juego, puedes contactarnos enviando un correo electrónico a: <strong>bioritualnature@gmail.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
