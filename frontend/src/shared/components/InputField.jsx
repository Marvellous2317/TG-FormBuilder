import React, { useState } from 'react';
import DropdownSelect from './DropdownSelect';

function InputField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  readOnly = false,
  disabled = false,
  autoComplete,
  className = '',
  labelClassName = '',
  inputClassName = '',
  options = [],
  rows = 4,
  searchable = false,
  onExternalSearchChange,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const isSelectField = type === 'select';
  const isTextAreaField = type === 'textarea';
  const inputType = isPasswordField && showPassword ? 'text' : type;
  const inputId = id || name;

  // Disabled overrides readOnly – if disabled, the field is completely inert
  const isDisabled = disabled;
  const isReadOnly = !disabled && readOnly; // readOnly only applies if not disabled

  // Build dynamic classes for inputs / textareas
  const baseInputClassName = [
    'w-full rounded-2xl border bg-white px-4 py-4 font-geist text-sm outline-none transition',
    'placeholder:text-secondary focus:border-primary-200/75 focus:ring-2 focus:ring-primary/10',
    // Border color based on state
    isDisabled || isReadOnly
      ? 'border-secondary-200 text-secondary!'
      : 'border-secondary-200',
    // Background and text styles for different states
    isDisabled
      ? 'bg-secondary-50 text-secondary-400 cursor-not-allowed opacity-70'
      : isReadOnly
        ? 'bg-secondary-50 text-secondary-700 cursor-default' // focusable but not-editable
        : 'bg-white text-primary!',
    isPasswordField ? 'pr-20' : '',
    isTextAreaField ? 'min-h-28 resize-y' : '',
    inputClassName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  // For DropdownSelect we need to pass readOnly/disabled correctly
  const selectButtonClasses = [
    'rounded-2xl border-secondary-200 py-4',
    isDisabled
      ? 'cursor-not-allowed bg-secondary-50 opacity-70'
      : isReadOnly
        ? 'cursor-default bg-secondary-50'
        : '',
    inputClassName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <div className={`w-full ${className}`.trim()}>
      {label && (
        <label
          htmlFor={inputId}
          className={`mb-2 block font-geist text-sm font-regular text-secondary ${labelClassName}`.trim()}
        >
          {label}
          {required && (
            <span className="ml-1 text-red-600 text-xs" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {isSelectField ? (
          <DropdownSelect
            value={value}
            options={options.map((option) =>
              typeof option === 'object'
                ? option
                : { value: option, label: option },
            )}
            onChange={(val) =>
              !isDisabled &&
              !isReadOnly &&
              onChange({ target: { value: val, name } })
            }
            placeholder={placeholder}
            disabled={isDisabled}
            readOnly={isReadOnly}
            searchable={searchable && !isDisabled && !isReadOnly}
            onExternalSearchChange={onExternalSearchChange}
            onLoadMore={onLoadMore}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            buttonClassName={selectButtonClasses}
          />
        ) : isTextAreaField ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={!isDisabled && !isReadOnly ? onChange : undefined}
            placeholder={placeholder}
            required={required}
            readOnly={isReadOnly}
            disabled={isDisabled}
            autoComplete={autoComplete}
            aria-required={required}
            rows={rows}
            className={baseInputClassName}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={inputType}
            value={value}
            onChange={!isDisabled && !isReadOnly ? onChange : undefined}
            placeholder={placeholder}
            readOnly={isReadOnly}
            required={required}
            disabled={isDisabled}
            autoComplete={autoComplete}
            aria-required={required}
            className={baseInputClassName}
          />
        )}

        {isPasswordField && !isDisabled && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 font-geist text-xs font-medium text-primary-200 cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
    </div>
  );
}

export default InputField;
