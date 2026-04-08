import React from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import Icons from '../../../../assets/icons';

export default function DeactivateUserModal({
  isDeactivateUserModalOpen,
  setIsDeactivateUserModalOpen,
}) {
  return (
    <Modal
      isOpen={isDeactivateUserModalOpen}
      onClose={() => setIsDeactivateUserModalOpen(false)}
      position="center"
      width="max-w-[386px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="mt-9 flex justify-center items-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 bg-tertiary-600 rounded-xl">
            <img
              src={Icons.deactivateUser}
              alt="deactivate user"
              className="w-4.5 object-contain"
            />
          </div>
        </div>
        <div className="space-y-0.5 w-full text-center flex items-center flex-col">
          <p className="text-base font-semibold font-geist text-primary">
            Deactivate user
          </p>
          <p className="text-sm font-geist w-3/4 text-tertiary">
            Are you sure you want to deactivate this user? This action is
            irreversible
          </p>
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsDeactivateUserModalOpen(false)}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-[10px] bg-tertiary-500 px-4 py-2.5 text-sm font-medium font-geist text-white"
          >
            Deactivate
          </Button>
        </div>
      </div>
    </Modal>
  );
}
