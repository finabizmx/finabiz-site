(() => {
  const header = document.getElementById('nav');
  const toggle = document.getElementById('burger');
  const navigation = document.getElementById('navLinks');
  const tableRegions = document.querySelectorAll('.article-table-wrap');

  if (tableRegions.length) {
    const updateHints = () => {
      tableRegions.forEach(region => {
        const hint = region.previousElementSibling;
        if (hint?.matches('.article-scroll-hint')) hint.hidden = region.scrollWidth <= region.clientWidth;
      });
    };
    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(updateHints);
      tableRegions.forEach(region => observer.observe(region));
    }
    window.addEventListener('resize', updateHints, { passive: true });
    document.fonts?.ready.then(updateHints);
    updateHints();
  }

  if (!header || !toggle || !navigation) return;

  function setOpen(open) {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }

  toggle.addEventListener('click', () => setOpen(!header.classList.contains('menu-open')));
  header.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !header.classList.contains('menu-open')) return;
    setOpen(false);
    toggle.focus();
  });
  navigation.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const wasOpen = header.classList.contains('menu-open');
      setOpen(false);
      const target = new URL(link.href);
      if (!wasOpen || target.origin !== location.origin || target.pathname !== location.pathname || !target.hash) return;

      let id;
      try {
        id = decodeURIComponent(target.hash.slice(1));
      } catch {
        return;
      }
      const destination = document.getElementById(id);
      if (!destination) return;
      if (!destination.hasAttribute('tabindex')) {
        destination.setAttribute('tabindex', '-1');
        destination.addEventListener('blur', () => destination.removeAttribute('tabindex'), { once: true });
      }
      requestAnimationFrame(() => destination.focus({ preventScroll: true }));
    });
  });
})();
