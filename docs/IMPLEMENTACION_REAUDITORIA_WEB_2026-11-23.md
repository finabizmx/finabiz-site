# Implementación de la reauditoría del sitio

23 de noviembre de 2026. Referencia de hallazgos y criterios en la [reauditoría UX/UI](https://github.com/finabizmx/finabiz-site/pull/43).

| Hallazgo | Implementación | Validación o dependencia |
| --- | --- | --- |
| UX-01, UX-05 | El acceso flotante oculto deja el orden de tabulación. Migas, etiquetas y metadatos pequeños de los encabezados interiores usan colores claros sobre el fondo azul. | Chromium a 390×844 y pruebas de reflujo. El estado visible se conserva mientras el enlace tenga foco. |
| UX-02 | El comparador ISR 2026 bloquea cifras fuera de rango, indica errores y enlaza el resultado. El comparador IVA 2027 tiene su propia URL, fuentes y escenarios. | Ejemplos con y sin acreditamiento, tasa 0%, saldos, retenciones, importaciones y límites de RESICO. |
| UX-03 | Las fichas puntuales y los artículos explican qué sigue según su contexto. El compromiso integral se conserva en su oferta. La asesoría de pago y Trámites ante el SAT requieren aprobación específica para ajustar su presentación. | Eliminar atribuciones genéricas no cambia las condiciones escritas de la propuesta. Mantener la validación comercial de tarifas o afirmaciones que se publiquen en el futuro. |
| UX-04 | Agenda muestra 30 minutos, enlace directo al comienzo, alternativa si el proveedor falla e inicialización explícita del widget. Se conserva la depuración de parámetros personales antes de GA. | Pruebas con y sin SDK. La API de Calendly confirma que el evento enlazado está activo y dura 30 minutos. Queda validar una reserva de punta a punta. |
| UX-06, UX-07, UX-08, UX-09, UX-15 | Menú coherente, salto de foco interno, ficha fiscal con accesos legales, portada más breve, contacto móvil con WhatsApp, encabezados interiores compactos y tarjetas con copy más directo. | Chromium probó cinco tamaños entre 320 y 1366 px. En 390×844, Inicio pasó de 17,133 a 13,656 px. A 320×640, el CTA de Diagnóstico pasó de y=788 a y=616. Se conserva el hero aprobado y el efecto 3D de portada. |
| UX-10, UX-11 | Regiones de tablas con nombre y ayuda al desbordar, blog por tema, índice en dos artículos largos y servicio relacionado por artículo. | Los 11 artículos conservan sus enlaces. Las regiones de tablas admiten foco y flechas. |
| UX-12, UX-13 | Herramientas con enlaces de retorno y explicación sin scripts. Aviso simplificado con tipografía de marca y salto al contenido. Los ajustes del comparador legado, aviso integral y términos requieren aprobación específica. | El texto legal del aviso simplificado coincide antes y después. Confirmar enlaces externos antes de retirar el comparador legado. |
| UX-14 | Hoja de estilo del aviso simplificado, navegación centralizada y retirada de fuentes anteriores duplicadas en los interiores incluidos. | Mantener revisión de cobertura CSS por estados antes de retirar otras reglas. |
| UX-16 | Eliminación de la opción que ocultaba el banner del Calendly heredado. Se conserva la separación de clic y envío en Typeform. La configuración publicada del formulario marca como obligatorios la aceptación del aviso de privacidad y el paso de Calendly. El banner de cookies de Typeform figura desactivado. | La recepción de leads y citas requiere una transacción de prueba autorizada, acceso al proveedor y revisión del consentimiento externo. |
| WEB-02 | Requiere control del DNS y de la redirección de www. | Validar destino y conservar ruta y consulta en HTTPS antes de modificar registros. |

## Cambios sujetos a aprobación

El registro de GitHub bloqueó la subida de cinco archivos. Los cambios de presentación se retiraron de la propuesta: asesoría de pago, trámites ante el SAT, comparador legado, aviso de privacidad integral y términos. Los archivos contienen tarifas, un enlace de pago, afirmaciones tributarias específicas o contenido legal. En la rama de trabajo se verificó que el texto principal de los documentos legales era idéntico antes y después de los ajustes visuales.

## Validación integrada

La combinación de los tres bloques pasó 22 pruebas automatizadas. Chromium verificó 34 páginas de contenido en cinco tamaños, 170 combinaciones sin desbordamiento horizontal de documento. Las pruebas de Axe se ejecutaron a 390×844 con dependencias externas bloqueadas. La revisión del comparador legado queda pendiente de aprobación. Los resultados de laboratorio se complementan con las pruebas pendientes de dispositivos físicos, lectores de pantalla y transacción de reserva.

## Metodología de la calculadora de IVA

La opción se implementa como estimación mensual diferida a enero de 2027. La persona indica si tributa en RESICO y captura bases, IVA acreditable de compras e importación y retenciones. La mecánica general muestra saldo del periodo cuando corresponda. La alternativa del 7% excluye acreditamientos y muestra aparte retenciones superiores al monto calculado, sin atribuirles un tratamiento de devolución. La tasa 0% se incorpora como lectura literal señalada expresamente. La herramienta deja fuera estímulos y otros esquemas especiales, así como saldos arrastrados y ajustes que requieren revisión individual. El comparador de ISR mantiene el ejercicio 2026. [DOF, LIF 2027](https://sidof.segob.gob.mx/notas/5803757) · [LIF 2027, art. 25 XVIII](https://www.diputados.gob.mx/LeyesBiblio/pdf/LIF_2027.pdf#page=34) · [Ley del IVA](https://www.diputados.gob.mx/LeyesBiblio/pdf/LIVA.pdf)
