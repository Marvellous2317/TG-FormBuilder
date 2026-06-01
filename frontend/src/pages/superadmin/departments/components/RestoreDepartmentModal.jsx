import React from 'react';
import Modal from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import Icons from '../../../../assets/icons';
import { useRestoreDepartment } from '../../../../shared/hooks/superadmin/useDepartments';
import useToast from '../../../../shared/hooks/useToast';
import Loader from '../../../../shared/components/Loader';

export default function RestoreDepartmentModal({
  isRestoreDepartmentModalOpen,
  setIsRestoreDepartmentModalOpen,
  departmentToRestore,
  setDepartmentToRestore,
}) {
  const { mutateAsync: restoreDepartment, isPending: isLoading } =
    useRestoreDepartment();
  const { showSuccess } = useToast();

  const handleSubmit = async () => {
    try {
      await restoreDepartment({
        departmentId: departmentToRestore?.departmentId,
      });
      showSuccess('Department restored successfully');
      setIsRestoreDepartmentModalOpen(false);
      setDepartmentToRestore(null);
    } catch (error) {
      console.error('Error', error);
    }
  };

  return (
    <Modal
      isOpen={isRestoreDepartmentModalOpen}
      onClose={() => setIsRestoreDepartmentModalOpen(false)}
      position="center"
      width="max-w-[386px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="mt-9 flex justify-center items-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 bg-tertiary-200 rounded-xl">
            <img
              src={Icons.activeUsers}
              alt="restore department"
              className="w-4.5 object-contain"
            />
          </div>
        </div>
        <div className="space-y-0.5 w-full text-center flex items-center flex-col">
          <p className="text-base font-semibold font-geist text-primary">
            Restore department
          </p>
          <p className="text-sm font-geist w-3/4 text-tertiary">
            Are you sure you want to restore this department?
          </p>
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsRestoreDepartmentModalOpen(false)}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-[10px] flex items-center gap-2 bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white"
            onClick={handleSubmit}
          >
            Restore
            {isLoading && <Loader size="border-white! h-4.5 w-4.5" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
