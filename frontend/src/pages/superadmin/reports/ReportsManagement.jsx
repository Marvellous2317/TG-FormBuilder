import React, { useState } from 'react';
import Button from '../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import EntityList from './components/EntityList';
import CreateEntityModal from './components/CreateEntityModal';
import EditEntityModal from './components/EditEntityModal';
import EmptyEntityList from './components/EmptyEntityList';
import StatCard from './components/StatCard';
import InputField from '../../../shared/components/InputField';
import Icons from '../../../assets/icons';
import AdminCard from '../../admin/dashboard/components/AdminCard';
import {
  useDashboardCompanyAdoptionAnalytics,
  useCompanies,
} from '../../../shared/hooks/superadmin/useCompanies';
import Loader from '../../../shared/components/Loader';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];

const today = new Date().toISOString().split('T')[0];

export default function ReportsManagement() {
  const [filters, setFilters] = useState({
    companyId: '',
    startDate: oneWeekAgo,
    endDate: today,
  });

  const { data: companiesData, isPending: isLoadingCompanies } = useCompanies();

  const queryParams = {
    startDate: filters.startDate,
    endDate: filters.endDate,
    ...(filters.companyId && { companyId: filters.companyId }),
  };

  const { data: dashboardAnalytics, isPending: isDashboardAnalyticsLoading } =
    useDashboardCompanyAdoptionAnalytics(queryParams);

  const dashboardAnalyticsData = dashboardAnalytics?.data;
  const companies = companiesData?.data?.companies || [];

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="w-full min-h-screen max-h-screen">
      <header className="flex flex-col gap-4 w-full px-8 py-4 border-b border-secondary-200">
        <div className="flex flex-col gap-1">
          <h1 className="text-primary text-xl font-medium font-geist">
            Adoption reports
          </h1>
          <p className="text-sm text-tertiary font-geist">
            Overview of cross entity adoption reports
          </p>
        </div>
      </header>

      <section className="py-6 px-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Company Filter */}
          <div className="flex-1 min-w-0">
            <InputField
              label="Company"
              id="company"
              value={filters.companyId}
              type="select"
              options={[
                { label: 'All Companies', value: '' },
                ...companies.map((company) => ({
                  label: company.companyName,
                  value: company.companyId,
                })),
              ]}
              onChange={(e) => handleFilterChange('companyId', e.target.value)}
              disabled={isLoadingCompanies}
            />
          </div>

          {/* Start Date Filter */}
          <div className="flex-1 min-w-0">
            <InputField
              label="Start Date"
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          {/* End Date Filter */}
          <div className="flex-1 min-w-0">
            <InputField
              label="End Date"
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="py-6 px-8 overflow-y-auto flex-1">
        {/* Adoption Section */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-primary mb-4 font-geist">
            User Adoption
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Users"
              value={dashboardAnalyticsData?.adoption?.totalUsers}
              loading={isDashboardAnalyticsLoading}
            />
            <StatCard
              label="Active Users"
              value={dashboardAnalyticsData?.adoption?.activeUsers}
              loading={isDashboardAnalyticsLoading}
            />
            {/* <StatCard
              label="Adopted Users"
              value={dashboardAnalyticsData?.adoption?.adoptedUsers}
              loading={isDashboardAnalyticsLoading}
            />
            <StatCard
              label="Adoption Rate"
              value={`${
                dashboardAnalyticsData?.adoption?.totalUsers
                  ? Math.round(
                      (dashboardAnalyticsData?.adoption?.adoptedUsers /
                        dashboardAnalyticsData?.adoption?.totalUsers) *
                        100,
                    )
                  : 0
              }%`}
              loading={isDashboardAnalyticsLoading}
            /> */}
          </div>
          {!isDashboardAnalyticsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Progress Bar */}
              <div className="rounded-2xl border border-secondary-200 bg-secondary-700 p-4">
                <h3 className="text-sm font-semibold text-primary mb-4 font-geist">
                  Active Progress
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-tertiary font-geist">
                      {dashboardAnalyticsData?.adoption?.activeUsers || 0} of{' '}
                      {dashboardAnalyticsData?.adoption?.totalUsers || 0} users
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {dashboardAnalyticsData?.adoption?.totalUsers
                        ? Math.round(
                            (dashboardAnalyticsData?.adoption?.activeUsers /
                              dashboardAnalyticsData?.adoption?.totalUsers) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-3">
                    <div
                      className="bg-primary-200 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          dashboardAnalyticsData?.adoption?.totalUsers
                            ? (dashboardAnalyticsData?.adoption?.activeUsers /
                                dashboardAnalyticsData?.adoption?.totalUsers) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="rounded-2xl border border-secondary-200 bg-secondary-700 p-4">
                <h3 className="text-sm font-semibold text-primary mb-4 font-geist">
                  User Distribution
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      {
                        name: 'Users',
                        'Total Users':
                          dashboardAnalyticsData?.adoption?.totalUsers || 0,
                        'Active Users':
                          dashboardAnalyticsData?.adoption?.activeUsers || 0,
                        'Adopted Users':
                          dashboardAnalyticsData?.adoption?.adoptedUsers || 0,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#bdbdbd" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Total Users" fill="#2463eb" />
                    <Bar dataKey="Active Users" fill="#218358" />
                    <Bar dataKey="Adopted Users" fill="#FFA500" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
        {/* Entities Section */}
        {!filters.companyId && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-primary mb-4 font-geist">
              Entities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Total Entities"
                value={dashboardAnalyticsData?.entities?.totalEntities}
                loading={isDashboardAnalyticsLoading}
              />
              <StatCard
                label="Active Entities"
                value={dashboardAnalyticsData?.entities?.activeEntities}
                loading={isDashboardAnalyticsLoading}
              />
              {/* <StatCard
              label="Using Platform"
              value={dashboardAnalyticsData?.entities?.entitiesUsing}
              loading={isDashboardAnalyticsLoading}
            /> */}
              <StatCard
                label="Inactive Entities"
                value={dashboardAnalyticsData?.entities?.entitiesNotUsing}
                loading={isDashboardAnalyticsLoading}
              />
            </div>
            {!isDashboardAnalyticsLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Progress Bar */}
                <div className="rounded-2xl border border-secondary-200 bg-secondary-700 p-4">
                  <h3 className="text-sm font-semibold text-primary mb-4 font-geist">
                    Platform Adoption
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-tertiary font-geist">
                        {dashboardAnalyticsData?.entities?.activeEntities || 0}{' '}
                        of{' '}
                        {dashboardAnalyticsData?.entities?.totalEntities || 0}{' '}
                        entities
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {dashboardAnalyticsData?.entities?.totalEntities
                          ? Math.round(
                              (dashboardAnalyticsData?.entities
                                ?.activeEntities /
                                dashboardAnalyticsData?.entities
                                  ?.totalEntities) *
                                100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-3">
                      <div
                        className="bg-primary-200 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            dashboardAnalyticsData?.entities?.totalEntities
                              ? (dashboardAnalyticsData?.entities
                                  ?.activeEntities /
                                  dashboardAnalyticsData?.entities
                                    ?.totalEntities) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="rounded-2xl border border-secondary-200 bg-secondary-700 p-4">
                  <h3 className="text-sm font-semibold text-primary mb-4 font-geist">
                    Entity Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={[
                        {
                          name: 'Entities',
                          'Total Entities':
                            dashboardAnalyticsData?.entities?.totalEntities ||
                            0,
                          'Active Entities':
                            dashboardAnalyticsData?.entities?.activeEntities ||
                            0,
                          'Inactive Entities':
                            dashboardAnalyticsData?.entities
                              ?.entitiesNotUsing || 0,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#bdbdbd" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Total Entities" fill="#2463eb" />
                      <Bar dataKey="Active Entities" fill="#218358" />
                      <Bar dataKey="Inactive Entities" fill="#c62828" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Usage Section */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-primary mb-4 font-geist">
            Record Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Submitted"
              value={dashboardAnalyticsData?.usage?.totalSubmittedRecords}
              loading={isDashboardAnalyticsLoading}
            />
            <StatCard
              label="Approved"
              value={dashboardAnalyticsData?.usage?.approvedRecords}
              loading={isDashboardAnalyticsLoading}
            />
            <StatCard
              label="Pending"
              value={dashboardAnalyticsData?.usage?.pendingRecords}
              loading={isDashboardAnalyticsLoading}
            />
            <StatCard
              label="Rejected"
              value={dashboardAnalyticsData?.usage?.rejectedRecords}
              loading={isDashboardAnalyticsLoading}
            />
          </div>
          {!isDashboardAnalyticsLoading &&
            dashboardAnalyticsData?.usage?.totalSubmittedRecords > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Progress Bar */}
                <div className="rounded-2xl border border-secondary-200 bg-secondary-700 p-4">
                  <h3 className="text-sm font-semibold text-primary mb-4 font-geist">
                    Approval Progress
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-tertiary font-geist">
                        {dashboardAnalyticsData?.usage?.approvedRecords || 0} of{' '}
                        {dashboardAnalyticsData?.usage?.totalSubmittedRecords ||
                          0}{' '}
                        approved
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {dashboardAnalyticsData?.usage?.totalSubmittedRecords
                          ? Math.round(
                              (dashboardAnalyticsData?.usage?.approvedRecords /
                                dashboardAnalyticsData?.usage
                                  ?.totalSubmittedRecords) *
                                100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-3">
                      <div
                        className="bg-primary-200 h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            dashboardAnalyticsData?.usage?.totalSubmittedRecords
                              ? (dashboardAnalyticsData?.usage
                                  ?.approvedRecords /
                                  dashboardAnalyticsData?.usage
                                    ?.totalSubmittedRecords) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="rounded-2xl border border-secondary-200 bg-secondary-700 p-4">
                  <h3 className="text-sm font-semibold text-primary mb-4 font-geist">
                    Record Status
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={[
                        {
                          name: 'Records',
                          Approved:
                            dashboardAnalyticsData?.usage?.approvedRecords || 0,
                          Pending:
                            dashboardAnalyticsData?.usage?.pendingRecords || 0,
                          Rejected:
                            dashboardAnalyticsData?.usage?.rejectedRecords || 0,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#bdbdbd" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Approved" fill="#218358" />
                      <Bar dataKey="Pending" fill="#FFA500" />
                      <Bar dataKey="Rejected" fill="#c62828" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          {!isDashboardAnalyticsLoading &&
            dashboardAnalyticsData?.usage?.totalSubmittedRecords === 0 && (
              <div className="rounded-2xl border border-secondary-200 bg-secondary-700 p-4 text-center">
                <p className="text-tertiary font-geist">
                  No records submitted yet
                </p>
              </div>
            )}
        </div>
      </section>
    </div>
  );
}
