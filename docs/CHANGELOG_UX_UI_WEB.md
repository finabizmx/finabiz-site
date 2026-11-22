# Registro de modificaciones web

## Fases 0–1 · Reconocimiento y auditoría

- Se registró la base `26be3a9`, la secuencia real del DOM y el inventario de rutas y dependencias.
- Se revisaron los once PR #16–26 y se comparó el árbol con el sitemap. Se documentaron evidencias HTTP, deuda CSS, riesgos de reserva, accesibilidad, privacidad y dominio.
- Quedan pendientes la configuración autoritativa, las pruebas con dispositivos reales y la comprobación de la cadena de conversión.

## Fase 2 · Reserva y navegación de portada, propuesta en PR independiente

- WEB-01. El CTA cancela la navegación cuando se abre el widget. El diálogo nativo tiene nombre, botón de cierre, fallback visible, Escape y manejo de Atrás. Los casos sin SDK o con error conservan el enlace directo y los clics modificados mantienen el comportamiento del navegador.
- WEB-05. Se incorporó un landmark de contenido con destino de salto enfocable, orden de Tab desde el botón hacia los enlaces, menú desplazable en ventanas bajas, cierre mediante Escape y tolerancia a hash mal codificado.
- Se conservan el hero aprobado, los servicios y las muestras de entregables en su sección.
- Validación automatizada con `node --test --test-isolation=none --test-reporter=spec tests/homepage.test.mjs`. Cubre apertura, recuperación ante error y ausencia del SDK, clic modificado, cierre, historial, restauración de scroll, links de respaldo y fragmentos.
- Pasaron 4 pruebas de Node. En Chromium 156, con red de terceros bloqueada y un SDK de prueba, se comprobó apertura y foco del diálogo, Escape, retorno de foco, menú por teclado, acordeón y selector de ejemplos. Sin desbordamiento horizontal en 320×640, 390×844, 412×915, 844×390 y 1366×768. Quedan por verificar el flujo productivo real de reserva y el comportamiento con Safari iOS, Chrome Android, lector de pantalla y red móvil.

## Fases 3–7 · Estado

Pendientes la validación de proveedores y métricas reales, los ajustes de presentación, la consolidación de CSS, el bloque SEO y la implementación por familias de páginas. Los hallazgos y criterios de aceptación se conservan en [la auditoría](AUDITORIA_INTEGRAL_WEB.md) y [el roadmap](ROADMAP_OPTIMIZACION_WEB.md).
