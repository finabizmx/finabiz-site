# Cabeceras HTTP del sitio público

GitHub Pages sirve Finabiz.mx. El HTML declara una política parcial con `base-uri 'none'` y `object-src 'none'`. El control `frame-ancestors` requiere una cabecera HTTP. La [regla de respuesta](../infra/cloudflare/finabiz-security-headers.json) permite aplicarla mediante Cloudflare y se entrega desactivada. La fase de la regla es `http_response_headers_transform`. [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) · [Reglas de Cloudflare](https://developers.cloudflare.com/rules/transform/response-header-modification/create-api/) · [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors)

La política limita la incrustación de páginas de Finabiz a su mismo origen y restringe los envíos de formularios del documento principal a ese origen. Typeform y Calendly gestionan sus envíos dentro de sus propios documentos. `nosniff` requiere servir los recursos con el tipo MIME correcto. La política de referencia conserva el valor del HTML y la política de permisos desactiva cámara, micrófono y geolocalización, que el sitio público no solicita. Una lista de orígenes de scripts exigiría una revisión separada de las dependencias y del código en línea.

## Validación del 27 de noviembre de 2026

Una vista previa local aplicó los valores de la regla a ocho respuestas. Se verificaron la portada, la agenda, el comparador de IVA, CSS, JavaScript, un módulo, el PDF y una URL inexistente. Chromium bloqueó una incrustación desde otro origen y permitió la del mismo origen en dos páginas de prueba. En producción se comprobó que el CSS, los scripts y el PDF se sirven con sus tipos MIME correspondientes. La comprobación de Typeform, Calendly y analítica a través del proxy queda para la activación controlada.

## Activación con aprobación de infraestructura

1. Exportar la zona DNS de GoDaddy y registrar los valores activos, incluidos MX, TXT, CAA y DNSSEC cuando existan. Comparar los valores con los de Cloudflare antes de delegar la administración DNS. GoDaddy puede seguir siendo el registrador y GitHub Pages el alojamiento.
2. Validar `finabiz.mx` y `www.finabiz.mx` antes de activar el proxy. Comprobar el certificado del origen y usar SSL/TLS **Full (strict)**. Verificar el certificado en el borde y el comportamiento de la renovación del certificado de GitHub Pages.
3. Agregar la regla como una entrada nueva y probarla antes de habilitarla. Conservar las demás reglas de respuesta. Comprobar las cabeceras en la portada, agenda, calculadoras y una respuesta 404. Verificar también CSS y JavaScript con `nosniff`, apertura de Typeform, calendario, descarga del PDF y consentimiento de analítica.
4. Confirmar que `www` redirige por HTTPS y conserva rutas y consultas. Comprobar correo entrante y saliente y comparar el acceso al dominio raíz por Wi-Fi y datos móviles.

Si hay una regresión de cabeceras, desactivar la regla. Si la regresión corresponde al proxy, volver a DNS Only y verificar el origen. La reversión de una delegación DNS requiere la configuración original de GoDaddy y la ventana de propagación. [Requisitos del proxy](https://developers.cloudflare.com/rules/transform/) · [Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/)
