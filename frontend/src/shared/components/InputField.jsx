import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

function InputField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  labelClassName = '',
  inputClassName = '',
  options = [],
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const isSelectField = type === 'select';
  const inputType = isPasswordField && showPassword ? 'text' : type;
  const inputId = id || name;
  const baseInputClassName = [
    'w-full rounded-2xl border border-secondary-200 bg-white px-4 py-4 font-geist text-sm text-primary outline-none transition',
    'placeholder:text-secondary focus:border-primary-200/75 focus:ring-2 focus:ring-primary/10',
    disabled ? 'cursor-not-allowed bg-secondary/60' : '',
    isPasswordField ? 'pr-20' : '',
    isSelectField ? 'appearance-none pr-10' : '',
    inputClassName,
  ]
    .join(' ')
    .trim();

  return (
    <div className={`w-full ${className}`.trim()}>
      {label ? (
        <label
          htmlFor={inputId}
          className={`mb-2 block font-geist text-sm font-regul text-secondary ${labelClassName}`.trim()}
        >
          {label}
          {required ? (
            <span className="ml-1 text-red-600 text-xs" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div className="relative">
        {isSelectField ? (
          <>
            <select
              id={inputId}
              name={name}
              value={value}
              onChange={onChange}
              required={required}
              disabled={disabled}
              autoComplete={autoComplete}
              aria-required={required}
              className={baseInputClassName}
            >
              {placeholder ? (
                <option value="" disabled>
                  {placeholder}
                </option>
              ) : null}
              {options.map((option) => {
                const optionValue =
                  typeof option === 'object' ? option.value : option;
                const optionLabel =
                  typeof option === 'object' ? option.label : option;

                return (
                  <option key={optionValue} value={optionValue}>
                    {optionLabel}
                  </option>
                );
              })}
            </select>
            <FaChevronDown
              size={12}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-secondary"
            />
          </>
        ) : (
          <input
            id={inputId}
            name={name}
            type={inputType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoComplete={autoComplete}
            aria-required={required}
            className={baseInputClassName}
          />
        )}

        {isPasswordField ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 font-geist text-xs font-medium text-primary-200 cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default InputField;
