import React, { useEffect, useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import {
  useCreateDepartments,
  useDepartments,
} from '../../../../shared/hooks/superadmin/useDepartments';
import useToast from '../../../../shared/hooks/useToast';
import Loader from '../../../../shared/components/Loader';
import { useRoles } from '../../../../shared/hooks/superadmin/useRoles';
import { useCompanies } from '../../../../shared/hooks/superadmin/useCompanies';

export default function CreateAdminUserModal({
  isCreateUserModalOpen,
  setIsCreateUserModalOpen,
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState({});
  const [entity, setEntity] = useState({});
  const [department, setDepartment] = useState('');

  const { data: departments, isPending: isLoadingDepartments } =
    useDepartments();
  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const { data: companies, isPending: isLoadingEntities } = useCompanies();

  const { showError, showSuccess } = useToast();

  const rolesData = roles?.data?.roles.map((role) => ({
    ...role,
    label: role.roleName,
    value: role.roleId,
  }));
  const companiesData = companies?.data?.companies;

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !role || !entity || !department) {
      showError('Enter all fields');
      return;
    }

    // try {
    //   await mutateAsync({
    //     firstName,
    //     lastName,
    //     email,
    //     roleId: role?.roleId,
    //     entityId: entity?.companyId,
    //     department,
    //   });
    //   showSuccess('Admin User created successfully');
    //   setIsCreateUserModalOpen(false);
    // } catch (err) {
    //   console.log(err);
    //   showError('Unable to create department. Please try again.');
    // }
  };

  return (
    <Modal
      isOpen={isCreateUserModalOpen}
      onClose={() => setIsCreateUserModalOpen(false)}
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

          <div className="flex gap-2 items-center">
            <InputField
              label="Role"
              id="role"
              className=""
              value={role?.roleId}
              required
              readOnly={isLoadingRoles}
              options={rolesData}
              type="select"
              onChange={(e) => setRole(e.target.value)}
            />
            {isLoadingRoles && <Loader />}
          </div>

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
            onClick={() => setIsCreateUserModalOpen(false)}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit()}
            // disabled={isLoading}
            className="rounded-[10px] flex gap-2 bg-primary-200 disabled:bg-primary-200/70 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-medium font-geist text-white"
          >
            Continue
            {/* {isLoading && <Loader size="border-white! h-4.5 w-4.5" />} */}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
