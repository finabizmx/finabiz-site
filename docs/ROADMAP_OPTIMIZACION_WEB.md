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

## Reauditoría UX/UI del 23 de noviembre de 2026

Ver [diagnóstico y criterios de aceptación por hallazgo](REAUDITORIA_UX_UI_2026-11-23.md). La base actual es el merge del PR #42 en producción. La línea base anterior permanece como registro histórico.

| Orden | Bloque para PR | Dependencia | Aceptación transversal |
| --- | --- | --- | --- |
| 1 · P1 | Foco y contraste compartidos (UX-01, UX-05) | Estados iniciales y de desplazamiento de cada familia | Ningún control invisible recibe foco. Contraste medido de al menos 4.5:1 para texto normal sobre cada fondo probado. |
| 2 · P1 | Validación y estados de calculadora (UX-02) | Escenarios fiscales de referencia aprobados para cambios de motor | Entrada inválida bloquea el resultado. Error y resultado son visibles y accesibles. La versión de referencia mantiene sus escenarios válidos. |
| 3 · P1 | Coherencia de oferta, agenda y dominio (UX-03, UX-04, WEB-02) | Validación comercial y del titular, inventario de URL externas y pruebas de proveedores. Para www, acceso y aprobación DNS | Cada página presenta únicamente el alcance aplicable. Duración concordante entre páginas y proveedor. Variante www conserva ruta y consulta y entrega HTTPS. |
| 4 · P2 | Navegación compartida y contacto móvil (UX-06, UX-08) | Validación del foco anterior y selección de estructura por familia | Menús consistentes y accesibles, contacto alternativo localizable en móvil y acceso legal desde las entradas comerciales. |
| 5 · P2 | Ritmo editorial de inicio, ofertas y fichas (UX-07, UX-09, UX-15) | Copy aprobado y capturas base por familia | Hero aprobado intacto, ejemplos separados, CTA y siguiente paso claros a 320–430 px. Cada área conserva los enlaces revisados en PR #39–42. |
| 6 · P2 | Editorial, legal y herramientas (UX-10 a UX-13) | Plantillas estabilizadas y revisión de rutas heredadas. Aprobación para texto legal | Artículos con índice cuando corresponda, tablas operables con nombre e indicador de scroll, retorno desde herramientas y lectura legal coherente. |
| 7 · P2 | Consolidación, rendimiento y validación de conversión (UX-14, UX-16) | Capturas y cobertura de estados, acceso de QA a proveedores | Refactor con pruebas visuales por estados, mediciones móvil y escritorio comparables, prueba autorizada hasta recepción de lead y confirmación de cita. |

En cada PR probar los cinco tamaños auditados, teclado, foco, movimiento reducido y la salida sin JavaScript que corresponda. Priorizar Safari iOS y Chrome Android físicos, además de VoiceOver y TalkBack, para cerrar los hallazgos de accesibilidad. Mantener GitHub Pages y evitar dependencias nuevas para estos ajustes.
