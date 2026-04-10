import React, { useState } from 'react';
import Button from '../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import CreateDepartmentModal from './components/CreateDepartmentModal';
import EditDepartmentModal from './components/EditDepartmentModal';
import EmptyDepartmentList from './components/EmptyDepartmentList';
import DepartmentList from './components/DepartmentList';

export default function DepartmentManagement() {
  const [isCreateDepartmentModal, setIsCreateDepartmentModal] = useState(false);
  const [isEditDepartmentModal, setIsEditDepartmentModal] = useState(false);

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
        {[1].length > 0 ? (
          <DepartmentList setIsEditDepartmentModal={setIsEditDepartmentModal} />
        ) : (
          <EmptyDepartmentList
            setIsCreateDepartmentModal={setIsCreateDepartmentModal}
          />
        )}
      </section>

      <CreateDepartmentModal
        isCreateDepartmentModal={isCreateDepartmentModal}
        setIsCreateDepartmentModal={setIsCreateDepartmentModal}
      />

      <EditDepartmentModal
        isEditDepartmentModal={isEditDepartmentModal}
        setIsEditDepartmentModal={setIsEditDepartmentModal}
      />
    </div>
  );
}
