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

function setup(typeform) {
  const overlay = eventTarget({
    open: false,
    showModal() { this.open = true; },
    close() { this.open = false; },
  });
  const closeButton = eventTarget();
  const link = eventTarget();
  const host = { children: [], appendChild(widget) { this.children.push(widget); } };
  const body = { classList: new Set(), style: { overflow: 'auto' } };
  body.classList.remove = body.classList.delete;
  const history = {
    state: null,
    pushState(state) { this.state = state; },
    back() { this.state = null; },
  };
  const window = eventTarget({ tf: typeform });
  const elements = { tfOverlay: overlay, tfOverlayClose: closeButton, tfOverlayWidget: host };
  const document = {
    body,
    getElementById: id => elements[id],
    querySelectorAll: () => [link],
    createElement: () => ({
      style: {},
      setAttribute() {},
      remove() { host.children.pop(); },
    }),
  };
  const script = scripts.find(source => source.includes("getElementById('tfOverlayWidget')"));
  runInNewContext(script, { window, document, history, location: { href: 'https://finabiz.mx/' } });
  return { overlay, closeButton, link, host, history, window, body };
}

test('the approved homepage retains its primary landmark and direct reservation links', () => {
  assert.match(html, /href="#main-content" class="skip-link"/);
  assert.match(html, /<main id="main-content" tabindex="-1">/);
  assert.match(html, /La estructura fiscal y financiera<br\/><span[^>]+>que impulsa tu negocio\./);
  assert.equal((html.match(/href="https:\/\/form\.typeform\.com\/to\/ykt2ayIi"[^>]*js-tf-cta/g) || []).length, 6);
  assert.match(html, /<dialog[^>]+aria-label="Formulario previo a tu llamada de orientación"/);
  assert.match(html, /<a href="https:\/\/form\.typeform\.com\/to\/ykt2ayIi"[^>]*>Abrir formulario directamente/);
  scripts.forEach(source => new Script(source));
});

test('opening the widget cancels navigation and closing restores scroll and history', () => {
  let loads = 0;
  const { overlay, closeButton, link, host, history, window, body } = setup({ load() { loads++; } });
  assert.equal(link.emit('click').defaultPrevented, true);
  assert.equal(overlay.open, true);
  assert.equal(body.style.overflow, 'hidden');
  assert.equal(history.state.tfOverlay, true);
  closeButton.emit('click');
  assert.equal(overlay.open, false);
  assert.equal(body.style.overflow, 'auto');
  assert.equal(history.state, null);
  link.emit('click');
  history.back();
  window.emit('popstate');
  assert.equal(overlay.open, false);
  assert.equal(host.children.length, 1);
  assert.equal(loads, 1);
  link.emit('click');
  assert.equal(overlay.emit('cancel').defaultPrevented, true);
  assert.equal(overlay.open, false);
});

test('provider failures and modified clicks retain native navigation', () => {
  const missing = setup();
  assert.equal(missing.link.emit('click').defaultPrevented, false);
  let fail = true;
  const delayed = setup({ load() { if (fail) throw new Error('SDK unavailable'); } });
  assert.equal(delayed.link.emit('click').defaultPrevented, false);
  assert.equal(delayed.host.children.length, 0);
  assert.equal(delayed.overlay.open, false);
  fail = false;
  assert.equal(delayed.link.emit('click', { ctrlKey: true }).defaultPrevented, false);
  assert.equal(delayed.link.emit('click').defaultPrevented, true);
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
