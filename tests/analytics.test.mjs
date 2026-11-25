import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../assets/analytics.js', import.meta.url), 'utf8');
const consentKey = 'finabiz_analytics_consent_v1';

function element(properties = {}) {
  const listeners = new Map();
  return {
    ...properties,
    addEventListener: (name, fn) => listeners.set(name, fn),
    click: () => listeners.get('click')(),
    setAttribute() {},
    append() {},
    focus() {},
  };
}

function load({
  url = 'https://finabiz.mx/',
  canonical = 'https://finabiz.mx/',
  referrer = '',
  data = {},
  gpc = false,
  storage = new Map(),
  consent = 'granted',
} = {}) {
  const window = { dispatchEvent() {} };
  const requests = [];
  const cookies = [];
  const choices = ['denied', 'granted'].map(consent => element({ dataset: { consent } }));
  const panel = element({ querySelectorAll: () => choices, querySelector: () => element() });
  const preferences = element();
  const document = {
    referrer, currentScript: { dataset: data }, documentElement: { dataset: {} },
    body: element(),
    querySelector: selector => selector.startsWith('link') && canonical ? { href: canonical } : null,
    createElement: tag => tag === 'section' ? panel : tag === 'button' ? preferences : {},
    head: { append: item => { if (item.src) requests.push(item.src); } },
    set cookie(value) { cookies.push(value); },
  };
  const sessionStorage = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  const persistent = new Map(consent ? [[consentKey, consent]] : []);
  const localStorage = { getItem: key => persistent.get(key), setItem: (key, value) => persistent.set(key, value) };
  runInNewContext(script, { window, document, sessionStorage, localStorage, location: new URL(url), URL, URLSearchParams, Event, navigator: { globalPrivacyControl: gpc } });
  return { window, requests, storage, persistent, cookies, panel, preferences, choices, attribution: { ...window.finabizAnalytics.attribution } };
}

test('analytics uses the existing property and sanitizes locations, referrers and event payloads', () => {
  const { window, requests, attribution } = load({
    url: 'https://finabiz.mx/calculadora-iva-resico.html?utm_source=correo&utm_campaign=demo&email=qa%40example.invalid&rfc=XAXX010101000&at16=12349999&utm_medium=XEXX010101000#datos',
    canonical: 'https://finabiz.mx/calculadora-iva-resico.html',
    referrer: 'https://www.google.com.mx/search?correo=qa%40example.invalid',
  });
  assert.equal(requests.length, 1);
  assert.match(requests[0], /G-VDZXBBNES7$/);
  const config = window.dataLayer.find(([command]) => command === 'config')[2];
  assert.equal(config.page_location, 'https://finabiz.mx/calculadora-iva-resico.html?utm_source=correo&utm_campaign=demo');
  assert.equal(config.page_referrer, 'https://www.google.com.mx');
  assert.deepEqual(attribution, { utm_source: 'correo', utm_campaign: 'demo', landing_page: '/calculadora-iva-resico.html' });
  window.finabizAnalytics.track('formulario_iniciado', 'lead');
  window.finabizAnalytics.track('llamada_agendada', 'lead');
  assert.deepEqual(Array.from(window.dataLayer).filter(([command]) => command === 'event').map(([, name]) => name), ['formulario_iniciado']);
  assert.doesNotMatch(JSON.stringify(window.dataLayer), /example.invalid|XAXX|XEXX|12349999|#datos/);
});

test('referring host classification separates search, social, AI and referral', () => {
  for (const [host, source, medium] of [
    ['www.google.com.mx', 'google', 'organic'], ['www.bing.com', 'bing', 'organic'],
    ['mx.search.yahoo.com', 'yahoo', 'organic'], ['m.facebook.com', 'facebook.com', 'social'],
    ['chatgpt.com', 'chatgpt', 'ai-assistant'], ['example.invalid', 'example.invalid', 'referral'],
  ]) {
    const { attribution } = load({ referrer: 'https://' + host + '/path?private=discarded' });
    assert.equal(attribution.utm_source, source, host);
    assert.equal(attribution.utm_medium, medium, host);
  }
  assert.deepEqual(load({ referrer: 'https://finabiz.mx/contabilidad-para-ecommerce.html' }).attribution, { landing_page: '/' });
});

test('first landing survives navigation and unavailable session storage degrades safely', () => {
  const first = load({ referrer: 'https://www.bing.com/search?q=qa' });
  const later = load({ url: 'https://finabiz.mx/calculo-de-impuestos.html?utm_source=other', canonical: 'https://finabiz.mx/calculo-de-impuestos.html', storage: first.storage });
  assert.deepEqual(later.attribution, first.attribution);
  const unavailable = { get() { throw new Error('Unavailable'); }, set() { throw new Error('Unavailable'); } };
  assert.equal(load({ referrer: 'https://chatgpt.com/', storage: unavailable }).attribution.utm_medium, 'ai-assistant');
});

test('privacy opt-out and previews avoid a tag request or a session-storage write', () => {
  for (const options of [{ gpc: true }, { url: 'http://127.0.0.1:8831/' }]) {
    const { requests, window, attribution } = load(options);
    assert.equal(requests.length, 0);
    assert.equal(window.dataLayer, undefined);
    assert.deepEqual(attribution, {});
    window.finabizAnalytics.track('click_whatsapp', 'engagement');
  }
});

test('unknown paths in the 404 template are not exposed', () => {
  const { window } = load({ canonical: null, url: 'https://finabiz.mx/persona-qa@example.invalid', data: { page: '/404.html' } });
  assert.equal(window.dataLayer.find(([command]) => command === 'config')[2].page_location, 'https://finabiz.mx/404.html');
});

test('analytics and attribution remain off until an affirmative choice and stop on withdrawal', () => {
  const { window, storage, requests, cookies, persistent, panel, preferences, choices } = load({ consent: null });
  assert.equal(requests.length, 0);
  assert.equal(storage.size, 0);
  assert.equal(panel.hidden, false);
  window.finabizAnalytics.track('click_whatsapp', 'engagement');
  assert.equal(window.dataLayer, undefined);
  choices[1].click();
  assert.equal(persistent.get(consentKey), 'granted');
  assert.equal(requests.length, 1);
  assert.equal(storage.size, 1);
  assert.equal(panel.hidden, true);
  assert.equal(window.dataLayer[0][2].analytics_storage, 'denied');
  assert.equal(window.dataLayer[1][2].analytics_storage, 'granted');
  assert.equal(window.dataLayer[1][2].ad_storage, 'denied');
  window.finabizAnalytics.track('click_whatsapp', 'engagement');
  assert.equal(window.dataLayer.at(-1)[1], 'click_whatsapp');
  preferences.click();
  choices[0].click();
  assert.equal(persistent.get(consentKey), 'denied');
  assert.equal(window['ga-disable-G-VDZXBBNES7'], true);
  assert.equal(storage.size, 0);
  assert.equal(Object.keys(window.finabizAnalytics.attribution).length, 0);
  assert.ok(cookies.every(value => value.includes('finabiz_web_ga') && value.includes('Max-Age=0')));
  assert.equal(window.dataLayer.at(-1)[2].analytics_storage, 'denied');
  window.finabizAnalytics.track('click_whatsapp', 'engagement');
  assert.equal(window.dataLayer.at(-1)[1], 'update');
  assert.equal(load({ consent: 'denied' }).requests.length, 0);
});
