(() => {
  const property = 'G-VDZXBBNES7';
  const storageKey = 'finabiz_attribution_v1';
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

  let attribution = { landing_page: pagePath };
  if (!exclude) {
    let saved;
    try { saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); }
    catch { /* Private browsing can restrict session storage. */ }

    if (usablePath(saved?.landing_page)) {
      attribution = { ...campaignLabels(key => saved[key]), landing_page: saved.landing_page };
    } else {
      const inferred = classifyReferral(referrerOrigin ? referrer.hostname : '');
      attribution = {
        ...(campaign.utm_source ? {} : inferred),
        ...campaign,
        landing_page: pagePath,
      };
      try { sessionStorage.setItem(storageKey, JSON.stringify(attribution)); }
      catch { /* Attribution is still available on this page. */ }
    }
  }

  const payload = { page_location: pageLocation.href, page_referrer: referrerOrigin };
  const trackedEvents = new Set(['click_agendar_llamada', 'formulario_iniciado', 'formulario_completado', 'click_whatsapp']);
  window.finabizAnalytics = {
    attribution,
    track(name, category) {
      if (!exclude && trackedEvents.has(name) && typeof window.gtag === 'function') {
        window.gtag('event', name, { ...payload, event_category: category, page_path: pagePath });
      }
    },
  };
  if (exclude) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', property, {
    ...payload,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + property;
  document.head.append(tag);
})();
