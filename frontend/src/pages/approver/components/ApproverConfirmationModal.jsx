import React from 'react';
import Button from '../../../shared/components/Button';
import Modal from '../../../shared/components/Modal';
import Loader from '../../../shared/components/Loader';

export default function ApproverConfirmationModal({
  isConfirmationModalOpen,
  setIsConfirmationModalOpen,
  handleUpdate,
  isUpdating,
  handleReject,
  isRejecting,
  action,
}) {
  const handleSubmit = async () => {
    if (action === 'approve') {
      handleUpdate();
    } else {
      handleReject();
    }
  };

  return (
    <Modal
      isOpen={isConfirmationModalOpen}
      onClose={() => setIsConfirmationModalOpen(false)}
      position="center"
      width="max-w-[386px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="my-4 flex justify-center items-center"></div>
        <div className="space-y-0.5 w-full text-center flex items-center flex-col">
          <p className="text-base font-semibold font-geist text-primary">
            {action === 'approve' ? 'Approve' : 'Reject'} entry
          </p>
          <p className="text-sm font-geist w-3/4 text-tertiary">
            Are you sure you want to{' '}
            {action === 'approve' ? 'approve' : 'reject'} this entry? This
            action is irreversible.
          </p>
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsConfirmationModalOpen(false)}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className={`rounded-[10px] flex items-center gap-2 px-4 py-2.5 text-sm font-medium font-geist text-white ${
              action === 'approve' ? 'bg-primary-200' : 'bg-tertiary-500'
            }`}
            onClick={handleSubmit}
          >
            Continue
            {isUpdating && <Loader size="border-white! h-4.5 w-4.5" />}
            {isRejecting && <Loader size="border-white! h-4.5 w-4.5" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
