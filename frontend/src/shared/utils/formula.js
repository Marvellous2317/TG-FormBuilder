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
    strEqual: (a, b) => String(a).toLowerCase() === String(b).toLowerCase(),
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
    const normalizedExpression = normalizeStringEquality(
      normalizeEquality(expression).toLowerCase(),
    );
    math.evaluate(normalizedExpression, scope);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: e.message };
  }
};

/**
 * Evaluate an expression with real field values.
 * fieldValues: { field1: 10, field2: 5, ... }
 */
// Normalize user-written `=` to `==` for equality comparisons.
// mathjs uses `=` for assignment, so IF(X=5,...) always resolves to truthy.
// We replace lone `=` (not already `==`, `!=`, `<=`, `>=`) with `==`.
const normalizeEquality = (expr) => expr.replace(/(?<![=!<>])=(?!=)/g, '==');

const stringValuePattern = String.raw`(?:"[^"]*"|'[^']*'|\d+(?:\.\d+)?[a-z_][a-z0-9_]*)`;
const fieldPattern = String.raw`[a-z_][a-z0-9_]*`;
const comparablePattern = String.raw`(?:${fieldPattern}|${stringValuePattern})`;
const stringEqualityPattern = new RegExp(
  String.raw`(${comparablePattern})\s*==\s*(${comparablePattern})`,
  'gi',
);

const quoteUnitLikeValue = (value) =>
  /^\d+(?:\.\d+)?[a-z_][a-z0-9_]*$/i.test(value) ? `"${value}"` : value;

const normalizeStringEquality = (expr) =>
  expr.replace(stringEqualityPattern, (match, left, right) => {
    const comparesString =
      /^["']/.test(left) ||
      /^["']/.test(right) ||
      /^\d+(?:\.\d+)?[a-z_]/i.test(left) ||
      /^\d+(?:\.\d+)?[a-z_]/i.test(right);

    if (!comparesString) return match;
    return `strEqual(${quoteUnitLikeValue(left)}, ${quoteUnitLikeValue(right)})`;
  });

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
    const normalizedExpression = normalizeStringEquality(
      normalizeEquality(expression).toLowerCase(),
    );
    let result = math.evaluate(normalizedExpression, scope);

    // mathjs can return a DenseMatrix (e.g. [21.6]) for certain expressions.
    // Unwrap to a scalar so callers always receive a plain number or string.
    if (result != null && typeof result === 'object') {
      if (typeof result.toArray === 'function') {
        const flat = result.toArray().flat(Infinity);
        result = flat.length === 1 ? flat[0] : flat;
      } else if (Array.isArray(result)) {
        result = result.length === 1 ? result[0] : result;
      }
    }

    return { value: result, error: null };
  } catch (e) {
    return { value: null, error: e.message };
  }
};

export const formatComputedValue = (value) => {
  const numericValue = Number(value);

  if (value !== '' && value != null && Number.isFinite(numericValue)) {
    return numericValue.toFixed(2);
  }

  return value;
};
