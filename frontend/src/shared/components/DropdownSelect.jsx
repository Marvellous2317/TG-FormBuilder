import React, { Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { FaCheck, FaChevronDown } from 'react-icons/fa';

function DropdownMenuPortal({
  open,
  buttonRef,
  options,
  value,
  onChange,
  multiple,
  menuClassName,
  itemClassName,
  searchable,
  searchQuery,
  onSearchChange,
  onExternalSearchChange,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
}) {
  const searchRef = useRef(null);
  const sentinelRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 176,
    listMaxHeight: 208,
  });

  // Only filter client-side when there's no API-driven search handler
  const filteredOptions =
    searchable && !onExternalSearchChange
      ? options.filter((o) =>
          String(o?.label ?? o?.title ?? o ?? '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        )
      : options;

  useEffect(() => {
    if (open && searchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open, searchable]);

  // IntersectionObserver to trigger next page fetch
  useEffect(() => {
    if (!onLoadMore || !hasNextPage || !sentinelRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, hasNextPage, isFetchingNextPage, open]);

  useEffect(() => {
    if (!open || !buttonRef.current) {
      return undefined;
    }

    const updateMenuPosition = () => {
      if (!buttonRef.current) {
        return;
      }

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuWidth = Math.max(buttonRect.width, 176);
      const searchBarHeight = searchable ? 44 : 0;
      const padding = 12;
      const gap = 8;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const spaceBelow = viewportHeight - buttonRect.bottom - padding;
      const spaceAbove = buttonRect.top - padding;
      const shouldOpenUpward = spaceBelow < 120 && spaceAbove > spaceBelow;

      const left = Math.min(
        Math.max(padding, buttonRect.left),
        viewportWidth - menuWidth - padding,
      );

      let top;
      let listMaxHeight;

      if (shouldOpenUpward) {
        const availableAbove = spaceAbove - searchBarHeight - gap - 8;
        listMaxHeight = Math.max(80, Math.min(208, availableAbove));
        top = buttonRect.top - searchBarHeight - listMaxHeight - 8 - gap;
      } else {
        top = buttonRect.bottom + gap;
        const availableBelow = spaceBelow - searchBarHeight - gap;
        listMaxHeight = Math.max(80, Math.min(208, availableBelow));
      }

      setMenuPosition({ top, left, width: menuWidth, listMaxHeight });
    };

    updateMenuPosition();

    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open, buttonRef, value, searchable]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <MenuItems
      static
      className={`fixed z-100 mt-0 flex min-w-44 flex-col rounded-xl border border-gray-200 bg-white p-1 shadow-lg shadow-gray-100 outline-none ${menuClassName}`.trim()}
      style={{
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        width: `${menuPosition.width}px`,
      }}
    >
      {searchable && (
        <div className="px-1 pb-1">
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onExternalSearchChange?.(e.target.value);
            }}
            placeholder="Search..."
            className="w-full rounded-lg border border-secondary-200 px-3 py-2 font-geist text-sm text-primary outline-none focus:border-primary-200/75 focus:ring-2 focus:ring-primary/10"
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: `${menuPosition.listMaxHeight}px` }}
      >
        {filteredOptions.length === 0 && !isFetchingNextPage ? (
          <p className="p-2 text-center font-geist text-sm text-tertiary">
            No results
          </p>
        ) : (
          filteredOptions.map((option) => {
            const optionLabel = option.label || option.title || option;
            const optionValue = option.value ?? option;
            const selectedValues = Array.isArray(value) ? value : [];
            const isSelected = multiple
              ? selectedValues.includes(optionValue)
              : optionValue === value;
            const optionClasses =
              `w-full cursor-pointer rounded-md p-2 text-left font-geist text-sm text-tertiary hover:bg-gray-100 ${
                isSelected ? 'bg-primary-50 text-primary-700' : ''
              } ${itemClassName}`.trim();

            if (multiple) {
              return (
                <button
                  key={optionValue}
                  type="button"
                  className={`flex items-center justify-between gap-3 ${optionClasses}`}
                  onClick={() => onChange(optionValue)}
                >
                  <span>{optionLabel}</span>
                  {isSelected && (
                    <FaCheck className="shrink-0 text-[10px] text-primary-700" />
                  )}
                </button>
              );
            }

            return (
              <MenuItem key={optionValue} as={Fragment}>
                {({ active }) => (
                  <button
                    type="button"
                    className={`${optionClasses} ${
                      active ? 'bg-gray-100' : ''
                    }`.trim()}
                    onClick={() => onChange(optionValue)}
                  >
                    {optionLabel}
                  </button>
                )}
              </MenuItem>
            );
          })
        )}
        {hasNextPage && <div ref={sentinelRef} className="h-1" />}
        {isFetchingNextPage && (
          <p className="py-1 text-center font-geist text-xs text-tertiary">
            Loading...
          </p>
        )}
      </div>
    </MenuItems>,
    document.body,
  );
}

export default function DropdownSelect({
  value,
  options = [],
  onChange,
  placeholder = 'Select option',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  itemClassName = '',
  searchable = false,
  multiple = false,
  onExternalSearchChange,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  disabled = false, // ← new prop
  readOnly = false, // ← new prop
}) {
  const buttonRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedValues = Array.isArray(value) ? value : [];
  const selectedOption = options.find((option) => option.value === value);
  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value),
  );
  const hasSelection = multiple ? selectedValues.length > 0 : selectedOption;
  const label = multiple
    ? selectedValues.length === 0
      ? placeholder
      : selectedValues.length === 1
        ? selectedOptions[0]?.label || selectedOptions[0]?.title || '1 selected'
        : `${selectedValues.length} selected`
    : selectedOption?.label || selectedOption?.title || placeholder;

  const handleChange = (val) => {
    if (disabled || readOnly) return; // prevent changes
    if (!multiple) {
      setSearchQuery('');
      onChange(val);
      return;
    }

    const nextValue = selectedValues.includes(val)
      ? selectedValues.filter((selectedValue) => selectedValue !== val)
      : [...selectedValues, val];

    onChange(nextValue);
  };

  // Determine if the dropdown should be interactive
  const isInteractive = !disabled && !readOnly;

  return (
    <div className={className}>
      <Menu>
        {({ open }) => (
          <>
            <MenuButton
              ref={buttonRef}
              disabled={!isInteractive}
              className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-secondary-200 bg-white px-4 py-3 text-left outline-none transition-all duration-150 ease-in-out hover:bg-gray-50 ${
                !isInteractive ? 'cursor-not-allowed bg-gray-50 opacity-70' : ''
              } ${buttonClassName}`.trim()}
            >
              <span
                className={`font-geist text-sm ${
                  hasSelection ? 'text-primary' : 'text-tertiary'
                }`}
              >
                {label}
              </span>
              <FaChevronDown
                className={`shrink-0 text-[10px] text-secondary transition-transform duration-200 ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </MenuButton>

            {isInteractive && (
              <DropdownMenuPortal
                open={open}
                buttonRef={buttonRef}
                options={options}
                value={value}
                onChange={handleChange}
                multiple={multiple}
                menuClassName={menuClassName}
                itemClassName={itemClassName}
                searchable={searchable}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onExternalSearchChange={onExternalSearchChange}
                onLoadMore={onLoadMore}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            )}
          </>
        )}
      </Menu>
    </div>
  );
}
