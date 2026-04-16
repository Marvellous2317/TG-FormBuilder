import React, { useState } from 'react';
import Button from '../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import EntityList from '../dashboard/components/EntityList';
import CreateEntityModal from '../dashboard/components/CreateEntityModal';
import EditEntityModal from '../dashboard/components/EditEntityModal';
import EmptyEntityList from '../dashboard/components/EmptyEntityList';
import Icons from '../../../assets/icons';
import AdminCard from '../../admin/dashboard/components/AdminCard';
import { useCompanies } from '../../../shared/hooks/superadmin/useCompanies';
import Loader from '../../../shared/components/Loader';

export default function EntitiesManagement() {
  const [isCreateEntityModal, setIsCreateEntityModal] = useState(false);
  const [isEditEntityModal, setIsEditEntityModal] = useState(false);

  const { data, isPending: isLoading } = useCompanies();

  const companies = data?.data?.companies;

  return (
    <div className="w-full min-h-screen max-h-screen">
      <header className="flex flex-col sm:flex-row gap-3 md:gap-0 w-full px-8 py-2.5 border-b border-secondary-200 md:items-center items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-primary text-xl font-medium font-geist">
            Entities
          </h1>
          <p className="text-sm text-tertiary font-geist">
            You have 6 onboarded entities
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateEntityModal(true)}
          className="bg-primary-200 gap-1 p-2.5 rounded-[10px]"
        >
          <IoAddOutline className="text-white" size={14} />
          <p className="text-white font-geist font-medium text-sm">
            Onboard entity
          </p>
        </Button>
      </header>

      {isLoading ? (
        <Loader size="h-12 w-12 !border-primary-200 mt-20" />
      ) : (
        <section className="py-6 px-8 min-h-full relative">
          {companies?.length > 0 ? (
            <EntityList
              setIsEditEntityModal={setIsEditEntityModal}
              entities={companies}
            />
          ) : (
            <EmptyEntityList setIsCreateEntityModal={setIsCreateEntityModal} />
          )}
        </section>
      )}

      <CreateEntityModal
        isCreateEntityModal={isCreateEntityModal}
        setIsCreateEntityModal={setIsCreateEntityModal}
      />

      <EditEntityModal
        isEditEntityModal={isEditEntityModal}
        setIsEditEntityModal={setIsEditEntityModal}
      />
    </div>
  );
}
