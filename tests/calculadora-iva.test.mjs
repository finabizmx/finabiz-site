import assert from 'node:assert/strict';
import test from 'node:test';
import { compareIva } from '../assets/calculadora-iva.mjs';

const scenario = {
  regime: 'fisica', at16: 100_000, at0: 0, exempt: 0,
  domesticCredit: 0, importCredit: 0, importPaid: 0, priorImports: 0, withheld: 0,
};
const compare = changes => compareIva({ ...scenario, ...changes });

test('compares a full month and preserves IVA transferred to customers', () => {
  const result = compare({ domesticCredit: 5_000, withheld: 2_000 });
  assert.equal(result.transferred, 1_600_000);
  assert.equal(result.generalDue, 900_000);
  assert.equal(result.option.optionDue, 500_000);
  assert.equal(result.option.paymentDifference, 400_000);
});

test('separates input credits, import IVA, general balance and excess withheld under the option', () => {
  const result = compare({ domesticCredit: 5_000, importCredit: 6_000, importPaid: 8_000, withheld: 8_000 });
  assert.equal(result.importTax, 800_000);
  assert.equal(result.generalDue, 0);
  assert.equal(result.generalBalance, 300_000);
  assert.equal(result.option.optionDue, 0);
  assert.equal(result.option.excessWithholding, 100_000);
});

test('includes zero-rated receipts in the literal scenario and excludes exempt receipts', () => {
  const result = compare({ at16: 0, at0: 100_000, exempt: 40_000, domesticCredit: 5_000 });
  assert.equal(result.generalBalance, 500_000);
  assert.equal(result.option.eligibleBase, 10_000_000);
  assert.equal(result.option.optionDue, 700_000);
  assert.equal(result.option.includesZeroRate, true);
});

test('limits the option by regime and prior-month imported value', () => {
  assert.equal(compare({ regime: 'otro' }).option, null);
  assert.equal(compare({ regime: 'sin-confirmar' }).option, null);
  assert.ok(compare({ priorImports: 5_000_000 }).option);
  assert.equal(compare({ priorImports: 5_000_000.01 }).option, null);
  assert.ok(compare({ regime: 'moral', priorImports: 50_000_000 }).option);
  assert.equal(compare({ regime: 'moral', priorImports: 50_000_000.01 }).option, null);
  assert.equal(compare({ specialOperations: true }).generalDue, null);
});

test('rejects incompatible or invalid amounts and rounds in cents', () => {
  assert.throws(() => compare({ at16: -1 }), RangeError);
  assert.throws(() => compare({ at16: NaN }), RangeError);
  assert.throws(() => compare({ importPaid: 10, importCredit: 11 }), RangeError);
  assert.throws(() => compare({ withheld: 16_001 }), RangeError);
  assert.equal(compare({ at16: 0.19 }).transferred, 3);
  assert.equal(compare({ at16: 0.19 }).option.optionDue, 1);
});
