(() => {
  const formId = 'ykt2ayIi';
  const formUrl = 'https://form.typeform.com/to/' + formId;
  const overlay = document.getElementById('tfOverlay');
  const host = document.getElementById('tfOverlayWidget');
  const closeButton = document.getElementById('tfOverlayClose');
  const status = document.getElementById('tfOverlayStatus');

  const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign'];
  const storageKey = 'finabiz_attribution_v1';
  let saved = {};
  try {
    saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}') || {};
  } catch {
    // Private browsing can restrict session storage.
  }
  const query = new URLSearchParams(location.search);
  const attribution = {};
  campaignKeys.forEach(key => {
    const value = saved[key] || query.get(key);
    if (typeof value === 'string' && value) attribution[key] = value.slice(0, 120);
  });

  if (!attribution.utm_source && document.referrer) {
    const sourceHost = new URL(document.referrer).hostname.toLowerCase();
    const sources = [
      [/^(chatgpt\.com|chat\.openai\.com)$/, 'chatgpt'],
      [/^(www\.)?perplexity\.ai$/, 'perplexity'],
      [/^gemini\.google\.com$/, 'gemini'],
      [/^(www\.)?google\.[a-z.]+$/, 'google'],
      [/^(www\.)?bing\.com$/, 'bing'],
    ];
    const source = sources.find(([pattern]) => pattern.test(sourceHost));
    if (source) {
      attribution.utm_source = source[1];
      attribution.utm_medium ||= 'referral';
    }
  }
  attribution.landing_page = typeof saved.landing_page === 'string'
    ? saved.landing_page.slice(0, 200)
    : location.pathname.slice(0, 200);
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(attribution));
  } catch {
    // The current page can still forward attribution to the form.
  }

  function track(name, category, label) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, {
        event_category: category,
        ...(label && { event_label: label }),
        page_path: location.pathname,
      });
    }
  }

  let sdkRequest;
  let mounted = false;
  let submitted = false;
  let restoreOverflow = '';
  let readyTimer;

  function loadSdk() {
    if (typeof window.tf?.createWidget === 'function') return Promise.resolve(window.tf);
    if (!sdkRequest) {
      sdkRequest = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://embed.typeform.com/next/embed.js';
        const timer = setTimeout(fail, 8000);

        function fail() {
          clearTimeout(timer);
          script.remove();
          reject(new Error('El SDK de Typeform no está disponible'));
        }

        script.addEventListener('error', fail, { once: true });
        script.addEventListener('load', () => {
          clearTimeout(timer);
          if (typeof window.tf?.createWidget === 'function') resolve(window.tf);
          else fail();
        }, { once: true });
        document.head.append(script);
      }).catch(error => {
        sdkRequest = undefined;
        throw error;
      });
    }
    return sdkRequest;
  }

  function setStatus(message) {
    status.textContent = message;
    status.hidden = !message;
  }

  async function mount() {
    if (mounted) return;
    setStatus('Cargando formulario de orientación…');
    try {
      const sdk = await loadSdk();
      if (!overlay.open || mounted) return;
      readyTimer = setTimeout(() => {
        setStatus('El formulario está tardando. Puedes abrirlo directamente.');
      }, 10000);
      sdk.createWidget(formId, {
        container: host,
        width: '100%',
        height: '100%',
        inlineOnMobile: true,
        hidden: attribution,
        iframeProps: {
          title: 'Formulario previo a tu llamada de orientación',
          allow: "camera 'none'; microphone 'none'",
        },
        onReady() {
          clearTimeout(readyTimer);
          setStatus('');
        },
        onSubmit(event) {
          if (event?.formId !== formId || submitted) return;
          submitted = true;
          track('formulario_completado', 'lead');
        },
      });
      mounted = true;
    } catch {
      clearTimeout(readyTimer);
      host.replaceChildren();
      if (overlay.open) setStatus('No se pudo cargar el formulario aquí. Puedes abrirlo directamente.');
    }
  }

  document.querySelectorAll('a[href^="' + formUrl + '"]').forEach(link => {
    const target = new URL(link.href);
    Object.entries(attribution).forEach(([key, value]) => target.searchParams.set(key, value));
    link.href = target.href;
    if (link.closest('dialog')) return;

    link.addEventListener('click', event => {
      track('click_agendar_llamada', 'conversion', link.className);
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (typeof overlay?.showModal !== 'function' || !host || !status || !closeButton) return;

      restoreOverflow = document.body.style.overflow;
      overlay.showModal();
      document.body.classList.add('tf-open');
      document.body.style.overflow = 'hidden';
      event.preventDefault();
      try {
        history.pushState({ tfOverlay: true }, '', location.href);
      } catch {
        // Closing via the toolbar and Escape still works.
      }
      mount();
    });
  });

  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => {
    link.addEventListener('click', () => track('click_whatsapp', 'engagement', link.className || 'whatsapp-link'));
  });

  if (!overlay || !closeButton || !host || !status) return;

  function close() {
    if (!overlay.open) return;
    overlay.close();
    document.body.classList.remove('tf-open');
    document.body.style.overflow = restoreOverflow;
  }

  function dismiss() {
    close();
    if (history.state?.tfOverlay) history.back();
  }

  closeButton.addEventListener('click', dismiss);
  overlay.addEventListener('click', event => {
    if (event.target === overlay) dismiss();
  });
  overlay.addEventListener('cancel', event => {
    event.preventDefault();
    dismiss();
  });
  window.addEventListener('popstate', close);
})();
