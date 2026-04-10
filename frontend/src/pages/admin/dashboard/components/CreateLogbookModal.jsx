import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';

export default function CreateLogbookModal({
  isShowLogbookModal,
  setIsShowLogbookModal,
}) {
  const [logbookTitle, setLogbookTitle] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');

  return (
    <Modal
      isOpen={isShowLogbookModal}
      onClose={() => setIsShowLogbookModal(false)}
      position="center"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Create Logbook
          </p>
          <p className="text-sm font-geist text-tertiary">
            Enter logbook details
          </p>
        </div>

        <div className="flex-1 gap-4 flex flex-col mt-7">
          <InputField
            label="Logbook title"
            id="logbookTitle"
            className="mb-1"
            value={logbookTitle}
            onChange={(e) => setLogbookTitle(e.target.value)}
          />

          <InputField
            label="Document Number"
            id="documentNumber"
            className="mb-1"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
          />
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsShowLogbookModal(false)}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white"
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
