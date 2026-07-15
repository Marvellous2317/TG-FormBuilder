import React, { useEffect, useState } from 'react';
import Icons from '../../assets/icons';
import Button from './Button';
import {
  FaAngleDown,
  FaAngleRight,
  FaAngleUp,
  FaAngleLeft,
} from 'react-icons/fa';
import { FaAnglesRight, FaAnglesLeft } from 'react-icons/fa6';

export default function Pagination({
  currentPage = 1,
  handlePageChange,
  itemsPerPage = 10,
  totalPages,
  totalItems,
}) {
  const pageCount =
    totalPages ??
    Math.max(1, Math.ceil((totalItems ?? itemsPerPage) / itemsPerPage));

  const current = Math.min(Math.max(1, Number(currentPage) || 1), pageCount);
  const [pageValue, setPageValue] = useState(current);
  const [pageSizeValue, setPageSizeValue] = useState(itemsPerPage);

  // Corrected boundary math for pagination arrows
  const canGoPrev = current > 1;
  const canGoPrevTwice = current > 2;
  const canGoNext = current < pageCount;
  const canGoNextTwice = current < pageCount - 1;

  useEffect(() => {
    setPageValue(current);
  }, [current]);

  useEffect(() => {
    setPageSizeValue(itemsPerPage);
  }, [itemsPerPage]);

  const emitPageChange = (name, value) => {
    if (typeof handlePageChange !== 'function') {
      return;
    }

    handlePageChange({ target: { name, value } });
  };

  const handlePageTyping = (event) => {
    setPageValue(event.target.value);
  };

  const handlePageSubmit = (event) => {
    const value = Number(event.target.value);

    let nextPage = Math.max(1, Number.isNaN(value) || value === 0 ? 1 : value);

    nextPage = Math.min(nextPage, pageCount);

    setPageValue(nextPage);
    emitPageChange('page', nextPage);
  };

  const handlePageKeyDown = (event) => {
    if (event.key === 'Enter') {
      handlePageSubmit(event);
    }
  };

  const handlePageSizeTyping = (event) => {
    setPageSizeValue(event.target.value);
  };

  const handlePageSizeSubmit = (event) => {
    const value = Number(event.target.value);
    const nextSize = Math.max(
      10,
      Number.isNaN(value) || value === 0 ? 10 : value,
    );

    setPageSizeValue(nextSize);
    emitPageChange('pageSize', nextSize);
  };

  const handlePageSizeKeyDown = (event) => {
    if (event.key === 'Enter') {
      handlePageSizeSubmit(event);
    }
  };
  return (
    <section className="items-center flex flex-wrap border-t border-gray-200 justify-center w-full py-3.5 gap-2 sm:gap-3 md:gap-4">
      <div className="flex items-center gap-1 mr-4.75">
        {/* Double Prev */}
        {canGoPrevTwice ? (
          <Button
            type="button"
            onClick={() => {
              const prev = current - 2;
              setPageValue(prev);
              emitPageChange('page', prev);
            }}
            className="p-1.5"
          >
            <FaAnglesLeft size={14} className="text-primary" />
          </Button>
        ) : (
          <Button
            type="button"
            className="p-1.5 cursor-not-allowed"
            onClick={() => {}} // Disabled state does nothing
          >
            <FaAnglesLeft size={14} className="text-tertiary-800" />
          </Button>
        )}

        {/* Single Prev */}
        {canGoPrev ? (
          <Button
            type="button"
            onClick={() => {
              const prev = current - 1;
              setPageValue(prev);
              emitPageChange('page', prev);
            }}
            className="p-1.5"
          >
            <FaAngleLeft size={14} className="text-primary" />
          </Button>
        ) : (
          <Button
            type="button"
            className="p-1.5 cursor-not-allowed"
            onClick={() => {}}
          >
            <FaAngleLeft size={14} className="text-tertiary-800" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <p className="text-primary font-geist text-sm">Page</p>
        <div className="flex items-center border border-gray-200 rounded w-17.5 pl-2.5 pr-1 py-0.5 justify-between">
          <input
            name="page"
            type="number"
            min="1"
            max={pageCount}
            value={pageValue}
            onChange={handlePageTyping}
            onBlur={handlePageSubmit}
            onKeyDown={handlePageKeyDown}
            className="w-5 text-start text-tertiary font-geist text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none"
          />
          <div className="flex flex-col">
            <Button
              type="button"
              onClick={() => {
                if (!canGoNext) return;
                const next = current + 1;
                setPageValue(next);
                emitPageChange('page', next);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <FaAngleUp />
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!canGoPrev) return;
                const prev = current - 1;
                setPageValue(prev);
                emitPageChange('page', prev);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <FaAngleDown />
            </Button>
          </div>
        </div>
        <p className="text-primary font-geist text-sm">of {pageCount}</p>
        {typeof totalItems === 'number' && (
          <p className="text-tertiary font-geist text-sm">
            | {totalItems} total
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 ml-4.75">
        {/* Single Next */}
        {canGoNext ? (
          <Button
            type="button"
            onClick={() => {
              const next = current + 1;
              setPageValue(next);
              emitPageChange('page', next);
            }}
            className="p-1.5"
          >
            <FaAngleRight size={14} className="text-primary" />
          </Button>
        ) : (
          <Button
            type="button"
            className="p-1.5 cursor-not-allowed"
            onClick={() => {}}
          >
            <FaAngleRight size={14} className="text-tertiary-800" />
          </Button>
        )}

        {/* Double Next */}
        {canGoNextTwice ? (
          <Button
            type="button"
            onClick={() => {
              const next = current + 2;
              setPageValue(next);
              emitPageChange('page', next);
            }}
            className="p-1.5"
          >
            <FaAnglesRight size={14} className="text-primary" />
          </Button>
        ) : (
          <Button
            type="button"
            className="p-1.5 cursor-not-allowed"
            onClick={() => {}}
          >
            <FaAnglesRight size={14} className="text-tertiary-800" />
          </Button>
        )}
      </div>

      <p className="text-tertiary-400 font-geist text-sm mx-4 hidden sm:block">
        |
      </p>

      <div className="flex items-center gap-2">
        <p className="text-primary font-geist text-sm">Results per page</p>
        <div className="flex items-center border border-gray-200 rounded w-17.5 pl-2.5 pr-1 py-0.5 justify-between">
          <input
            name="pageSize"
            type="number"
            min="10"
            value={pageSizeValue}
            onChange={handlePageSizeTyping}
            onBlur={handlePageSizeSubmit}
            onKeyDown={handlePageSizeKeyDown}
            className="w-5 text-start text-tertiary font-geist text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none"
          />
          <div className="flex flex-col">
            <Button
              type="button"
              onClick={() => {
                const nextSize = pageSizeValue + 1;
                setPageSizeValue(nextSize);
                emitPageChange('pageSize', nextSize);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <FaAngleUp />
            </Button>
            <Button
              type="button"
              onClick={() => {
                const nextSize = Math.max(1, pageSizeValue - 1);
                setPageSizeValue(nextSize);
                emitPageChange('pageSize', nextSize);
              }}
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
