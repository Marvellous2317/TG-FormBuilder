import React, { useEffect, useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { useDepartmentsInfinite } from '../../../../shared/hooks/superadmin/useDepartments';
import Loader from '../../../../shared/components/Loader';
import useToast from '../../../../shared/hooks/useToast';
import {
  useCreateChecklists,
  useUpdateChecklist,
} from '../../../../shared/hooks/admin/useChecklist';

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

export default function EditLogbookModal({
  isEditChecklistModalOpen,
  setIsEditChecklistModalOpen,
  checklistToEdit,
  setChecklistToEdit,
}) {
  const [formData, setFormData] = useState({
    logbookTitle: checklistToEdit?.title ?? '',
    documentNumber: checklistToEdit?.documentNumber ?? '',
    department: checklistToEdit?.department
      ? {
          departmentId: checklistToEdit?.department?.departmentId,
          departmentName: checklistToEdit?.department?.departmentName,
        }
      : {},
    frequency: checklistToEdit?.frequency || '',
    frequencyInterval: checklistToEdit?.frequencyInterval || '',
  });

  const [departmentSearchInput, setDepartmentSearchInput] = useState('');
  const [departmentSearch, setDepartmentSearch] = useState('');

  const { showError, showSuccess } = useToast();

  useEffect(() => {
    if (isEditChecklistModalOpen && checklistToEdit) {
      setFormData({
        logbookTitle: checklistToEdit.title || '',
        documentNumber: checklistToEdit.documentNumber || '',
        department: checklistToEdit.department || {},
        frequency: checklistToEdit.frequency || '',
        frequencyInterval: checklistToEdit.frequencyInterval || '',
      });
    }
  }, [isEditChecklistModalOpen, checklistToEdit]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDepartmentSearch(departmentSearchInput),
      500,
    );
    return () => clearTimeout(timer);
  }, [departmentSearchInput]);

  const { mutateAsync, isPending: isLoading } = useUpdateChecklist();

  const {
    data: departmentsData,
    isPending: isLoadingDepartments,
    fetchNextPage: fetchNextDepartmentsPage,
    hasNextPage: hasNextDepartmentsPage,
    isFetchingNextPage: isFetchingNextDepartmentsPage,
  } = useDepartmentsInfinite(
    { search: departmentSearch },
    { enabled: isEditChecklistModalOpen },
  );

  const allDepartments =
    departmentsData?.pages.flatMap((p) => p.data.departments) ?? [];

  const departmentsList = allDepartments.map((department) => ({
    ...department,
    label: department.departmentName,
    value: department.departmentId,
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
      await mutateAsync({
        checklistId: checklistToEdit.checklistId,
        payload: {
          title: logbookTitle,
          documentNumber,
          departmentId: department.departmentId,
          frequency,
          frequencyInterval,
        },
      });
      showSuccess('Checklist updated successfully');
      handleCancel();
    } catch (err) {
      console.log(err.response.data);
      showError(
        err.response.data.message ??
          'Unable to update logbook. Please try again.',
      );
    }
  };

  const handleCancel = () => {
    console.log(isEditChecklistModalOpen);
    setFormData({
      logbookTitle: '',
      documentNumber: '',
      department: {},
      frequency: '',
      frequencyInterval: '',
    });
    setIsEditChecklistModalOpen(false);
    setChecklistToEdit(null);
    setDepartmentSearchInput('');
    setDepartmentSearch('');
  };

  return (
    <Modal
      isOpen={isEditChecklistModalOpen}
      onClose={() => setIsEditChecklistModalOpen(false)}
      position="center"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Edit Logbook
          </p>
          <p className="text-sm font-geist text-tertiary">
            Update logbook details
          </p>
        </div>

        <div className="flex-1 gap-3 flex flex-col mt-7">
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

          <div className="flex items-center">
            <InputField
              label="Department"
              id="department"
              className="mb-1"
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
            label="Frequency"
            id="frequency"
            className=""
            value={formData.frequency}
            required
            options={frequencyList}
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
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
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
            Update
            {isLoading && <Loader size="border-white! h-4.5 w-4.5" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
