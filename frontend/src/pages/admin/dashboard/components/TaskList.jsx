import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { FaChevronDown } from 'react-icons/fa';

const status = [
  {
    title: 'Completed',
    value: 'completed',
  },
  {
    title: 'Pending',
    value: 'pending',
  },
];

export default function TaskList() {
  const [search, setSearch] = useState('');
  const [currentStatus, setCurrentStatus] = useState('all');

  const handleChange = (event) => {
    const { value } = event.target;
    setSearch(value);
  };

  return (
    <div className="border border-secondary-200 rounded-2xl">
      <section className="py-3 px-4 flex items-center justify-between w-full">
        <div className="flex items-center gap-2 p-3">
          <FiSearch />
          <input
            type="text"
            placeholder="Enter search here"
            value={search}
            onChange={handleChange}
            className="outline-none text-tertiary placeholder:text-tertiary font-geist text-sm"
          />
        </div>

        <div className="relative">
          <Menu>
            <MenuButton className="cursor-pointer flex items-center gap-1.5 outline-none group transition-all duration-150 ease-in-out">
              <span className="text-tertiary font-geist text-sm">
                All status
              </span>
              <FaChevronDown
                className="group-hover:translate-y-0.5 text-primary"
                size={12}
              />
            </MenuButton>
            <MenuItems className="flex flex-col z-10 absolute top-8 -right-2 bg-white border border-secondary-200 outline-none rounded-[14px] p-2 w-44">
              {status.map((status, index) => (
                <MenuItem
                  key={index}
                  as={'fragment'}
                  className={
                    'cursor-pointer hover:bg-secondary-700 p-2 rounded-md text-secondary-100 text-sm font-geist'
                  }
                  onClick={() => setCurrentStatus(status.value)}
                >
                  {status.title}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
      </section>
    </div>
  );
}
