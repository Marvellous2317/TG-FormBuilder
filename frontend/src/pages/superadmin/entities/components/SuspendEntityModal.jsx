import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { useSuspendCompany } from '../../../../shared/hooks/superadmin/useCompanies';
import Loader from '../../../../shared/components/Loader';
import useToast from '../../../../shared/hooks/useToast';

export default function SuspendEntityModal({
  isSuspendEntityModal,
  setIsSuspendEntityModal,
  companyId,
}) {
  const [reason, setReason] = useState('');

  const { mutateAsync, isPending: isLoading } = useSuspendCompany();

  const { showSuccess } = useToast();

  const handleSuspension = async () => {
    try {
      await mutateAsync({ companyId, payload: { reason } });
      setIsSuspendEntityModal(false);
      showSuccess('Entity suspended successfully');
    } catch (error) {
      console.error('Error', error);
    }
  };

  return (
    <Modal
      isOpen={isSuspendEntityModal}
      onClose={() => setIsSuspendEntityModal(false)}
      position="center"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Suspend entity
          </p>
          <p className="text-sm font-geist text-tertiary">
            Suspending will permanently disable this entity. Data will be
            retained for 90 days.
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-4 mt-7">
          <InputField
            label="Reason"
            id="reason"
            required
            className=""
            value={reason}
            type="textarea"
            rows={5}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsSuspendEntityModal(false)}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-[10px] flex gap-2 bg-tertiary-500 px-4 py-2.5 text-sm font-medium font-geist text-white"
            onClick={() => handleSuspension()}
          >
            Confirm suspension
            {isLoading && <Loader size="border-white! h-4.5 w-4.5" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
