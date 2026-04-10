import React, { useState } from 'react';
import Button from '../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import CompanyList from './components/CompanyList';
import CreateCompanyModal from './components/CreateCompanyModal';
import EditCompanyModal from './components/EditCompanyModal';
import EmptyCompanyList from './components/EmptyCompanyList';
import Icons from '../../../assets/icons';
import AdminCard from '../../admin/dashboard/components/AdminCard';

export default function SuperAdminDashboard() {
  const [isCreateCompanyModal, setIsCreateCompanyModal] = useState(false);
  const [isEditCompanyModal, setIsEditCompanyModal] = useState(false);

  return (
    <div className="w-full min-h-screen max-h-screen">
      <header className="flex flex-col sm:flex-row gap-3 md:gap-0 w-full px-8 py-2.5 border-b border-secondary-200 md:items-center items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-primary text-xl font-medium font-geist">
            Dashboard
          </h1>
          <p className="text-sm text-tertiary font-geist">
            Overview of cross entity usage metrics
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateCompanyModal(true)}
          className="bg-primary-200 gap-1 p-2.5 rounded-[10px]"
        >
          <IoAddOutline className="text-white" size={14} />
          <p className="text-white font-geist font-medium text-sm">
            Onboard entity
          </p>
        </Button>
      </header>

      <section className="py-6 px-8">
        <div className="flex flex-col md:flex-row items-center w-full gap-9 ">
          <AdminCard icon={Icons.totalUsers} title="Total users" count="150" />
          <AdminCard
            icon={Icons.activeUsers}
            title="Active users"
            count="150"
          />
          <AdminCard
            icon={Icons.inactiveUsers}
            title="Inactive users"
            count="150"
          />
          <AdminCard
            icon={Icons.inactiveUsers}
            title="Total roles"
            count="150"
          />
        </div>
      </section>

      <section className="py-6 px-8 min-h-full relative">
        {[1].length > 0 ? (
          <CompanyList setIsEditCompanyModal={setIsEditCompanyModal} />
        ) : (
          <EmptyCompanyList setIsCreateCompanyModal={setIsCreateCompanyModal} />
        )}
      </section>

      <CreateCompanyModal
        isCreateCompanyModal={isCreateCompanyModal}
        setIsCreateCompanyModal={setIsCreateCompanyModal}
      />

      <EditCompanyModal
        isEditCompanyModal={isEditCompanyModal}
        setIsEditCompanyModal={setIsEditCompanyModal}
      />
    </div>
  );
}
