import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { useDepartments } from '../../../../shared/hooks/superadmin/useDepartments';
import useToast from '../../../../shared/hooks/useToast';
import Loader from '../../../../shared/components/Loader';
import { useRoles } from '../../../../shared/hooks/superadmin/useRoles';
import { useCompanies } from '../../../../shared/hooks/superadmin/useCompanies';
import { useCreateUser } from '../../../../shared/hooks/superadmin/useSuperAdminUser';

export default function CreateAdminUserModal({
  isCreateUserModalOpen,
  setIsCreateUserModalOpen,
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: {},
    entity: {},
    department: {},
  });

  const { data: departments, isPending: isLoadingDepartments } =
    useDepartments();
  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const { data: companies, isPending: isLoadingEntities } = useCompanies();

  const { mutateAsync, isPending: isLoading } = useCreateUser();

  const { showError, showSuccess } = useToast();

  const rolesData = roles?.data?.roles.map((role) => ({
    ...role,
    label: role.roleName,
    value: role.roleId,
  }));

  const companiesData = companies?.data?.companies.map((company) => ({
    ...company,
    label: company.companyName,
    value: company.companyId,
  }));

  const departmentsData = departments?.data?.departments.map((department) => ({
    ...department,
    label: department.departmentName,
    value: department.departmentId,
  }));

  const handleSetRole = (roleId) => {
    setFormData((prev) => ({
      ...prev,
      role: {
        roleId,
        label: rolesData.filter((r) => r.roleId === roleId)[0]?.label,
      },
    }));
  };

  const handleSetEntity = (companyId) => {
    setFormData((prev) => ({
      ...prev,
      entity: {
        companyId,
        label: companiesData.filter((r) => r.companyId === companyId)[0]?.label,
      },
    }));
  };

  const handleSetDepartment = (departmentId) => {
    setFormData((prev) => ({
      ...prev,
      department: {
        departmentId,
        label: departmentsData.filter((r) => r.departmentId === departmentId)[0]
          ?.label,
      },
    }));
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    const { firstName, lastName, email, role, entity, department } = formData;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !role?.roleId ||
      !entity?.companyId ||
      !department?.departmentId
    ) {
      showError('Enter all fields');
      return;
    }

    try {
      await mutateAsync({
        firstName,
        lastName,
        email,
        roleId: role?.roleId,
        companyId: entity?.companyId,
        department: department.label,
      });
      showSuccess('Admin User created successfully');
      handleCloseModal();
    } catch (err) {
      console.log(err.response.data);
      showError(
        err.response.data.message ?? 'Unable to create user. Please try again.',
      );
    }
  };

  const handleCloseModal = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: {},
      entity: {},
      department: {},
    });
    setIsCreateUserModalOpen(false);
  };

  return (
    <Modal
      isOpen={isCreateUserModalOpen}
      onClose={() => handleCloseModal()}
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
            value={formData.firstName}
            required
            onChange={handleInputChange}
          />

          <InputField
            label="Last name"
            id="lastName"
            className=""
            value={formData.lastName}
            required
            onChange={handleInputChange}
          />

          <InputField
            label="Email"
            id="email"
            className=""
            value={formData.email}
            required
            onChange={handleInputChange}
          />

          <div className="flex gap-2 w-full items-center relative">
            <InputField
              label="Role"
              id="role"
              className=""
              value={formData.role?.roleId}
              required
              readOnly={isLoadingRoles}
              options={rolesData}
              type="select"
              onChange={(e) => handleSetRole(e.target.value)}
            />
            {isLoadingRoles && <Loader size="w-4.5 h-4.5 mt-4" />}
          </div>

          <div className="flex gap-2 w-full items-center relative">
            <InputField
              label="Entity"
              id="entity"
              className=""
              value={formData.entity?.companyId}
              required
              readOnly={isLoadingEntities}
              options={companiesData}
              type="select"
              onChange={(e) => handleSetEntity(e.target.value)}
            />
            {isLoadingEntities && <Loader size="w-4.5 h-4.5 mt-4" />}
          </div>

          <div className="flex gap-2 w-full items-center relative">
            <InputField
              label="Department"
              id="department"
              className=""
              value={formData.department?.departmentId}
              required
              readOnly={isLoadingDepartments}
              options={departmentsData}
              type="select"
              onChange={(e) => handleSetDepartment(e.target.value)}
            />
            {isLoadingDepartments && <Loader size="w-4.5 h-4.5 mt-4" />}
          </div>
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
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
