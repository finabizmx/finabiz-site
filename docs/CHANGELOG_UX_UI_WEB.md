# Registro de modificaciones web

## Fases 0–1 · Reconocimiento y auditoría

- Se registró la base `26be3a9`, la secuencia real del DOM y el inventario de rutas y dependencias.
- Se revisaron los once PR #16–26 y se comparó el árbol con el sitemap. Se documentaron evidencias HTTP, deuda CSS, riesgos de reserva, accesibilidad, privacidad y dominio.
- Quedan pendientes la configuración autoritativa, las pruebas con dispositivos reales y la comprobación de la cadena de conversión.

## Fase 2 · Reserva y navegación de portada, publicada mediante [PR #28](https://github.com/finabizmx/finabiz-site/pull/28)

- WEB-01. El CTA cancela la navegación cuando se abre el widget. El diálogo nativo tiene nombre, botón de cierre, fallback visible, Escape y manejo de Atrás. Los casos sin SDK o con error conservan el enlace directo y los clics modificados mantienen el comportamiento del navegador.
- WEB-05. Se incorporó un landmark de contenido con destino de salto enfocable, orden de Tab desde el botón hacia los enlaces, menú desplazable en ventanas bajas, cierre mediante Escape y tolerancia a hash mal codificado.
- Se ajustó el nombre accesible de la marca para incluir su texto visible, la jerarquía de encabezados y el área táctil de los enlaces legales y el contraste del texto del pie. Se retiró el reveal inicial del hero para pintar el contenido sin esperar al observer.
- Se conservan el hero aprobado, los servicios y las muestras de entregables en su sección.
- Validación automatizada con `node --test --test-isolation=none --test-reporter=spec tests/homepage.test.mjs`. Cubre apertura, recuperación ante error y ausencia del SDK, clic modificado, cierre, historial, restauración de scroll, links de respaldo y fragmentos.
- Pasaron 4 pruebas de Node. En Chromium 156, con red de terceros bloqueada y un SDK de prueba, se comprobó apertura y foco del diálogo, Escape, retorno de foco, menú por teclado, acordeón y selector de ejemplos. Sin desbordamiento horizontal en 320×640, 390×844, 412×915, 844×390 y 1366×768. Con JavaScript desactivado se verificaron los seis enlaces directos y las tres muestras disponibles. Quedan por verificar Safari iOS, Chrome Android, lectores de pantalla y red móvil.
- Lighthouse móvil local, mediana de tres corridas por versión. Accesibilidad 94 → 100, rendimiento 93 → 92, LCP 2.92 → 2.98 s y CLS 0 → 0. La auditoría detalla el aislamiento de terceros, la ausencia de INP de campo y los hallazgos residuales de axe.

- Verificación de producción el 22 de noviembre de 2026. El HTML público coincidió con el blob probado en `64af69c`. Chromium con viewport de 390 × 844 cargó el SDK real, mostró la pantalla de bienvenida de Typeform dentro del diálogo y restauró foco, scroll e historial al cerrar. La analítica estuvo bloqueada durante la prueba. El envío y la confirmación de cita siguen pendientes.

## Fase 3 · Degradación progresiva y contraste de portada ([PR #29](https://github.com/finabizmx/finabiz-site/pull/29))

- WEB-05. El menú compacto ofrece sus cuatro enlaces sin JavaScript. El selector de ejemplos aparece tras inicializar sus controles. Sin scripts se conservan las tres muestras visibles y las reservas directas.
- WEB-09. El texto de duración y la etiqueta de la fase destacada usan el azul profundo de la marca sobre el fondo naranja. La etiqueta pasa de 4.11:1 a 5.55:1. Se retiraron el reveal al desplazarse y los contadores animados. Las cifras y todo el contenido permanecen visibles.
- Las acciones rápidas de contacto tienen una región con nombre. En navegadores sin IntersectionObserver, el menú sigue operativo y se mantiene la reserva en la navegación y el contenido.
- Validado con cinco pruebas de Node, Chromium en cinco tamaños y tres tamaños con JavaScript desactivado. Axe no devolvió infracciones en la vista local de 390 × 844 con movimiento reducido y terceros bloqueados; dejó contraste y algunos atributos ARIA para revisión manual.
- Lighthouse móvil local, tres corridas con terceros bloqueados. Medianas de 93 en rendimiento, 100 en accesibilidad, 2.90 s de LCP y 0 de CLS. El LCP sigue por encima del objetivo de 2.5 s y queda pendiente medir INP y rendimiento de producción.

## Fases siguientes · Estado

Pendientes la validación de proveedores y métricas reales, los ajustes de presentación, la consolidación de CSS, el bloque SEO y la implementación por familias de páginas. Los hallazgos y criterios de aceptación se conservan en [la auditoría](AUDITORIA_INTEGRAL_WEB.md) y [el roadmap](ROADMAP_OPTIMIZACION_WEB.md).

## Navegación interior y URLs canónicas

- WEB-06. Se añadió una región principal a las plantillas corporativas, servicios, blog, artículos y calculadora. Los menús interiores comparten orden de foco, cierre por Escape, estados accesibles y una versión que funciona sin JavaScript. La tabla comparativa de la calculadora admite desplazamiento por teclado. El pie compartido tiene enlaces legales más amplios y mejor contraste. Se ajustó el contraste de los rótulos de agenda y páginas legales.
- WEB-12. El sitemap y los enlaces internos apuntan directamente a Cumplimiento y Optimización Fiscal. Se conserva la redirección HTML de la URL anterior. La plantilla editorial con marcadores se conserva como archivo de texto en `docs/plantillas/`. La intención de indexación de Asesoría Fiscal Estratégica sigue pendiente de confirmación.
- Se verificaron ocho pruebas de Node, incluida la coincidencia de los 29 destinos de sitemap con sus canónicas y directivas de indexación. Chromium comprobó navegación por teclado, salto a contenido y desbordamiento en seis páginas, desplazamiento de la tabla comparativa y navegación horizontal y sin JavaScript. Queda pendiente la evaluación manual de WCAG en dispositivos reales.

## Formulario compartido, rendimiento y cabeceras declarables

- WEB-04. El formulario embebido usa un diálogo compartido, un enlace directo y el callback oficial `onSubmit` de Typeform. Se emiten por separado el clic y el envío del formulario correcto, con deduplicación por instancia y sin transferir datos de respuesta a GA4. El evento de cita requiere confirmación del proveedor o el CRM. La landing fiscal conserva su configuración de analítica existente.
- WEB-07 y WEB-08. Se centralizaron el CSS y el código de reserva repetidos en 27 páginas. Typeform y sus conexiones se aplazan hasta una interacción. Se consolidaron las variables de color y se retiró el CSS sin uso del panel antiguo de portada y su cinta oculta. Las tres fotos existentes del equipo ahora son WebP nativos con carga diferida. La portada dejó de descargar el componente de edición y su archivo de estado.
- WEB-09. El foco usa un contorno oscuro y blanco según el fondo. Se corrigieron dos grupos con nombres accesibles y se ocultó el indicador decorativo de desplazamiento bajo movimiento reducido.
- WEB-11. Se declaró por HTML una política CSP contra elementos de base y objetos embebidos, además de una política explícita de referrer. El diálogo de reserva deniega cámara y micrófono al iframe. La configuración de cookies y las cabeceras que requieren control HTTP siguen pendientes.
- Validación de 9 pruebas de Node. Chromium a 390 px comprobó apertura del formulario publicado, ausencia de solicitudes Typeform antes del clic, tamaño del iframe y cierre en portada, Arquitectura y Cumplimiento. La prueba no envió respuestas. Lighthouse móvil local, tres ejecuciones con terceros bloqueados, mediana de rendimiento 96, accesibilidad 100, SEO 100, LCP de 2.40 s y CLS de 0. Falta medir datos de campo y probar el embudo hasta la cita.

## Remodelación editorial de la página de inicio

- La portada incorpora una jerarquía tipográfica más clara, una navegación sobria y una franja editorial de capacidades. Conserva el titular aprobado, los enlaces de reserva y la identidad visual de Finabiz.
- Las entradas a Cumplimiento y Optimización Fiscal y Arquitectura de Claridad Fiscal muestran el alcance de cada oferta y enlazan a sus páginas. El catálogo de servicios específicos conserva sus áreas desplegables.
- El método se presenta como tres etapas en orden de lectura. Los ejemplos de mapa fiscal, utilidad y proyección tienen una vista de reporte y explican qué decisión facilita cada uno. Las tres muestras se leen sin scripts y llevan la indicación de datos simulados.
- Los estilos de la remodelación se cargan en inicio. Se retiraron el CSS de los bloques sustituidos y las animaciones continuas del botón y del indicador de avance. Los detalles de servicios, ejemplos y reserva se comprobaron con teclado y sin JavaScript.
- Validación con 11 pruebas de Node y Chromium en siete tamaños de ventana. Axe no reportó infracciones en la vista móvil probada y dejó contraste para revisión manual. Se comprobó el formulario real hasta su pantalla de bienvenida. Lighthouse móvil local con terceros bloqueados, mediana de 3 corridas: rendimiento 96, accesibilidad 100, LCP 2.40 s, CLS 0. La transferencia local bajó cerca de 8 kB.

## Interactividad y profundidad en inicio

- La portada incorpora capas con perspectiva CSS 3D y respuesta al cursor en pantallas de escritorio compatibles. La comparación de servicios, las etapas y los ejemplos usan animaciones breves. La preferencia de movimiento reducido desactiva las animaciones, las transiciones y el seguimiento del cursor.
- La proyección incluye barras seleccionables por mes con el contexto de ventas y utilidad. El panel de utilidad alterna entre importes y porcentajes de ventas. Ambas interacciones calculan sus valores a partir de las muestras existentes. La tabla y los importes originales siguen disponibles sin scripts.
- Pasaron 14 pruebas de Node y las pruebas de Chromium en siete tamaños. Se verificaron selección con flechas, preferencia de movimiento reducido, vista sin JavaScript, apertura del formulario real y respuesta al cursor con puntero fino emulado. Axe no reportó infracciones en la vista móvil probada y dejó contraste para revisión manual.
- Lighthouse móvil local con terceros bloqueados, mediana de tres ejecuciones consecutivas por versión. Rendimiento 97 → 96, accesibilidad 100 → 100, LCP 2.25 → 2.48 s y CLS 0 → 0. La transferencia aumentó cerca de 6.4 kB.

## Títulos del catálogo de servicios

- La tarjeta de contabilidad mensual se distingue de Cumplimiento y Optimización Fiscal. La tarjeta de cálculo de impuestos y su página usan «Cálculo de ISR e IVA», también en sus metadatos y datos estructurados.
- Se conservaron las URLs y los alcances. Pasaron las 14 pruebas de Node y se comprobó la correspondencia entre títulos, enlaces y metadatos.

## Organización del catálogo fiscal

- Cálculo de ISR e IVA se encuentra en el área de Cumplimiento fiscal. Una sola tarjeta de Cumplimiento y Optimización Fiscal explica las dos modalidades de contabilidad y enlaza a la página del servicio.
- Una prueba de regresión verifica la ubicación del cálculo y un único enlace a la oferta fiscal en el acordeón. Pasaron las 15 pruebas de Node.
