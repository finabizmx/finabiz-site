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

test('the fiscal catalog groups the ISR and IVA calculation with a single recurring service', () => {
  const [, fiscal = ''] = html.match(/<details[^>]*id="ruta-cumplimiento">([\s\S]*?)<\/details>/) || [];
  const [, financial = ''] = html.match(/<details[^>]*id="ruta-claridad">([\s\S]*?)<\/details>/) || [];
  assert.ok(fiscal && financial);
  const fiscalLinks = [...fiscal.matchAll(/<a class="svc" href="([^"]+)"/g)].map(match => match[1]);
  assert.equal(fiscalLinks.filter(href => href === 'cumplimiento-optimizacion-fiscal.html').length, 1);
  assert.equal(fiscalLinks.filter(href => href === 'calculo-de-impuestos.html').length, 1);
  assert.match(fiscal, /llevar tu contabilidad mensual o trabajar con tu contador actual/);
  assert.doesNotMatch(financial, /calculo-de-impuestos\.html|cálculo de impuestos/i);
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

const interactive = readFileSync(new URL('../assets/inicio-interactivo.js', import.meta.url), 'utf8');

test('the utility view switches to shares of gross sales and restores the original amounts', () => {
  const amounts = ['$180,000', '−$21,600', '−$27,000', '−$34,200', '$97,200'];
  const cells = amounts.map(textContent => ({ textContent }));
  const units = ['amount', 'share'].map(utilityUnit => eventTarget({
    dataset: { utilityUnit },
    setAttribute(name, value) { this[name] = value; },
  }));
  const controls = { hidden: true, querySelectorAll: () => units };
  const selectors = {
    '.report-utility': { querySelectorAll: () => cells },
    '.report-units': controls,
  };
  const document = { querySelector: selector => selectors[selector], getElementById: () => null };
  runInNewContext(interactive, { document });

  assert.equal(controls.hidden, false);
  units[1].emit('click');
  assert.deepEqual(cells.map(cell => cell.textContent.replace('−', '-')), ['100%', '-12%', '-15%', '-19%', '54%']);
  assert.equal(units[1]['aria-pressed'], 'true');
  units[0].emit('click');
  assert.deepEqual(cells.map(cell => cell.textContent), amounts);
  assert.equal(units[0]['aria-pressed'], 'true');
});

test('the forecast chart derives its scale and selected month from the table', () => {
  const entries = [
    ['Mes 1', '$820K', '$98K', '$27K'],
    ['Mes 2', '$865K', '$104K', '$29K'],
    ['Mes 3', '$910K', '$112K', '$31K'],
  ];
  const output = { textContent: '' };
  const options = [];
  const bars = { append: option => options.push(option) };
  const chart = { hidden: true, querySelector: selector => selector === '.projection-bars' ? bars : output };
  const forecast = {
    querySelectorAll: () => entries.map(cells => ({ cells: cells.map(textContent => ({ textContent })) })),
    querySelector: () => chart,
  };
  const template = { content: { firstElementChild: { cloneNode() {
    const nodes = { input: eventTarget(), '.projection-month': {}, '.projection-value': {} };
    const properties = new Map();
    return {
      properties,
      style: { setProperty: (key, value) => properties.set(key, value) },
      querySelector: selector => nodes[selector],
    };
  } } } };
  const document = {
    querySelector: selector => selector === '.report-forecast' ? forecast : null,
    getElementById: id => id === 'projection-option' ? template : null,
  };
  runInNewContext(interactive, { document });

  assert.equal(chart.hidden, false);
  assert.equal(options.length, 3);
  assert.equal(options[0].querySelector('input').checked, true);
  assert.equal(options[0].querySelector('.projection-value').textContent, '$27K');
  assert.equal(options[2].properties.get('--bar-height'), '100%');
  assert.ok(parseFloat(options[0].properties.get('--bar-height')) < parseFloat(options[1].properties.get('--bar-height')));
  const third = options[2].querySelector('input');
  third.checked = true;
  third.emit('change');
  assert.equal(output.textContent, 'Mes 3 · Ventas $910K · Utilidad $112K');
});

test('hero depth uses a single animation frame and clears when motion is disabled', () => {
  const styles = new Map();
  const depth = {
    style: {
      setProperty: (name, value) => styles.set(name, value),
      removeProperty: name => styles.delete(name),
    },
  };
  const hero = eventTarget({
    querySelector: () => depth,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 500 }),
  });
  const preference = eventTarget({ matches: true });
  const frames = new Map();
  let frameId = 0;
  const document = {
    querySelector: selector => selector === '.hero-editorial' ? hero : null,
    getElementById: () => null,
  };
  runInNewContext(interactive, {
    document,
    matchMedia: () => preference,
    requestAnimationFrame(callback) {
      frames.set(++frameId, callback);
      return frameId;
    },
    cancelAnimationFrame: id => frames.delete(id),
  });

  hero.emit('pointermove', { pointerType: 'touch', clientX: 900, clientY: 450 });
  assert.equal(frames.size, 0);
  hero.emit('pointermove', { pointerType: 'mouse', clientX: 200, clientY: 100 });
  hero.emit('pointermove', { pointerType: 'mouse', clientX: 900, clientY: 450 });
  assert.equal(frames.size, 1);
  frames.get(frameId)();
  assert.equal(styles.get('--hero-tilt-x'), '-3.60deg');
  assert.equal(styles.get('--hero-tilt-y'), '4.40deg');
  preference.matches = false;
  preference.emit('change');
  assert.equal(styles.size, 0);
});
