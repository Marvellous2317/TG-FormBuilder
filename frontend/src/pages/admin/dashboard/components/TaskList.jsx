import React, { useState, Fragment, useEffect } from 'react';
import { FiSearch, FiMoreVertical } from 'react-icons/fi';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { FaChevronDown } from 'react-icons/fa';
import Pagination from '../../../../shared/components/Pagination';
import DropdownSelect from '../../../../shared/components/DropdownSelect';
import { createPortal } from 'react-dom';
import useToast from '../../../../shared/hooks/useToast';
import Button from '../../../../shared/components/Button';
import { formatDate } from '../../../../shared/utils/constants';
import { useNavigate } from 'react-router-dom';
import AssignLogbookModal from './AssignLogbookModal';

const statusOptions = [
  { title: 'All status', value: 'all' },
  { title: 'Completed', value: 'completed' },
  { title: 'Pending', value: 'pending' },
];

const departmentOptions = [
  { title: 'All departments', value: 'all' },
  { title: 'Packaging', value: 'packaging' },
];

export default function TaskList({
  checklists,
  setIsEditChecklistModalOpen,
  setChecklistToEdit,
  setChecklistToDelete,
  pagination,
  handlePageChange,
  setIsDeleteChecklistModalOpen,
  checklistToEdit,
}) {
  const [search, setSearch] = useState('');
  const [currentStatus, setCurrentStatus] = useState('all');
  const [currentDepartment, setCurrentDepartment] = useState('all');
  const [actionToPerform, setActionToPerform] = useState('assign');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isShowAssignLogbookModal, setIsShowAssignLogbookModal] =
    useState(false);

  const { showError } = useToast();
  const navigate = useNavigate();

  const currentPage = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? pagination?.limit ?? 20;

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
      title: 'Entries',
      value: 'entries',
      onClick: () => {
        setActiveMenuId(null);
        navigate(
          `/admin/entries/${checklistToEdit?.checklistId}/${encodeURIComponent(checklistToEdit?.title)}`,
        );
      },
    },
    {
      title: 'Unassign log',
      value: 'unassign',
      onClick: () => {
        setActiveMenuId(null);
        setActionToPerform('unassign');
        setIsShowAssignLogbookModal(true);
      },
    },
    {
      title: 'Assign log',
      value: 'assign',
      onClick: () => {
        setActiveMenuId(null);
        setActionToPerform('assign');
        setIsShowAssignLogbookModal(true);
      },
    },
    {
      title: 'Edit log',
      value: 'edit',
      onClick: () => {
        setActiveMenuId(null);
        setIsEditChecklistModalOpen(true);
      },
    },
    {
      title: 'Delete log',
      value: 'delete',
      onClick: () => {
        setActiveMenuId(null);
        setIsDeleteChecklistModalOpen(true);
      },
    },
  ];

  const toggleRowMenu = (rowId, event, row) => {
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

    setChecklistToEdit(row);
    setChecklistToDelete(row);
  };

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
              className="outline-none text-secondary placeholder:text-gray-400 font-geist text-sm w-full bg-transparent"
            />
          </div>

          <div className="relative w-full flex items-center gap-4 sm:w-auto">
            <DropdownSelect
              value={currentDepartment}
              options={departmentOptions}
              onChange={(value) => setCurrentDepartment(value)}
              placeholder="All departments"
              buttonClassName="px-3! py-2! rounded-lg!"
              menuClassName=""
            />
            <DropdownSelect
              value={currentStatus}
              options={statusOptions}
              onChange={(value) => setCurrentStatus(value)}
              placeholder="All status"
              buttonClassName="px-3! py-2! rounded-lg!"
              menuClassName=""
            />
          </div>
        </div>
        {/* Table Container - Horizontal scroll on mobile */}
        <div className="w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-100 xl:max-h-140">
          <table className="w-full text-left border-collapse relative min-w-160 md:min-w-full">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr className="bg-tertiary-300">
                {/* <th className="p-3 md:p-4 w-10 md:w-12 border-r border-b border-gray-200 bg-tertiary-300">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 md:w-4 md:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th> */}
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Checklist
                </th>
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Department
                </th>
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Document Number
                </th>
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Issued date
                </th>
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Assigned to
                </th>
                <th className="p-3 md:p-4 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                  Frequency
                </th>
                <th className="p-3 md:p-4 w-10 md:w-12 border-b border-gray-200 bg-tertiary-300"></th>
              </tr>
            </thead>

            <tbody>
              {checklists.length > 0 ? (
                checklists.map((row) => (
                  <tr
                    key={row.checklistId}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {/* <td className="p-3 md:p-4 border-r border-gray-200">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 md:w-4 md:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td> */}
                    <td className="p-3 md:p-4 text-tertiary font-geist text-xs md:text-sm border-r border-gray-200">
                      {row?.title}
                    </td>
                    <td className="p-3 md:p-4 text-tertiary font-geist text-xs md:text-sm border-r border-gray-200 wrap-break-words max-w-50 md:max-w-none">
                      {row?.department?.departmentName || 'N/A'}
                    </td>
                    <td className="p-3 md:p-4 text-tertiary font-geist text-xs md:text-sm border-r border-gray-200 whitespace-nowrap">
                      {row?.documentNumber || 'N/A'}
                    </td>
                    <td className="p-3 md:p-4 text-tertiary font-geist text-xs md:text-sm border-r border-gray-200">
                      {formatDate(row?.createdAt) || 'N/A'}
                    </td>
                    <td className="p-3 md:p-4 text-tertiary font-geist text-xs md:text-sm border-r border-gray-200 whitespace-nowrap">
                      {row?.assignments?.length}
                    </td>

                    <td className="p-3 md:p-4 text-tertiary font-geist text-xs md:text-sm border-r border-gray-200 whitespace-nowrap">
                      {row?.frequency || 'N/A'}
                    </td>
                    <td className="p-3 md:p-4 text-gray-400 hover:text-secondary text-center">
                      <Button
                        type="button"
                        onClick={(event) => toggleRowMenu(row.id, event, row)}
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
        handlePageChange={handlePaginationChange}
        itemsPerPage={pageSize}
        totalPages={pagination?.totalPages}
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
                    className="w-full text-left p-2 rounded-md text-tertiary text-sm font-geist hover:bg-gray-100"
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
      <AssignLogbookModal
        isShowAssignLogbookModal={isShowAssignLogbookModal}
        setIsShowAssignLogbookModal={setIsShowAssignLogbookModal}
        checklistId={checklistToEdit?.checklistId}
        checklistAssignments={checklistToEdit?.assignments}
        action={actionToPerform}
      />
    </div>
  );
}
