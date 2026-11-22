import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runInNewContext, Script } from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);

function eventTarget(properties = {}) {
  const listeners = new Map();
  return {
    ...properties,
    addEventListener(type, listener) { listeners.set(type, listener); },
    emit(type, properties = {}) {
      const event = {
        button: 0,
        defaultPrevented: false,
        preventDefault() { this.defaultPrevented = true; },
        ...properties,
      };
      listeners.get(type)?.(event);
      return event;
    },
  };
}

const booking = readFileSync(new URL('../assets/booking.js', import.meta.url), 'utf8');
const nextTurn = () => new Promise(resolve => setImmediate(resolve));

function setup(typeform, supportsDialog = true) {
  const overlay = eventTarget({
    open: false,
    showModal: supportsDialog ? function () { this.open = true; } : undefined,
    close() { this.open = false; },
  });
  const closeButton = eventTarget();
  const link = eventTarget({
    href: 'https://form.typeform.com/to/ykt2ayIi',
    className: 'js-tf-cta',
    closest: () => null,
  });
  const host = { replaceChildren() {} };
  const status = { hidden: true };
  const body = { classList: new Set(), style: { overflow: 'auto' } };
  body.classList.remove = body.classList.delete;
  const history = {
    state: null,
    pushState(state) { this.state = state; },
    back() { this.state = null; },
  };
  const hits = [];
  const requests = [];
  const window = eventTarget({ tf: typeform, gtag: (...args) => hits.push(args) });
  const elements = { tfOverlay: overlay, tfOverlayClose: closeButton, tfOverlayWidget: host, tfOverlayStatus: status };
  const document = {
    body,
    head: { append: element => requests.push(element) },
    getElementById: id => elements[id],
    querySelectorAll: selector => selector.includes('typeform.com') ? [link] : [],
    createElement: () => eventTarget({ remove() {} }),
  };
  const location = new URL('https://finabiz.mx/?utm_source=qa');
  runInNewContext(booking, { window, document, history, location, URL, URLSearchParams, setTimeout: () => 1, clearTimeout() {} });
  return { overlay, closeButton, link, status, history, window, body, hits, requests };
}

test('the approved homepage retains its primary landmark and direct reservation links', () => {
  assert.match(html, /href="#main-content" class="skip-link"/);
  assert.match(html, /<main id="main-content" tabindex="-1">/);
  assert.match(html, /La estructura fiscal y financiera<br\/>\s*<span[^>]+>que impulsa tu negocio\./);
  assert.equal((html.match(/href="https:\/\/form\.typeform\.com\/to\/ykt2ayIi"[^>]*js-tf-cta/g) || []).length, 6);
  assert.match(html, /<dialog[^>]+aria-label="Formulario previo a tu llamada de orientación"/);
  assert.match(html, /<a href="https:\/\/form\.typeform\.com\/to\/ykt2ayIi"[^>]*>Abrir formulario directamente/);
  scripts.forEach(source => new Script(source));
});

test('opening the widget restores focus-related state and reuses the embed', async () => {
  let mounts = 0;
  const { overlay, closeButton, link, status, history, window, body } = setup({
    createWidget(id, options) {
      assert.equal(id, 'ykt2ayIi');
      assert.equal(options.hidden.utm_source, 'qa');
      options.onReady();
      mounts++;
    },
  });
  assert.equal(link.emit('click').defaultPrevented, true);
  assert.equal(overlay.open, true);
  assert.equal(body.style.overflow, 'hidden');
  assert.equal(history.state.tfOverlay, true);
  await nextTurn();
  assert.equal(status.hidden, true);
  closeButton.emit('click');
  assert.equal(overlay.open, false);
  assert.equal(body.style.overflow, 'auto');
  assert.equal(history.state, null);
  link.emit('click');
  history.back();
  window.emit('popstate');
  assert.equal(overlay.open, false);
  assert.equal(mounts, 1);
  link.emit('click');
  assert.equal(overlay.emit('cancel').defaultPrevented, true);
  assert.equal(overlay.open, false);
});

test('the SDK loads on first interaction and a network error leaves the direct link available', async () => {
  const { link, status, overlay, requests, window, closeButton } = setup();
  assert.equal(requests.length, 0);
  assert.equal(link.emit('click', { ctrlKey: true }).defaultPrevented, false);
  assert.equal(requests.length, 0);
  assert.equal(link.emit('click').defaultPrevented, true);
  assert.equal(requests.length, 1);
  requests[0].emit('error');
  await nextTurn();
  assert.equal(overlay.open, true);
  assert.match(status.textContent, /abrirlo directamente/);
  assert.match(link.href, /^https:\/\/form\.typeform\.com\/to\/ykt2ayIi/);
  closeButton.emit('click');
  link.emit('click');
  assert.equal(requests.length, 2);
  window.tf = { createWidget(id, options) { options.onReady(); } };
  requests[1].emit('load');
  await nextTurn();
  assert.equal(status.hidden, true);
  assert.equal(setup(undefined, false).link.emit('click').defaultPrevented, false);
});

test('conversion is emitted once for the Typeform submit callback and excludes response data', async () => {
  let options;
  const { link, hits, window } = setup({ createWidget(id, config) { options = config; } });
  link.emit('click');
  await nextTurn();
  assert.equal(hits[0][1], 'click_agendar_llamada');
  window.emit('message', { data: { type: 'form-submit', formId: 'ykt2ayIi' } });
  options.onSubmit({ formId: 'unrelated' });
  assert.equal(hits.length, 1);
  options.onSubmit({ formId: 'ykt2ayIi', responseId: 'private-response' });
  options.onSubmit({ formId: 'ykt2ayIi', responseId: 'private-response' });
  assert.equal(hits.length, 2);
  assert.equal(hits[1][1], 'formulario_completado');
  assert.doesNotMatch(JSON.stringify(hits[1]), /private-response/);
});

test('service deep links handle valid and malformed percent encoding', () => {
  const script = scripts.find(source => source.includes('Contextual service navigation'));
  const area = { open: false, matches: () => true };
  const document = {
    querySelectorAll: () => [],
    getElementById: id => id === 'ruta-claridad' ? area : null,
  };
  runInNewContext(script, { document, location: { hash: '#%E0%A4%A' } });
  assert.equal(area.open, false);
  runInNewContext(script, { document, location: { hash: '#ruta-%63laridad' } });
  assert.equal(area.open, true);
});

test('the example selector only appears after setup and switches its visible card', () => {
  assert.match(html, /<div class="sample-tabs" hidden role="group"/);
  assert.equal((html.match(/<article class="sample-card">/g) || []).length, 3);
  assert.equal((html.match(/class="sample-badge">Datos simulados/g) || []).length, 3);
  const classList = { toggle() {}, add() {} };
  const cards = Array.from({ length: 3 }, () => ({ classList }));
  const tabs = Array.from({ length: 3 }, () => eventTarget({
    classList,
    attributes: new Map(),
    setAttribute(name, value) { this.attributes.set(name, value); },
  }));
  const controls = { hidden: true, querySelectorAll: () => tabs };
  const grid = { classList, querySelectorAll: () => cards };
  const selectors = { '.sample-tabs': controls, '.samples-grid': grid };
  const document = { getElementById: () => ({ querySelector: selector => selectors[selector] }) };

  const script = scripts.find(source => source.includes("const examples = document.getElementById('ejemplos')"));
  runInNewContext(script, { document });
  assert.equal(controls.hidden, false);
  assert.deepEqual(cards.map(card => card.hidden), [false, true, true]);
  tabs[2].emit('click');
  assert.deepEqual(cards.map(card => card.hidden), [true, true, false]);
  assert.equal(tabs[2].attributes.get('aria-controls'), cards[2].id);
  assert.equal(tabs[2].attributes.get('aria-pressed'), 'true');
  assert.equal(tabs[0].attributes.get('aria-pressed'), 'false');
});
