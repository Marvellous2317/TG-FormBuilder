import React, { useState, useEffect, useCallback } from 'react';
import AdminCard from '../admin/dashboard/components/AdminCard';
import Icons from '../../assets/icons';
import { FiSearch } from 'react-icons/fi';
import Pagination from '../../shared/components/Pagination';
import { useOperatorChecklists } from '../../shared/hooks/operator/useOperatorChecklists';
import { useUserAnalytics } from '../../shared/hooks/useAuth';
import Loader from '../../shared/components/Loader';
import { useNavigate } from 'react-router-dom';
import { saveToCache, getFromCache } from '../../lib/offlineCache';

export default function OperatorDashboard() {
  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 20,
    search: '',
  });

  const [cachedChecklists, setCachedChecklists] = useState(null);

  useEffect(() => {
    getFromCache('operator-checklists').then(setCachedChecklists);
  }, []);

  const handleSearch = useCallback((searchValue) => {
    setUsersPagination((prev) => ({
      ...prev,
      search: searchValue,
      page: 1,
    }));
  }, []);

  const { data, isFetching } = useOperatorChecklists(usersPagination, {
    placeholderData: cachedChecklists,
  });

  useEffect(() => {
    if (data) saveToCache('operator-checklists', data);
  }, [data]);

  const { data: userAnalytics, isPending: isLoadingUserAnalytics } =
    useUserAnalytics();

  const analyticsData = userAnalytics?.data;

  const checklistsData = data?.data?.assignments;
  const pagination = data?.data?.pagination;

  const currentPage = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? pagination?.limit ?? 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(search);
    }, 1000);
    return () => clearTimeout(timer);
  }, [search, handleSearch]);

  const handleChange = (event) => {
    setSearch(event.target.value);
  };

  const handlePageChange = ({ page, pageSize }) => {
    setUsersPagination({
      page: Number(page) || 1,
      limit: Number(pageSize) || 20,
    });
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

  const handleRowClick = (rowId) => {
    navigate(`/operator/entries/${rowId}/create`);
  };

  return (
    <div className="flex w-full flex-col min-h-screen bg-white">
      <section className="py-5 px-4 md:px-10 lg:px-25 gap-1 border-b border-secondary-200">
        <h2 className="font-medium text-primary text-xl">Dashboard</h2>
        <p className="text-xs text-tertiary">
          Your dashboard analytics and checklists
        </p>
      </section>

      <div className="px-4 md:px-10 lg:px-25 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-5">
          <AdminCard
            icon={Icons.createdIcon}
            title="Total checklists"
            count={analyticsData?.totalChecklists || 0}
            loading={isLoadingUserAnalytics}
          />
          <AdminCard
            icon={Icons.submitIcon}
            title="Total approved"
            count={analyticsData?.totalApproved || 0}
            loading={isLoadingUserAnalytics}
          />
          <AdminCard
            icon={Icons.pendingIcon}
            title="Total pending"
            count={analyticsData?.totalPending || 0}
            loading={isLoadingUserAnalytics}
          />
          <AdminCard
            icon={Icons.pendingIcon}
            title="Total rejected"
            count={analyticsData?.totalRejected || 0}
            loading={isLoadingUserAnalytics}
          />
          <AdminCard
            icon={Icons.logsWeekIcon}
            title="Checklists this week"
            count={analyticsData?.myChecklistsThisWeek || 0}
            loading={isLoadingUserAnalytics}
          />
          <AdminCard
            icon={Icons.logsTodayIcon}
            title="Checklists today"
            count={analyticsData?.myChecklistsToday || 0}
            loading={isLoadingUserAnalytics}
          />
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white w-full min-h-full shadow-sm">
          <section className="flex-col flex w-full min-h-full">
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
            </div>

            <div className="w-full overflow-x-auto overflow-y-auto max-h-[60vh] md:max-h-100 xl:max-h-140">
              <table className="w-full text-left border-collapse relative min-w-160 md:min-w-full">
                <thead className="sticky top-0 z-10 shadow-sm">
                  <tr className="bg-tertiary-300">
                    <th className="p-3 md:p-4 w-12 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                      #
                    </th>
                    <th className="p-3 md:p-4 text-tertiary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                      Checklist title
                    </th>
                    <th className="p-3 md:p-4 text-tertiary font-medium font-geist text-xs md:text-sm border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                      Document number
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {isFetching ? (
                    <tr>
                      <td colSpan="3" className="p-12 text-center">
                        <Loader size="h-8 w-8 !border-primary-200 mx-auto" />
                      </td>
                    </tr>
                  ) : checklistsData?.length > 0 ? (
                    checklistsData.map((row, index) => (
                      <tr
                        key={row.assignmentId}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleRowClick(row?.assignmentId)}
                      >
                        <td className="p-3 md:p-4 text-tertiary font-geist text-sm border-r border-gray-200">
                          {index + 1}
                        </td>
                        <td className="p-3 md:p-4 border-r text-tertiary font-geist text-sm border-gray-200">
                          {row?.checklist?.title}
                        </td>
                        <td className="p-3 md:p-4 text-tertiary font-geist text-sm wrap-break-words border-gray-200">
                          {row?.checklist?.documentNumber}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
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
      </div>
    </div>
  );
}
