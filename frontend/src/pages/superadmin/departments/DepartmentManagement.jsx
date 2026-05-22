import React, { useState, useCallback } from 'react';
import Button from '../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import CreateDepartmentModal from './components/CreateDepartmentModal';
import EditDepartmentModal from './components/EditDepartmentModal';
import DeleteDepartmentModal from './components/DeleteDepartmentModal';
import DepartmentList from './components/DepartmentList';
import { useDepartments } from '../../../shared/hooks/superadmin/useDepartments';
import RestoreDepartmentModal from './components/RestoreDepartmentModal';

export default function DepartmentManagement() {
  const [isCreateDepartmentModal, setIsCreateDepartmentModal] = useState(false);
  const [isEditDepartmentModal, setIsEditDepartmentModal] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState(null);
  const [depertmentToRestore, setDepertmentToRestore] = useState(null);
  const [isRestoreDepartmentModalOpen, setIsRestoreDepartmentModalOpen] =
    useState(false);
  const [isDeleteDepartmentModalOpen, setIsDeleteDepartmentModalOpen] =
    useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  const [departmentPagination, setDepartmentPagination] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: 'active',
    deleted: 'false',
  });

  const { data, isFetching } = useDepartments(departmentPagination);

  const pagination = data?.data?.pagination;
  const departments = data?.data?.departments;

  const handleSearch = useCallback((searchValue) => {
    setDepartmentPagination((prev) => ({
      ...prev,
      search: searchValue,
      page: 1,
    }));
  }, []);

  const handleStatusChange = useCallback((status) => {
    setDepartmentPagination((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const handlePagination = useCallback(({ page, pageSize }) => {
    setDepartmentPagination((prev) => ({
      ...prev,
      page: Number(page) || 1,
      limit: Number(pageSize) || 20,
    }));
  }, []);

  const handleDeletedChange = useCallback((deleted) => {
    setDepartmentPagination((prev) => ({ ...prev, deleted, page: 1 }));
  }, []);

  return (
    <div className="w-full min-h-screen max-h-screen">
      <header className="flex flex-col sm:flex-row gap-3 md:gap-0 w-full px-8 py-2.5 border-b border-secondary-200 md:items-center items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-primary text-xl font-medium font-geist">
            Department
          </h1>
          <p className="text-sm text-tertiary font-geist">
            Create and manage departments and their descriptions
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateDepartmentModal(true)}
          className="bg-primary-200 gap-1 p-2.5 rounded-[10px]"
        >
          <IoAddOutline className="text-white" size={14} />
          <p className="text-white font-geist font-medium text-sm">
            Add a department
          </p>
        </Button>
      </header>

      <section className="py-6 px-8 min-h-full relative">
        <DepartmentList
          setIsEditDepartmentModal={setIsEditDepartmentModal}
          setIsDeleteDepartmentModalOpen={setIsDeleteDepartmentModalOpen}
          setDepartmentToDelete={setDepartmentToDelete}
          departments={departments}
          pagination={pagination}
          handleDepartmentPageChange={handlePagination}
          setDepartmentToEdit={setDepartmentToEdit}
          isFetching={isFetching}
          handleSearch={handleSearch}
          handleStatusChange={handleStatusChange}
          setIsCreateDepartmentModal={setIsCreateDepartmentModal}
          handleDeletedChange={handleDeletedChange}
          setIsRestoreDepartmentModalOpen={setIsRestoreDepartmentModalOpen}
          setDepertmentToRestore={setDepertmentToRestore}
        />
      </section>

      <CreateDepartmentModal
        isCreateDepartmentModal={isCreateDepartmentModal}
        setIsCreateDepartmentModal={setIsCreateDepartmentModal}
      />

      <EditDepartmentModal
        key={`edit-${departmentToEdit?.departmentId}`}
        isEditDepartmentModal={isEditDepartmentModal}
        setIsEditDepartmentModal={setIsEditDepartmentModal}
        departmentToEdit={departmentToEdit}
        setDepartmentToEdit={setDepartmentToEdit}
      />

      <DeleteDepartmentModal
        key={`delete-${departmentToDelete?.departmentId}`}
        isDeleteDepartmentModalOpen={isDeleteDepartmentModalOpen}
        setIsDeleteDepartmentModalOpen={setIsDeleteDepartmentModalOpen}
        departmentToDelete={departmentToDelete}
        setDepartmentToDelete={setDepartmentToDelete}
      />

      <RestoreDepartmentModal
        key={`restore-${depertmentToRestore?.departmentId}`}
        isRestoreDepartmentModalOpen={isRestoreDepartmentModalOpen}
        setIsRestoreDepartmentModalOpen={setIsRestoreDepartmentModalOpen}
        depertmentToRestore={depertmentToRestore}
        setDepertmentToRestore={setDepertmentToRestore}
      />
    </div>
  );
}
