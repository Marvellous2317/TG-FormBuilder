import React, { useState, useEffect } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import Icons from '../../../../assets/icons';
import Loader from '../../../../shared/components/Loader';
import { useChecklists } from '../../../../shared/hooks/admin/useChecklist';

export default function DuplicateTasksModal({
  isDuplicateTasksModalOpen,
  setIsDuplicateTasksModalOpen,
  setChecklistToDuplicate,
  setIsShowLogbookModal,
}) {
  const [documentNumber, setDocumentNumber] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query (waits 2 seconds after typing stops)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(documentNumber.trim());
    }, 2000);
    return () => clearTimeout(timer);
  }, [documentNumber]);

  // Reset state on close
  useEffect(() => {
    if (!isDuplicateTasksModalOpen) {
      setDocumentNumber('');
      setDebouncedSearch('');
    }
  }, [isDuplicateTasksModalOpen]);

  const { data, isPending, isFetching } = useChecklists(
    {
      search: debouncedSearch,
      limit: 10,
      deleted: 'false',
    },
    {
      enabled: isDuplicateTasksModalOpen && Boolean(debouncedSearch),
    },
  );

  const isLoadingChecklists =
    (isFetching || isPending) && Boolean(debouncedSearch);

  const checklists = data?.data?.checklists || [];

  // Find exact matching checklist by documentNumber (case-insensitive) or default to top match
  const matchedChecklist = debouncedSearch
    ? checklists.find(
        (c) =>
          c.documentNumber?.toLowerCase() === debouncedSearch.toLowerCase(),
      ) ||
      checklists[0] ||
      null
    : null;

  const handleContinue = () => {
    if (!matchedChecklist) return;
    setChecklistToDuplicate(matchedChecklist);
    setIsDuplicateTasksModalOpen(false);
    setIsShowLogbookModal(true);
  };

  const handleClose = () => {
    setIsDuplicateTasksModalOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && matchedChecklist) {
      e.preventDefault();
      handleContinue();
    }
  };

  return (
    <Modal
      isOpen={isDuplicateTasksModalOpen}
      onClose={handleClose}
      position="center"
      width="max-w-[420px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="mt-9 flex justify-center items-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 bg-secondary-700 rounded-xl">
            <img
              src={Icons.documentIcon}
              alt="duplicate task list"
              className="w-6 h-6 object-contain"
            />
          </div>
        </div>

        <div className="space-y-0.5 w-full text-center flex items-center flex-col mb-5">
          <p className="text-base font-semibold font-geist text-primary">
            Duplicate task list
          </p>
          <p className="text-sm font-geist text-tertiary">
            Paste a document number to duplicate its details
          </p>
        </div>

        <div className="w-full space-y-3 mb-6" onKeyDown={handleKeyDown}>
          <div className="relative w-full">
            <InputField
              label="Document Number"
              id="documentNumberInput"
              type="text"
              placeholder="Paste document number (e.g. FM/QCPC_PSIL/P-5)"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              inputClassName="placeholder:text-gray-400! pr-10"
              className="w-full"
              autoFocus
            />
            {isLoadingChecklists && (
              <div className="absolute right-3.5 bottom-3.5 flex items-center justify-center pointer-events-none">
                <Loader size="w-4.5 h-4.5" />
              </div>
            )}
          </div>

          {/* Found document preview */}
          {!isLoadingChecklists && matchedChecklist && (
            <div className="p-3.5 bg-secondary-700 border border-secondary-200 rounded-xl flex flex-col gap-1 text-left font-geist">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-primary-200 uppercase tracking-wider">
                  Document Found
                </span>
                <span className="text-xs font-medium text-tertiary">
                  {matchedChecklist.documentNumber}
                </span>
              </div>
              <p className="text-sm font-semibold text-primary truncate">
                {matchedChecklist.title}
              </p>
              {matchedChecklist.department?.departmentName && (
                <p className="text-xs text-tertiary">
                  Department: {matchedChecklist.department.departmentName}
                </p>
              )}
            </div>
          )}

          {/* No results message */}
          {!isLoadingChecklists && debouncedSearch && !matchedChecklist && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-geist text-red-600 text-center">
              No task list found matching "{debouncedSearch}"
            </div>
          )}
        </div>

        <div className="flex items-center mt-2 justify-end gap-3">
          <Button
            type="button"
            onClick={handleClose}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!matchedChecklist || isLoadingChecklists}
            className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
