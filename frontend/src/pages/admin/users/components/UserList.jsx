import React, { useState, Fragment } from 'react';
import { FiSearch, FiMoreVertical } from 'react-icons/fi';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { FaAngleDown, FaAngleUp, FaChevronDown } from 'react-icons/fa';
import Icons from '../../../../assets/icons';
import Button from '../../../../shared/components/Button';
import InputField from '../../../../shared/components/InputField';
import Pagination from '../../../../shared/components/Pagination';

const statusOptions = [
  { title: 'Completed', value: 'completed' },
  { title: 'Pending', value: 'pending' },
];

const roleOptions = [
  { title: 'Admin', value: 'admin' },
  { title: 'Operator', value: 'operator' },
  { title: 'Approver', value: 'approver' },
];

// Mock data (expanded to demonstrate the scrolling effect)
const tableData = [
  {
    id: 1,
    name: 'Ajayi Tami',
    email: 'ajayi.tami@example.com',
    roles: 'Admin',
    status: 'Active',
    lastSeen: '2026-03-13',
  },
  {
    id: 2,
    name: 'Lennox',
    email: 'lennox@example.com',
    roles: 'Editor',
    status: 'Active',
    lastSeen: '2026-03-13',
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    roles: 'Viewer',
    status: 'Pending',
    lastSeen: '2026-03-10',
  },
  {
    id: 4,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    roles: 'Editor',
    status: 'Pending',
    lastSeen: '2026-03-11',
  },
  {
    id: 5,
    name: 'Ajayi Tami',
    email: 'ajayi.tami@example.com',
    roles: 'Admin',
    status: 'Active',
    lastSeen: '2026-03-14',
  },
  {
    id: 6,
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    roles: 'Viewer',
    status: 'Pending',
    lastSeen: '2026-03-09',
  },
  {
    id: 7,
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    roles: 'Editor',
    status: 'Pending',
    lastSeen: '2026-03-12',
  },
  {
    id: 8,
    name: 'Ajayi Tami',
    email: 'ajayi.tami@example.com',
    roles: 'Admin',
    status: 'Active',
    lastSeen: '2026-03-15',
  },
  {
    id: 9,
    name: 'Lennox',
    email: 'lennox@example.com',
    roles: 'Editor',
    status: 'Active',
    lastSeen: '2026-03-14',
  },
  {
    id: 10,
    name: 'Olivia Martinez',
    email: 'olivia.martinez@example.com',
    roles: 'Viewer',
    status: 'Pending',
    lastSeen: '2026-03-08',
  },
  {
    id: 11,
    name: 'James Anderson',
    email: 'james.anderson@example.com',
    roles: 'Editor',
    status: 'Pending',
    lastSeen: '2026-03-10',
  },
  {
    id: 12,
    name: 'Ajayi Tami',
    email: 'ajayi.tami@example.com',
    roles: 'Admin',
    status: 'Pending',
    lastSeen: '2026-03-12',
  },
];

export default function UserList({
  setIsEditUserModalOpen,
  setIsDeactivateUserModalOpen,
}) {
  const [search, setSearch] = useState('');
  const [currentStatus, setCurrentStatus] = useState('all');
  const [currentRole, setCurrentRole] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        <span className="inline-flex px-2 py-1 md:px-3 md:py-1 bg-gray-100 text-secondary rounded-full text-xs font-medium">
          Pending
        </span>
      );
    }
    return <span className="text-xs md:text-sm text-gray-700">{status}</span>;
  };

  // Filter data based on search and status
  const filteredData = tableData.filter((row) => {
    const matchesSearch =
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      currentStatus === 'all' ||
      row.status.toLowerCase() === currentStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handlePageChange = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const dropOtions = [
    {
      title: 'Edit',
      value: 'edit',
      onClick: () => setIsEditUserModalOpen(true),
    },
    {
      title: 'Deactivate user',
      value: 'deactivate',
      onClick: () => setIsDeactivateUserModalOpen(true),
    },
    { title: 'Unassign', value: 'unassign', onClick: () => {} },
    { title: 'Assign', value: 'assign', onClick: () => {} },
    { title: 'Delete log', value: 'delete', onClick: () => {} },
  ];

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
            {/* Role dropdown */}
            <Menu>
              {({ open }) => (
                <>
                  <MenuButton className="cursor-pointer flex items-center justify-between sm:justify-center gap-2 outline-none transition-all duration-150 ease-in-out px-3 py-2 rounded-lg hover:bg-gray-50 w-full sm:w-auto border border-secondary-200">
                    <span className="text-secondary font-geist text-sm">
                      {currentRole === 'all'
                        ? 'All roles'
                        : roleOptions.find((s) => s.value === currentRole)
                            ?.title || 'All roles'}
                    </span>
                    <FaChevronDown
                      className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                      size={10}
                    />
                  </MenuButton>
                  <MenuItems className="flex flex-col z-20 absolute top-full right-32 mt-2 bg-white border border-gray-200 outline-none rounded-xl p-1 w-full sm:w-40 shadow-lg shadow-gray-100">
                    <MenuItem as={Fragment}>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } w-full text-left cursor-pointer p-2 rounded-md text-gray-700 text-sm font-geist ${
                            currentRole === 'all'
                              ? 'bg-primary-50 text-primary-700'
                              : ''
                          }`}
                          onClick={() => setCurrentRole('all')}
                        >
                          All roles
                        </button>
                      )}
                    </MenuItem>
                    {roleOptions.map((status, index) => (
                      <MenuItem key={index} as={Fragment}>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } w-full text-left cursor-pointer p-2 rounded-md text-gray-700 text-sm font-geist ${
                              currentRole === status.value
                                ? 'bg-primary-50 text-primary-700'
                                : ''
                            }`}
                            onClick={() => setCurrentRole(status.value)}
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
                  Roles
                </th>
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Status
                </th>
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Last seen
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
                      <p className="text-secondary text-sm font-geist">
                        {row.name}
                      </p>
                      <p className="text-tertiary text-sm font-geist">
                        {row.email}
                      </p>
                    </td>
                    <td className="p-3 md:p-4 text-gray-700 font-geist text-xs md:text-sm border-r border-gray-200 wrap-break-words max-w-50 md:max-w-none">
                      {row.roles}
                    </td>
                    <td className="p-3 md:p-4 text-gray-700 font-geist text-xs md:text-sm border-r border-gray-200 whitespace-nowrap">
                      {getStatusBadge(row.status)}
                    </td>
                    <td className="p-3 md:p-4 text-gray-700 font-geist text-xs md:text-sm border-r border-gray-200">
                      {row.lastSeen}
                    </td>
                    <td className="p-3 md:p-4 text-gray-400 hover:text-secondary cursor-pointer text-center relative">
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
                                    <Button
                                      className={`${
                                        active ? 'bg-gray-100' : ''
                                      } w-full text-left p-2 rounded-md text-gray-700 text-sm font-geist ${
                                        currentStatus === status.value
                                          ? 'bg-primary-50 text-primary-700'
                                          : ''
                                      }`}
                                      onClick={status.onClick}
                                    >
                                      {status.title}
                                    </Button>
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
      <Pagination
        currentPage={currentPage}
        handlePageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}
