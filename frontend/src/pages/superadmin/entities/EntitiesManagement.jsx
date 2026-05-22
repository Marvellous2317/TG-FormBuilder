import React, { useState, useCallback } from 'react';
import Button from '../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import EntityList from '../dashboard/components/EntityList';
import CreateEntityModal from '../dashboard/components/CreateEntityModal';
import { useCompanies } from '../../../shared/hooks/superadmin/useCompanies';

export default function EntitiesManagement() {
  const [isCreateEntityModal, setIsCreateEntityModal] = useState(false);
  const [companiesPagination, setCompaniesPagination] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: 'active',
  });

  const { data, isFetching } = useCompanies(companiesPagination);

  const companies = data?.data?.companies;

  const handleSearch = useCallback((searchValue) => {
    setCompaniesPagination((prev) => ({
      ...prev,
      search: searchValue,
      page: 1,
    }));
  }, []);

  const handleStatusChange = useCallback((status) => {
    setCompaniesPagination((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  return (
    <div className="w-full min-h-screen max-h-screen">
      <header className="flex flex-col sm:flex-row gap-3 md:gap-0 w-full px-8 py-2.5 border-b border-secondary-200 md:items-center items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-primary text-xl font-medium font-geist">
            Entities
          </h1>
          <p className="text-sm text-tertiary font-geist">
            List of onboarded entities
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

      <section className="py-6 px-8 min-h-full relative">
        <EntityList
          entities={companies}
          pagination={data?.data?.pagination}
          isFetching={isFetching}
          handleSearch={handleSearch}
          handleStatusChange={handleStatusChange}
          setIsCreateEntityModal={setIsCreateEntityModal}
        />
      </section>

      <CreateEntityModal
        isCreateEntityModal={isCreateEntityModal}
        setIsCreateEntityModal={setIsCreateEntityModal}
      />
    </div>
  );
}
