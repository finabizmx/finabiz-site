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

  return {
    ...result,
    option: {
      eligibleBase, optionTax, optionDue, excessWithholding,
      paymentDifference: result.generalDue - optionDue,
      includesZeroRate: asCents(at0) > 0,
    },
  };
}

function mount(form) {
  const result = document.getElementById('iva-result');
  const status = document.getElementById('iva-status');
  const values = result.querySelectorAll('[data-iva]');
  const render = (field, cents) => {
    result.querySelector(`[data-iva="${field}"]`).textContent = cents === null ? '—' : money.format(cents / 100);
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const numeric = name => data.get(name) === '' ? 0 : Number(data.get(name));
    const invalid = [...form.elements].find(field => field.willValidate && !field.validity.valid);
    if (invalid) {
      result.hidden = true;
      status.textContent = `${invalid.labels[0].textContent.trim()}. ${invalid.validationMessage}`;
      invalid.focus();
      return;
    }

    let calculation;
    try {
      calculation = compareIva({
        regime: data.get('regime'),
        at16: numeric('at16'), at0: numeric('at0'), exempt: numeric('exempt'),
        domesticCredit: numeric('domesticCredit'), importCredit: numeric('importCredit'),
        importPaid: numeric('importPaid'), priorImports: numeric('priorImports'),
        withheld: numeric('withheld'), specialOperations: data.has('specialOperations'),
      });
    } catch (error) {
      result.hidden = true;
      status.textContent = error.message;
      return;
    }

    for (const value of values) value.textContent = '—';
    const { option } = calculation;
    if (calculation.generalDue === null) {
      result.hidden = true;
      status.textContent = calculation.reason;
      return;
    }

    render('transferred', calculation.transferred);
    render('general-retention', calculation.retention);
    render('general-credit', calculation.credits);
    render('general-due', calculation.generalDue);
    render('general-balance', calculation.generalBalance);
    render('import-general', calculation.importTax);
    if (option) {
      render('option-base', option.eligibleBase);
      render('option-tax', option.optionTax);
      render('option-retention', calculation.retention);
      render('option-credit', 0);
      render('option-due', option.optionDue);
      render('option-excess', option.excessWithholding);
      render('import-option', calculation.importTax);
    }

    const details = [calculation.reason || 'Comparativo mensual actualizado.'];
    if (option?.includesZeroRate) details.push('La simulación incluye la tasa 0% en la base del 7% por lectura literal. Confirma este tratamiento antes de optar.');
    if (option?.excessWithholding) details.push('El excedente retenido se muestra por separado. La simulación omite cualquier devolución o aplicación posterior de ese importe.');
    if (option) {
      const difference = option.paymentDifference;
      const impact = money.format(Math.abs(difference) / 100);
      details.push(difference > 0 ? `El pago del mes sería ${impact} menor con la opción.` : difference < 0 ? `El pago del mes sería ${impact} mayor con la opción.` : 'El pago del mes es igual en ambos escenarios.');
    }
    status.textContent = details.join(' ');
    result.hidden = false;
  });

  form.addEventListener('input', () => {
    if (result.hidden) return;
    result.hidden = true;
    status.textContent = 'Capturaste cambios. Selecciona Comparar IVA para actualizar.';
  });
  form.querySelector('button').disabled = false;
}

const form = typeof document === 'undefined' ? null : document.getElementById('iva-form');
if (form) mount(form);
