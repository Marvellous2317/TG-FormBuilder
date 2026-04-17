import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { useCreateDepartments } from '../../../../shared/hooks/superadmin/useDepartments';
import useToast from '../../../../shared/hooks/useToast';
import Loader from '../../../../shared/components/Loader';

export default function EditAdminUserModal({
  isEditUserModalOpen,
  setIsEditUserModalOpen,
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState({});
  const [entity, setEntity] = useState({});
  const [department, setDepartment] = useState('');

  const { mutateAsync, isPending: isLoading } = useCreateDepartments();

  const { showError, showSuccess } = useToast();

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !role || !entity || !department) {
      showError('Enter all fields');
      return;
    }

    try {
      await mutateAsync({
        firstName,
        lastName,
        email,
        roleId: role?.roleId,
        entityId: entity?.companyId,
        department,
      });
      showSuccess('Admin User created successfully');
      setIsEditUserModalOpen(false);
    } catch (err) {
      console.log(err);
      showError('Unable to create department. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isEditUserModalOpen}
      onClose={() => setIsEditUserModalOpen(false)}
      position="right"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Create user
          </p>
          <p className="text-sm font-geist text-tertiary">
            Create a user and assign them to a role
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-4 mt-7">
          <InputField
            label="First name"
            id="firstName"
            className=""
            value={firstName}
            required
            onChange={(e) => setFirstName(e.target.value)}
          />

          <InputField
            label="Last name"
            id="lastName"
            className=""
            value={lastName}
            required
            onChange={(e) => setLastName(e.target.value)}
          />

          <InputField
            label="Email"
            id="email"
            className=""
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputField
            label="Role"
            id="role"
            className=""
            value={role?.roleId}
            required
            onChange={(e) => setRole(e.target.value)}
          />

          <InputField
            label="Entity"
            id="entity"
            className=""
            value={entity?.companyId}
            required
            onChange={(e) => setEntity(e.target.value)}
          />

          <InputField
            label="Department"
            id="department"
            className=""
            value={department}
            required
            onChange={(e) => setDepartment(e.target.value)}
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
