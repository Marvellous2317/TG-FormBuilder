import React, { useState } from 'react';

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
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`.trim()}>
      {label ? (
        <label
          htmlFor={inputId}
          className={`mb-2 block font-geist text-sm font-medium text-primary ${labelClassName}`.trim()}
        >
          {label}
          {required ? (
            <span className="ml-1 text-red-600" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div className="relative">
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
          className={[
            'w-full rounded-md border border-tertiary/30 bg-white px-4 py-2.5 font-geist text-sm text-primary outline-none transition',
            'placeholder:text-tertiary/80 focus:border-primary focus:ring-2 focus:ring-primary/10',
            disabled ? 'cursor-not-allowed bg-secondary/60' : '',
            isPasswordField ? 'pr-20' : '',
            inputClassName,
          ]
            .join(' ')
            .trim()}
        />

        {isPasswordField ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 font-geist text-xs font-medium text-tertiary hover:text-primary"
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
