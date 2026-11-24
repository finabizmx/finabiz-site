# Seguimiento de conversión y consentimiento

## Conciliación histórica

Se comparó el periodo del 26 de octubre al 21 de noviembre de 2026. Para cada minuto de GA4 se identificó una reserva vigente del evento de orientación de 30 minutos y una respuesta completada de Typeform que contenía el campo de Calendly. Las horas de la tabla corresponden a America/Matamoros. Typeform y Calendly se consultaron con acceso de lectura.

| Fecha y hora | Página de GA4 | GA4 | Calendly | Typeform |
|---|---|---:|---:|---:|
| 27 de octubre, 12:43 | Ecommerce | 1 evento | 1 reserva a las 12:43:08 | 1 respuesta a las 12:43:13 |
| 9 de noviembre, 08:03 | Inicio | 1 evento | 1 reserva a las 08:03:19 | 1 respuesta a las 08:03:25 |

La correspondencia temporal es única en la muestra. Los dos registros de GA4 quedan conciliados operativamente con dos reservas de orientación. La agregación disponible no ofrece un identificador común y el código del sitio no emite `llamada_agendada`. Sigue pendiente identificar su origen en GA4 Admin, una integración o una versión previa de la etiqueta. `formulario_completado` continúa como una señal separada.

La automatización visible de Typeform para envío a Notion está en estado borrador. La cuenta puede tener otras integraciones ajenas a esa lista. Los dos registros anteriores prueban que Typeform recibió respuestas y que Calendly creó reservas durante el periodo.

## Consentimiento y prueba actual

El formulario publicado exige confirmar que se consultó el aviso simplificado. La opción de recibir marketing es independiente y opcional. El ajuste `show_cookie_consent` de Typeform está desactivado, aun cuando el aviso integral de Finabiz remite al control que el proveedor mostraría al abrir el formulario. La versión en producción del sitio carga GA4 sin presentar una preferencia de analítica de primera parte.

El candidato del PR #48 usa el modo básico. Espera una elección afirmativa antes de cargar la etiqueta, guardar la atribución o trasladarla a Typeform. La opción «Solo necesarias» deja disponible el formulario y omite la atribución opcional. El control permanente en el pie permite cambiar la preferencia. La revocación detiene los eventos posteriores en la página, elimina la atribución de sesión y borra las cookies del prefijo de GA4 de esta versión. El prefijo aísla los identificadores de otras implementaciones y puede iniciar una nueva identificación analítica para visitantes que acepten.

La preferencia del sitio gobierna GA4 y la atribución que el sitio añade a Typeform. Typeform y Calendly administran sus propias cookies. Antes de publicar, hay que alinear el aviso y la configuración del proveedor y comprobar ambos resultados en una sesión real. El cambio del sitio está en una rama de GitHub. [Modo básico de Google](https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic) · [Control de cookies de Typeform](https://help.typeform.com/hc/en-us/articles/6389226218132-Activate-cookie-consent)

En navegador se verificó la bienvenida del Typeform publicado tanto por enlace directo como dentro de la portada. El iframe mostró «Comenzar formulario» y recibió `utm_campaign=prueba_no_prospecto`. La prueba visual terminó antes de iniciar el formulario. El envío controlado requiere un correo y un teléfono de prueba de Finabiz, que el formulario solicita antes de Calendly. El nombre debe indicar «PRUEBA — NO PROSPECTO». Mantener desmarcado el marketing y verificar la respuesta y la reserva por separado. Documentar el intervalo y retirar la reserva si se autorizó hacerlo, sin borrar registros de terceros. Las pruebas automatizadas ejercitan el consentimiento, la revocación, el enlace alternativo y la atribución sin notificar a nadie.

## Dominio y cambios editoriales

`www.finabiz.mx` sigue devolviendo 404 en la ruta interior probada. El panel de GoDaddy requiere iniciar sesión. Al contar con acceso, conservar una captura de los registros y del reenvío vigentes, mantener el dominio raíz y comprobar el CNAME de `www` hacia `finabizmx.github.io` conforme a la configuración del sitio. Los registros MX y TXT quedan fuera del cambio. La prueba posterior debe incluir la redirección HTTPS de la portada y de una ruta interior con consulta. Cualquier ajuste se puede revertir con la configuración capturada. [Dominios personalizados en GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)

El PR #49 aplica los metadatos de seis páginas y los cambios aprobados sobre orientación, diagnóstico y plazos. La cláusula de 60 días, los avisos y las fórmulas se conservan. El PR #49 se compara con la rama del #48.
