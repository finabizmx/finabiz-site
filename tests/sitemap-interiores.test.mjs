import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const canonicalService = '/cumplimiento-optimizacion-fiscal.html';
const oldService = '/contabilidad-y-cumplimiento-fiscal.html';

test('sitemap lists canonical indexable pages and the current fiscal service', () => {
  const locations = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]));
  assert.equal(new Set(locations.map(url => url.href)).size, locations.length);
  assert.ok(locations.some(url => url.pathname === canonicalService));
  assert.ok(!locations.some(url => url.pathname === oldService));
  for (const url of locations) {
    assert.equal(url.origin, 'https://finabiz.mx');
    const html = read(url.pathname === '/' ? 'index.html' : url.pathname.slice(1));
    assert.match(html, /<link rel="canonical" href="([^"]+)"/);
    assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)[1], url.href);
    assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/i);
    assert.match(html, /<main\b/);
  }
});

test('interiors link to the canonical service and expose navigation before content', () => {
  for (const path of readdirSync(root).filter(path => path.endsWith('.html'))) {
    const html = read(path);
    assert.doesNotMatch(html, /href="\/?contabilidad-y-cumplimiento-fiscal\.html"/);
    if (!html.includes('href="assets/site.css"') || !html.includes('id="navLinks"')) continue;
    assert.match(html, /<a href="#main-content" class="skip-link"/);
    assert.match(html, /<main id="main-content" tabindex="-1">/);
    assert.ok(html.indexOf('id="burger"') < html.indexOf('id="navLinks"'), path);
    assert.match(html, /<noscript><link rel="stylesheet" href="assets\/menu-sin-js\.css"/);
  }
});

test('the refund service uses the same title across the catalog and page and explains IVA refunds', () => {
  const home = read('index.html');
  const service = read('recuperacion-de-saldos-a-favor.html');
  assert.match(home, /href="recuperacion-de-saldos-a-favor\.html">\s*<div class="n">[^<]+<\/div>\s*<div class="t">Recuperación de saldos a favor<\/div>/);
  assert.match(service, /<h1[^>]*>Recuperación de saldos a favor<\/h1>/);
  assert.match(service, /<title>Recuperación de saldos a favor \| Finabiz<\/title>/);
  const [, faqAnswer] = service.match(/<summary>¿Cómo sé si tengo saldo a favor\?<\/summary>\s*<p>([^<]+)<\/p>/) || [];
  assert.match(faqAnswer, /recuperación de saldos a favor de IVA/);
  const structured = [...service.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  assert.equal(structured.find(item => item['@type'] === 'Service').name, 'Recuperación de saldos a favor');
  assert.equal(structured.find(item => item['@type'] === 'FAQPage').mainEntity[0].acceptedAnswer.text, faqAnswer);
});

test('the calculator comparison region has a keyboard target and visible label', () => {
  const html = read('calculadora-regimenes-fiscales.html');
  assert.match(html, /<h2 id="titulo-comparacion">Ventajas y desventajas, lado a lado/);
  assert.match(html, /<div class="cmp" tabindex="0" role="region" aria-labelledby="titulo-comparacion">/);
});
