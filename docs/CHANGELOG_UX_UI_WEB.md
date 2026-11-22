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

## Fase 3 · Degradación progresiva y contraste de portada

- WEB-05. El menú compacto ofrece sus cuatro enlaces sin JavaScript. El selector de ejemplos aparece tras inicializar sus controles. Sin scripts se conservan las tres muestras visibles y las reservas directas.
- WEB-09. El texto de duración de la fase destacada usa el azul profundo de la marca. Se retiraron el reveal al desplazarse y los contadores animados. Las cifras y todo el contenido permanecen visibles.
- Las acciones rápidas de contacto tienen una región con nombre. En navegadores sin IntersectionObserver, el menú sigue operativo y se mantiene la reserva en la navegación y el contenido.
- Validado con cinco pruebas de Node, Chromium en cinco tamaños y tres tamaños con JavaScript desactivado. Axe no devolvió infracciones en la vista local de 390 × 844 con movimiento reducido y terceros bloqueados; dejó contraste y algunos atributos ARIA para revisión manual.

## Fases siguientes · Estado

Pendientes la validación de proveedores y métricas reales, los ajustes de presentación, la consolidación de CSS, el bloque SEO y la implementación por familias de páginas. Los hallazgos y criterios de aceptación se conservan en [la auditoría](AUDITORIA_INTEGRAL_WEB.md) y [el roadmap](ROADMAP_OPTIMIZACION_WEB.md).
