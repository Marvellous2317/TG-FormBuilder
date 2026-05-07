import { create, all } from 'mathjs';

const math = create(all);

math.import(
  {
    // average is called mean in mathjs
    average: (...args) => math.mean(...args),
    // variadic count
    count: (...args) => args.length,
    // ternary if
    if: (condition, trueVal, falseVal) => (condition ? trueVal : falseVal),
    // string concat
    concat: (...args) => args.map(String).join(''),
  },
  { override: true },
);

/**
 * Validate an expression without real values.
 * fieldRefs: array of fieldRef strings e.g. ['field1', 'field2']
 */
export const validateFormula = (expression, fieldRefs = []) => {
  if (!expression?.trim()) return { valid: false, error: 'Expression is empty' };
  try {
    const scope = Object.fromEntries(fieldRefs.map((ref) => [ref.toLowerCase(), 1]));
    math.evaluate(expression.toLowerCase(), scope);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: e.message };
  }
};

/**
 * Evaluate an expression with real field values.
 * fieldValues: { field1: 10, field2: 5, ... }
 */
export const evaluateFormula = (expression, fieldValues = {}) => {
  try {
    const scope = Object.fromEntries(
      Object.entries(fieldValues).map(([k, v]) => [k.toLowerCase(), Number(v) || 0]),
    );
    const result = math.evaluate(expression.toLowerCase(), scope);
    return { value: result, error: null };
  } catch (e) {
    return { value: null, error: e.message };
  }
};
