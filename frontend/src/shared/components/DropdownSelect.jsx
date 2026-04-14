import React, { Fragment } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { FaChevronDown } from 'react-icons/fa';

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
  const selectedOption = options.find((option) => option.value === value);
  const label = selectedOption?.label || selectedOption?.title || placeholder;

  return (
    <div className={`relative ${className}`.trim()}>
      <Menu>
        {({ open }) => (
          <>
            <MenuButton
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

            <MenuItems
              className={`absolute right-0 top-full z-20 mt-2 flex w-full min-w-44 flex-col rounded-xl border border-gray-200 bg-white p-1 shadow-lg shadow-gray-100 outline-none ${menuClassName}`.trim()}
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
            </MenuItems>
          </>
        )}
      </Menu>
    </div>
  );
}
