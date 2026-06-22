import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChecklistsVersions } from '../../../shared/hooks/admin/useChecklist';
import { formatDate } from '../../../shared/utils/constants';
import { FiSearch } from 'react-icons/fi';
import Loader from '../../../shared/components/Loader';
import Pagination from '../../../shared/components/Pagination';

export default function HistoryManagement() {
  const { id: checklistId } = useParams();

  const navigate = useNavigate();

  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 20,
  });

  const { data: versions, isFetching } = useChecklistsVersions(
    checklistId,
    usersPagination,
    { enabled: Boolean(checklistId) },
  );
  const versionsData = versions?.data?.versions;
  const pagination = versions?.data?.pagination;

  const currentPage = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? pagination?.limit ?? 20;

  const handlePageChange = ({ page, pageSize }) => {
    setUsersPagination({
      page: Number(page) || 1,
      limit: Number(pageSize) || 20,
      status: 'approved',
    });
  };

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

  const handleRowClick = (rowId, rowTitle) => {
    navigate(
      `/admin/entries/${checklistId}/view/${rowId}/history?title=${rowTitle}`,
    );
  };

  return (
    <div className="w-full min-h-screen max-h-screen">
      <header className="flex flex-col sm:flex-row gap-3 md:gap-0 w-full px-8 py-2.5 border-b border-secondary-200 md:items-center items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-primary text-xl font-medium font-geist">
            Version history
          </h1>
          <p className="text-sm text-tertiary font-geist">
            Here's all the version history for this task list
          </p>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-25">
        <div className="border border-gray-200 overflow-hidden bg-white w-full min-h-full">
          <section className="flex-col flex w-full min-h-full">
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
                      Frequency
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
                  ) : versionsData?.length > 0 ? (
                    versionsData.map((row, index) => (
                      <tr
                        key={row.versionChecklistId}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() =>
                          handleRowClick(row?.versionChecklistId, row?.title)
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
                          {row?.frequency}
                        </td>
                        <td className="p-3 md:p-4 text-tertiary text-sm">
                          {formatDate(row.createdAt)}
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
