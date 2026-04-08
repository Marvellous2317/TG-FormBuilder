import React from 'react';
import Icons from '../../assets/icons';
import Button from './Button';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

export default function Pagination({
  currentPage,
  handlePageChange,
  itemsPerPage,
}) {
  return (
    <section className="items-center flex flex-wrap border-t border-gray-200 justify-center w-full py-3.5 gap-2 sm:gap-3 md:gap-4">
      <div className="flex items-center gap-1 mr-4.75">
        <Button className="p-1.5">
          <img
            src={Icons.doubleArrowLeftInactive}
            className="object-contain w-3 h-3"
          />
        </Button>
        <Button className="p-1.5">
          <img
            src={Icons.arrowLeftInactive}
            className="object-contain w-3 h-3"
          />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-primary font-geist text-sm">Page</p>
        <div className="flex items-center border border-gray-200 rounded w-17.5 pl-2.5 pr-1 py-0.5 justify-between">
          <input
            type="number"
            min="1"
            value={currentPage}
            onChange={handlePageChange}
            className="w-5 text-start text-gray-700 font-geist text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none"
          />
          <div className="flex flex-col">
            <Button
              onClick={() =>
                handlePageChange({ target: { value: currentPage + 1 } })
              }
              className="text-gray-600 hover:text-gray-900"
            >
              <FaAngleUp />
            </Button>
            <Button
              onClick={() =>
                handlePageChange({ target: { value: currentPage - 1 } })
              }
              className="text-gray-600 hover:text-gray-900"
            >
              <FaAngleDown />
            </Button>
          </div>
        </div>
        <p className="text-primary font-geist text-sm">of {itemsPerPage}</p>
      </div>

      <div className="flex items-center gap-1 ml-4.75">
        <Button className="p-1.5">
          <img
            src={Icons.doubleArrowRightInactive}
            className="object-contain w-3 h-3"
          />
        </Button>
        <Button className="p-1.5">
          <img
            src={Icons.arrowRightInactive}
            className="object-contain w-3 h-3"
          />
        </Button>
      </div>

      <p className="text-tertiary-400 font-geist text-sm mx-4 hidden sm:block">
        |
      </p>

      <div className="flex items-center gap-2">
        <p className="text-primary font-geist text-sm">Results per page</p>
        <div className="flex items-center border border-gray-200 rounded w-17.5 pl-2.5 pr-1 py-0.5 justify-between">
          <input
            type="number"
            min="1"
            value={currentPage}
            onChange={handlePageChange}
            className="w-5 text-start text-gray-700 font-geist text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none"
          />
          <div className="flex flex-col">
            <Button
              onClick={() =>
                handlePageChange({ target: { value: currentPage + 1 } })
              }
              className="text-gray-600 hover:text-gray-900"
            >
              <FaAngleUp />
            </Button>
            <Button
              onClick={() =>
                handlePageChange({ target: { value: currentPage - 1 } })
              }
              className="text-gray-600 hover:text-gray-900"
            >
              <FaAngleDown />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
