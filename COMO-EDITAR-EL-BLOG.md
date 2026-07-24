# Cómo editar el blog de Finabiz

Este sitio es 100% estático: no hay panel de administración ni base de datos. Se edita directamente en GitHub, y cada vez que guardas un cambio en la rama `main`, el sitio se publica solo en unos minutos (GitHub Pages).

Tu cuenta de GitHub **es** tu credencial de acceso — no hay usuario/contraseña aparte que configurar.

---

## Editar un artículo que ya existe

1. Entra a [github.com](https://github.com) e inicia sesión.
2. Ve al repositorio del sitio: `finabizmx/finabiz-site`.
3. Busca el archivo del artículo (todos empiezan con `blog-`, por ejemplo `blog-retenciones-mercado-libre-mercado-pago.html`).
4. Ábrelo y da clic en el ícono de lápiz (✏️) arriba a la derecha para editarlo.
5. Haz tus cambios directamente en el texto.
6. Baja hasta el final de la página, escribe un mensaje corto describiendo el cambio (ej. "Actualiza tasa de IVA 2027") y da clic en **"Commit changes..."** → **"Commit directly to the main branch"** → **"Commit changes"**.
7. Espera 1-2 minutos y revisa la página en vivo en `finabiz.mx`.

---

## Publicar un artículo nuevo

1. En el repositorio, da clic en **"Add file" → "Create new file"**.
2. Nómbralo así: `blog-tu-tema-aqui.html` — todo en minúsculas, palabras separadas por guiones, sin acentos ni espacios ni "ñ". Ejemplos: `blog-deducciones-nomina-2027.html`.
3. Abre el archivo `blog-plantilla.html` en otra pestaña, copia **todo** su contenido, y pégalo en el archivo nuevo que estás creando.
4. Reemplaza cada `[[MARCADOR]]` por tu contenido real (usa Ctrl+F para encontrarlos todos — cada uno aparece varias veces: en el título de la pestaña, en las redes sociales, en el schema para Google, en el encabezado visible y en el cuerpo).
5. **Importante:** cambia `<meta name="robots" content="noindex, nofollow" />` por `content="index, follow" />` — la plantilla trae "noindex" a propósito para que Google nunca la indexe a ella misma.
6. Borra el bloque de comentario de instrucciones que está hasta arriba del archivo (entre `<!--` y `-->`).
7. Guarda el archivo (**"Commit new file"**, directo a `main`).

### Autor del artículo

Cada artículo debe llevar un autor real, con nombre y puesto. En la plantilla hay dos lugares donde va: el JSON-LD (`"author": { "name": "[[AUTOR-NOMBRE]]", "jobTitle": "[[AUTOR-TITULO]]", ... }`) y la línea visible debajo del título (`<span>Por [[AUTOR-NOMBRE]], [[AUTOR-TITULO]]</span>`). Usa el mismo nombre/puesto en ambos lugares. Ejemplo ya usado en el sitio: `Víctor Pérez`, `Director General`.

### Agregarlo al listado del blog

Abre `blog.html` y edita dos partes:

**A. La tarjeta visible** — dentro de `<div class="blog-grid">`, copia una tarjeta existente y ajusta el enlace, la categoría, el título y la descripción corta:

```html
<a href="blog-tu-tema-aqui.html" class="blog-card">
  <span class="tag">Tu categoría</span>
  <h3>Tu título</h3>
  <p>Descripción corta de una o dos líneas.</p>
  <span class="read-more">Leer artículo →</span>
</a>
```

**B. El listado para buscadores (schema)** — dentro del bloque `<script type="application/ld+json">` que tiene `"@type": "Blog"`, agrega una línea al arreglo `"blogPost"`:

```json
{ "@type": "BlogPosting", "headline": "Tu título", "url": "https://finabiz.mx/blog-tu-tema-aqui.html" }
```

### Agregarlo al sitemap

Abre `sitemap.xml` y agrega, antes de `</urlset>`:

```xml
<url>
  <loc>https://finabiz.mx/blog-tu-tema-aqui.html</loc>
  <lastmod>AAAA-MM-DD</lastmod>
  <changefreq>yearly</changefreq>
  <priority>0.6</priority>
</url>
```

(`lastmod` en formato año-mes-día, por ejemplo `2026-08-15`.)

---

## Reglas importantes antes de publicar

- **Nunca inventes cifras fiscales** (tasas, límites, porcentajes). Estas cambian con cada Resolución Miscelánea Fiscal — verifícalas antes de publicar y agrega el aviso de "Verifica la vigencia" que ya usan los demás artículos (está en la plantilla).
- Mantén el tono del blog: directo, para dueños de negocio, sin relleno.
- Cada artículo debe terminar con una invitación a agendar la llamada gratuita (ya viene en la plantilla, no la quites).
- Si citas un artículo, ley o regla, agrégalo en la nota de fundamento al final (`<p class="article-source-note">`).

---

## Verificar que todo quedó bien

Después de publicar (artículo nuevo o editado), espera 1-2 minutos y revisa:

1. Que la página cargue en `https://finabiz.mx/blog-tu-tema-aqui.html` sin errores.
2. Que aparezca correctamente en `https://finabiz.mx/blog.html`.
3. Si agregaste el artículo al sitemap, puedes reenviarlo en Google Search Console (Sitemaps → escribe `sitemap.xml` de nuevo → Enviar) para que Google lo note más rápido.
