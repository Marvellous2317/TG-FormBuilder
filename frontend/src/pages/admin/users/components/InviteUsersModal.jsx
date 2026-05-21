import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';

export default function InviteUsersModal({
  isInviteModalOpen,
  setIsInviteModalOpen,
}) {
  const [emails, setEmails] = useState('');

  return (
    <Modal
      isOpen={isInviteModalOpen}
      onClose={() => setIsInviteModalOpen(false)}
      position="center"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Invite users
          </p>
          <p className="text-sm font-geist text-tertiary">
            Invite users in your entity to the platform
          </p>
        </div>

        <div className="flex-1 space-y-5 mt-7">
          <InputField
            label="Email address"
            placeholder="Enter email address"
            type="email"
            id="email"
            className="mb-1"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
          />

          <p className="text-tertiary font-geist text-[10px] leading-3.5">
            Separate emails using a comma or enter key
          </p>
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsInviteModalOpen(false)}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white"
          >
            Send invite
          </Button>
        </div>
      </div>
    </Modal>
  );
}
