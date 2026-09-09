import React, { useState } from 'react';
import Button from '../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import EntityList from './components/EntityList';
import CreateEntityModal from './components/CreateEntityModal';
import EditEntityModal from './components/EditEntityModal';
import EmptyEntityList from './components/EmptyEntityList';
import Icons from '../../../assets/icons';
import AdminCard from '../../admin/dashboard/components/AdminCard';
import {
  useCompanies,
  useDashboardCompanyAnalytics,
} from '../../../shared/hooks/superadmin/useCompanies';
import Loader from '../../../shared/components/Loader';

export default function ReportsManagement() {
  const [isCreateEntityModal, setIsCreateEntityModal] = useState(false);
  const [isEditEntityModal, setIsEditEntityModal] = useState(false);
  const [companyPagination, setCompanyPagination] = useState({
    page: 1,
    limit: 20,
  });

  const { data, isPending: isLoading } = useCompanies(companyPagination);

  const { data: dashboardAnalytics, isPending: isDashboardAnalyticsLoading } =
    useDashboardCompanyAnalytics();

  const dashboardAnalyticsData = dashboardAnalytics?.data;

  const handlePagination = ({ page, pageSize }) => {
    setCompanyPagination({
      page: Number(page) || 1,
      limit: Number(pageSize) || 20,
    });
  };

  const companies = data?.data?.companies;
  const pagination = data?.data?.pagination;

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
          onClick={() => setIsCreateEntityModal(true)}
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
          <AdminCard
            icon={Icons.activeEntitiesIcon}
            title="Active entities"
            count={dashboardAnalyticsData?.totalActiveCompanies || 0}
            loading={isDashboardAnalyticsLoading}
          />
          <AdminCard
            icon={Icons.activeUsers}
            title="Active users"
            count={dashboardAnalyticsData?.totalActiveUsers || 0}
            loading={isDashboardAnalyticsLoading}
          />
          <AdminCard
            icon={Icons.logsTodayIcon}
            title="Logs today"
            count={dashboardAnalyticsData?.totalChecklistsToday || 0}
            loading={isDashboardAnalyticsLoading}
          />
          <AdminCard
            icon={Icons.logsWeekIcon}
            title="This week's log"
            count={dashboardAnalyticsData?.totalChecklistsThisWeek || 0}
            loading={isDashboardAnalyticsLoading}
          />
        </div>
      </section>

      {isLoading ? (
        <Loader size="h-12 w-12 !border-primary-200 mt-20" />
      ) : (
        <section className="py-6 px-8 min-h-full relative">
          {companies?.length > 0 ? (
            <EntityList
              setIsEditEntityModal={setIsEditEntityModal}
              isFromDashboard={true}
              entities={companies}
              pagination={pagination}
              handlePageChange={handlePagination}
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
