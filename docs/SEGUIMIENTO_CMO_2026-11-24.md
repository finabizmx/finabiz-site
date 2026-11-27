# Seguimiento de conversión y consentimiento

Actualizado el 27 de noviembre de 2026. Se verificó el certificado de `www.finabiz.mx` y su redirección al dominio raíz. También se confirmó en GA4 una reserva de prueba creada desde la agenda directa. Los [pendientes vigentes](#pendientes-al-27-de-noviembre-de-2026) incluyen la conexión desde Telcel y la medición de reservas iniciadas en la portada.

## Conciliación histórica

Se comparó el periodo del 26 de octubre al 21 de noviembre de 2026. Para cada minuto de GA4 se identificó una reserva vigente del evento de orientación de 30 minutos y una respuesta completada de Typeform que contenía el campo de Calendly. Las horas de la tabla corresponden a America/Matamoros. Typeform y Calendly se consultaron con acceso de lectura.

| Fecha y hora | Página de GA4 | GA4 | Calendly | Typeform |
|---|---|---:|---:|---:|
| 27 de octubre, 12:43 | Ecommerce | 1 evento | 1 reserva a las 12:43:08 | 1 respuesta a las 12:43:13 |
| 9 de noviembre, 08:03 | Inicio | 1 evento | 1 reserva a las 08:03:19 | 1 respuesta a las 08:03:25 |

La correspondencia por minuto es única en la muestra y concilia los dos registros de GA4 con dos reservas de orientación. La agregación de GA4 no ofrece un identificador común. El commit histórico `875b280`, vigente en main durante ambos días, emitía `llamada_agendada` en `index.html:2966` y `contabilidad-para-ecommerce.html:483` al recibir un mensaje de envío de Typeform. El commit `8aa84ea` separó el envío y sustituyó el nombre por `formulario_completado` a partir del 21 de noviembre. Ese historial explica los registros y el motivo por el que el evento antiguo no se usa como confirmación de Calendly. Durante la prueba, el código publicado todavía carecía de un emisor de reservas hacia GA4. Las citas se verificaron en Calendly. [Origen histórico](https://github.com/finabizmx/finabiz-site/commit/875b280) · [Separación de eventos](https://github.com/finabizmx/finabiz-site/commit/8aa84ea)

La automatización visible de Typeform para envío a Notion está en estado borrador. La cuenta puede tener otras integraciones ajenas a esa lista. Los dos registros anteriores prueban que Typeform recibió respuestas y que Calendly creó reservas durante el periodo.

## Consentimiento y prueba actual

El formulario publicado exige confirmar que se consultó el aviso simplificado. La opción de recibir marketing es independiente y opcional. El ajuste `show_cookie_consent` de Typeform está desactivado. El aviso integral de Finabiz indica que el proveedor ofrece un control al abrir el formulario.

El consentimiento publicado en el PR #48 usa el modo básico. Espera una elección afirmativa antes de cargar la etiqueta, guardar la atribución o trasladarla a Typeform. La opción «Solo necesarias» deja disponible el formulario y omite la atribución opcional. El control permanente en el pie permite cambiar la preferencia. La revocación detiene los eventos posteriores en la página, elimina la atribución de sesión y borra las cookies del prefijo de GA4 de esta versión. El prefijo aísla los identificadores de otras implementaciones y puede iniciar una nueva identificación analítica para visitantes que acepten. [PR #48](https://github.com/finabizmx/finabiz-site/pull/48)

La preferencia del sitio gobierna GA4 y la atribución que el sitio añade a Typeform. Typeform y Calendly administran sus propias cookies. Falta alinear sus controles con lo que describe el aviso integral y verificar las opciones en una sesión real. [Modo básico de Google](https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic) · [Control de cookies de Typeform](https://help.typeform.com/hc/en-us/articles/6389226218132-Activate-cookie-consent)

Se verificó la bienvenida del Typeform publicado tanto por enlace directo como dentro de la portada. Después se completó la prueba autorizada «PRUEBA — NO PROSPECTO» en el iframe de producción con `utm_campaign=prueba_no_prospecto`. Se confirmó la lectura del aviso simplificado, se dejó desmarcado el marketing y se rechazaron las cookies opcionales de Calendly.

- **Calendly.** La API confirmó una reserva activa de 30 minutos con el nombre de prueba. Se creó el 24 de noviembre de 2026 a las 17:51:14, hora de Matamoros.
- **Typeform.** Se mostró la página de cita confirmada. La API devolvió una respuesta completada con el campo de Calendly a las 17:51:18 del mismo día. La consulta filtró por la campaña de prueba.
- **GA4.** Una consulta posterior devolvió `formulario_completado` a las 17:51 del 24 de noviembre, hora de Matamoros. La confirmación de la reserva para este flujo quedó registrada en Calendly. El consentimiento del sitio se comprobó con pruebas automatizadas de aceptación, revocación, enlace alternativo y atribución.

## Confirmación de Calendly en la agenda directa

`/agenda.html` puede registrar `llamada_agendada` al recibir `calendly.event_scheduled` de su propio calendario integrado, con consentimiento de analítica. El identificador de la reserva se usa en memoria para evitar duplicados. GA4 recibe el evento y la ruta saneada, sin datos de contacto ni identificadores de la reserva. Las pruebas simulan la señal oficial, una segunda entrega, fuentes distintas y la negativa de consentimiento.

La portada sigue abriendo primero el Typeform de precualificación. El formulario publicado exige tipo de actividad, rango de ventas, problema a resolver, origen, datos de contacto y lectura del aviso de privacidad antes de mostrar el calendario. En el flujo vigente, la señal de Calendly llega a Typeform y Finabiz.mx registra el envío del formulario.

Para usar el calendario integrado en Finabiz.mx desde la portada, falta validar una variante del formulario que redirija a `/agenda.html` después de recoger las mismas respuestas. La redirección está disponible en Typeform Plus o superior. La API validó su formato sin guardar cambios. La agenda admite nombre y correo en el fragmento de la URL, que el navegador no envía al servidor de GitHub Pages. El sitio retira ambos valores antes de inicializar la analítica y los usa para prellenar Calendly, incluido el enlace de respaldo. El paso siguiente requiere comprobar la redirección real y la confirmación de Calendly desde el formulario de prueba antes de cambiar los CTA públicos. [Redirecciones de Typeform](https://help.typeform.com/hc/en-us/articles/360060589532-Redirect-to-URL-or-redirect-with-End-Screens) · [Eventos del calendario integrado](https://calendly.com/help/advanced-calendly-embed-for-developers#track-actions-with-postmessage)

El 25 de noviembre se verificó que la portada muestra la primera pregunta obligatoria con la analítica rechazada. El formulario publicado identifica su plan como Free en el enlace de atribución de Typeform. La agenda independiente cargó horarios de 30 minutos. La prueba con datos ficticios detectó que Calendly interpretaba el espacio del nombre como un signo `+`. El PR #51 corrigió esa codificación y conserva los signos `+` reales del correo. [PR #51](https://github.com/finabizmx/finabiz-site/pull/51)

Calendly confirmó una reserva de prueba desde `/agenda.html` el 26 de noviembre de 2026 a las 13:26:50, hora de Matamoros. La consulta del 27 de noviembre en la propiedad Finabiz de GA4 devolvió un evento `llamada_agendada` a las 13:26 para `/agenda.html?utm_campaign=prueba_no_prospecto`. Queda verificada la medición de la agenda directa con consentimiento de analítica. [PR #50](https://github.com/finabizmx/finabiz-site/pull/50)

## Dominio y cambios editoriales

El 26 de noviembre se volvió a agregar `finabiz.mx` como dominio personalizado en GitHub Pages. El CNAME de `www` apunta a `finabizmx.github.io` y GitHub Pages reporta HTTPS obligatorio con un certificado válido para ambos nombres. Las pruebas externas por IPv4 e IPv6 confirmaron el redireccionamiento 301 de `www` a `finabiz.mx`. La ruta `/arquitectura-de-claridad-fiscal.html?origen=qa` conservó ruta y consulta y devolvió HTTP 200 al seguir la redirección. [Prueba IPv4](https://api.globalping.io/v1/measurements/2Rg5Vo1ZbU1MyzRzf00021ZsD) · [Prueba IPv6](https://api.globalping.io/v1/measurements/2dqxAU6UrhEOpp4FU00021ZsD)

En la línea Telcel probada persiste el timeout del dominio raíz en 4G y 5G, en varias ubicaciones y en movimiento, incluso con Defender desactivado. Desde la misma PC, la conexión TCP a `185.199.108.153:443` falló al compartir internet desde el iPhone y funcionó por Wi-Fi. La prueba usa la IP directamente y falla antes del intercambio TLS. También se reportó acceso exitoso desde una línea Movistar. Falta determinar la causa y el alcance en otras líneas Telcel.

El PR #49 está publicado con los metadatos de seis páginas y los cambios aprobados sobre orientación, diagnóstico y plazos. La cláusula contractual de 60 días queda para revisión legal. [PR #49](https://github.com/finabizmx/finabiz-site/pull/49)

## Pendientes al 27 de noviembre de 2026

| Prioridad | Pendiente | Criterio de cierre |
|---|---|---|
| Alta | Acceso desde Telcel | Contrastar con otra línea Telcel y obtener un diagnóstico del operador. Confirmar carga repetida del dominio raíz con los datos móviles afectados. |
| Alta | Medición de reservas desde la portada | Validar un flujo que mantenga la precualificación obligatoria antes de agendar y conciliar una reserva controlada con su evento `llamada_agendada` en GA4. La redirección automática de Typeform requiere Plus o superior. |
| Media | Privacidad y términos | Alinear el aviso integral con los controles efectivos de Typeform y Calendly. Revisar la cláusula contractual de 60 días con autorización para cualquier cambio de texto legal. |
| Media | Accesibilidad móvil | Ejecutar pruebas manuales en Safari iOS y Chrome Android con VoiceOver y TalkBack. Verificar foco, zoom, contraste y formularios. |
| Media | Indexación y rendimiento | Inspeccionar en Search Console el comparador IVA RESICO y la página de Cumplimiento y Optimización Fiscal. Medir producción con terceros activos y revisar métricas de campo cuando haya muestra suficiente. El laboratorio móvil local registró LCP de 2.73 s en Ecommerce y 2.58 s en Diagnóstico y Primer empleado, frente al objetivo de 2.5 s. |
| Media | Deuda técnica | Consolidar reglas CSS compartidas con regresión visual por componente. Los cambios de cabeceras HTTP que excedan lo configurable en GitHub Pages requieren una decisión de infraestructura. |

Ver [auditoría CMO](AUDITORIA_CMO_2026-11-24.md), [reauditoría UX/UI](REAUDITORIA_UX_UI_2026-11-23.md) y [roadmap](ROADMAP_OPTIMIZACION_WEB.md) para los criterios detallados por fase.
