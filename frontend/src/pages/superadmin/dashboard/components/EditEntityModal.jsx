import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';

export default function EditEntityModal({
  isEditEntityModal,
  setIsEditEntityModal,
}) {
  const [departmentName, setEntityName] = useState('');
  const [departmentAddress, setEntityAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  return (
    <Modal
      isOpen={isEditEntityModal}
      onClose={() => setIsEditEntityModal(false)}
      position="center"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Edit department
          </p>
          <p className="text-sm font-geist text-tertiary">
            Edit a department for users to be assigned
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-4 mt-7">
          <InputField
            label="Entity name"
            id="departmentName"
            className=""
            value={departmentName}
            onChange={(e) => setEntityName(e.target.value)}
          />

          <InputField
            label="Entity address"
            id="departmentAddress"
            className=""
            value={departmentAddress}
            onChange={(e) => setEntityAddress(e.target.value)}
          />

          <InputField
            label="Contact email"
            id="contactEmail"
            type="email"
            className=""
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsEditEntityModal(false)}
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
