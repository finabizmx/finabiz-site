# Auditoría técnica CMO de Finabiz.mx

**Corte del 24 de noviembre de 2026.** Comparación de producción con `main` en `d20145d531b470bbc166dc4c6346223e6b6fb1a3`. El candidato está aislado en una rama. Sus resultados corresponden a pruebas locales salvo donde se indica producción.

## Diagnóstico

Finabiz.mx sirve HTML estático con GitHub Pages. `CNAME:1` declara el dominio raíz y `.nojekyll` permite publicar los archivos directamente. El sitio comparte hojas CSS, navegación, gestión de reservas y scripts de portada. Las dos calculadoras operan en el navegador. Typeform y Calendly gestionan el formulario y la agenda. GA4 y Google Fonts aportan medición y tipografía. El repositorio carece de un servidor de aplicación o un proceso de compilación necesario para publicar. Las pruebas de Node usan las API integradas.

La mayor brecha es la medición entre clic, envío y reserva. La segunda es comercial. Inicio y Arquitectura prometen etapas con plazos concretos al tiempo que otras secciones los sujetan a propuesta. La incidencia HTTP comprobada corresponde a `www`. La versión canónica del dominio resolvió todas las rutas examinadas. La coincidencia con `main` descarta una diferencia de publicación para los archivos comparados en este corte.

Las propuestas editoriales y el inventario tienen sus propios documentos. [Propuestas de SEO y contenido](PROPUESTAS_SEO_CMO_2026-11-24.md) · [Inventario HTML y SEO](INVENTARIO_SEO_CMO_2026-11-24.md)

## Evidencia comercial comprobada

Del **26 de octubre al 21 de noviembre de 2026**, Search Console devolvió 436 impresiones, 9 clics, CTR de 2.06% y posición media de 6.81. El artículo de alta del primer empleado concentró 331 impresiones y recibió un clic. Inicio obtuvo 5 de 25, Ecommerce 2 de 22, Arquitectura 0 de 11 y Diagnóstico 0 de 20. La URL fiscal anterior tuvo 9 impresiones. La nueva carece de fila para el periodo. Los datos por consulta son escasos y pueden tener supresiones, en especial para el artículo de nómina.

GA4 devolvió **48 sesiones y 75 vistas**. La distribución de sesiones fue 15 directas, 14 asociadas a `chatgpt.com / ai-assistant`, 11 de búsqueda orgánica, 7 de redes sociales orgánicas y 1 de referencia. Los informes usan las fuentes y los canales asignados por GA4. La corrección de atribución en el candidato solo influye en el tráfico que reciba la nueva versión una vez publicada.

| Señal | Observado en GA4 | Estado en el código |
|---|---|---|
| `click_agendar_llamada` | 4, dos en Inicio y dos en Ecommerce | Clic hacia Typeform en `assets/booking.js:99–120`. Indica intención y puede repetirse. El enlace alternativo genera un clic al usarse con JavaScript. |
| `formulario_iniciado` | Sin fila devuelta | Callback `onStarted` en el candidato. Abrir el diálogo por sí solo nunca emite esta señal. |
| `formulario_completado` | Sin fila devuelta | Callback `onSubmit` del formulario integrado. El envío en la página directa de Typeform queda fuera de la observación del sitio. |
| `llamada_agendada` | 2, uno en Inicio y uno en Ecommerce | Propiedad correcta. La búsqueda en el código de `main` encontró cero emisores. Falta revisar reglas de creación en administración, integraciones y reservas en Calendly. |
| `click_whatsapp` | 1 en Ecommerce | Clic hacia WhatsApp en `assets/booking.js:124–126`. |
| `file_download` | 1 en el artículo de retenciones de Mercado Libre | Señal compatible con medición mejorada. Hay que confirmar su configuración en GA4. El candidato evita emitir un evento paralelo. |

Las métricas son conteos de eventos. La conciliación con respuestas de Typeform y citas confirmadas en Calendly queda pendiente. El formulario publicado respondió HTTP 200 y la configuración conectada confirmó el identificador, el campo obligatorio de Calendly, los cuatro parámetros admitidos y el indicador de aviso de cookies desactivado. La configuración consultada de Calendly confirma el evento vigente de 30 minutos. La página heredada `agenda.html` es pública por URL directa y declara `noindex,nofollow`. La revisión cubrió su configuración y el acceso HTTP, sin generar una respuesta ni reservar una cita.

## Matriz

| ID | Área | Prioridad / estado | Evidencia | Impacto y esfuerzo | Solución y criterio de aceptación |
|---|---|---|---|---|---|
| CMO-01 | GA4 | P1 · confirmado, implementado | `cumplimiento-optimizacion-fiscal.html:77`, `calculadora-iva-resico.html:64`; ambos carecían de la etiqueta. | Dos rutas de interés sin medición. Bajo. | Cargar una sola etiqueta compartida con la propiedad existente en las 30 páginas del sitemap. Prevenir duplicación con QA. |
| CMO-02 | Atribución | P1 · confirmado, implementado | La versión base de `assets/booking.js` tenía una clasificación incompleta. `assets/analytics.js:19–82`. | Leads de búsqueda, IA y redes mal clasificados en Typeform. Medio. | Preservar UTMs válidas y primera entrada, clasificar Google, Bing y Yahoo como orgánicos y separar IA, social y terceros. Verificar sesión, varios dominios y URL directa con fragmento. |
| CMO-03 | Conversión | P1 · confirmado, implementado parcialmente | `assets/booking.js:63–92` y `tests/homepage.test.mjs:132–148`. GA4 recibió clics y registros históricos de origen pendiente. | Diferenciar abandono de falta de medición. Medio. | Separar clic, inicio y envío en el código. Conciliar una prueba autorizada con Typeform, GA4 y Calendly antes de considerar verificada la medición comercial. |
| CMO-04 | Consentimiento y privacidad | P1 · confirmado, requiere aprobación | `aviso-de-privacidad.html:164–170`; Google Tag aparece en la base. El formulario conectado registra `show_cookie_consent=false`. | El aviso describe una opción que requiere comprobación operativa. Medio. | Validar base aplicable, mecanismo, revocación y configuración de ambos proveedores antes de activar el candidato. Verificar red con aceptación y rechazo. |
| CMO-05 | Minimización | P1 · confirmado, implementado parcialmente | `assets/analytics.js:8–33,60–104`, `agenda.html:7–49`, `404.html:6`. | La ubicación automática anterior podía incluir consultas innecesarias. Medio. | Enviar la ruta canónica, etiquetas de campaña filtradas y solo el origen de referencia. En agenda omitir referencia. Probar los filtros y revisar en QA autorizado la carga real y ajustes de medición mejorada y redacción de Google. |
| CMO-06 | Dominio | P1 · confirmado, pendiente | `www` en HTTPS devuelve 301 al raíz HTTP desde la portada y 404 desde una ruta interior. `CNAME:1` indica el dominio raíz. | Pérdida de visitas o enlaces compartidos. Medio y requiere acceso DNS. | Autorizar revisión de GoDaddy y Pages. HTTPS con ruta y consulta preservadas en `www`. Conservar raíz y validar Telcel y Defender por separado. |
| CMO-07 | Consistencia de producción | P2 · descartado en el corte | Los 36 HTML y 6 recursos/archivos citados abajo fueron idénticos a la base. | Evita corregir una diferencia histórica que no apareció en la muestra. Bajo. | Repetir la comparación después de un despliegue aprobado y no usar URLs excluidas como evidencia de desactualización. |
| CMO-08 | Indexabilidad | P2 · confirmado y pendiente de relectura | `sitemap.xml` tiene 30 entradas. Search Console reportó 29 enviadas en la lectura del 21 nov., cero errores y cero avisos. | El informe puede estar desfasado respecto al archivo. Bajo. | Conservar las 30 rutas. Revisar próxima lectura y usar Inspección de URL para IVA y servicio fiscal. Un contador del conector no demuestra la indexación de cada ruta. |
| CMO-09 | Metadatos | P2 · confirmado, implementado | Faltaban tarjetas y datos estructurados en las dos rutas. `cumplimiento-optimizacion-fiscal.html:13–61`, `calculadora-iva-resico.html:12–61`. | Menor contexto al compartir o procesar la página. Bajo. | Añadir OG, Twitter y `BreadcrumbList` con `Service` y `WebApplication` respectivamente. Verificar correspondencia con title, descripción, H1 y ruta. |
| CMO-10 | Redirección heredada | P2 · compatibilidad verificada | `contabilidad-y-cumplimiento-fiscal.html:4`, HTTP 200 con `meta refresh` inmediato, enlace y canonical al destino. Navegación local comprobada. | Los enlaces antiguos siguen resolviendo. Bajo. | Conservar archivo, destino y exclusión del sitemap. Documentar que Pages sirve la redirección HTML. |
| CMO-11 | Oferta y contrato | P1 · confirmado, requiere autorización | `index.html:1945–1963`, `arquitectura-de-claridad-fiscal.html:219–223,254–255`, `contabilidad-para-ecommerce.html:84,253`, `terminos-y-condiciones.html:156–159`. | Las etapas y el FAQ pueden generar expectativas de plazo o alcance. Medio. | Aprobar copy de ofertas, metodología, FAQ y criterios contractuales con protección de derechos existentes. |
| CMO-12 | SEO editorial | P2 · confirmado, propuesta | Datos de Search Console y `blog-alta-primer-empleado-nomina-imss.html:8–9,52–53,194`. | Oportunidades de explicar intención y revisión, con muestra limitada. Medio. | Aprobar propuestas para seis rutas, enlaces contextuales, ficha verificable y fuentes oficiales. |
| CMO-13 | Rendimiento | P2 · medido, residual | 28 corridas Lighthouse y tabla de laboratorio abajo. LCP móvil supera 2.5 s en tres rutas del candidato. | Posible fricción de carga en Ecommerce, Diagnóstico y el artículo de nómina. Medio. | Medir variantes repetidas con fuentes y terceros activos antes de tocar CSS o fuentes. Validar el percentil 75 si hay muestra de campo. |
| CMO-14 | Accesibilidad | P2 · muestra aprobada, pendientes manuales | Chromium y axe en 34 documentos, cinco tamaños. Menús, foco, tablas, calculadoras y alternativa Typeform cubiertos en estados seleccionados. | Riesgo residual en Safari, lectores de pantalla y el iframe. Medio. | Verificar zonas con revisión de contraste manual, zoom, lector de pantalla y Safari iOS real antes de declarar conformidad. |
| CMO-15 | Seguridad del sitio estático | P2 · confirmado, residual | `index.html:4–6`, `agenda.html:4–8`. HTTP del raíz observado con HSTS. CSP parcial por `meta`. | Una política completa depende de proveedores y de la capa HTTP. Medio. | Mantener revisión de secretos de formatos conocidos y limitar permisos del iframe. Inventariar las dependencias antes de acordar una CSP HTTP o nuevas cabeceras. |
| CMO-16 | Prevención | P2 · implementado | `scripts/audit_site.py`, `tests/*.test.mjs`, `.github/workflows/qa-estatico.yml`. | Previene enlaces y recursos rotos, cambios de indexación, metadatos incompletos y regresiones funcionales. Bajo. | Suite de Node y Python en PR, ejecución local con las mismas órdenes y protección de rama evaluada según cuota. |

## HTTP, infraestructura e indexación

La comprobación HTTP usó GET comprimido con comparación de bytes descomprimidos. Los 36 HTML, `robots.txt`, `sitemap.xml`, `assets/site.css`, `assets/inicio-editorial.css`, `assets/inicio-interactivo.js` y `assets/booking.js` devolvieron 200 y coincidieron con los archivos de `main`. La URL inexistente devolvió 404. `http://finabiz.mx/` redirigió al dominio HTTPS. `https://www.finabiz.mx/` redirigió a `http://finabiz.mx`. `https://www.finabiz.mx/arquitectura-de-claridad-fiscal.html?origen=qa` devolvió 404. El HTML de Inicio mostró HSTS con `max-age=31556952`, `Cache-Control: max-age=600`, gzip y TTFB observado de 216 ms. La respuesta del entorno pasó por un proxy y no acredita el certificado de origen ni el comportamiento de un operador móvil.

DNS mediante el resolutor público de Google. Raíz A `185.199.108.153`–`185.199.111.153` y AAAA `2606:50c0:8000::153`–`2606:50c0:8003::153`. Los NS observados fueron `ns47.domaincontrol.com` y `ns48.domaincontrol.com`. Para `www` se observaron A `3.33.251.168` y `15.197.225.128`, sin AAAA ni CNAME devueltos. Esto respalda la investigación del reenvío y no explica por sí solo el antecedente Telcel/Defender. Para cerrar la incidencia se necesita una prueba con un segundo resolutor, TLS origen y un iPhone en la red afectada.

El sitemap mantiene 30 canonicals, sin URLs inexistentes ni repetidas. Se actualizaron dos `lastmod` por los nuevos datos estructurados. Las fechas de los artículos permanecen. En el artículo de primer empleado el JSON-LD conserva publicación y modificación de 2026-09-29. El `lastmod` del sitemap marca 2026-11-21 por cambios de página. Falta confirmar la fecha de una revisión fiscal efectiva para cualquier actualización editorial. `robots.txt` conserva acceso al rastreo y sitemap. Las seis exclusiones mantienen sus directivas. La ruta preexistente `/detective/` sigue aislada fuera del inventario indexable, sin enlaces desde el sitio corporativo. [Sitemaps y significado de lastmod](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) · [Redirecciones reconocidas por Google](https://developers.google.com/search/docs/crawling-indexing/301-redirects)

## Implementación y comparación

| Control | Base | Candidato |
|---|---|---|
| Etiqueta de GA4 | Bloque repetido en 30 HTML. Faltaba en 2 rutas indexables. | Archivo compartido. 30 de 30 rutas indexables con una etiqueta. Identificador y destino conservados. |
| URL y origen de GA4 | Etiqueta anterior recibía ubicación predeterminada en páginas ordinarias. Agenda aplicaba limpieza específica. | Ruta pública saneada, UTMs filtradas, referrer limitado al origen y agenda con referrer omitido. Los escenarios de QA y el opt-out no activan la etiqueta. |
| Typeform | Carga diferida, diálogo y enlace alternativo ya existentes. La versión inicial infería atribución en el script de reservas. | Se conservan esos comportamientos. El SDK recibe cuatro campos admitidos y el enlace directo utiliza el fragmento admitido por Typeform. El callback de envío se distingue del de inicio y los identificadores de respuesta quedan en memoria para evitar duplicados. |
| Contrato, fórmulas y textos | El hero, la oferta, los textos fiscales/legales y los motores están publicados. | Los 36 cuerpos HTML y títulos/descripciones coinciden con la base. Los motores fiscal e IVA conservan su código. Las propuestas quedan en documentación. |
| Indexación | 30 rutas en sitemap. Redirección en HTML. | 30 rutas, mismos destinos y exclusiones. OG y JSON-LD nuevos en 2 rutas. |
| Control de regresiones | Suite local con homepage, agenda, IVA y sitemap interior. | 27 casos, chequeo estático de las 36 páginas y flujo de CI de solo lectura. |

No se añaden dependencias del sitio, precios, clientes, reseñas ni promesas nuevas. Los filtros rechazan consultas arbitrarias y formatos comunes de RFC, CURP, correo y teléfono. Un nombre u otro dato privado puede coincidir con el patrón de un slug válido si se introduce deliberadamente como campaña. Los enlaces de marketing deben usar etiquetas controladas. Las calculadoras no envían importes mediante el código del candidato. En configuración se deben verificar `form_interaction`, redacción de datos, detección de descargas y reglas de generación de eventos. [Referencia de GA4](https://developers.google.com/analytics/devguides/collection/ga4/reference/config) · [Medición mejorada](https://support.google.com/analytics/answer/9216061) · [Redacción de datos](https://support.google.com/analytics/answer/13544947) · [Callbacks de Typeform](https://www.typeform.com/developers/embed/callbacks/) · [Parámetros de Typeform](https://help.typeform.com/hc/en-us/articles/360052676612-Using-URL-parameters-formerly-Hidden-Fields)

## QA y rendimiento

Se analizaron Chromium 156 y axe-core 4.10.3 con recursos HTTPS externos bloqueados. Se cargaron las 36 rutas locales, con verificación de la redirección fiscal y la exclusión del destino externo de Detective. Se examinaron 34 páginas de contenido en 320 × 640, 390 × 844, 430 × 932, 844 × 390 y 1366 × 900. Hubo 170 vistas sin desbordamiento de la página. axe no detectó violaciones en el estado inicial. Marcó contraste y enlaces en texto para revisión manual en algunas páginas. El barrido automático tiene límites de cobertura y no certifica WCAG 2.2 AA. Se verificaron el menú móvil por teclado, salto de foco hacia Servicios, casos válido e inválido de ambas calculadoras y estado sin JavaScript del comparador IVA. En las pruebas automatizadas se ejercitaron el diálogo Typeform, la tecla Escape, el cierre por historial, el fallo del SDK, clic modificado, alternativa y callbacks. Los eventos se simularon y ningún caso envió un formulario.

Google Fonts usa `preconnect` y `display=swap` en las plantillas principales. Inicio mantiene CSS inline junto a `assets/inicio-editorial.css`. Los artículos comparten `assets/site.css` y estilos locales. Se conserva esa cascada. La calculadora IVA usa un módulo nativo y CSS propio. El diálogo Typeform conserva la carga bajo demanda. El uso real de fuentes, el contraste con todos los recursos externos, la experiencia en lector de pantalla y la caché de recursos remotos necesitan una segunda serie con red real.

Lighthouse 12.8.2 ejecutó una corrida por modo y versión en un servidor local con tráfico externo HTTPS bloqueado. CLS y TBT fueron **0** en las 28 corridas. Accesibilidad, prácticas recomendadas y SEO obtuvieron **100** en el mismo perfil de laboratorio. Las variaciones indican la muestra observada. PageSpeed Insights respondió **HTTP 429** por cuota. El INP de campo queda sin dato y TBT mide una condición diferente.

| Ruta | Rendimiento móvil base → candidato | LCP móvil s base → candidato | Rendimiento escritorio base → candidato | LCP escritorio s base → candidato |
|---|---:|---:|---:|---:|
| Inicio | 97 → 97 | 2.33 → 2.26 | 100 → 100 | 0.58 → 0.56 |
| Ecommerce | 94 → 94 | 2.66 → 2.73 | 100 → 100 | 0.66 → 0.68 |
| Arquitectura | 96 → 96 | 2.43 → 2.36 | 100 → 100 | 0.61 → 0.58 |
| Cumplimiento fiscal | 97 → 97 | 2.21 → 2.28 | 100 → 100 | 0.55 → 0.53 |
| Diagnóstico | 94 → 95 | 2.66 → 2.58 | 100 → 100 | 0.65 → 0.63 |
| Primer empleado | 94 → 95 | 2.66 → 2.58 | 100 → 100 | 0.66 → 0.63 |
| IVA RESICO | 100 → 99 | 1.53 → 1.65 | 100 → 100 | 0.43 → 0.43 |

### Reproducción

Desde una copia de la rama, con Node 24 y Python 3.12 o posteriores compatibles:

```sh
set -e
for archivo in tests/*.test.mjs; do
  node "$archivo"
done
python3 scripts/audit_site.py
python3 scripts/audit_site.py --markdown
git diff --check origin/main...HEAD
```

Comparación de red. Desde un checkout con la base especificada al comienzo del informe, este comando valida producción sin activar scripts.

```sh
set -e
for archivo in $(git ls-files '*.html' robots.txt sitemap.xml assets/site.css assets/inicio-editorial.css assets/inicio-interactivo.js assets/booking.js); do
  case "$archivo" in
    index.html) ruta=/ ;;
    */index.html) ruta="/${archivo%index.html}" ;;
    *) ruta="/$archivo" ;;
  esac
  curl --fail --silent --show-error --compressed "https://finabiz.mx$ruta" | cmp "$archivo" -
done
```

Para repetir una medición, servir el checkout mediante `python3 -m http.server 8831 --bind 127.0.0.1` y ejecutar Lighthouse 12.8.2. El perfil móvil es el predeterminado. Agregar `--preset=desktop` para escritorio. Cambiar la URL por la ruta de la tabla y repetir en el otro checkout.

```sh
npx --yes lighthouse@12.8.2 http://127.0.0.1:8831/index.html \
  --chrome-flags='--headless --disable-gpu --no-sandbox --disable-dev-shm-usage' \
  --blocked-url-patterns='https://*' --output=json --output-path=/tmp/finabiz-lighthouse.json
```

### Transferencia y reversión

- **CMO.** Usar el clic como intención de contacto. Conciliar los envíos y reservas antes de reportar leads o citas. Revisar las propuestas de SEO con el CEO, en especial metodología y términos de orientación, y evaluar CTR por consulta y página después de publicar con una ventana de datos comparable.
- **COO.** Consultar GA4 Admin y la configuración de Typeform y Calendly para identificar el origen de `llamada_agendada`. Una prueba autorizada y rotulada `PRUEBA — NO PROSPECTO` debe registrar por separado clic, inicio, respuesta del proveedor, recepción interna y reserva confirmada. Ejecutar con y sin consentimiento y comprobar que ningún identificador ni valor de formulario aparece en GA4. Anotar la fecha y separar la prueba de los reportes comerciales.
- **CEO y responsables fiscal y legal.** Aprobar cambios sustantivos de copy, fundamentos, modalidad, plazos contractuales y consentimiento antes de su publicación. Conservar los derechos de órdenes existentes y documentar cualquier aplicación prospectiva. Encargar a Víctor Pérez la revisión fiscal del artículo de nómina y del comparador IVA RESICO antes de actualizar ambos.
- **Infraestructura.** Con aprobación, guardar DNS y configuración de Pages y luego corregir `www`. Verificar HTTPS, conservación de ruta y consulta, resolución y TLS en dos redes. Validar iPhone con Telcel y Defender activado y desactivado antes de atribuir causa.
- **Rollback.** Si el candidato sigue en PR, cerrar o actualizar la rama según la decisión de revisión. Si se publica en el futuro y surge una regresión, revertir el commit mediante un PR y comprobar que Pages sirve los bytes esperados. Repetir las pruebas de menú, calculadoras, reserva alternativa y GA4. Los ajustes futuros en GA4, Typeform o DNS deben tener su propio respaldo y reversión.
