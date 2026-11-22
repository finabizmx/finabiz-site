(() => {
  const header = document.getElementById('nav');
  const toggle = document.getElementById('burger');
  const navigation = document.getElementById('navLinks');
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
    link.addEventListener('click', () => setOpen(false));
  });
})();
