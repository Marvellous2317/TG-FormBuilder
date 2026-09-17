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

const accessLevels = [
  { label: 'Read only', value: 'read' },
  { label: 'Read and write', value: 'read_write' },
];

export default function CreateAdminUserModal({
  isCreateUserModalOpen,
  setIsCreateUserModalOpen,
  fromAdmin = false,
}) {
  const { user } = useAuthStore.getState();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: {},
    entity: fromAdmin ? user?.company : {},
    department: {},
    accessLevel: 'read_write',
  });

  useEffect(() => {
    if (!isCreateUserModalOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: {},
        entity: fromAdmin ? user?.company : {},
        department: {},
        accessLevel: 'read_write',
      });
    }
  }, [isCreateUserModalOpen, fromAdmin, user?.company]);

  const [entitySearchInput, setEntitySearchInput] = useState('');
  const [entitySearch, setEntitySearch] = useState('');
  const [departmentSearchInput, setDepartmentSearchInput] = useState('');
  const [departmentSearch, setDepartmentSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setEntitySearch(entitySearchInput), 2000);
    return () => clearTimeout(timer);
  }, [entitySearchInput]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDepartmentSearch(departmentSearchInput),
      3000,
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
    { enabled: !!isCreateUserModalOpen },
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

  let rolesData = roles?.data?.roles.map((role) => ({
    ...role,
    label: role.roleName,
    value: role.roleId,
  }));

  rolesData = fromAdmin
    ? rolesData?.filter((r) => r.label.toLowerCase() !== 'corporateadmin')
    : rolesData;

  const isAdminRole =
    rolesData?.find((r) => r.label === 'admin')?.roleId ===
    formData?.role?.roleId;

  const isCorporateAdminRole =
    rolesData?.find((r) => r.label === 'corporateAdmin')?.roleId ===
    formData?.role?.roleId;

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
    const selectedRole = rolesData?.find((r) => r.roleId === roleId);
    const isCorporateAdmin = selectedRole?.label === 'corporateAdmin';

    setFormData((prev) => {
      let entity = prev.entity;

      if (isCorporateAdmin && !Array.isArray(entity)) {
        entity = entity?.companyId ? [entity] : [];
      }

      if (!isCorporateAdmin && Array.isArray(entity)) {
        entity = entity[0] ?? {};
      }

      return {
        ...prev,
        role: {
          roleId,
          label: selectedRole?.label,
        },
        entity,
      };
    });
  };

  const handleSetEntity = (companyId) => {
    setFormData((prev) => ({
      ...prev,
      entity: isCorporateAdminRole
        ? companyId.map((id) => ({
            companyId: id,
            label: companiesList?.find((r) => r.companyId === id)?.label,
          }))
        : {
            companyId,
            label: companiesList?.find((r) => r.companyId === companyId)?.label,
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
    const {
      firstName,
      lastName,
      email,
      role,
      entity,
      department,
      accessLevel,
    } = formData;

    if (
      !fromAdmin &&
      (isCorporateAdminRole
        ? !Array.isArray(entity) || entity.length === 0
        : !entity?.companyId)
    ) {
      showError('Select an entity');
      return;
    }

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

    try {
      const companyId = fromAdmin
        ? user.companyId
        : isCorporateAdminRole
          ? entity.map(({ companyId }) => companyId)
          : entity.companyId;
      await mutateAsync({
        firstName,
        lastName,
        email,
        roleId: role?.roleId,
        companyId,
        department: department.label,
        accessLevel,
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
      accessLevel: 'read_write',
    });
    setEntitySearchInput('');
    setEntitySearch('');
    setDepartmentSearchInput('');
    setDepartmentSearch('');
    setIsCreateUserModalOpen(false);
  };

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

          {isAdminRole && (
            <div className="flex gap-2 w-full items-center relative">
              <InputField
                label="Admin access level"
                id="accessLevel"
                className=""
                value={formData.accessLevel}
                required
                readOnly={isLoadingRoles}
                options={accessLevels}
                type="select"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    accessLevel: e.target.value,
                  }))
                }
              />
            </div>
          )}

          {/* {fromAdmin ? (
            <InputField
              label="Entity"
              id="entity"
              className=""
              value={user?.company?.companyName}
              readOnly={fromAdmin}
              disabled={fromAdmin}
              onChange={handleInputChange}
            />
          ) : (
            <div className="flex gap-2 w-full items-center relative">
              <InputField
                label="Entity"
                id="entity"
                className=""
                value={formData.entity?.companyId}
                required
                disabled={isLoadingEntities}
                options={companiesList}
                type="select"
                searchable
                onExternalSearchChange={setEntitySearchInput}
                onLoadMore={fetchNextEntitiesPage}
                hasNextPage={hasNextEntitiesPage}
                isFetchingNextPage={isFetchingNextEntitiesPage}
                onChange={(e) => handleSetEntity(e.target.value)}
              />
              {isLoadingEntities && <Loader size="w-4.5 h-4.5 mt-4" />}
            </div>
          )} */}

          <div className="flex gap-2 w-full items-center relative">
            <InputField
              key={isCorporateAdminRole ? 'corporate' : 'standard'}
              label="Entity"
              id="entity"
              className=""
              value={
                isCorporateAdminRole
                  ? Array.isArray(formData.entity)
                    ? formData.entity.map(({ companyId }) => companyId)
                    : []
                  : fromAdmin
                    ? user?.companyId
                    : (formData.entity?.companyId ?? '')
              }
              required
              readOnly={isLoadingEntities}
              disabled={fromAdmin}
              options={companiesList}
              type="select"
              placeholder={fromAdmin ? formData.entity?.companyName : ''}
              searchable={!fromAdmin}
              onExternalSearchChange={setEntitySearchInput}
              onLoadMore={fetchNextEntitiesPage}
              hasNextPage={hasNextEntitiesPage}
              isFetchingNextPage={isFetchingNextEntitiesPage}
              multiple={isCorporateAdminRole}
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
