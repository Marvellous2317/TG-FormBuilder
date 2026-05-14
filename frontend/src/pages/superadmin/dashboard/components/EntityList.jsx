import React, { useState, Fragment, useEffect } from 'react';
import { FiSearch, FiMoreVertical } from 'react-icons/fi';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { FaArrowRight, FaChevronDown } from 'react-icons/fa';
import Button from '../../../../shared/components/Button';
import Pagination from '../../../../shared/components/Pagination';
import { Link, useNavigate } from 'react-router-dom';
import DropdownSelect from '../../../../shared/components/DropdownSelect';
import { formatDate } from '../../../../shared/utils/constants';

const statusOptions = [
  { title: 'All status', value: 'all' },
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
];

export default function EntityList({
  isFromDashboard = false,
  entities,
  pagination,
  handlePageChange,
}) {
  const [search, setSearch] = useState('');
  const [currentStatus, setCurrentStatus] = useState('all');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const currentPage = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? 20;

  const handleChange = (event) => {
    const { value } = event.target;
    setSearch(value);
  };

  const handlePaginationChange = (payload) => {
    if (typeof handlePageChange !== 'function') {
      return;
    }

    const normalizeEvent = (input) => {
      if (input?.target) {
        return input.target;
      }

      if (typeof input === 'object' && input !== null) {
        return input;
      }

      return { name: 'page', value: input };
    };

    const { name, value } = normalizeEvent(payload);

    if (name === 'page') {
      const nextPage = Math.max(1, Number(value) || 1);
      handlePageChange({ page: nextPage, pageSize });
      return;
    }

    if (name === 'pageSize') {
      const nextSize = Math.max(1, Number(value) || 1);
      handlePageChange({ page: 1, pageSize: nextSize });
    }
  };

  // Filter data based on search and status
  const filteredData = entities?.filter((row) => {
    const matchesSearch =
      row.companyName.toLowerCase().includes(search.toLowerCase()) ||
      row.address.toLowerCase().includes(search.toLowerCase()) ||
      row.contactEmail.toLowerCase().includes(search.toLowerCase());

    let status = '';
    if (row.status) {
      status = 'active';
    } else {
      status = 'inactive';
    }

    const matchesStatus =
      currentStatus === 'all' ||
      status.toLowerCase() === currentStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

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

  const navigate = useNavigate();

  const handleRowClick = (rowId) => {
    navigate(`/superadmin/entities/${rowId}`);
  };

  return (
    <div className="border border-gray-200 rounded-xl md:rounded-2xl overflow-hidden bg-white w-full min-h-full">
      <section className="flex-col flex w-full min-h-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full p-3 md:p-4 border-b border-gray-200 bg-white">
          {isFromDashboard ? (
            <h2 className="text-primary font-medium text-base">
              Entity Tenants
            </h2>
          ) : (
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
          )}

          <div className="relative w-full flex items-center gap-4 sm:w-auto">
            {isFromDashboard ? (
              <Link
                className="flex items-center gap-2 group transition-all duration-150 ease-in-out cursor-pointer"
                to="/superadmin/entities"
              >
                <p className="text-primary-200 text-sm font-medium">
                  View table
                </p>
                <FaArrowRight
                  className="text-primary-200 group-hover:translate-x-0.5"
                  size={16}
                />
              </Link>
            ) : (
              <div className="">
                <DropdownSelect
                  value={currentStatus}
                  options={statusOptions}
                  onChange={(value) => setCurrentStatus(value)}
                  placeholder="All status"
                  buttonClassName="px-3! py-2! rounded-lg!"
                  menuClassName=""
                />
              </div>
            )}
          </div>
        </div>

        {/* Table Container - Horizontal scroll on mobile */}
        <div className="w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-90 xl:max-h-120">
          <table className="w-full text-left border-collapse relative min-w-160 md:min-w-full">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-tertiary-300">
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Entity
                </th>
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Admin
                </th>
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Status
                </th>
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Users
                </th>
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Created at
                </th>
                {/* <th className="p-3 md:p-4 w-10 md:w-12 border-b border-gray-200 bg-tertiary-300"></th> */}
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr
                    key={row.companyId}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(row.companyId)}
                  >
                    <td className="p-3 md:p-4 text-tertiary font-geist text-xs md:text-sm border-r border-gray-200 space-y-1">
                      <p className="text-secondary text-sm">
                        {row.companyName}
                      </p>
                      {/* <p className="text-tertiary text-xs">{row.companyId}</p> */}
                    </td>
                    <td className="p-3 md:p-4 text-tertiary font-geist text-xs md:text-sm border-r border-gray-200 wrap-break-words max-w-50 md:max-w-none">
                      <p className="text-secondary text-sm">
                        {row.contactFullName || 'N/A'}
                      </p>
                      <p className="text-tertiary text-xs">
                        {row.contactEmail}
                      </p>
                    </td>
                    <td className="p-3 md:p-4 text-tertiary font-geist text-xs md:text-sm border-r border-gray-200 whitespace-nowrap">
                      {row.status}
                    </td>
                    <td className="p-3 md:p-4 text-tertiary font-geist text-xs md:text-sm border-r border-gray-200 whitespace-nowrap">
                      {row?.userCount || 'N/A'}
                    </td>
                    <td className="p-3 md:p-4 text-tertiary font-geist text-xs md:text-sm border-r border-gray-200">
                      {formatDate(row.createdAt)}
                    </td>
                    {/* <td className="p-3 md:p-4 text-gray-400 hover:text-secondary text-center">
                      <Button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleRowMenu(row.id, event);
                        }}
                        className=" flex items-center justify-between sm:justify-center gap-2 outline-none transition-all duration-150 ease-in-out px-3 py-2 rounded-lg hover:bg-gray-50 w-full sm:w-auto border border-gray-200 sm:border-0"
                      >
                        <FiMoreVertical
                          size={16}
                          className="mx-auto md:w-4.5 md:h-4.5"
                        />
                      </Button>
                    </td> */}
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
        handlePageChange={handlePaginationChange}
        itemsPerPage={pageSize}
        totalPages={pagination?.totalPages}
      />
    </div>
  );
}
