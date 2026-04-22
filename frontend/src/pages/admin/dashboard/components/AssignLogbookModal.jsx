import React, { useEffect, useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import Loader from '../../../../shared/components/Loader';
import useToast from '../../../../shared/hooks/useToast';
import {
  useAssignChecklistOperator,
  useUnassignChecklistOperator,
} from '../../../../shared/hooks/admin/useChecklist';
import { useFetchUsersInfinite } from '../../../../shared/hooks/superadmin/useSuperAdminUser';
import { IoClose } from 'react-icons/io5';

export default function AssignLogbookModal({
  isShowAssignLogbookModal,
  setIsShowAssignLogbookModal,
  checklistId,
  checklistAssignments,
  action,
}) {
  const [formData, setFormData] = useState({
    operator: '',
  });

  const [userSearchInput, setUserSearchInput] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [assignedUsers, setAssignedUsers] = useState([]);

  const { showError, showSuccess } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setUserSearch(userSearchInput), 500);
    return () => clearTimeout(timer);
  }, [userSearchInput]);

  const { mutateAsync, isPending: isLoading } = useAssignChecklistOperator();
  const { mutateAsync: unassignChecklist, isPending: isUnassigning } =
    useUnassignChecklistOperator();

  const {
    data: usersData,
    isPending: isLoadingUsers,
    fetchNextPage: fetchNextUsersPage,
    hasNextPage: hasNextUsersPage,
    isFetchingNextPage: isFetchingNextUsersPage,
  } = useFetchUsersInfinite(
    { search: userSearch },
    { enabled: isShowAssignLogbookModal },
  );

  const allUsers = usersData?.pages.flatMap((p) => p.data.users) ?? [];

  const usersList = allUsers.map((user) => ({
    ...user,
    label: `${user.firstName} ${user.lastName} - ${user?.role?.roleName || 'N/A'}`,
    value: user.userId,
  }));

  useEffect(() => {
    setAssignedUsers(checklistAssignments);
  }, [checklistAssignments]);

  const handleSetUserOperator = (userId) => {
    setFormData((prev) => ({
      ...prev,
      operator: userId,
    }));
  };

  const handleSubmit = async () => {
    const { operator } = formData;

    if (!operator) {
      showError('Enter all fields');
      return;
    }

    try {
      await mutateAsync({
        assignedTo: operator,
        checklistId,
      });

      showSuccess('Logbook assigned successfully');
      handleCancel();
    } catch (err) {
      console.log(err.response.data);
      showError(
        err.response.data.message ??
          'Unable to assign logbook. Please try again.',
      );
    }

    setFormData({
      operator: '',
    });
    setUserSearchInput('');
    setUserSearch('');
    setIsShowAssignLogbookModal(false);
  };

  const handleRemoveOperator = async (operatorId) => {
    try {
      await unassignChecklist({
        assignedTo: operatorId,
        checklistId,
      });

      showSuccess('Logbook unassigned successfully');
      setAssignedUsers((prev) =>
        prev.filter((assignment) => assignment.operator.userId !== operatorId),
      );
    } catch (err) {
      console.log(err.response.data);
      showError(
        err.response.data.message ??
          'Unable to unassign logbook. Please try again.',
      );
    }
  };

  const handleCancel = () => {
    setFormData({
      operator: '',
    });
    setUserSearchInput('');
    setUserSearch('');
    setIsShowAssignLogbookModal(false);
  };

  const toPerformAssign = action === 'assign';

  return (
    <Modal
      isOpen={isShowAssignLogbookModal}
      onClose={() => setIsShowAssignLogbookModal(false)}
      position={toPerformAssign ? 'center' : 'right'}
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            {toPerformAssign ? 'Assign' : 'Unassign'} Logbook
          </p>
          <p className="text-sm font-geist text-tertiary">
            Enter logbook details
          </p>
        </div>

        {toPerformAssign ? (
          <div className="flex-1 gap-3 flex flex-col mt-7">
            <div className="flex items-center">
              <InputField
                label="Operator"
                id="operator"
                className="mb-1"
                value={formData?.operator}
                required
                disabled={isLoadingUsers}
                options={usersList}
                type="select"
                searchable
                onExternalSearchChange={setUserSearchInput}
                onLoadMore={fetchNextUsersPage}
                hasNextPage={hasNextUsersPage}
                isFetchingNextPage={isFetchingNextUsersPage}
                onChange={(e) => handleSetUserOperator(e.target.value)}
              />
              {isLoadingUsers && <Loader size="w-4.5 h-4.5 mt-4" />}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-3 mt-7">
            {assignedUsers?.length === 0 && (
              <div className="flex justify-center items-center h-full">
                <p className="text-sm font-geist text-tertiary">
                  No operator assigned to this checklist
                </p>
              </div>
            )}
            {assignedUsers?.length > 0 &&
              assignedUsers?.map((assignment) => (
                <div
                  key={assignment?.assignmentId}
                  className="flex py-3 mb-4 px-3.5 rounded-2xl border border-secondary-200 bg-tertiary-700 items-center w-full justify-between"
                >
                  <p className="text-secondary text-sm">
                    {assignment?.operator?.firstName}{' '}
                    {assignment?.operator?.lastName}
                  </p>
                  <Button
                    type="button"
                    disabled={isUnassigning}
                    onClick={() =>
                      handleRemoveOperator(assignment?.operator?.userId)
                    }
                  >
                    {isUnassigning ? (
                      <Loader size="h-4.5 w-4.5" />
                    ) : (
                      <IoClose
                        size={14}
                        className="text-tertiary-500 cursor-pointer"
                      />
                    )}
                  </Button>
                </div>
              ))}
          </div>
        )}

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => handleCancel()}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          {toPerformAssign && (
            <Button
              type="button"
              className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white flex gap-2"
              onClick={() => handleSubmit()}
              disabled={isLoading}
            >
              Continue
              {isLoading && <Loader size="border-white! h-4.5 w-4.5" />}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
