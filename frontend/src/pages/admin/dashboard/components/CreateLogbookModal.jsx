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
import {
  getChecklistApprovers,
  getChecklistOperatorIds,
} from '../../../../shared/utils/constants';
import {
  createChecklistEntries,
  fetchChecklistsEntries,
} from '../../../../core/api/admin';

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

const cloneConfig = (config = {}) =>
  typeof structuredClone === 'function'
    ? structuredClone(config)
    : JSON.parse(JSON.stringify(config));

const removeServerOwnedFields = (value = {}) => {
  const cleaned = { ...value };

  delete cleaned.entryId;
  delete cleaned.checklistEntryId;
  delete cleaned.checklistId;
  delete cleaned.createdAt;
  delete cleaned.updatedAt;
  delete cleaned.deletedAt;

  return cleaned;
};

const cleanCopiedEntry = (entry, index) => {
  const rest = removeServerOwnedFields(entry);
  const config = cloneConfig(entry.config);

  if (Array.isArray(config.items)) {
    config.items = config.items.map(removeServerOwnedFields);
  }

  return {
    ...rest,
    order: index,
    config,
  };
};

export default function CreateLogbookModal({
  isShowLogbookModal,
  setIsShowLogbookModal,
  checklistToDuplicate,
  setChecklistToDuplicate,
}) {
  const [formData, setFormData] = useState({
    logbookTitle: checklistToDuplicate
      ? `${checklistToDuplicate?.title} (copy)`
      : '',
    documentNumber: checklistToDuplicate
      ? `${checklistToDuplicate?.documentNumber} (copy)`
      : '',
    department: checklistToDuplicate?.department
      ? {
          departmentId: checklistToDuplicate?.department?.departmentId,
          departmentName: checklistToDuplicate?.department?.departmentName,
        }
      : {},
    frequency: checklistToDuplicate?.frequency || '',
    frequencyInterval: checklistToDuplicate?.frequencyInterval || '',
    approvalMode: checklistToDuplicate?.approvalMode || '',
    operators: getChecklistOperatorIds(checklistToDuplicate),
    approvers: getChecklistApprovers(checklistToDuplicate),
    issuedNumber: checklistToDuplicate?.issuedNumber || '',
    entityDisplayName: checklistToDuplicate?.entityDisplayName || '',
    approvalRequired: checklistToDuplicate?.approvalRequired || true,
  });

  useEffect(() => {
    if (isShowLogbookModal && checklistToDuplicate) {
      setFormData({
        logbookTitle: checklistToDuplicate
          ? `${checklistToDuplicate?.title} (copy)`
          : '',
        documentNumber: checklistToDuplicate
          ? `${checklistToDuplicate?.documentNumber} (copy)`
          : '',
        department: checklistToDuplicate?.department || {},
        frequency: checklistToDuplicate?.frequency || '',
        frequencyInterval: checklistToDuplicate?.frequencyInterval || '',
        approvalMode: checklistToDuplicate?.approvalMode || '',
        operators: getChecklistOperatorIds(checklistToDuplicate),
        approvers: getChecklistApprovers(checklistToDuplicate),
        issuedNumber: checklistToDuplicate?.issuedNumber || '',
        entityDisplayName: checklistToDuplicate?.entityDisplayName || '',
        approvalRequired: checklistToDuplicate?.approvalRequired || true,
      });
    }
  }, [isShowLogbookModal, checklistToDuplicate]);

  const [departmentSearchInput, setDepartmentSearchInput] = useState('');
  const [departmentSearch, setDepartmentSearch] = useState('');
  const [userSearchInput, setUserSearchInput] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userOtherSearch, setUserOtherSearch] = useState('');
  const [isDuplicatingChecklist, setIsDuplicatingChecklist] = useState(false);

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

  const { mutateAsync, isPending: isLoading } = useCreateChecklists();

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

  const approverRole = rolesData?.find((role) => role.roleName === 'approval');
  const operatorRole = rolesData?.find((role) => role.roleName === 'operator');
  const adminRole = rolesData?.find((role) => role.roleName === 'admin');
 const coporateAdminRole = rolesData?.find((role) => role.role === 'corporateAdmin');
  
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
    { search: userOtherSearch, roleId: approverRole?.roleId },
    { enabled: isShowLogbookModal && Boolean(approverRole?.roleId) },
  );

  const allOtherUsers =
    usersOtherData?.pages.flatMap((p) => p.data.users) ?? [];

  const usersOtherList = allOtherUsers
    .filter((user) => user.roleId === approverRole?.roleId)
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
    const { id, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const navigateToEntries = (checklist) => {
    const checklistId = checklist?.checklistId;
    const checklistTitle = checklist?.title || 'Entries';

    navigate(
      `/admin/entries/${checklistId}/${encodeURIComponent(checklistTitle)}`,
    );
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
      issuedNumber,
      entityDisplayName,
      approvalRequired,
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

    if (frequency === 'hourly' && !frequencyInterval) {
      showError('Please enter a frequency interval');
      return;
    }

    if (frequency === 'hourly' && frequencyInterval) {
      if (frequencyInterval < 1) {
        showError('Frequency interval cannot be less than 1');
        return;
      }
      if (frequencyInterval > 24) {
        showError('Frequency interval cannot be greater than 24');
        return;
      }
    }

    const payload = approvalRequired
      ? {
          title: logbookTitle,
          documentNumber,
          departmentId: department.departmentId,
          frequency,
          ...(frequency === 'hourly' ? { frequencyInterval } : {}),
          approvalMode,
          approvers,
          operators,
          issuedNumber,
          entityDisplayName,
          approvalRequired,
        }
      : {
          title: logbookTitle,
          documentNumber,
          departmentId: department.departmentId,
          frequency,
          ...(frequency === 'hourly' ? { frequencyInterval } : {}),
          operators,
          issuedNumber,
          entityDisplayName,
          approvalRequired,
        };

    try {
      if (checklistToDuplicate) {
        setIsDuplicatingChecklist(true);

        const response = await fetchChecklistsEntries(
          checklistToDuplicate.checklistId,
        );
        const entries = response?.data?.entries ?? [];
        const duplicatedEntries = entries.map(cleanCopiedEntry);

        const createdChecklist = await mutateAsync(payload);
        const newChecklist = createdChecklist?.data?.checklist;

        await createChecklistEntries(newChecklist?.checklistId, {
          entries: duplicatedEntries,
        });

        showSuccess('Checklist duplicated successfully');
        handleCancel();
        navigateToEntries(newChecklist);
        return;
      }

      const createdChecklist = await mutateAsync(payload);
      const newChecklist = createdChecklist?.data?.checklist;

      showSuccess('Checklist created successfully');
      handleCancel();
      navigateToEntries(newChecklist);
    } catch (err) {
      console.log(err?.response?.data || err);
      showError(
        err?.response?.data?.message ||
          `Unable to ${checklistToDuplicate ? 'duplicate' : 'create'} logbook. Please try again.`,
      );
    } finally {
      setIsDuplicatingChecklist(false);
    }
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
      issuedNumber: '',
      entityDisplayName: '',
      approvalRequired: false,
    });
    setDepartmentSearchInput('');
    setDepartmentSearch('');
    setUserSearchInput('');
    setUserSearch('');
    setUserOtherSearch('');
    setChecklistToDuplicate(null);
    setIsShowLogbookModal(false);
  };

  return (
    <Modal
      isOpen={isShowLogbookModal}
      onClose={() => handleCancel()}
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
            label="Does this checklist require approval?"
            id="approvalRequired"
            required
            className="mb-1"
            value={formData.approvalRequired}
            onChange={handleInputChange}
            type="checkbox"
            className="flex! w-full gap-4 items-center justify-between"
            inputClassName="!w-4 !h-4 mt-4 cursor-pointer"
          />

          {formData.approvalRequired && (
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
          )}

          {formData.approvalRequired && (
            <div className="flex items-center gap-1">
              <InputField
                label="Approvers"
                id="approvers"
                className="mb-1"
                placeholder="Select approvers"
                value={formData.approvers.map((o) => o.approverId)}
                multiple
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
          )}

          <div className="flex items-center gap-1">
            <InputField
              label="Operators"
              id="operators"
              className="mb-1"
              placeholder="Select operators"
              value={formData.operators}
              multiple
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

          <InputField
            label="Issued number"
            id="issuedNumber"
            className="mb-1"
            value={formData.issuedNumber}
            onChange={handleInputChange}
          />

          <InputField
            label="Entity display name"
            id="entityDisplayName"
            className="mb-1"
            value={formData.entityDisplayName}
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
            disabled={isLoading || isDuplicatingChecklist}
          >
            Continue
            {(isLoading || isDuplicatingChecklist) && (
              <Loader size="border-white! h-4.5 w-4.5" />
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
