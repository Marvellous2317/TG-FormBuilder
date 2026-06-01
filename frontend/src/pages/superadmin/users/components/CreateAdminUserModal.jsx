import React, { useEffect, useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { useDepartmentsInfinite } from '../../../../shared/hooks/superadmin/useDepartments';
import useToast from '../../../../shared/hooks/useToast';
import Loader from '../../../../shared/components/Loader';
import { useRoles } from '../../../../shared/hooks/superadmin/useRoles';
import { useCompaniesInfinite } from '../../../../shared/hooks/superadmin/useCompanies';
import { useCreateUser } from '../../../../shared/hooks/superadmin/useSuperAdminUser';
import { useAuthStore } from '../../../../shared/store/authStore';

export default function CreateAdminUserModal({
  isCreateUserModalOpen,
  setIsCreateUserModalOpen,
  isFromAdmin = false,
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: {},
    entity: {},
    department: {},
  });

  const [entitySearchInput, setEntitySearchInput] = useState('');
  const [entitySearch, setEntitySearch] = useState('');
  const [departmentSearchInput, setDepartmentSearchInput] = useState('');
  const [departmentSearch, setDepartmentSearch] = useState('');

  const { user } = useAuthStore.getState();

  useEffect(() => {
    const timer = setTimeout(() => setEntitySearch(entitySearchInput), 500);
    return () => clearTimeout(timer);
  }, [entitySearchInput]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDepartmentSearch(departmentSearchInput),
      500,
    );
    return () => clearTimeout(timer);
  }, [departmentSearchInput]);

  const {
    data: departmentsData,
    isPending: isLoadingDepartments,
    fetchNextPage: fetchNextDepartmentsPage,
    hasNextPage: hasNextDepartmentsPage,
    isFetchingNextPage: isFetchingNextDepartmentsPage,
  } = useDepartmentsInfinite(
    { search: departmentSearch },
    { enabled: isCreateUserModalOpen },
  );

  const { data: roles, isLoading: isLoadingRoles } = useRoles();

  const {
    data: companiesData,
    isPending: isLoadingEntities,
    fetchNextPage: fetchNextEntitiesPage,
    hasNextPage: hasNextEntitiesPage,
    isFetchingNextPage: isFetchingNextEntitiesPage,
  } = useCompaniesInfinite(
    { search: entitySearch },
    { enabled: isCreateUserModalOpen },
  );

  const { mutateAsync, isPending: isLoading } = useCreateUser();

  const { showError, showSuccess } = useToast();

  const rolesData = roles?.data?.roles.map((role) => ({
    ...role,
    label: role.roleName,
    value: role.roleId,
  }));

  const allCompanies =
    companiesData?.pages.flatMap((p) => p.data.companies) ?? [];
  const allDepartments =
    departmentsData?.pages.flatMap((p) => p.data.departments) ?? [];

  const companiesList = allCompanies.map((company) => ({
    ...company,
    label: company.companyName,
    value: company.companyId,
  }));

  const departmentsList = allDepartments.map((department) => ({
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
        label: companiesList.find((r) => r.companyId === companyId)?.label,
      },
    }));
  };

  const handleSetDepartment = (departmentId) => {
    setFormData((prev) => ({
      ...prev,
      department: {
        departmentId,
        label: departmentsList.find((r) => r.departmentId === departmentId)
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
      !department?.departmentId
    ) {
      showError('Enter all fields');
      return;
    }

    if (!entity?.companyId && !isFromAdmin) {
      showError('Select an entity');
      return;
    }

    try {
      await mutateAsync({
        firstName,
        lastName,
        email,
        roleId: role?.roleId,
        companyId: isFromAdmin ? selectedEntity?.companyId : entity?.companyId,
        department: department.label,
      });
      showSuccess('Admin User created successfully');
      handleCloseModal();
    } catch (err) {
      console.log(err.response.data);
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
    setEntitySearchInput('');
    setEntitySearch('');
    setDepartmentSearchInput('');
    setDepartmentSearch('');
    setIsCreateUserModalOpen(false);
  };

  const selectedEntity = companiesList.find(
    (company) => company.companyId === user.companyId,
  );

  return (
    <Modal
      isOpen={isCreateUserModalOpen}
      onClose={() => handleCloseModal()}
      position="right"
      width="max-w-[460px]"
      // className="overflow-hidden"
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
              value={
                isFromAdmin
                  ? selectedEntity?.companyId
                  : formData.entity?.companyId
              }
              required
              disabled={isLoadingEntities || isFromAdmin}
              options={companiesList}
              type="select"
              searchable
              onExternalSearchChange={setEntitySearchInput}
              onLoadMore={fetchNextEntitiesPage}
              hasNextPage={hasNextEntitiesPage}
              isFetchingNextPage={isFetchingNextEntitiesPage}
              onChange={(e) => handleSetEntity(e.target.value)}
              readOnly={isFromAdmin}
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
              disabled={isLoadingDepartments}
              options={departmentsList}
              type="select"
              searchable
              onExternalSearchChange={setDepartmentSearchInput}
              onLoadMore={fetchNextDepartmentsPage}
              hasNextPage={hasNextDepartmentsPage}
              isFetchingNextPage={isFetchingNextDepartmentsPage}
              onChange={(e) => handleSetDepartment(e.target.value)}
            />
            {isLoadingDepartments && <Loader size="w-4.5 h-4.5 mt-4" />}
          </div>

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
        </div>

        <div className="flex items-center mt-6 justify-end pb-5 gap-3">
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
