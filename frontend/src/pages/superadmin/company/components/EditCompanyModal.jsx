import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';

export default function EditCompanyModal({
  isEditCompanyModal,
  setIsEditCompanyModal,
}) {
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  return (
    <Modal
      isOpen={isEditCompanyModal}
      onClose={() => setIsEditCompanyModal(false)}
      position="center"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Edit company
          </p>
          <p className="text-sm font-geist text-tertiary">
            Edit a company for users to be assigned
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-4 mt-7">
          <InputField
            label="Company name"
            id="companyName"
            className=""
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <InputField
            label="Company address"
            id="companyAddress"
            className=""
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
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
            onClick={() => setIsEditCompanyModal(false)}
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
