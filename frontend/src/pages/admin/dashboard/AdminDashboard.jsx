import React, { useState, useCallback } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import Button from '../../../shared/components/Button';
import AdminCard from './components/AdminCard';
import TaskList from './components/TaskList';
import Icons from '../../../assets/icons';
import CreateLogbookModal from './components/CreateLogbookModal';
import {
  useChecklists,
  useChecklistsAnalytics,
} from '../../../shared/hooks/admin/useChecklist';
import EditLogbookModal from './components/EditLogbookModal';
import DeleteChecklistModal from './components/DeleteChecklistModal';
import RestoreChecklistModal from './components/RestoreChecklistModal';

export default function AdminDashboard() {
  const [isShowLogbookModal, setIsShowLogbookModal] = useState(false);
  const [checklistToEdit, setChecklistToEdit] = useState(null);
  const [checklistToDelete, setChecklistToDelete] = useState(null);
  const [isEditChecklistModalOpen, setIsEditChecklistModalOpen] =
    useState(false);
  const [isDeleteChecklistModalOpen, setIsDeleteChecklistModalOpen] =
    useState(false);
  const [isRestoreChecklistModalOpen, setIsRestoreChecklistModalOpen] =
    useState(false);
  const [checklistToRestore, setChecklistToRestore] = useState(null);

  const [checklistPagination, setChecklistPagination] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: 'active',
    department: '',
    deleted: 'false',
  });

  const { data, isFetching } = useChecklists(checklistPagination);

  const { data: checklistsAnalytics, isPending: isChecklistsAnalyticsLoading } =
    useChecklistsAnalytics();

  const checklistsData = data?.data?.checklists;
  const pagination = data?.data?.pagination;
  const analyticsData = checklistsAnalytics?.data;

  const handleSearch = useCallback((searchValue) => {
    setChecklistPagination((prev) => ({
      ...prev,
      search: searchValue,
      page: 1,
    }));
  }, []);

  const handleStatusChange = useCallback((status) => {
    setChecklistPagination((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const handleDepartmentChange = useCallback((department) => {
    setChecklistPagination((prev) => ({ ...prev, department, page: 1 }));
  }, []);

  const handleDeletedChange = useCallback((deleted) => {
    setChecklistPagination((prev) => ({ ...prev, deleted, page: 1 }));
  }, []);

  const handlePagination = useCallback(({ page, pageSize }) => {
    setChecklistPagination((prev) => ({
      ...prev,
      page: Number(page) || 1,
      limit: Number(pageSize) || 20,
    }));
  }, []);

  return (
    <div className="w-full min-h-screen max-h-screen">
      <header className="flex flex-col sm:flex-row gap-3 md:gap-0 w-full px-8 py-2.5 border-b border-secondary-200 md:items-center items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-primary text-xl font-medium font-geist">
            Dashboard
          </h1>
          <p className="text-sm text-tertiary font-geist">
            Here's an overview of your task list
          </p>
        </div>
        <Button
          className="bg-primary-200 gap-1 p-2.5 rounded-[10px]"
          onClick={() => setIsShowLogbookModal(true)}
        >
          <IoAddOutline className="text-white" size={14} />
          <p className="text-white font-geist font-medium text-sm">
            Add a task list
          </p>
        </Button>
      </header>

      <section className="py-6 px-8">
        <div className="flex flex-col md:flex-row items-center w-full gap-9">
          <AdminCard
            icon={Icons.createdIcon}
            title="Pending logs"
            count={analyticsData?.totalPending || 0}
            loading={isChecklistsAnalyticsLoading}
          />
          <AdminCard
            icon={Icons.submitIcon}
            title="Approved logs"
            count={analyticsData?.totalApproved || 0}
            loading={isChecklistsAnalyticsLoading}
          />
          <AdminCard
            icon={Icons.pendingIcon}
            title="Rejected logs"
            count={analyticsData?.totalRejected || 0}
            loading={isChecklistsAnalyticsLoading}
          />
        </div>
      </section>

      <section className="py-6 px-8 min-h-full relative">
        <TaskList
          setIsEditChecklistModalOpen={setIsEditChecklistModalOpen}
          setChecklistToDelete={setChecklistToDelete}
          setChecklistToRestore={setChecklistToRestore}
          checklists={checklistsData}
          pagination={pagination}
          handlePageChange={handlePagination}
          setChecklistToEdit={setChecklistToEdit}
          setIsDeleteChecklistModalOpen={setIsDeleteChecklistModalOpen}
          setIsRestoreChecklistModalOpen={setIsRestoreChecklistModalOpen}
          isFetching={isFetching}
          handleSearch={handleSearch}
          handleStatusChange={handleStatusChange}
          handleDepartmentChange={handleDepartmentChange}
          handleDeletedChange={handleDeletedChange}
          setIsShowLogbookModal={setIsShowLogbookModal}
        />
      </section>

      <CreateLogbookModal
        isShowLogbookModal={isShowLogbookModal}
        setIsShowLogbookModal={setIsShowLogbookModal}
      />

      <EditLogbookModal
        key={`edit-${checklistToEdit?.checklistId}`}
        isEditChecklistModalOpen={isEditChecklistModalOpen}
        setIsEditChecklistModalOpen={setIsEditChecklistModalOpen}
        checklistToEdit={checklistToEdit}
        setChecklistToEdit={setChecklistToEdit}
      />

      <DeleteChecklistModal
        key={`delete-${checklistToDelete?.checklistId}`}
        isDeleteChecklistModalOpen={isDeleteChecklistModalOpen}
        setIsDeleteChecklistModalOpen={setIsDeleteChecklistModalOpen}
        checklistToDelete={checklistToDelete}
        setChecklistToDelete={setChecklistToDelete}
      />

      <RestoreChecklistModal
        key={`restore-${checklistToRestore?.checklistId}`}
        isRestoreChecklistModalOpen={isRestoreChecklistModalOpen}
        setIsRestoreChecklistModalOpen={setIsRestoreChecklistModalOpen}
        checklistToRestore={checklistToRestore}
        setChecklistToRestore={setChecklistToRestore}
      />
    </div>
  );
}
