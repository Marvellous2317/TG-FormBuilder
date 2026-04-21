import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import Pagination from '../../shared/components/Pagination';
import { useOperatorSubmittedChecklists } from '../../shared/hooks/operator/useOperatorChecklists';
import Loader from '../../shared/components/Loader';

export default function ApprovedTasks() {
  const [search, setSearch] = useState('');

  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 20,
    status: 'approved',
  });

  const { data: submissions, isPending: isLoadingSubmissions } =
    useOperatorSubmittedChecklists(usersPagination);

  const submissionsData = submissions?.data?.submissions;
  const pagination = submissions?.data?.pagination;

  const currentPage = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? pagination?.limit ?? 20;

  const handleChange = (event) => {
    const { value } = event.target;
    setSearch(value);
  };

  const handlePageChange = ({ page, pageSize }) => {
    setUsersPagination({
      page: Number(page) || 1,
      limit: Number(pageSize) || 20,
      status: 'approved',
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

  return (
    <div className="flex w-full flex-col max-h-screen">
      <section className="py-5 px-25 gap-1 border-b border-secondary-200">
        <h2 className="font-medium text-primary text-xl">Approved Task</h2>
        <p className="text-xs text-tertiary">Your approved submissions</p>
      </section>

      {isLoadingSubmissions ? (
        <Loader size="h-12 w-12 !border-primary-200 mt-20" />
      ) : (
        <div className="px-25">
          <div className="border border-gray-200 overflow-hidden bg-white w-full min-h-full">
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

              <div className="w-full overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-100 xl:max-h-140">
                <table className="w-full text-left border-collapse relative min-w-160 md:min-w-full">
                  <thead className="sticky top-0 z-10 shadow-sm">
                    <tr className="bg-tertiary-300">
                      <th className="p-3 md:p-4 w-12 text-secondary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                        #
                      </th>
                      <th className="p-3 md:p-4 text-tertiary font-medium font-geist text-xs md:text-sm border-r border-b border-secondary-200 bg-tertiary-700 whitespace-nowrap">
                        Checklist ID
                      </th>
                      <th className="p-3 md:p-4 text-tertiary font-medium font-geist text-xs md:text-sm border-r border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                        Checklist title
                      </th>
                      <th className="p-3 md:p-4 text-tertiary font-medium font-geist text-xs md:text-sm  border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                        Document number
                      </th>
                      <th className="p-3 md:p-4 text-tertiary font-medium font-geist text-xs md:text-sm  border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                        Approved by
                      </th>
                      <th className="p-3 md:p-4 text-tertiary font-medium font-geist text-xs md:text-sm  border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                        Submitted at
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {submissionsData?.length > 0 ? (
                      submissionsData?.map((row, index) => (
                        <tr
                          key={row.id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-3 md:p-4 text-tertiary font-geist text-sm md:text-sm border-r border-gray-200 space-y-1">
                            {index + 1}
                          </td>
                          <td className="p-3 md:p-4 text-tertiary font-geist text-sm md:text-sm space-y-1">
                            {row.name}
                          </td>
                          <td className="p-3 md:p-4 text-tertiary font-geist text-sm md:text-sm wrap-break-words max-w-50 md:max-w-none">
                            {row.address}
                          </td>
                          <td className="p-3 md:p-4 text-tertiary font-geist text-sm md:text-sm">
                            {row.createdAt}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
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
      )}
    </div>
  );
}
