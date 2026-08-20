import React from 'react';
import Modal from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';
import { useDeleteCompany } from '../../../../shared/hooks/superadmin/useCompanies';
import Loader from '../../../../shared/components/Loader';
import useToast from '../../../../shared/hooks/useToast';

export default function DeleteEntityModal({
  isDeleteEntityModal,
  setIsDeleteEntityModal,
  companyId,
}) {
  const { mutateAsync, isPending: isLoading } = useDeleteCompany();

  const { showSuccess } = useToast();

  const handleDeletion = async () => {
    try {
      await mutateAsync({ companyId });
      setIsDeleteEntityModal(false);
      showSuccess('Entity deleted successfully');
    } catch (error) {
      console.error('Error', error);
    }
  };

  return (
    <Modal
      isOpen={isDeleteEntityModal}
      onClose={() => setIsDeleteEntityModal(false)}
      position="center"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Delete entity
          </p>
          <p className="text-sm font-geist text-tertiary">
            Deleting will permanently remove this entity. Data will be
            retained for 90 days.
          </p>
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsDeleteEntityModal(false)}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-[10px] flex gap-2 bg-tertiary-500 px-4 py-2.5 text-sm font-medium font-geist text-white"
            onClick={() => handleDeletion()}
          >
            Confirm deletion
            {isLoading && <Loader size="border-white! h-4.5 w-4.5" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
