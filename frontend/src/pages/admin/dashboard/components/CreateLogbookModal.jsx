import React, { useEffect, useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { useDepartmentsInfinite } from '../../../../shared/hooks/superadmin/useDepartments';
import Loader from '../../../../shared/components/Loader';
import useToast from '../../../../shared/hooks/useToast';
import { useCreateChecklists } from '../../../../shared/hooks/admin/useChecklist';
import { useNavigate } from 'react-router-dom';
import { useRoles } from '../../../../shared/hooks/superadmin/useRoles';
import { useFetchUsersInfinite } from '../../../../shared/hooks/superadmin/useSuperAdminUser';

const frequencyList = [
  {
    label: 'Hourly',
    value: 'hourly',
  },
  {
    label: 'Daily',
    value: 'daily',
  },
  {
    label: 'Weekly',
    value: 'weekly',
  },
  {
    label: 'Monthly',
    value: 'monthly',
  },
];

const approvalModeList = [
  {
    label: 'Sequential',
    value: 'sequential',
  },
  {
    label: 'Parallel',
    value: 'parallel',
  },
];

export default function CreateLogbookModal({
  isShowLogbookModal,
  setIsShowLogbookModal,
}) {
  const [formData, setFormData] = useState({
    logbookTitle: '',
    documentNumber: '',
    department: {},
    frequency: '',
    frequencyInterval: '',
    approvalMode: '',
    operators: [],
    approvers: [],
  });

  const [departmentSearchInput, setDepartmentSearchInput] = useState('');
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [userSearchInput, setUserSearchInput] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userOtherSearch, setUserOtherSearch] = useState('');

  const navigate = useNavigate();

  const { showError, showSuccess } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setUserSearch(userSearchInput), 500);
    return () => clearTimeout(timer);
  }, [userSearchInput]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDepartmentSearch(departmentSearchInput),
      500,
    );
    return () => clearTimeout(timer);
  }, [departmentSearchInput]);

  const { mutateAsync, isPending: isLoading } = useCreateChecklists({
    onSuccess: (response) => {
      const checkListToNavigateTo = response?.data?.checklist?.checklistId;
      const checkListTitleToNavigateTo = response?.data?.checklist?.title;

      showSuccess('Checklist created successfully');
      handleCancel();

      navigate(
        `/admin/entries/${checkListToNavigateTo}/${checkListTitleToNavigateTo || 'Entries'}`,
      );
    },
  });

  const {
    data: departmentsData,
    isPending: isLoadingDepartments,
    fetchNextPage: fetchNextDepartmentsPage,
    hasNextPage: hasNextDepartmentsPage,
    isFetchingNextPage: isFetchingNextDepartmentsPage,
  } = useDepartmentsInfinite(
    { search: departmentSearch },
    { enabled: isShowLogbookModal },
  );

  const allDepartments =
    departmentsData?.pages.flatMap((p) => p.data.departments) ?? [];

  const departmentsList = allDepartments.map((department) => ({
    ...department,
    label: department.departmentName,
    value: department.departmentId,
  }));

  const { data: roles } = useRoles();

  const rolesData = roles?.data?.roles;

  const operatorRole = rolesData?.find((role) => role.roleName === 'operator');

  const {
    data: usersData,
    isPending: isLoadingUsers,
    fetchNextPage: fetchNextUsersPage,
    hasNextPage: hasNextUsersPage,
    isFetchingNextPage: isFetchingNextUsersPage,
  } = useFetchUsersInfinite(
    { search: userSearch, roleId: operatorRole?.roleId },
    { enabled: isShowLogbookModal },
  );

  const allUsers = usersData?.pages.flatMap((p) => p.data.users) ?? [];

  const usersList = allUsers.map((user) => ({
    ...user,
    label: `${user.firstName} ${user.lastName} - ${user?.role?.roleName || 'N/A'}`,
    value: user.userId,
  }));

  const {
    data: usersOtherData,
    isPending: isLoadingOtherUsers,
    fetchNextPage: fetchNextOtherUsersPage,
    hasNextPage: hasNextOtherUsersPage,
    isFetchingNextPage: isFetchingNextOtherUsersPage,
  } = useFetchUsersInfinite(
    { search: userOtherSearch },
    { enabled: isShowLogbookModal },
  );

  const allOtherUsers =
    usersOtherData?.pages.flatMap((p) => p.data.users) ?? [];

  const usersOtherList = allOtherUsers
    .filter((user) => user.roleId !== operatorRole?.roleId)
    .map((user) => ({
      ...user,
      label: `${user.firstName} ${user.lastName} - ${user?.role?.roleName || 'N/A'}`,
      value: user.userId,
    }));

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

  const handleSetFrequency = (frequency) => {
    setFormData((prev) => ({
      ...prev,
      frequency: frequency,
    }));
  };

  const handleSetOperator = (operator) => {
    if (Array.isArray(operator)) {
      setFormData((prev) => ({
        ...prev,
        operators: operator,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      operators: prev.operators.includes(operator)
        ? prev.operators.filter((operatorId) => operatorId !== operator)
        : [...prev.operators, operator],
    }));
  };

  const handleSetApprover = (approver) => {
    if (Array.isArray(approver)) {
      setFormData((prev) => ({
        ...prev,
        approvers: approver.map((approverId, index) => ({
          approverId,
          step: index,
        })),
      }));
      return;
    }

    setFormData((prev) => {
      const isSelected = prev.approvers.some(
        ({ approverId }) => approverId === approver,
      );

      const approvers = isSelected
        ? prev.approvers
            .filter(({ approverId }) => approverId !== approver)
            .map((approverData, index) => ({
              ...approverData,
              step: index,
            }))
        : [
            ...prev.approvers,
            { approverId: approver, step: prev.approvers.length },
          ];

      return {
        ...prev,
        approvers,
      };
    });
  };

  const handleSetApprovalMode = (frequency) => {
    setFormData((prev) => ({
      ...prev,
      approvalMode: frequency,
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
      logbookTitle,
      documentNumber,
      department,
      frequency,
      frequencyInterval,
      approvalMode,
      operators,
      approvers,
    } = formData;

    if (
      !logbookTitle ||
      !documentNumber ||
      !department?.departmentId ||
      !frequency
    ) {
      showError('Enter all fields');
      return;
    }

    try {
      if (frequency === 'hourly') {
        await mutateAsync({
          title: logbookTitle,
          documentNumber,
          departmentId: department.departmentId,
          frequency,
          frequencyInterval,
          approvalMode,
          approvers,
          operators,
        });
      } else {
        await mutateAsync({
          title: logbookTitle,
          documentNumber,
          departmentId: department.departmentId,
          frequency,
          approvalMode,
          approvers,
          operators,
        });
      }
    } catch (err) {
      console.log(err.response.data);
      showError(
        err.response.data.message ??
          'Unable to create logbook. Please try again.',
      );
    }

    setFormData({
      logbookTitle: '',
      documentNumber: '',
      department: {},
      frequency: '',
      frequencyInterval: '',
      approvalMode: '',
      operators: [],
      approvers: [],
    });
    setDepartmentSearchInput('');
    setDepartmentSearch('');
    setUserSearchInput('');
    setUserSearch('');
    setUserOtherSearch('');
    setIsShowLogbookModal(false);
  };

  const handleCancel = () => {
    setFormData({
      logbookTitle: '',
      documentNumber: '',
      department: {},
      frequency: '',
      frequencyInterval: '',
      approvalMode: '',
      operators: [],
      approvers: [],
    });
    setDepartmentSearchInput('');
    setDepartmentSearch('');
    setUserSearchInput('');
    setUserSearch('');
    setUserOtherSearch('');
    setIsShowLogbookModal(false);
  };

  return (
    <Modal
      isOpen={isShowLogbookModal}
      onClose={() => setIsShowLogbookModal(false)}
      position="right"
      width="max-w-[460px]"
      className=""
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Create Logbook
          </p>
          <p className="text-sm font-geist text-tertiary">
            Enter logbook details
          </p>
        </div>

        <div className="flex-1 gap-3 flex flex-col mt-7">
          <div className="flex items-center gap-1">
            <InputField
              label="Department"
              id="department"
              className="mb-1"
              value={formData.department?.departmentId}
              required
              disabled={isLoadingDepartments}
              options={departmentsList}
              type="select"
              placeholder="Select department"
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
            label="Frequency"
            id="frequency"
            className=""
            value={formData.frequency}
            required
            options={frequencyList}
            placeholder="Select frequency"
            type="select"
            onChange={(e) => handleSetFrequency(e.target.value)}
          />

          {formData.frequency === 'hourly' && (
            <InputField
              label="Frequency interval"
              id="frequencyInterval"
              className="mb-1"
              value={formData.frequencyInterval}
              onChange={handleInputChange}
            />
          )}

          <InputField
            label="Approval mode"
            id="approvalMode"
            className=""
            value={formData.approvalMode}
            required
            placeholder="Select approval mode"
            options={approvalModeList}
            type="select"
            onChange={(e) => handleSetApprovalMode(e.target.value)}
          />

          <div className="flex items-center gap-1">
            <InputField
              label="Operators"
              id="operators"
              className="mb-1"
              placeholder="Select operators"
              value={formData.operators}
              multiple
              required
              disabled={isLoadingUsers}
              options={usersList}
              type="select"
              searchable
              onExternalSearchChange={setUserSearchInput}
              onLoadMore={fetchNextUsersPage}
              hasNextPage={hasNextUsersPage}
              isFetchingNextPage={isFetchingNextUsersPage}
              onChange={(e) => handleSetOperator(e.target.value)}
            />
            {isLoadingUsers && <Loader size="w-4.5 h-4.5 mt-4" />}
          </div>

          <div className="flex items-center gap-1">
            <InputField
              label="Approvers"
              id="approvers"
              className="mb-1"
              placeholder="Select approvers"
              value={formData.approvers.map((o) => o.approverId)}
              multiple
              required
              disabled={isLoadingOtherUsers}
              options={usersOtherList}
              type="select"
              searchable
              onExternalSearchChange={setUserOtherSearch}
              onLoadMore={fetchNextOtherUsersPage}
              hasNextPage={hasNextOtherUsersPage}
              isFetchingNextPage={isFetchingNextOtherUsersPage}
              onChange={(e) => handleSetApprover(e.target.value)}
            />
            {isLoadingOtherUsers && <Loader size="w-4.5 h-4.5 mt-4" />}
          </div>

          <InputField
            label="Logbook title"
            id="logbookTitle"
            required
            className="mb-1"
            value={formData.logbookTitle}
            onChange={handleInputChange}
          />

          <InputField
            label="Document Number"
            id="documentNumber"
            required
            className="mb-1"
            value={formData.documentNumber}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex items-center mt-6 pb-4 justify-end gap-3">
          <Button
            type="button"
            onClick={() => handleCancel()}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white flex gap-2"
            onClick={() => handleSubmit()}
            disabled={isLoading}
          >
            Continue
            {isLoading && <Loader size="border-white! h-4.5 w-4.5" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
