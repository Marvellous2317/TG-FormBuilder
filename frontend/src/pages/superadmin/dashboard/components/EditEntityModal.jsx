import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { FaPlus } from 'react-icons/fa';
import { FiUpload } from 'react-icons/fi';
import Divider from '../../../../shared/components/Divider';
import { useUpdateCompany } from '../../../../shared/hooks/superadmin/useCompanies';
import useToast from '../../../../shared/hooks/useToast';
import Loader from '../../../../shared/components/Loader';

export default function EditEntityModal({
  isEditEntityModal,
  setIsEditEntityModal,
  company,
}) {
  const [entityName, setEntityName] = useState(company?.companyName ?? '');
  const [entityAddress, setEntityAddress] = useState(company?.address ?? '');
  const [fullName, setFullName] = useState(company?.contactFullName ?? '');
  const [emailAddress, setEmailAddress] = useState(company?.contactEmail ?? '');

  const { mutateAsync, isPending: isLoading } = useUpdateCompany();

  const { showSuccess, showError } = useToast();

  const handleSubmit = async () => {
    if (!entityName || !entityAddress || !fullName || !emailAddress) {
      showError('Complete all fields');
      return;
    }

    try {
      await mutateAsync({
        companyId: company.companyId,
        payload: {
          companyName: entityName,
          address: entityAddress,
          contactEmail: emailAddress,
          contactFullName: fullName,
        },
      });

      showSuccess('Entity updated successfully');
      setIsEditEntityModal(false);
    } catch (err) {
      console.error('Error', err);
      showError('Unable to update entity. Please try again.');
    }
  };

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
            Edit entity
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
              readOnly
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
              className="mt-4"
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
            className="rounded-[10px] flex gap-2 bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white"
            onClick={() => handleSubmit()}
          >
            Update
            {isLoading && <Loader size="border-white! h-4.5 w-4.5" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
