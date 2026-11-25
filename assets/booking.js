(() => {
  const formId = 'ykt2ayIi';
  const formUrl = 'https://form.typeform.com/to/' + formId;
  const overlay = document.getElementById('tfOverlay');
  const host = document.getElementById('tfOverlayWidget');
  const closeButton = document.getElementById('tfOverlayClose');
  const status = document.getElementById('tfOverlayStatus');

  const analytics = window.finabizAnalytics;
  function track(name, category) {
    analytics?.track(name, category);
  }

  let sdkRequest;
  let mounted = false;
  let widget;
  const started = new Set();
  const submitted = new Set();
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

  function recordFormEvent(event, seen, name) {
    if (event?.formId !== formId) return;
    const response = typeof event.responseId === 'string' ? event.responseId : '';
    if (seen.has(response)) return;
    seen.add(response);
    track(name, 'lead');
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
      widget = sdk.createWidget(formId, {
        container: host,
        width: '100%',
        height: '100%',
        inlineOnMobile: true,
        hidden: analytics?.attribution || {},
        iframeProps: {
          title: 'Formulario previo a tu llamada de orientación',
          allow: "camera 'none'; microphone 'none'",
        },
        onReady() {
          clearTimeout(readyTimer);
          setStatus('');
        },
        onStarted(event) { recordFormEvent(event, started, 'formulario_iniciado'); },
        onSubmit(event) { recordFormEvent(event, submitted, 'formulario_completado'); },
      });
      mounted = true;
    } catch {
      clearTimeout(readyTimer);
      host.replaceChildren();
      if (overlay.open) setStatus('No se pudo cargar el formulario aquí. Puedes abrirlo directamente.');
    }
  }

  document.querySelectorAll('a[href^="' + formUrl + '"]').forEach(link => {
    const original = link.href;
    function updateLink() {
      const target = new URL(original);
      const hidden = new URLSearchParams(target.hash.slice(1));
      Object.entries(analytics?.attribution || {}).forEach(([key, value]) => hidden.set(key, value));
      target.hash = hidden.toString();
      link.href = target.href;
    }
    updateLink();
    window.addEventListener('finabiz-analytics-preference', updateLink);
    link.addEventListener('click', event => {
      track('click_agendar_llamada', 'engagement');
      if (link.closest('dialog')) return;
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
    link.addEventListener('click', () => track('click_whatsapp', 'engagement'));
  });

  if (!overlay || !closeButton || !host || !status) return;

  window.addEventListener('finabiz-analytics-preference', () => {
    if (!mounted) return;
    clearTimeout(readyTimer);
    if (typeof widget?.unmount === 'function') widget.unmount();
    else host.replaceChildren();
    mounted = false;
    if (overlay.open) mount();
  });

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
