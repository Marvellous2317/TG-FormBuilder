import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { formatDate } from '../../../shared/utils/constants';
import { FiSearch } from 'react-icons/fi';
import { FaArrowLeft } from 'react-icons/fa';
import Loader from '../../../shared/components/Loader';
import InputField from '../../../shared/components/InputField';
import { useCompanies } from '../../../shared/hooks/superadmin/useCompanies';
import { useFetchUsers } from '../../../shared/hooks/superadmin/useSuperAdminUser';
import Pagination from '../../../shared/components/Pagination';
import { useSuperAdminSubmissions } from '@/shared/hooks/superadmin/useCompanies';
import AdminUserList from '../users/components/AdminUserList';
import DropdownSelect from '@/shared/components/DropdownSelect';

export default function SuperAdminSubmissionsManagement() {
  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    companyId: '',
  });

  const submissionStatusOptions = [
    { title: 'Approved', value: 'approved' },
    { title: 'Pending', value: 'pending' },
    { title: 'Rejected', value: 'rejected' },
    { title: 'All', value: '' },
  ];

  const [currentStatus, setCurrentStatus] = useState('pending');

  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: 'approved',
  });

  const { data: companiesData, isPending: isLoadingCompanies } = useCompanies();

  const { data: submissions, isFetching } =
    useSuperAdminSubmissions(usersPagination);
  const submissionsData = submissions?.data?.submittedChecklists;
  const pagination = submissions?.data?.pagination;

  const currentPage = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? pagination?.limit ?? 20;

  const handleSearch = useCallback((searchValue) => {
    setUsersPagination((prev) => ({ ...prev, search: searchValue, page: 1 }));
  }, []);

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
    setUsersPagination((prev) => ({
      ...prev,
      page: Number(page) || 1,
      limit: Number(pageSize) || 20,
    }));
  };

  const handleStatusChange = useCallback((status) => {
    setUsersPagination((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleStatusChange(currentStatus);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentStatus, handleStatusChange]);

  const handlePaginationChange = (payload) => {
    if (typeof handlePageChange !== 'function') return;

    const normalizeEvent = (input) => {
      if (input?.target) return input.target;
      if (typeof input === 'object' && input !== null) return input;
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

  const handleRowClick = (id) => {
    navigate(`/superadmin/submissions/${id}`);
  };

  const companies = companiesData?.data?.companies || [];

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  return (
    <div className="w-full min-h-screen max-h-screen">
      <header className="flex flex-col sm:flex-row gap-3 md:gap-0 w-full px-8 py-2.5 border-b border-secondary-200 md:items-center items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-primary text-xl font-medium font-geist">
            Submissions
          </h1>
          <p className="text-sm text-tertiary font-geist">
            Here's all the submissions for this task list
          </p>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-25 mt-10">
        <div className="border border-gray-200 overflow-hidden bg-white w-full min-h-full">
          <section className="flex-col flex w-full min-h-full">
            {/* SEARCH */}
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

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2 items-center">
                  <p className="text-secondary text-sm">Companies:</p>
                  {/* Company Filter */}
                  <div className="flex-1 min-w-0">
                    <InputField
                      // label="Company"
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
                      onChange={(e) =>
                        handleFilterChange('companyId', e.target.value)
                      }
                      disabled={isLoadingCompanies}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-secondary font-geist text-sm">
                    Status:{' '}
                  </h2>
                  <DropdownSelect
                    value={currentStatus}
                    options={submissionStatusOptions}
                    onChange={(value) => setCurrentStatus(value)}
                    placeholder="All"
                    buttonClassName="px-3! py-2! rounded-lg!"
                    menuClassName=""
                  />
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className="w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-100 xl:max-h-140">
              <table className="w-full text-left border-collapse relative min-w-175 md:min-w-full">
                <thead className="sticky top-0 z-10 shadow-sm">
                  <tr className="bg-tertiary-300">
                    <th className="p-3 md:p-4 w-12 text-secondary font-medium text-xs md:text-sm border-r border-b border-gray-200 whitespace-nowrap">
                      #
                    </th>
                    <th className="p-3 md:p-4 text-tertiary font-medium text-xs md:text-sm border-r border-b border-gray-200 whitespace-nowrap">
                      Checklist title
                    </th>
                    <th className="p-3 md:p-4 text-tertiary font-medium text-xs md:text-sm border-r border-b border-gray-200 whitespace-nowrap">
                      Document number
                    </th>
                    <th className="p-3 md:p-4 text-tertiary font-medium text-xs md:text-sm border-r border-b border-gray-200 whitespace-nowrap">
                      Approved by
                    </th>
                    <th className="p-3 md:p-4 text-tertiary font-medium text-xs md:text-sm border-b border-gray-200 whitespace-nowrap">
                      Submitted at
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {isFetching ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center">
                        <Loader size="h-8 w-8 !border-primary-200 mx-auto" />
                      </td>
                    </tr>
                  ) : submissionsData?.length > 0 ? (
                    submissionsData.map((row, index) => (
                      <tr
                        key={row.submittedChecklistId}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() =>
                          handleRowClick(row?.submittedChecklistId)
                        }
                      >
                        <td className="p-3 md:p-4 text-tertiary text-sm border-r border-gray-200">
                          {index + 1}
                        </td>
                        <td className="p-3 md:p-4 text-tertiary text-sm wrap-break-words max-w-50 md:max-w-none">
                          {row?.title}
                        </td>
                        <td className="p-3 md:p-4 text-tertiary text-sm wrap-break-words max-w-50 md:max-w-none">
                          {row?.documentNumber}
                        </td>
                        <td className="p-3 md:p-4 text-tertiary text-sm wrap-break-words max-w-50 md:max-w-none">
                          {row?.approver &&
                          row.approver.firstName &&
                          row.approver.lastName
                            ? `${row.approver.firstName} ${row.approver.lastName}`
                            : 'N/A'}
                        </td>
                        <td className="p-3 md:p-4 text-tertiary text-sm">
                          {formatDate(row.submittedAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-8 text-center text-gray-500 text-sm"
                      >
                        No results found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* PAGINATION */}
          <Pagination
            currentPage={currentPage}
            handlePageChange={handlePaginationChange}
            itemsPerPage={pageSize}
            totalPages={pagination?.totalPages}
            totalItems={pagination?.total}
          />
        </div>
      </div>
    </div>
  );
}
