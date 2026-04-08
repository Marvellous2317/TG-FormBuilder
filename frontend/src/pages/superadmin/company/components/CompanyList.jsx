import React, { useState, Fragment, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiSearch, FiMoreVertical } from 'react-icons/fi';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { FaChevronDown } from 'react-icons/fa';
import Button from '../../../../shared/components/Button';
import Pagination from '../../../../shared/components/Pagination';

const statusOptions = [
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
];

// Mock data (expanded to demonstrate the scrolling effect)
const tableData = [
  {
    id: 1,
    name: 'Ajayi Tami',
    isActive: true,
    createdAt: '2026-03-13',
    description: 'This is description',
  },
  {
    id: 2,
    name: 'Lennox',
    isActive: true,
    createdAt: '2026-03-13',
    description: 'This is description',
  },
];

export default function CompanyList({ setIsEditCompanyModal }) {
  const [search, setSearch] = useState('');
  const [currentStatus, setCurrentStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const itemsPerPage = 10;

  const handleChange = (event) => {
    const { value } = event.target;
    setSearch(value);
  };

  // Filter data based on search and status
  const filteredData = tableData.filter((row) => {
    const matchesSearch =
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.description.toLowerCase().includes(search.toLowerCase());

    let status = '';
    if (row.status) {
      status = 'Active';
    } else {
      status = 'Inactive';
    }

    const matchesStatus =
      currentStatus === 'all' ||
      status.toLowerCase() === currentStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handlePageChange = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    if (activeMenuId === null) {
      return undefined;
    }

    const closeMenu = () => setActiveMenuId(null);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveMenuId(null);
      }
    };

    window.addEventListener('resize', closeMenu);
    window.addEventListener('scroll', closeMenu, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMenuId]);

  const dropOptions = [
    {
      title: 'Edit',
      value: 'edit',
      onClick: () => {
        setActiveMenuId(null);
        setIsEditCompanyModal(true);
      },
    },
    {
      title: 'Delete',
      value: 'delete',
      onClick: () => setActiveMenuId(null),
    },
  ];

  const toggleRowMenu = (rowId, event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const menuWidth = window.innerWidth < 640 ? 192 : 160;
    const menuHeight = dropOptions.length * 44 + 8;
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const shouldOpenUpward = spaceBelow < menuHeight + 12;

    const left = Math.min(
      Math.max(12, buttonRect.right - menuWidth),
      window.innerWidth - menuWidth - 12,
    );
    const top = shouldOpenUpward
      ? Math.max(12, buttonRect.top - menuHeight - 8)
      : Math.min(buttonRect.bottom + 8, window.innerHeight - menuHeight - 12);

    setMenuPosition({ top, left });
    setActiveMenuId((prevId) => (prevId === rowId ? null : rowId));
  };

  return (
    <div className="border border-gray-200 rounded-xl md:rounded-2xl overflow-hidden bg-white w-full min-h-full">
      <section className="flex-col flex w-full min-h-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full p-3 md:p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 p-2 w-full sm:max-w-sm transition-all">
            <FiSearch className="text-gray-400 shrink-0" size={18} />
            <input
              type="text"
              placeholder="Enter search here"
              value={search}
              onChange={handleChange}
              className="outline-none text-secondary placeholder:text-gray-400 font-geist text-sm w-full bg-transparent"
            />
          </div>

          <div className="relative w-full flex items-center gap-4 sm:w-auto">
            {/* Status dropdown */}
            <Menu>
              {({ open }) => (
                <>
                  <MenuButton className="cursor-pointer flex items-center justify-between sm:justify-center gap-2 outline-none transition-all duration-150 ease-in-out px-3 py-2 rounded-lg hover:bg-gray-50 w-full sm:w-auto border border-secondary-200">
                    <span className="text-secondary font-geist text-sm">
                      {currentStatus === 'all'
                        ? 'All status'
                        : statusOptions.find((s) => s.value === currentStatus)
                            ?.title || 'All status'}
                    </span>
                    <FaChevronDown
                      className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                      size={10}
                    />
                  </MenuButton>
                  <MenuItems className="flex flex-col z-20 absolute top-full right-0 mt-2 bg-white border border-gray-200 outline-none rounded-xl p-1 w-full sm:w-40 shadow-lg shadow-gray-100">
                    <MenuItem as={Fragment}>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } w-full text-left cursor-pointer p-2 rounded-md text-gray-700 text-sm font-geist ${
                            currentStatus === 'all'
                              ? 'bg-primary-50 text-primary-700'
                              : ''
                          }`}
                          onClick={() => setCurrentStatus('all')}
                        >
                          All status
                        </button>
                      )}
                    </MenuItem>
                    {statusOptions.map((status, index) => (
                      <MenuItem key={index} as={Fragment}>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } w-full text-left cursor-pointer p-2 rounded-md text-gray-700 text-sm font-geist ${
                              currentStatus === status.value
                                ? 'bg-primary-50 text-primary-700'
                                : ''
                            }`}
                            onClick={() =>
                              setCurrentStatus(
                                status.value ? 'active' : 'inactive',
                              )
                            }
                          >
                            {status.title}
                          </button>
                        )}
                      </MenuItem>
                    ))}
                  </MenuItems>
                </>
              )}
            </Menu>
          </div>
        </div>

        {/* Table Container - Horizontal scroll on mobile */}
        <div className="w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-100 xl:max-h-140">
          <table className="w-full text-left border-collapse relative min-w-160 md:min-w-full">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-tertiary-300">
                <th className="p-3 md:p-4 w-10 md:w-12 border-r border-b border-gray-200 bg-tertiary-300">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 md:w-4 md:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Name
                </th>
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Description
                </th>
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Status
                </th>
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Created at
                </th>
                <th className="p-3 md:p-4 w-10 md:w-12 border-b border-gray-200 bg-tertiary-300"></th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 md:p-4 border-r border-gray-200">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 md:w-4 md:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-3 md:p-4 text-gray-700 font-geist text-xs md:text-sm border-r border-gray-200 space-y-1">
                      {row.name}
                    </td>
                    <td className="p-3 md:p-4 text-gray-700 font-geist text-xs md:text-sm border-r border-gray-200 wrap-break-words max-w-50 md:max-w-none">
                      {row.description}
                    </td>
                    <td className="p-3 md:p-4 text-gray-700 font-geist text-xs md:text-sm border-r border-gray-200 whitespace-nowrap">
                      {row.isActive ? 'Active' : 'Inactive'}
                    </td>
                    <td className="p-3 md:p-4 text-gray-700 font-geist text-xs md:text-sm border-r border-gray-200">
                      {row.createdAt}
                    </td>
                    <td className="p-3 md:p-4 text-gray-400 hover:text-secondary text-center">
                      <Button
                        type="button"
                        onClick={(event) => toggleRowMenu(row.id, event)}
                        className=" flex items-center justify-between sm:justify-center gap-2 outline-none transition-all duration-150 ease-in-out px-3 py-2 rounded-lg hover:bg-gray-50 w-full sm:w-auto border border-gray-200 sm:border-0"
                      >
                        <FiMoreVertical
                          size={16}
                          className="mx-auto md:w-4.5 md:h-4.5"
                        />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="p-8 text-center text-gray-500 font-geist text-sm"
                  >
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <Pagination
        currentPage={currentPage}
        handlePageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
      />
      {activeMenuId !== null && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-50"
              onClick={() => setActiveMenuId(null)}
              role="presentation"
            >
              <div
                className="absolute flex flex-col bg-white border border-gray-200 outline-none rounded-xl p-1 w-48 sm:w-40 shadow-lg shadow-gray-100"
                style={{
                  top: `${menuPosition.top}px`,
                  left: `${menuPosition.left}px`,
                }}
                onClick={(event) => event.stopPropagation()}
                role="menu"
              >
                {dropOptions.map((option) => (
                  <Button
                    key={option.value}
                    className="w-full text-left p-2 rounded-md text-gray-700 text-sm font-geist hover:bg-gray-100"
                    onClick={option.onClick}
                  >
                    {option.title}
                  </Button>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
