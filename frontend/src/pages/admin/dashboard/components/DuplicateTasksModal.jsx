import React, { useState, useEffect } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import Loader from '../../../../shared/components/Loader';
import {
  useChecklists,
  useSearchChecklists,
} from '../../../../shared/hooks/admin/useChecklist';

export default function DuplicateTasksModal({
  isDuplicateTasksModalOpen,
  setIsDuplicateTasksModalOpen,
  setChecklistToDuplicate,
  setIsShowLogbookModal,
}) {
  const [documentNumber, setDocumentNumber] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  // Debounce search query (waits 400ms after typing stops)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(documentNumber.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [documentNumber]);

  // Reset state on close
  useEffect(() => {
    if (!isDuplicateTasksModalOpen) {
      setDocumentNumber('');
      setDebouncedSearch('');
      setSelectedChecklist(null);
    }
  }, [isDuplicateTasksModalOpen]);

  const { data, isPending, isFetching } = useSearchChecklists(
    {
      documentNumber: debouncedSearch,
    },
    {
      enabled: isDuplicateTasksModalOpen && Boolean(debouncedSearch),
    },
  );

  const isLoadingChecklists =
    (isFetching || isPending) && Boolean(debouncedSearch);

  const checklists = data?.data?.checklists || [];

  // Filter & sort matching checklists (documents starting with query come first, followed by containing query)
  const matchingChecklists = debouncedSearch
    ? [...checklists]
        .filter((c) => {
          const query = debouncedSearch.toLowerCase();
          const docNum = (c.documentNumber || '').toLowerCase();
          const title = (c.title || '').toLowerCase();
          return docNum.includes(query) || title.includes(query);
        })
        .sort((a, b) => {
          const query = debouncedSearch.toLowerCase();
          const aDoc = (a.documentNumber || '').toLowerCase();
          const bDoc = (b.documentNumber || '').toLowerCase();

          const aStarts = aDoc.startsWith(query);
          const bStarts = bDoc.startsWith(query);

          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return 0;
        })
    : [];

  // Auto select first match if current selected is invalid
  useEffect(() => {
    if (matchingChecklists.length > 0) {
      const exists = matchingChecklists.some(
        (item) => item.checklistId === selectedChecklist?.checklistId,
      );
      if (!exists) {
        setSelectedChecklist(matchingChecklists[0]);
      }
    } else {
      setSelectedChecklist(null);
    }
  }, [matchingChecklists]);

  const handleContinue = () => {
    if (!selectedChecklist) return;
    setChecklistToDuplicate(selectedChecklist);
    setIsDuplicateTasksModalOpen(false);
    setIsShowLogbookModal(true);
  };

  const handleClose = () => {
    setIsDuplicateTasksModalOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && selectedChecklist) {
      e.preventDefault();
      handleContinue();
    }
  };

  return (
    <Modal
      isOpen={isDuplicateTasksModalOpen}
      onClose={handleClose}
      position="right"
      width="max-w-[460px]"
      className=""
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Duplicate task list
          </p>
          <p className="text-sm font-geist text-tertiary">
            Search and select a document to duplicate its details
          </p>
        </div>

        <div
          className="flex-1 flex flex-col mt-7 min-h-0 overflow-y-auto pr-1"
          onKeyDown={handleKeyDown}
        >
          <div className="relative w-full mb-4">
            <InputField
              label="Document Number"
              id="documentNumberInput"
              type="text"
              placeholder="Search document number (e.g. 3 or FM/QCPC)"
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

          {/* Results list */}
          {!isLoadingChecklists && matchingChecklists.length > 0 && (
            <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[360px] pr-1 font-geist">
              <p className="text-xs font-medium text-tertiary uppercase tracking-wider mb-1">
                Matching Documents ({matchingChecklists.length})
              </p>
              {matchingChecklists.map((checklist) => {
                const isSelected =
                  selectedChecklist?.checklistId === checklist.checklistId;
                return (
                  <div
                    key={checklist.checklistId}
                    onClick={() => setSelectedChecklist(checklist)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left flex flex-col gap-1 ${
                      isSelected
                        ? 'border-primary-200 bg-secondary-700 shadow-sm ring-1 ring-primary-200'
                        : 'border-secondary-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary-200">
                        {checklist.documentNumber}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-semibold bg-primary-200 text-white px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-primary truncate">
                      {checklist.title}
                    </p>
                    {checklist.department?.departmentName && (
                      <p className="text-xs text-tertiary">
                        Department: {checklist.department.departmentName}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* No results message */}
          {!isLoadingChecklists &&
            debouncedSearch &&
            matchingChecklists.length === 0 && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-geist text-red-600 text-center">
                No task list found matching "{debouncedSearch}"
              </div>
            )}
        </div>

        <div className="flex items-center mt-6 pb-4 justify-end gap-3">
          <Button
            type="button"
            onClick={handleClose}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedChecklist || isLoadingChecklists}
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
