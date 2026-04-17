import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { useCreateDepartments } from '../../../../shared/hooks/superadmin/useDepartments';
import useToast from '../../../../shared/hooks/useToast';
import Loader from '../../../../shared/components/Loader';

export default function CreateDepartmentModal({
  isCreateDepartmentModal,
  setIsCreateDepartmentModal,
}) {
  const [departmentName, setDepartmentName] = useState('');
  const [departmentDescription, setDepartmentDescription] = useState('');

  const { mutateAsync, isPending: isLoading } = useCreateDepartments();

  const { showError, showSuccess } = useToast();

  const handleSubmit = async () => {
    if (!departmentName || !departmentDescription) {
      showError('Enter all fields');
      return;
    }

    try {
      await mutateAsync({
        departmentName,
        description: departmentDescription,
      });
      showSuccess('Department created successfully');
      setIsCreateDepartmentModal(false);
    } catch (err) {
      console.log(err);
      showError('Unable to create department. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isCreateDepartmentModal}
      onClose={() => setIsCreateDepartmentModal(false)}
      position="center"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Create department
          </p>
          <p className="text-sm font-geist text-tertiary">
            Create a departments for logbooks to be assigned
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-4 mt-7">
          <InputField
            label="Department name"
            id="departmentName"
            className=""
            value={departmentName}
            required
            onChange={(e) => setDepartmentName(e.target.value)}
          />

          <InputField
            label="Department description"
            id="departmentDescription"
            className=""
            type="textarea"
            value={departmentDescription}
            required
            onChange={(e) => setDepartmentDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsCreateDepartmentModal(false)}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isLoading}
            className="rounded-[10px] flex gap-2 bg-primary-200 disabled:bg-primary-200/70 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-medium font-geist text-white"
          >
            Continue
            {isLoading && <Loader size="border-white! h-4.5 w-4.5" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
