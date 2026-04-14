import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { FaPlus } from 'react-icons/fa';
import { FiUpload } from 'react-icons/fi';
import Divider from '../../../../shared/components/Divider';

export default function EditEntityModal({
  isEditEntityModal,
  setIsEditEntityModal,
}) {
  const [entityName, setEntityName] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  return (
    <Modal
      isOpen={isEditEntityModal}
      onClose={() => setIsEditEntityModal(false)}
      position="right"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col">
        <div className="space-y-0.5 p-5 border-b border-secondary-200">
          <p className="text-base font-semibold font-geist text-primary">
            New entity
          </p>
          <p className="text-sm font-geist text-tertiary">
            Add all details to onboard an entity
          </p>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="px-5 py-6">
            <h2 className="text-base font-semibold font-geist text-primary">
              Entity profile
            </h2>
            <p className="text-sm font-geist text-tertiary">
              Add image and name of entity
            </p>
            <div className="mt-5 w-full rounded-2xl px-4 py-2 bg-tertiary-700 flex items-center justify-between">
              <div className="bg-white border border-secondary-200 rounded-full p-5.25 border-dashed">
                <FaPlus className="text-primary" size={14} />
              </div>

              <Button className="bg-white border rounded-[10px] border-secondary-200 px-3 py-2 flex items-center gap-1">
                <FiUpload className="text-primary" size={12} />
                <p className="text-secondary-100 text-sm font-medium">Upload</p>
              </Button>
            </div>

            <InputField
              label="Name of entity"
              id="entityName"
              className="mt-4"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
            />
          </div>

          <Divider />

          <div className="px-5 py-6">
            <h2 className="text-base font-semibold font-geist text-primary">
              Entity admin account
            </h2>
            <p className="text-sm font-geist text-tertiary">
              The admin will configure their logbook system
            </p>

            <InputField
              label="Full name"
              id="fullName"
              className="mt-5"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <InputField
              label="Email address"
              id="emailAddress"
              type="email"
              className=""
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center mt-6 p-5 border-t border-secondary-200 justify-end gap-3">
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
