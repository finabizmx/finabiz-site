(() => {
  const property = 'G-VDZXBBNES7';
  const storageKey = 'finabiz_attribution_v1';
  const consentKey = 'finabiz_analytics_consent_v1';
  const cookiePrefix = 'finabiz_web';
  const campaignFields = ['utm_source', 'utm_medium', 'utm_campaign'];
  const script = document.currentScript;
  const asUrl = value => {
    try { return value ? new URL(value, location.origin) : null; }
    catch { return null; }
  };
  const usablePath = value => typeof value === 'string' && /^\/(?:[a-z0-9-]{1,110}\.html)?$/.test(value);
  const canonical = asUrl(document.querySelector('link[rel="canonical"]')?.href);
  const proposedPath = script?.dataset.page || (canonical?.hostname === 'finabiz.mx' ? canonical.pathname : '/');
  const pagePath = usablePath(proposedPath) ? proposedPath : '/';
  const pageLocation = new URL(pagePath, 'https://finabiz.mx');
  const referrer = script?.dataset.referrer === 'omit' ? null : asUrl(document.referrer);
  const referrerOrigin = referrer && /^https?:$/.test(referrer.protocol) ? referrer.origin : '';

  // Campaign labels are optional. Reject free-form input, emails, RFCs, CURPs and phone-like values.
  function campaignLabels(getValue) {
    const labels = {};
    for (const key of campaignFields) {
      const value = getValue(key);
      if (typeof value === 'string' && /^[a-z0-9][a-z0-9._-]{0,79}$/i.test(value)
          && !/[a-z]{3,4}\d{6}[a-z0-9]{3}/i.test(value)
          && !/[a-z]{4}\d{6}[hm][a-z]{5}[a-z0-9]\d/i.test(value)
          && !/^(?:[+._-]*\d){8,}[._-]*$/.test(value)) labels[key] = value;
    }
    return labels;
  }

  const incoming = new URLSearchParams(location.search);
  const campaign = campaignLabels(key => incoming.get(key));
  for (const [key, value] of Object.entries(campaign)) pageLocation.searchParams.set(key, value);

  function classifyReferral(host) {
    if (!host || host === 'finabiz.mx' || host.endsWith('.finabiz.mx')) return {};
    if (/^(www\.)?google\.(com(?:\.[a-z]{2})?|co\.[a-z]{2}|[a-z]{2})$/.test(host)) {
      return { utm_source: 'google', utm_medium: 'organic' };
    }
    if (/^(www\.)?bing\.com$/.test(host)) return { utm_source: 'bing', utm_medium: 'organic' };
    if (/^(?:[a-z0-9-]+\.)*search\.yahoo\.com$/.test(host)) return { utm_source: 'yahoo', utm_medium: 'organic' };

    const assistants = {
      'chatgpt.com': 'chatgpt', 'chat.openai.com': 'chatgpt',
      'perplexity.ai': 'perplexity', 'www.perplexity.ai': 'perplexity',
      'gemini.google.com': 'gemini', 'claude.ai': 'claude',
      'copilot.microsoft.com': 'copilot',
    };
    if (Object.hasOwn(assistants, host)) return { utm_source: assistants[host], utm_medium: 'ai-assistant' };

    const social = host.match(/(?:^|\.)(facebook\.com|instagram\.com|linkedin\.com|tiktok\.com|youtube\.com|x\.com)$/);
    if (social) return { utm_source: social[1], utm_medium: 'social' };

    const source = campaignLabels(key => key === 'utm_source' ? host : null);
    return source.utm_source ? { ...source, utm_medium: 'referral' } : {};
  }

  const exclude = location.origin !== 'https://finabiz.mx'
    || navigator.globalPrivacyControl === true
    || window['ga-disable-' + property] === true
    || document.documentElement.dataset.analyticsDisabled === 'true';

  function readAttribution() {
    let saved;
    try { saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); }
    catch { /* Private browsing can restrict session storage. */ }

    if (usablePath(saved?.landing_page)) {
      return { ...campaignLabels(key => saved[key]), landing_page: saved.landing_page };
    }
    const inferred = classifyReferral(referrerOrigin ? referrer.hostname : '');
    const firstTouch = { ...(campaign.utm_source ? {} : inferred), ...campaign, landing_page: pagePath };
    try { sessionStorage.setItem(storageKey, JSON.stringify(firstTouch)); }
    catch { /* Attribution is still available on this page. */ }
    return firstTouch;
  }

  const payload = { page_location: pageLocation.href, page_referrer: referrerOrigin };
  const trackedEvents = new Set(['click_agendar_llamada', 'formulario_iniciado', 'formulario_completado', 'click_whatsapp']);
  if (pagePath === '/agenda.html') trackedEvents.add('llamada_agendada');
  const adsDenied = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
  const gaDisabled = 'ga-disable-' + property;
  let attribution = {};
  let consent;
  let tag;
  window.finabizAnalytics = {
    get attribution() { return attribution; },
    track(name, category) {
      if (consent !== 'granted' || !trackedEvents.has(name) || typeof window.gtag !== 'function') return false;
      window.gtag('event', name, { ...payload, event_category: category, page_path: pagePath });
      return true;
    },
  };
  if (exclude) return;

  function enableAnalytics() {
    attribution = readAttribution();
    window[gaDisabled] = false;
    if (tag) {
      window.gtag('consent', 'update', { ...adsDenied, analytics_storage: 'granted' });
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { ...adsDenied, analytics_storage: 'denied' });
    window.gtag('consent', 'update', { ...adsDenied, analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', property, {
      ...payload,
      cookie_prefix: cookiePrefix,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + property;
    document.head.append(tag);
  }

  function setConsent(choice) {
    if (consent === choice) return;
    consent = choice;
    try { localStorage.setItem(consentKey, choice); }
    catch { /* The choice is still enforced on this page. */ }

    if (choice === 'granted') {
      enableAnalytics();
    } else {
      window[gaDisabled] = true;
      attribution = {};
      if (tag) window.gtag('consent', 'update', { ...adsDenied, analytics_storage: 'denied' });
      try { sessionStorage.removeItem(storageKey); }
      catch { /* No attribution will be used without consent. */ }
      for (const cookie of [cookiePrefix + '_ga', cookiePrefix + '_ga_' + property.slice(2)]) {
        const expired = cookie + '=; Max-Age=0; Path=/; Secure; SameSite=Lax';
        document.cookie = expired;
        document.cookie = expired + '; Domain=finabiz.mx';
      }
    }
    window.dispatchEvent(new Event('finabiz-analytics-preference'));
  }

  try { consent = localStorage.getItem(consentKey); }
  catch { /* An unavailable store leaves the default unchanged. */ }
  if (consent === 'granted') enableAnalytics();

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = '/assets/analytics-consent.css';
  document.head.append(stylesheet);

  const panel = document.createElement('section');
  panel.id = 'analytics-preference-panel';
  panel.className = 'analytics-preference-panel';
  panel.setAttribute('aria-labelledby', 'analytics-preference-title');
  panel.innerHTML = `
    <h2 id="analytics-preference-title" tabindex="-1">Preferencias de privacidad</h2>
    <p>Puedes permitir la medición opcional de visitas y clics con Google Analytics. Tu elección se puede cambiar en cualquier momento. <a href="/aviso-de-privacidad.html">Aviso de privacidad</a></p>
    <div class="analytics-preference-actions">
      <button type="button" data-consent="denied">Solo necesarias</button>
      <button type="button" data-consent="granted">Permitir analítica</button>
    </div>`;

  const preferences = document.createElement('button');
  preferences.type = 'button';
  preferences.className = 'analytics-preference-button';
  preferences.textContent = 'Preferencias de privacidad';
  preferences.setAttribute('aria-controls', panel.id);

  let openedFromFooter = false;
  function showPanel(visible, moveFocus = false) {
    panel.hidden = !visible;
    preferences.setAttribute('aria-expanded', String(visible));
    if (moveFocus && visible) panel.querySelector('h2').focus();
  }

  preferences.addEventListener('click', () => {
    openedFromFooter = panel.hidden;
    showPanel(panel.hidden, true);
  });
  panel.querySelectorAll('[data-consent]').forEach(button => {
    button.addEventListener('click', () => {
      setConsent(button.dataset.consent);
      showPanel(false);
      if (openedFromFooter) preferences.focus({ preventScroll: true });
    });
  });
  (document.querySelector('footer') || document.body).append(preferences);
  document.body.append(panel);
  showPanel(consent !== 'granted' && consent !== 'denied');
})();
