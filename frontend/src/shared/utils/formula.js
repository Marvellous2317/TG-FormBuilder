import { create, all } from 'mathjs';

const math = create(all);

math.import(
  {
    // average is called mean in mathjs
    average: (...args) => math.mean(...args),
    // variadic count
    count: (...args) => args.length,
    // ternary if
    // if: (condition, trueVal, falseVal) => (condition ? trueVal : falseVal),
    if: (...args) => {
      // Throw a hard error if they don't provide exactly 3 arguments
      if (args.length !== 3) {
        throw new Error(
          `The IF function requires exactly 3 arguments: IF(condition, true_value, false_value). You provided ${args.length}. Check your parentheses!`,
        );
      }
      return args[0] ? args[1] : args[2];
    },
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
  if (!expression?.trim())
    return { valid: false, error: 'Expression is empty' };
  try {
    const scope = Object.fromEntries(
      fieldRefs.map((ref) => [ref.toLowerCase(), 1]),
    );
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
      Object.entries(fieldValues).map(([k, v]) => {
        const num = Number(v);
        return [
          k.toLowerCase(),
          v !== '' && !isNaN(num) ? num : String(v ?? ''),
        ];
      }),
    );
    const result = math.evaluate(expression.toLowerCase(), scope);
    return { value: result, error: null };
  } catch (e) {
    return { value: null, error: e.message };
  }
};
