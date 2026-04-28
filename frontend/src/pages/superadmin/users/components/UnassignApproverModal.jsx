import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import useToast from '../../../../shared/hooks/useToast';
import Loader from '../../../../shared/components/Loader';
import { useUnAssignApprover } from '../../../../shared/hooks/superadmin/useSuperAdminUser';
import Divider from '../../../../shared/components/Divider';

export default function UnassignApproverModal({
  isUnassignApproverModalOpen,
  setIsUnassignApproverModalOpen,
  userToEdit,
  isLoadingUsers,
  users,
}) {
  const [approver, setApprover] = useState(null);

  const { mutateAsync, isPending: isLoading } = useUnAssignApprover();

  const { showError, showSuccess } = useToast();

  const handleSubmit = async () => {
    if (!approver) {
      showError('Failed to assign approver, select an approver');
      return;
    }

    try {
      await mutateAsync({
        approverId: approver?.value,
        userId: userToEdit?.userId,
      });
      showSuccess('Approver assigned successfully');
      handleCloseModal();
    } catch (err) {
      console.log(err?.response);
      showError(
        err?.response?.data?.message ??
          'Unable to create user. Please try again.',
      );
    }
  };

  const handleCloseModal = () => {
    setApprover(null);
    setIsUnassignApproverModalOpen(false);
  };

  const handleAssign = (id) => {
    setApprover({
      value: id,
      label: `${users?.find((user) => user?.id === id)?.approver?.firstName} ${users?.find((user) => user?.id === id)?.approver?.lastName}}`,
    });
  };

  const usersData = userToEdit?.operatorApprovers?.map((user) => ({
    ...user,
    label: `${user?.approver.firstName} ${user?.approver.lastName}`,
    value: user?.id,
  }));

  return (
    <Modal
      isOpen={isUnassignApproverModalOpen}
      onClose={() => handleCloseModal()}
      position="right"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col">
        <div className="space-y-0.5 p-5">
          <p className="text-base font-semibold font-geist text-primary">
            Unassign approver
          </p>
          <p className="text-sm font-geist text-tertiary">
            Unssign an approver from an operator
          </p>
        </div>

        <Divider />

        <div className="flex-1 flex flex-col gap-4 px-5 pt-2">
          <div className="flex gap-2 flex-col">
            <p className="text-base font-semibold font-geist text-primary">
              Operator information
            </p>
            <InputField
              label="Full name"
              value={`${userToEdit?.firstName} ${userToEdit?.lastName}`}
              readOnly
              onChange={() => {}}
            />
            <InputField
              label="Email"
              value={`${userToEdit?.email}`}
              readOnly
              onChange={() => {}}
            />
            <InputField
              label="Entity"
              value={`${userToEdit?.company?.companyName}`}
              readOnly
              onChange={() => {}}
            />
          </div>

          <div className="flex gap-2 flex-col mt-5">
            <p className="text-base font-semibold font-geist text-primary">
              Select approver
            </p>

            <div className="flex gap-2 w-full items-center relative">
              <InputField
                label="Approver"
                id="approver"
                value={approver?.value}
                required
                readOnly={isLoadingUsers}
                options={usersData}
                type="select"
                onChange={(e) => handleAssign(e.target.value)}
              />
              {isLoadingUsers && <Loader size="w-4.5 h-4.5 mt-4" />}
            </div>
          </div>
        </div>

        <div className="flex items-center mt-6 justify-end gap-3 p-5">
          <Button
            type="button"
            onClick={() => handleCloseModal()}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isLoading}
            className="rounded-[10px] flex gap-2 bg-tertiary-500 disabled:bg-tertiary-500/70 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-medium font-geist text-white"
          >
            Unassign
            {isLoading && <Loader size="border-white! h-4.5 w-4.5" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
