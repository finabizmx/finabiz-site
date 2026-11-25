import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../agenda.html', import.meta.url), 'utf8');
const analytics = readFileSync(new URL('../assets/analytics.js', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function visit(search, { rejectHistory = false, withSdk = false, consent = 'granted' } = {}) {
  const order = [];
  const config = {};
  const frame = { hidden: true };
  const status = {};
  const fallback = {};
  const calendarWindow = {};
  const window = { addEventListener(type, handler) { if (type === 'message') config.message = handler; } };
  if (withSdk) window.Calendly = { initInlineWidget(options) { config.mount = options; } };
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
    currentScript: { dataset: { page: '/agenda.html', referrer: 'omit' } },
    documentElement: { dataset: {} },
    querySelector: () => null,
    body: { append() {} },
    createElement: () => ({ setAttribute() {}, addEventListener() {}, querySelectorAll: () => [] }),
    head: { append: element => { if (element.src) order.push('analytics'); } },
    addEventListener(type, handler) { config.ready = handler; },
    getElementById(id) {
      if (id === 'greeting') return {};
      if (id === 'calendlyFrame') return frame;
      if (id === 'calendlyStatus') return status;
      if (id === 'calendlyFallback') return fallback;
      return {
        setAttribute(name, value) { config.calendar = new URL(value); },
        querySelector: selector => selector === 'iframe' ? { contentWindow: calendarWindow } : null,
      };
    },
  };
  const globals = { window, location, history, document, URL, URLSearchParams, navigator: {},
    localStorage: { getItem: () => consent },
    sessionStorage: { getItem: () => null, setItem() {} } };
  runInNewContext(script, globals);
  runInNewContext(analytics, globals);
  config.ready();
  return { window, location, order, calendar: config.calendar, mount: config.mount, frame, status, fallback, message: config.message, calendarWindow };
}

test('agenda removes legacy personal parameters before GA and keeps the calendar prefill', () => {
  const r = visit('?nombre=Persona+QA&correo=qa%40example.invalid&utm_source=demo');
  assert.deepEqual(r.order, ['clean', 'analytics']);
  assert.equal(r.location.search, '?utm_source=demo');
  const config = r.window.dataLayer.find(([command]) => command === 'config')[2];
  assert.equal(config.page_location, 'https://finabiz.mx/agenda.html?utm_source=demo');
  assert.equal(config.page_referrer, '');
  assert.equal(r.calendar.searchParams.get('name'), 'Persona QA');
  assert.equal(r.calendar.searchParams.get('email'), 'qa@example.invalid');
  assert.equal(r.calendar.searchParams.has('hide_gdpr_banner'), false);
  assert.match(html, /<meta name="referrer" content="no-referrer"/);
  assert.match(html, /id="calendlyFallback" href="https:\/\/calendly\.com\/finabiz-mx\/sesion-estrategica-gratuita"/);
});

test('agenda preloads contact data from the fragment into both calendar paths before starting analytics', () => {
  const r = visit('?utm_source=demo&email=legacy%40example.invalid#nombre=Ana+P%C3%A9rez&correo=qa%2Bdemo%40example.invalid', { withSdk: true });
  assert.deepEqual(r.order, ['clean', 'analytics']);
  assert.equal(r.location.href, 'https://finabiz.mx/agenda.html?utm_source=demo');
  assert.equal(r.calendar.searchParams.get('name'), 'Ana Pérez');
  assert.equal(r.calendar.searchParams.get('email'), 'qa+demo@example.invalid');
  assert.equal(r.mount.url, r.fallback.href);
  assert.doesNotMatch(JSON.stringify(r.window.dataLayer), /Pérez|example\.invalid|nombre|correo/);
});

test('agenda with personal parameters skips GA when history cleanup fails', () => {
  for (const params of ['?name=QA&email=qa%40example.invalid', '#nombre=QA&correo=qa%40example.invalid']) {
    const r = visit(params, { rejectHistory: true });
    assert.deepEqual(r.order, []);
    assert.equal(r.window.dataLayer, undefined);
    assert.equal(new URL(r.fallback.href).searchParams.get('email'), 'qa@example.invalid');
  }
});


test('agenda uses manual initialization after receiving its URL and keeps a fallback on SDK error', () => {
  const working = visit('', { withSdk: true });
  assert.equal(working.mount.url, working.calendar.href);
  assert.equal(working.frame.hidden, false);
  const blocked = visit('');
  assert.equal(blocked.frame.hidden, true);
  assert.match(blocked.status.textContent, /enlace directo/);
  assert.match(html, /La sesión dura 30 minutos/);
});

const bookingMessage = source => ({
  source,
  origin: 'https://calendly.com',
  data: {
    event: 'calendly.event_scheduled',
    payload: { invitee: { uri: 'https://api.calendly.com/scheduled_events/test-event/invitees/test-invitee' } },
  },
});

test('agenda records one Calendly confirmation from its own widget without sending reservation details', () => {
  const page = visit('?email=qa%40example.invalid', { withSdk: true });
  const confirmation = bookingMessage(page.calendarWindow);
  const hits = () => Array.from(page.window.dataLayer).filter(([command]) => command === 'event');
  page.message({ ...confirmation, source: {} });
  page.message({ ...confirmation, origin: 'https://form.typeform.com' });
  page.message({ ...confirmation, data: { event: 'calendly.date_and_time_selected' } });
  page.message({ ...confirmation, data: { event: 'calendly.event_scheduled' } });
  assert.equal(hits().length, 0);

  page.message(confirmation);
  page.message(confirmation);
  assert.equal(hits().length, 1);
  const [, name, params] = hits()[0];
  assert.equal(name, 'llamada_agendada');
  assert.equal(params.page_location, 'https://finabiz.mx/agenda.html');
  assert.equal(params.event_category, 'conversion');
  assert.doesNotMatch(JSON.stringify(params), /qa@example|test-invitee|test-event|api\.calendly\.com/);
});

test('agenda leaves Google Analytics disabled for a confirmed booking when consent is denied', () => {
  const page = visit('', { withSdk: true, consent: 'denied' });
  page.message(bookingMessage(page.calendarWindow));
  assert.equal(page.window.dataLayer, undefined);
});
