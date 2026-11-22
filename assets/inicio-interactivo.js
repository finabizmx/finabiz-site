(() => {
  // Both views use the amounts already present in the illustrative reports.
  function readAmount(text) {
    const match = text.trim().match(/^([−-])?\$([\d,]+(?:\.\d+)?)(K)?$/i);
    if (!match) return NaN;
    const [, negative, amount, thousands] = match;
    return Number(amount.replaceAll(',', '')) * (thousands ? 1000 : 1) * (negative ? -1 : 1);
  }

  const utility = document.querySelector('.report-utility');
  const unitControls = document.querySelector('.report-units');
  if (utility && unitControls) {
    const cells = Array.from(utility.querySelectorAll('dd'));
    const amounts = cells.map(cell => cell.textContent.trim());
    const values = amounts.map(readAmount);
    const sales = values[0];
    if (sales > 0 && values.every(Number.isFinite)) {
      const percent = new Intl.NumberFormat('es-MX', { style: 'percent', maximumFractionDigits: 1 });
      const units = unitControls.querySelectorAll('button');
      units.forEach(button => {
        button.addEventListener('click', () => {
          const showShare = button.dataset.utilityUnit === 'share';
          cells.forEach((cell, index) => {
            cell.textContent = showShare ? percent.format(values[index] / sales) : amounts[index];
          });
          units.forEach(unit => unit.setAttribute('aria-pressed', String(unit === button)));
        });
      });
      unitControls.hidden = false;
    }
  }

  const forecast = document.querySelector('.report-forecast');
  const optionTemplate = document.getElementById('projection-option');
  if (forecast && optionTemplate) {
    const months = Array.from(forecast.querySelectorAll('tbody tr'), row => {
      const cells = Array.from(row.cells, cell => cell.textContent.trim());
      const [name, sales, profit, tax] = cells;
      return { name, sales, profit, tax, amount: readAmount(tax || '') };
    });

    if (months.length && months.every(month => month.amount > 0 && Number.isFinite(month.amount))) {
      const max = Math.max(...months.map(month => month.amount));
      const chart = forecast.querySelector('.projection-explorer');
      const bars = chart.querySelector('.projection-bars');
      const detail = chart.querySelector('.projection-detail');

      function selectMonth(month) {
        detail.textContent = `${month.name} · Ventas ${month.sales} · Utilidad ${month.profit}`;
      }

      months.forEach((month, index) => {
        const option = optionTemplate.content.firstElementChild.cloneNode(true);
        const input = option.querySelector('input');
        input.checked = index === 0;
        option.style.setProperty('--bar-height', `${month.amount / max * 100}%`);
        option.querySelector('.projection-month').textContent = month.name;
        option.querySelector('.projection-value').textContent = month.tax;
        input.addEventListener('change', () => {
          if (input.checked) selectMonth(month);
        });
        bars.append(option);
      });
      selectMonth(months[0]);
      chart.hidden = false;
    }
  }

  if (typeof IntersectionObserver === 'function') {
    const enter = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in-view');
        enter.unobserve(entry.target);
      });
    }, { threshold: .16 });

    document.querySelectorAll('.offer-grid, .method-stages, .examples-explorer').forEach(section => enter.observe(section));
  }

  const hero = document.querySelector('.hero-editorial');
  const depth = hero?.querySelector('.hero-depth-stack');
  if (depth && typeof matchMedia === 'function') {
    const tracking = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 920px) and (prefers-reduced-motion: no-preference)');
    let frame = 0;

    function resetDepth() {
      cancelAnimationFrame(frame);
      frame = 0;
      depth.style.removeProperty('--hero-tilt-x');
      depth.style.removeProperty('--hero-tilt-y');
    }

    hero.addEventListener('pointermove', event => {
      if (!tracking.matches || event.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = hero.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - .5;
        const y = (event.clientY - bounds.top) / bounds.height - .5;
        depth.style.setProperty('--hero-tilt-x', `${(-y * 9).toFixed(2)}deg`);
        depth.style.setProperty('--hero-tilt-y', `${(x * 11).toFixed(2)}deg`);
        frame = 0;
      });
    }, { passive: true });
    hero.addEventListener('pointerleave', resetDepth);
    tracking.addEventListener?.('change', resetDepth);
  }
})();
