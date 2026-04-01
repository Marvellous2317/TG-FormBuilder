import React, { useState, Fragment } from 'react';
import { FiSearch, FiMoreVertical } from 'react-icons/fi';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { FaChevronDown } from 'react-icons/fa';

const statusOptions = [
  { title: 'Completed', value: 'completed' },
  { title: 'Pending', value: 'pending' },
];

const dropOtions = [
  { title: 'Unassign', value: 'unassign' },
  { title: 'Assign', value: 'assign' },
  { title: 'Delete log', value: 'delete' },
];

// Mock data (expanded to demonstrate the scrolling effect)
const tableData = [
  {
    id: 1,
    checklist: 'Packaging record',
    docNumber: 'FM / MFG / PKG_MONO / H-1',
    date: 'March 13, 2026',
    assignee: 'Ajayi Tami',
    status: 'Completed',
  },
  {
    id: 2,
    checklist: 'Packaging record',
    docNumber: 'FM / MFG / PKG_MONO / H-1',
    date: 'March 13, 2026',
    assignee: '--',
    status: 'Completed',
  },
  {
    id: 3,
    checklist: 'Packaging record',
    docNumber: 'FM / MFG / PKG_MONO / H-1',
    date: 'March 13, 2026',
    assignee: '--',
    status: 'Pending',
  },
  {
    id: 4,
    checklist: 'Packaging record',
    docNumber: 'FM / MFG / PKG_MONO / H-1',
    date: 'March 13, 2026',
    assignee: '--',
    status: 'Pending',
  },
  {
    id: 5,
    checklist: 'Packaging record',
    docNumber: 'FM / MFG / PKG_MONO / H-1',
    date: 'March 13, 2026',
    assignee: 'Ajayi Tami',
    status: 'Completed',
  },
  {
    id: 6,
    checklist: 'Packaging record',
    docNumber: 'FM / MFG / PKG_MONO / H-1',
    date: 'March 13, 2026',
    assignee: 'Ajayi Tami',
    status: 'Pending',
  },
  {
    id: 7,
    checklist: 'Packaging record',
    docNumber: 'FM / MFG / PKG_MONO / H-1',
    date: 'March 13, 2026',
    assignee: 'Ajayi Tami',
    status: 'Pending',
  },
  {
    id: 8,
    checklist: 'Packaging record',
    docNumber: 'FM / MFG / PKG_MONO / H-1',
    date: 'March 13, 2026',
    assignee: 'Ajayi Tami',
    status: 'Completed',
  },
  {
    id: 9,
    checklist: 'Labeling record',
    docNumber: 'FM / MFG / LBL_MONO / H-2',
    date: 'March 14, 2026',
    assignee: 'Lennox',
    status: 'Completed',
  },
  {
    id: 10,
    checklist: 'Labeling record',
    docNumber: 'FM / MFG / LBL_MONO / H-2',
    date: 'March 14, 2026',
    assignee: 'Lennox',
    status: 'Pending',
  },
  {
    id: 11,
    checklist: 'Quality Assurance',
    docNumber: 'FM / QA / CHK_MONO / H-3',
    date: 'March 15, 2026',
    assignee: '--',
    status: 'Pending',
  },
  {
    id: 12,
    checklist: 'Quality Assurance',
    docNumber: 'FM / QA / CHK_MONO / H-3',
    date: 'March 15, 2026',
    assignee: 'Ajayi Tami',
    status: 'Pending',
  },
];

export default function TaskList() {
  const [search, setSearch] = useState('');
  const [currentStatus, setCurrentStatus] = useState('all');

  const handleChange = (event) => {
    const { value } = event.target;
    setSearch(value);
  };

  const getStatusBadge = (status) => {
    if (status === 'Completed') {
      return (
        <span className="inline-flex px-2 py-1 md:px-3 md:py-1 bg-[#D1F2D6] text-[#1B4D2E] rounded-full text-xs font-medium">
          Completed
        </span>
      );
    }
    if (status === 'Pending') {
      return (
        <span className="inline-flex px-2 py-1 md:px-3 md:py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
          Pending
        </span>
      );
    }
    return <span className="text-xs md:text-sm text-gray-700">{status}</span>;
  };

  // Filter data based on search and status
  const filteredData = tableData.filter((row) => {
    const matchesSearch =
      row.checklist.toLowerCase().includes(search.toLowerCase()) ||
      row.docNumber.toLowerCase().includes(search.toLowerCase()) ||
      row.assignee.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      currentStatus === 'all' ||
      row.status.toLowerCase() === currentStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="border border-gray-200 rounded-xl md:rounded-2xl overflow-hidden bg-white w-full">
      <section className="flex-col flex w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full p-3 md:p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 p-2 w-full sm:max-w-sm transition-all">
            <FiSearch className="text-gray-400 shrink-0" size={18} />
            <input
              type="text"
              placeholder="Enter search here"
              value={search}
              onChange={handleChange}
              className="outline-none text-gray-600 placeholder:text-gray-400 font-geist text-sm w-full bg-transparent"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <Menu>
              {({ open }) => (
                <>
                  <MenuButton className="cursor-pointer flex items-center justify-between sm:justify-center gap-2 outline-none transition-all duration-150 ease-in-out px-3 py-2 rounded-lg hover:bg-gray-50 w-full sm:w-auto border border-gray-200 sm:border-0">
                    <span className="text-gray-600 font-geist text-sm">
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
                            onClick={() => setCurrentStatus(status.value)}
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
        <div className="w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-100">
          <table className="w-full text-left border-collapse relative min-w-160 md:min-w-full">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-tertiary-300">
                <th className="p-3 md:p-4 w-10 md:w-12 border-r border-b border-gray-200 bg-tertiary-300">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 md:w-4 md:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="p-3 md:p-4 text-gray-600 font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Checklist
                </th>
                <th className="p-3 md:p-4 text-gray-600 font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Document Number
                </th>
                <th className="p-3 md:p-4 text-gray-600 font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Issued date
                </th>
                <th className="p-3 md:p-4 text-gray-600 font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Assigned to
                </th>
                <th className="p-3 md:p-4 text-gray-600 font-medium font-geist text-xs md:text-sm border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Status
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
                    <td className="p-3 md:p-4 text-gray-700 font-geist text-xs md:text-sm border-r border-gray-200">
                      {row.checklist}
                    </td>
                    <td className="p-3 md:p-4 text-gray-700 font-geist text-xs md:text-sm border-r border-gray-200 wrap-break-words max-w-50 md:max-w-none">
                      {row.docNumber}
                    </td>
                    <td className="p-3 md:p-4 text-gray-700 font-geist text-xs md:text-sm border-r border-gray-200 whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="p-3 md:p-4 text-gray-700 font-geist text-xs md:text-sm border-r border-gray-200">
                      {row.assignee}
                    </td>
                    <td className="p-3 md:p-4">{getStatusBadge(row.status)}</td>
                    <td className="p-3 md:p-4 text-gray-400 hover:text-gray-600 cursor-pointer text-center relative">
                      <Menu>
                        {({ open }) => (
                          <>
                            <MenuButton className="cursor-pointer flex items-center justify-between sm:justify-center gap-2 outline-none transition-all duration-150 ease-in-out px-3 py-2 rounded-lg hover:bg-gray-50 w-full sm:w-auto border border-gray-200 sm:border-0">
                              <FiMoreVertical
                                size={16}
                                className="mx-auto md:w-4.5 md:h-4.5"
                              />
                            </MenuButton>
                            <MenuItems className="flex flex-col z-20 absolute top-10 right-0 mt-2 bg-white border border-gray-200 outline-none rounded-xl p-1 w-full sm:w-40 shadow-lg shadow-gray-100">
                              {dropOtions.map((status, index) => (
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
      <section className="items-center flex flex-row justify-center w-full">
        {/* // TODO: pagination */}
      </section>
    </div>
  );
}
