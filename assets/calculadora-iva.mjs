const importLimits = { fisica: 5_000_000, moral: 50_000_000 };
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const asCents = value => Math.round(value * 100);
const rate = (base, percentage) => Math.round(base * percentage / 100);

export function compareIva({
  regime, at16, at0, exempt, domesticCredit, importCredit, importPaid,
  priorImports, withheld, specialOperations = false,
}) {
  if (!['fisica', 'moral', 'otro', 'sin-confirmar'].includes(regime)) {
    throw new RangeError('Selecciona el régimen para este escenario.');
  }

  const amounts = [at16, at0, exempt, domesticCredit, importCredit, importPaid, priorImports, withheld];
  if (!amounts.every(value => Number.isFinite(value) && value >= 0 && value <= 999_999_999)) {
    throw new RangeError('Captura importes entre $0 y $999,999,999 MXN.');
  }

  const transferred = rate(asCents(at16), 16);
  const retention = asCents(withheld);
  if (retention > transferred) {
    throw new RangeError('Revisa el IVA retenido. En esta simulación debe corresponder al IVA trasladado del mismo mes.');
  }
  if (asCents(importCredit) > asCents(importPaid)) {
    throw new RangeError('El IVA acreditable de importación no puede superar el IVA de importación pagado.');
  }

  const credits = asCents(domesticCredit) + asCents(importCredit);
  const importTax = asCents(importPaid);
  const general = transferred - credits - retention;
  const result = {
    transferred, retention, credits, importTax,
    generalDue: Math.max(0, general),
    generalBalance: Math.max(0, -general),
    option: null,
    reason: '',
  };

  if (specialOperations) {
    return { ...result, generalDue: null, generalBalance: null, reason: 'Las operaciones con estímulos, tasas distintas de 16% o 0%, o IVA definitivo de plataformas requieren un cálculo separado.' };
  }

  const limit = importLimits[regime];
  if (!limit) {
    return { ...result, reason: 'La opción del 7% requiere tributar en RESICO como persona física o moral.' };
  }
  if (priorImports > limit) {
    return { ...result, reason: 'Las importaciones acumuladas hasta el mes anterior superan el límite para esta opción.' };
  }

  const eligibleBase = asCents(at16) + asCents(at0);
  const optionTax = rate(eligibleBase, 7);
  const optionDue = Math.max(0, optionTax - retention);
  const excessWithholding = Math.max(0, retention - optionTax);
  // Costo real de IVA del mes, incluido lo que te retienen. En la mecánica general un
  // resultado negativo es saldo a favor; con la opción, el excedente retenido no se recupera.
  const generalNet = transferred - credits;
  const optionNet = Math.max(optionTax, retention);

  return {
    ...result,
    generalNet,
    option: {
      eligibleBase, optionTax, optionDue, excessWithholding, optionNet,
      paymentDifference: result.generalDue - optionDue,
      netSavings: generalNet - optionNet,
      breakEvenCredit: Math.max(0, transferred - optionNet),
      includesZeroRate: asCents(at0) > 0,
    },
  };
}

function mount(form) {
  const $ = selector => document.querySelector(selector);
  const result = $('#iva-result');
  const empty = $('#iva-empty');
  const status = $('#iva-status');
  const verdict = $('#iva-verdict');
  const set = (selector, text) => { const el = $(selector); if (el) el.textContent = text; };
  const fmt = cents => money.format(cents / 100);
  const render = (field, cents) => set(`[data-iva="${field}"]`, cents === null || cents === undefined ? '—' : fmt(cents));
  const at16 = form.elements.at16;
  const credit = form.elements.domesticCredit;
  const withheld = form.elements.withheld;
  const gastos = $('#gastos');
  const chips = [...form.querySelectorAll('.chip')];
  let retentionRate = 0;

  const peek = $('#iva-peek');
  const card = $('.iva-result');
  let cardVisible = false;
  if ('IntersectionObserver' in window && peek) {
    new IntersectionObserver(entries => {
      cardVisible = entries[0].isIntersecting;
      updatePeek();
    }, { threshold: 0.25 }).observe(card);
  }
  let peekText = '';
  const updatePeek = () => {
    if (!peek) return;
    peek.hidden = cardVisible || !peekText;
    peek.querySelector('[data-peek]').textContent = peekText;
  };

  const showEmpty = (title, note = 'El resultado aparece al momento.') => {
    peekText = '';
    updatePeek();
    result.hidden = true;
    empty.hidden = false;
    empty.querySelector('.empty-v').textContent = title;
    empty.querySelector('.tiny').textContent = note;
  };

  const syncRetention = () => {
    if (!retentionRate) return;
    const base = Number(at16.value) || 0;
    withheld.value = base ? (Math.round(base * retentionRate * 100) / 100).toString() : '';
  };

  const calculate = () => {
    const data = new FormData(form);
    const numeric = name => data.get(name) === '' || data.get(name) === null ? 0 : Number(data.get(name));
    if (!numeric('at16') && !numeric('at0')) return showEmpty('Captura lo que cobras en el mes');
    const invalid = [...form.elements].find(field => field.willValidate && !field.validity.valid);
    if (invalid) return showEmpty('Revisa este dato', `${invalid.closest('label')?.querySelector('.lbl')?.textContent || 'Un importe'}: ${invalid.validationMessage}`);

    let calc;
    try {
      calc = compareIva({
        regime: data.get('regime'),
        at16: numeric('at16'), at0: numeric('at0'), exempt: numeric('exempt'),
        domesticCredit: numeric('domesticCredit'), importCredit: numeric('importCredit'),
        importPaid: numeric('importPaid'), priorImports: numeric('priorImports'),
        withheld: numeric('withheld'), specialOperations: data.has('specialOperations'),
      });
    } catch (error) {
      return showEmpty('Revisa este dato', error.message);
    }
    if (calc.generalDue === null) return showEmpty('Este caso requiere un cálculo a la medida', calc.reason);

    const { option } = calc;
    empty.hidden = true;
    result.hidden = false;

    for (const cell of result.querySelectorAll('[data-iva]')) cell.textContent = '—';
    render('transferred', calc.transferred);
    render('general-credit', calc.credits);
    render('general-retention', calc.retention);
    render('general-due', calc.generalDue);
    render('general-balance', calc.generalBalance);
    render('import-general', calc.importTax);

    const generalCost = calc.generalNet;
    if (!option) {
      verdict.dataset.tone = 'neutral';
      set('[data-verdict="value"]', 'La opción del 7% no aplica');
      set('[data-verdict="year"]', calc.reason);
      set('[data-verdict="note"]', '');
      setBars(generalCost, null);
      status.textContent = '';
      peek.dataset.tone = 'neutral';
      peekText = 'El 7% no aplica';
      updatePeek();
      return;
    }

    render('option-base', option.eligibleBase);
    render('option-tax', option.optionTax);
    render('option-credit', 0);
    render('option-retention', calc.retention);
    render('option-due', option.optionDue);
    render('option-excess', option.excessWithholding);
    render('import-option', calc.importTax);

    const savings = option.netSavings;
    verdict.dataset.tone = savings > 0 ? 'good' : savings < 0 ? 'bad' : 'neutral';
    set('[data-verdict="value"]', savings > 0 ? `Ahorras ${fmt(savings)}` : savings < 0 ? `Pagas ${fmt(-savings)} más` : 'Pagas lo mismo');
    set('[data-verdict="year"]', savings ? `con la opción del 7% · ≈ ${fmt(Math.abs(savings) * 12)} al año` : 'en los dos escenarios');
    set('[data-verdict="note"]', savings >= 0
      ? `Te conviene mientras el IVA de tus gastos sea menor a ${fmt(option.breakEvenCredit)} al mes.`
      : `Solo te convendría si el IVA de tus gastos bajara de ${fmt(option.breakEvenCredit)} al mes.`);
    setBars(generalCost, option.optionNet);
    peek.dataset.tone = verdict.dataset.tone;
    peekText = $('[data-verdict="value"]').textContent + (savings ? ' con el 7%' : '');
    updatePeek();

    const notes = [];
    if (calc.generalBalance > 0) notes.push(`En la mecánica general tendrías ${fmt(calc.generalBalance)} a favor; con la opción se pierde.`);
    if (option.excessWithholding) notes.push(`Te retienen ${fmt(option.excessWithholding)} más que el 7%, y ese excedente no se recupera.`);
    if (option.includesZeroRate) notes.push('Incluimos tus cobros a tasa 0% en la base del 7% (lectura literal de la ley).');
    status.textContent = notes.join(' ');
  };

  const setBars = (generalCost, optionCost) => {
    const max = Math.max(Math.abs(generalCost), Math.abs(optionCost ?? 0), 1);
    const width = value => `${Math.max(2, Math.round(Math.abs(value) / max * 100))}%`;
    $('[data-bar="general"]').style.width = width(generalCost);
    set('[data-bar-v="general"]', generalCost < 0 ? `${fmt(-generalCost)} a favor` : fmt(generalCost));
    const optionRow = $('.bar-row.opt');
    optionRow.hidden = optionCost === null;
    if (optionCost !== null) {
      $('[data-bar="option"]').style.width = width(optionCost);
      set('[data-bar-v="option"]', fmt(optionCost));
    }
  };

  let timer;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(calculate, 150); };

  gastos?.addEventListener('input', () => {
    const value = Number(gastos.value) || 0;
    credit.value = value ? (Math.round(value * 16) / 100).toString() : '';
  });
  at16.addEventListener('input', syncRetention);
  withheld.addEventListener('input', () => {
    retentionRate = 0;
    chips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.ret === '0' && !withheld.value)));
  });
  chips.forEach(chip => chip.addEventListener('click', () => {
    retentionRate = Number(chip.dataset.ret);
    chips.forEach(other => other.setAttribute('aria-pressed', String(other === chip)));
    if (retentionRate) syncRetention(); else withheld.value = '';
    schedule();
  }));
  form.addEventListener('input', schedule);
  form.addEventListener('change', schedule);
  form.addEventListener('submit', event => { event.preventDefault(); calculate(); });
  calculate();
}

const form = typeof document === 'undefined' ? null : document.getElementById('iva-form');
if (form) mount(form);
