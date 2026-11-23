import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../agenda.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function visit(search, rejectHistory = false, withSdk = false) {
  const order = [];
  const config = {};
  const frame = { hidden: true };
  const status = {};
  const window = withSdk ? { Calendly: { initInlineWidget(options) { config.mount = options; } } } : {};
  const location = new URL('https://finabiz.mx/agenda.html' + search);
  const history = {
    state: null,
    replaceState(state, title, url) {
      if (rejectHistory) throw new Error('History blocked');
      order.push('clean');
      location.href = url;
    },
  };
  const document = {
    createElement: () => ({}),
    head: { append: () => order.push('analytics') },
    addEventListener(type, handler) { config.ready = handler; },
    getElementById(id) {
      if (id === 'greeting') return {};
      if (id === 'calendlyFrame') return frame;
      if (id === 'calendlyStatus') return status;
      return { setAttribute(name, value) { config.calendar = new URL(value); } };
    },
  };
  runInNewContext(script, { window, location, history, document, URL });
  config.ready();
  return { window, location, order, calendar: config.calendar, mount: config.mount, frame, status };
}

test('agenda removes legacy personal parameters before GA and keeps the calendar prefill', () => {
  const r = visit('?nombre=Persona+QA&correo=qa%40example.invalid&utm_source=demo');
  assert.deepEqual(r.order, ['clean', 'analytics']);
  assert.equal(r.location.search, '?utm_source=demo');
  assert.equal(r.window.dataLayer[1][2].page_location, 'https://finabiz.mx/agenda.html');
  assert.equal(r.window.dataLayer[1][2].page_referrer, '');
  assert.equal(r.calendar.searchParams.get('name'), 'Persona QA');
  assert.equal(r.calendar.searchParams.get('email'), 'qa@example.invalid');
  assert.equal(r.calendar.searchParams.has('hide_gdpr_banner'), false);
  assert.match(html, /<meta name="referrer" content="no-referrer"/);
  assert.match(html, /id="calendlyFallback" href="https:\/\/calendly\.com\/finabiz-mx\/sesion-estrategica-gratuita"/);
});

test('agenda with personal parameters skips GA when history cleanup fails', () => {
  const r = visit('?name=QA&email=qa%40example.invalid', true);
  assert.deepEqual(r.order, []);
  assert.equal(r.window.dataLayer, undefined);
  assert.equal(r.calendar.searchParams.get('email'), 'qa@example.invalid');
});


test('agenda uses manual initialization after receiving its URL and keeps a fallback on SDK error', () => {
  const working = visit('', false, true);
  assert.equal(working.mount.url, working.calendar.href);
  assert.equal(working.frame.hidden, false);
  const blocked = visit('');
  assert.equal(blocked.frame.hidden, true);
  assert.match(blocked.status.textContent, /enlace directo/);
  assert.match(html, /La sesión dura 30 minutos/);
});
