import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';

export default function EditUsersModal({
  isEditUserModalOpen,
  setIsEditUserModalOpen,
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  return (
    <Modal
      isOpen={isEditUserModalOpen}
      onClose={() => setIsEditUserModalOpen(false)}
      position="center"
      width="max-w-xl"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Edit details
          </p>
          <p className="text-sm font-geist text-tertiary">
            You can only edit assigned roles
          </p>
        </div>

        <div className="flex-1 space-y-5 mt-7">
          <div className="flex items-center gap-6">
            <InputField
              label="First name"
              className=""
              id="firstName"
              autoComplete
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <InputField
              label="Last name"
              className=""
              id="lastName"
              autoComplete
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <InputField
            label="Email address"
            type="email"
            id="email"
            className="mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputField
            label="Role"
            type="select"
            id="role"
            placeholder="Select role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { label: 'Admin', value: 'admin' },
              { label: 'Operator', value: 'operator' },
              { label: 'Approver', value: 'approver' },
            ]}
          />
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsEditUserModalOpen(false)}
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
