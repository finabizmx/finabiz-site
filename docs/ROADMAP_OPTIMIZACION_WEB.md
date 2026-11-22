# Roadmap de optimización web

| Fase | Prioridad y bloque | Dependencias | Criterio de aceptación |
| --- | --- | --- | --- |
| 0 | Inventario, historial y línea base versionada | GitHub y DNS público | Inventario de 35 HTML y revisión de PR #16–26 vinculados al SHA base. |
| 1 | Auditoría por hallazgo y evidencia | Lectura de GitHub, acceso público y QA | Matriz con impactos, responsables de decisiones y límites de comprobación. |
| 2 | WEB-01 y WEB-05 en portada. Evaluar WEB-02–04 en paralelo | Pruebas de navegador. Aprobación para DNS, privacidad, duración y cambios de medición | Reserva funciona con y sin SDK, foco correcto y un clic no abre dos destinos. Prueba de Telcel y verificación del embudo en una ventana acordada. |
| 3 | WEB-09 y WEB-10. Conversión y legibilidad | Aprobación de mensajes y respaldo de afirmaciones | Un propósito por sección, estados visibles y sin restricciones táctiles en 320–430 px y horizontal. |
| 4 | WEB-07. Consolidación de CSS y scripts | Capturas y estilos computados de referencia | Reducir duplicación por componente. Mantener snapshots y orden de cascada. Separar PR de refactor del visual. |
| 5 | WEB-08, WEB-11 y WEB-12. SEO, seguridad y rendimiento | Medición reproducible, intención de indexación y control de infraestructura para cabeceras | Sitemap y canonicals consistentes. Sin regresiones de reservas. Comparar medianas Lighthouse y datos de campo si existen. |
| 6 | WEB-06. Arquitectura, servicios, firma y contacto, legal, blog, herramientas | Portada estable y validación de plantillas | Landmarks y navegación coherentes. Verificar estados móviles y CTA por familia. Cambios sustantivos legales sujetos a aprobación. |
| 7 | QA y entrega | Chromium, Safari iOS, Android, VoiceOver/TalkBack y validación controlada de lead | Pruebas reproducibles, evidencia de carga y cita, riesgos residuales documentados y PR verificables. |

Los objetivos son Lighthouse 90+ en rendimiento y 95+ en las demás categorías, LCP ≤ 2.5 s, CLS ≤ 0.1 e INP ≤ 200 ms. Registrar CWV de campo por percentil 75 cuando exista muestra suficiente. Comparar laboratorio antes y después por ruta y dispositivo con el mismo perfil. En GitHub Pages, una modificación de bordes HTTP o DNS requiere aprobación y un procedimiento de reversión explícito.

Para reproducir la incidencia móvil, registrar fecha, URL, iOS, versión de Defender, red y mensaje, y comparar Wi-Fi frente a Telcel con VPN activada y desactivada. Contrastar DNS, TLS y redirecciones de raíz y www en la misma ventana. Confirmar registros autoritativos NS, CNAME, A y AAAA antes de proponer cambios.

La validación de reservas debe comprobar por separado apertura, consentimiento, finalización de Typeform, recepción del lead y confirmación Calendly. Usar un registro de prueba acordado para evitar confundir los datos comerciales. Consultar GA4 solo para verificar eventos existentes y su definición.

Prioridad de aprobación: reenvío HTTPS de www, datos personales en URLs de agenda, duración y afirmaciones comerciales. Revisar servicios e interiores en PR separados por familia después de validar la portada.

## Verificación de la corrección del dominio (WEB-02)

Antes de cambiar el reenvío de `www`, confirmar en GitHub Pages que el dominio personalizado es `finabiz.mx`, revisar la validación TLS y guardar la configuración actual de DNS y reenvío. El destino previsto para un CNAME de Pages es `finabizmx.github.io` si coincide con la configuración vigente de la cuenta. Los registros del dominio raíz deben conservarse. El cambio requiere acceso a GoDaddy y aprobación.

Aceptar la corrección cuando `https://www.finabiz.mx/` y una ruta interior con consulta redirijan a la URL HTTPS correspondiente. Comprobar tanto HTTP como HTTPS y al menos dos resolutores. Si la ruta deja de resolver o el certificado no cubre `www`, restaurar los registros y el reenvío guardados. La prueba de Telcel con Defender requiere un dispositivo o evidencia independiente.
