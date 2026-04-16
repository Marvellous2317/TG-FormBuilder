import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { FaPlus } from 'react-icons/fa';
import { FiUpload } from 'react-icons/fi';
import Divider from '../../../../shared/components/Divider';
import { useCreateCompanies } from '../../../../shared/hooks/superadmin/useCompanies';
import useToast from '../../../../shared/hooks/useToast';
import Loader from '../../../../shared/components/Loader';

export default function CreateEntityModal({
  isCreateEntityModal,
  setIsCreateEntityModal,
}) {
  const [entityName, setEntityName] = useState('');
  const [entityAddress, setEntityAddress] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  const { mutateAsync, isPending: isLoading } = useCreateCompanies();

  const { showSuccess, showError } = useToast();

  const handleSubmit = async () => {
    if (!entityName || !entityAddress || !fullName || !emailAddress) {
      showError('Complete all fields');
      return;
    }

    try {
      await mutateAsync({
        companyName: entityName,
        address: entityAddress,
        contactEmail: emailAddress,
        contactFullName: fullName,
      });

      showSuccess('Entity created successfully');
      setIsCreateEntityModal(false);
    } catch (err) {
      console.error('Error', err);
      showError('Unable to create entity. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isCreateEntityModal}
      onClose={() => setIsCreateEntityModal(false)}
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
            {/* <p className="text-sm font-geist text-tertiary">
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
            </div> */}

            <InputField
              label="Address of entity"
              id="entityAddress"
              className="mt-4"
              value={entityAddress}
              onChange={(e) => setEntityAddress(e.target.value)}
            />

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
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="mt-4"
            />
          </div>
        </div>

        <div className="flex items-center mt-6 p-5 border-t border-secondary-200 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsCreateEntityModal(false)}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-[10px] flex gap-2 bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white"
            onClick={() => handleSubmit()}
          >
            Continue
            {isLoading && <Loader size="border-white! h-4.5 w-4.5" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
