# Seguimiento de conversión y consentimiento

## Conciliación histórica

Se comparó el periodo del 26 de octubre al 21 de noviembre de 2026. Para cada minuto de GA4 se identificó una reserva vigente del evento de orientación de 30 minutos y una respuesta completada de Typeform que contenía el campo de Calendly. Las horas de la tabla corresponden a America/Matamoros. Typeform y Calendly se consultaron con acceso de lectura.

| Fecha y hora | Página de GA4 | GA4 | Calendly | Typeform |
|---|---|---:|---:|---:|
| 27 de octubre, 12:43 | Ecommerce | 1 evento | 1 reserva a las 12:43:08 | 1 respuesta a las 12:43:13 |
| 9 de noviembre, 08:03 | Inicio | 1 evento | 1 reserva a las 08:03:19 | 1 respuesta a las 08:03:25 |

La correspondencia por minuto es única en la muestra y concilia los dos registros de GA4 con dos reservas de orientación. La agregación de GA4 no ofrece un identificador común. El commit histórico `875b280`, vigente en main durante ambos días, emitía `llamada_agendada` en `index.html:2966` y `contabilidad-para-ecommerce.html:483` al recibir un mensaje de envío de Typeform. El commit `8aa84ea` separó el envío y sustituyó el nombre por `formulario_completado` a partir del 21 de noviembre. Ese historial explica los registros y el motivo por el que el evento antiguo no se usa como confirmación de Calendly. Durante la prueba, el código publicado todavía carecía de un emisor de reservas hacia GA4. Las citas se verificaron en Calendly. [Origen histórico](https://github.com/finabizmx/finabiz-site/commit/875b280) · [Separación de eventos](https://github.com/finabizmx/finabiz-site/commit/8aa84ea)

La automatización visible de Typeform para envío a Notion está en estado borrador. La cuenta puede tener otras integraciones ajenas a esa lista. Los dos registros anteriores prueban que Typeform recibió respuestas y que Calendly creó reservas durante el periodo.

## Consentimiento y prueba actual

El formulario publicado exige confirmar que se consultó el aviso simplificado. La opción de recibir marketing es independiente y opcional. El ajuste `show_cookie_consent` de Typeform está desactivado, aun cuando el aviso integral de Finabiz remite al control que el proveedor mostraría al abrir el formulario. La versión en producción del sitio carga GA4 sin presentar una preferencia de analítica de primera parte.

El candidato del PR #48 usa el modo básico. Espera una elección afirmativa antes de cargar la etiqueta, guardar la atribución o trasladarla a Typeform. La opción «Solo necesarias» deja disponible el formulario y omite la atribución opcional. El control permanente en el pie permite cambiar la preferencia. La revocación detiene los eventos posteriores en la página, elimina la atribución de sesión y borra las cookies del prefijo de GA4 de esta versión. El prefijo aísla los identificadores de otras implementaciones y puede iniciar una nueva identificación analítica para visitantes que acepten.

La preferencia del sitio gobierna GA4 y la atribución que el sitio añade a Typeform. Typeform y Calendly administran sus propias cookies. Antes de publicar, hay que alinear el aviso y la configuración del proveedor y comprobar ambos resultados en una sesión real. El cambio del sitio está en una rama de GitHub. [Modo básico de Google](https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic) · [Control de cookies de Typeform](https://help.typeform.com/hc/en-us/articles/6389226218132-Activate-cookie-consent)

Se verificó la bienvenida del Typeform publicado tanto por enlace directo como dentro de la portada. Después se completó la prueba autorizada «PRUEBA — NO PROSPECTO» en el iframe de producción con `utm_campaign=prueba_no_prospecto`. Se confirmó la lectura del aviso simplificado, se dejó desmarcado el marketing y se rechazaron las cookies opcionales de Calendly.

- **Calendly.** La API confirmó una reserva activa de 30 minutos con el nombre de prueba. Se creó el 24 de noviembre de 2026 a las 17:51:14, hora de Matamoros.
- **Typeform.** Se mostró la página de cita confirmada. La API devolvió una respuesta completada con el campo de Calendly a las 17:51:18 del mismo día. La consulta filtró por la campaña de prueba.
- **GA4.** En la consulta inmediata todavía no se devolvieron eventos para la campaña. La confirmación de ambos proveedores es la evidencia de esta prueba. La implementación de consentimiento de este PR sigue en revisión y se comprobó con pruebas automatizadas de aceptación, revocación, enlace alternativo y atribución.

## Confirmación de Calendly en la agenda directa

`/agenda.html` puede registrar `llamada_agendada` al recibir `calendly.event_scheduled` de su propio calendario integrado, con consentimiento de analítica. El identificador de la reserva se usa en memoria para evitar duplicados. GA4 recibe el evento y la ruta saneada, sin datos de contacto ni identificadores de la reserva. Las pruebas simulan la señal oficial, una segunda entrega, fuentes distintas y la negativa de consentimiento.

El botón principal sigue abriendo Typeform. En ese recorrido Calendly envía la confirmación a su iframe padre, por lo que el sitio por sí solo puede medir el envío de Typeform. La cuenta de Finabiz usa Calendly Free. La integración nativa con GA4 requiere un plan compatible y agrega otros eventos de agenda a nivel de cuenta. Una activación de ese alcance requiere aprobación específica y comprobación del consentimiento de los visitantes. [Eventos del calendario integrado](https://calendly.com/help/advanced-calendly-embed-for-developers#track-actions-with-postmessage) · [Integración nativa con GA4](https://calendly.com/help/calendly-google-analytics)

## Dominio y cambios editoriales

`www.finabiz.mx` sigue devolviendo 404 en la ruta interior probada. El panel de GoDaddy requiere iniciar sesión. Al contar con acceso, conservar una captura de los registros y del reenvío vigentes, mantener el dominio raíz y comprobar el CNAME de `www` hacia `finabizmx.github.io` conforme a la configuración del sitio. Los registros MX y TXT quedan fuera del cambio. La prueba posterior debe incluir la redirección HTTPS de la portada y de una ruta interior con consulta. Cualquier ajuste se puede revertir con la configuración capturada. [Dominios personalizados en GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)

El PR #49 aplica los metadatos de seis páginas y los cambios aprobados sobre orientación, diagnóstico y plazos. La cláusula de 60 días, los avisos y las fórmulas se conservan. El PR #49 se compara con la rama del #48.
