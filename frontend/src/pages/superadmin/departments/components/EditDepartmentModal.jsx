import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { useUpdateDepartment } from '../../../../shared/hooks/superadmin/useDepartments';
import useToast from '../../../../shared/hooks/useToast';
import Loader from '../../../../shared/components/Loader';

export default function EditDepartmentModal({
  isEditDepartmentModal,
  setIsEditDepartmentModal,
  departmentToEdit,
  setDepartmentToEdit,
}) {
  const [departmentName, setDepartmentName] = useState(
    departmentToEdit?.departmentName ?? '',
  );
  const [departmentDescription, setDepartmentDescription] = useState(
    departmentToEdit?.description ?? '',
  );

  const { mutateAsync, isPending: isLoading } = useUpdateDepartment();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async () => {
    try {
      await mutateAsync({
        departmentId: departmentToEdit?.departmentId,
        payload: { departmentName, description: departmentDescription },
      });

      showSuccess('Department updated successfully');
      setIsEditDepartmentModal(false);
      setDepartmentToEdit(null);
    } catch (error) {
      console.error('Error', error);
      showError('Unable to update department. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isEditDepartmentModal}
      onClose={() => {
        setIsEditDepartmentModal(false);
        setDepartmentToEdit(null);
      }}
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
            label="Department name"
            id="departmentName"
            className=""
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
          />

          <InputField
            label="Department description"
            id="departmentDescription"
            type="textarea"
            className=""
            value={departmentDescription}
            onChange={(e) => setDepartmentDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => {
              setIsEditDepartmentModal(false);
              setDepartmentToEdit(null);
            }}
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
