import React, { Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { FaChevronDown } from 'react-icons/fa';

function DropdownMenuPortal({
  open,
  buttonRef,
  options,
  value,
  onChange,
  menuClassName,
  itemClassName,
}) {
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 176,
  });

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
      const estimatedMenuHeight = options.length * 40 + 16;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const shouldOpenUpward = spaceBelow < estimatedMenuHeight + 12;

      const left = Math.min(
        Math.max(12, buttonRect.left),
        viewportWidth - menuWidth - 12,
      );

      const top = shouldOpenUpward
        ? Math.max(12, buttonRect.top - estimatedMenuHeight - 8)
        : Math.min(
            buttonRect.bottom + 8,
            viewportHeight - estimatedMenuHeight - 12,
          );

      setMenuPosition({
        top,
        left,
        width: menuWidth,
      });
    };

    updateMenuPosition();

    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open, buttonRef, options.length, value]);

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
      {options.map((option) => {
        const optionLabel = option.label || option.title;
        const isSelected = option.value === value;

        return (
          <MenuItem key={option.value} as={Fragment}>
            {({ active }) => (
              <button
                type="button"
                className={`w-full cursor-pointer rounded-md p-2 text-left font-geist text-sm text-gray-700 ${
                  active ? 'bg-gray-100' : ''
                } ${isSelected ? 'bg-primary-50 text-primary-700' : ''} ${itemClassName}`.trim()}
                onClick={() => onChange(option.value)}
              >
                {optionLabel}
              </button>
            )}
          </MenuItem>
        );
      })}
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
}) {
  const buttonRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value);
  const label = selectedOption?.label || selectedOption?.title || placeholder;

  return (
    <div className={className}>
      <Menu>
        {({ open }) => (
          <>
            <MenuButton
              ref={buttonRef}
              className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-secondary-200 bg-white px-4 py-3 text-left outline-none transition-all duration-150 ease-in-out hover:bg-gray-50 ${buttonClassName}`.trim()}
            >
              <span
                className={`font-geist text-sm ${
                  selectedOption ? 'text-primary' : 'text-tertiary'
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

            <DropdownMenuPortal
              open={open}
              buttonRef={buttonRef}
              options={options}
              value={value}
              onChange={onChange}
              menuClassName={menuClassName}
              itemClassName={itemClassName}
            />
          </>
        )}
      </Menu>
    </div>
  );
}
