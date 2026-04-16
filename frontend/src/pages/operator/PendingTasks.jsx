import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import Pagination from '../../shared/components/Pagination';

// Mock data (expanded to demonstrate the scrolling effect)
const tableData = [
  {
    id: 1,
    name: 'Ajayi Tami',
    address: 'an address',
    status: true,
    email: 'Lennox.charles@tolaram.com',
    createdAt: '2026-03-13',
    description: 'This is description',
  },
  {
    id: 2,
    name: 'Lennox',
    address: 'an address',
    status: true,
    email: 'Lennox.charles@tolaram.com',
    createdAt: '2026-03-13',
    description: 'This is description',
  },
];

export default function PendingTasks() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleChange = (event) => {
    const { value } = event.target;
    setSearch(value);
  };

  // Filter data based on search and status
  const filteredData = tableData.filter((row) => {
    const matchesSearch =
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.address.toLowerCase().includes(search.toLowerCase()) ||
      row.email.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  const handlePageChange = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  return (
    <div className="flex w-full flex-col max-h-screen">
      <section className="py-5 px-25 gap-1 border-b border-secondary-200">
        <h2 className="font-medium text-primary text-xl">Pending Task</h2>
        <p className="text-xs text-tertiary">You have 10 pending tasks</p>
      </section>

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
                      Checklist
                    </th>
                    <th className="p-3 md:p-4 text-tertiary font-medium font-geist text-xs md:text-sm border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                      Document Number
                    </th>
                    <th className="p-3 md:p-4 text-tertiary font-medium font-geist text-xs md:text-sm  border-b border-gray-200 bg-tertiary-300 whitespace-nowrap">
                      Issued date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((row, index) => (
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
            handlePageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>
    </div>
  );
}
