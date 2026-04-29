import React, { useState } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import BasicForm from '../../shared/components/entries/BasicForm';
import { FaArrowLeft } from 'react-icons/fa';
import Loader from '../../shared/components/Loader';
import EnumForm from '../../shared/components/entries/EnumForm';
import DropdownForm from '../../shared/components/entries/DropdownForm';
import SectionForm from '../../shared/components/entries/SectionForm';
import {
  useApproverApproveChecklistEntries,
  useApproverChecklist,
  useApproverRejectChecklistEntries,
} from '../../shared/hooks/approver/useApprover';
import Button from '../../shared/components/Button';
import ApproverConfirmationModal from './components/ApproverConfirmationModal';
import useToast from '../../shared/hooks/useToast';

export default function ViewApproverEntries() {
  let { id: checklistId, back: previousLocation } = useLoaderData();

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const [action, setAction] = useState('');

  const { data, isPending: isLoadingChecklistEntries } =
    useApproverChecklist(checklistId);

  const [formData, setFormData] = useState({});

  const entriesData = data?.data?.submission?.entries;

  const operator = data?.data?.submission?.assignment?.operator;

  const navigate = useNavigate();

  const { showError, showSuccess } = useToast();

  const { mutateAsync: approveEntries, isPending: isApprovingEntries } =
    useApproverApproveChecklistEntries(checklistId);

  const { mutateAsync: rejectEntries, isPending: isRejectingEntries } =
    useApproverRejectChecklistEntries(checklistId);

  const handleReject = async () => {
    try {
      await rejectEntries();
      showSuccess('Checklist rejected successfully');
      navigate('/approver/');
    } catch (err) {
      console.log(err);
      showError('Something went wrong');
    }
  };

  const handleApprove = async () => {
    const formDataArray = Object.values(formData);

    try {
      await approveEntries({ data: formDataArray });
      showSuccess('Checklist approved successfully');
      navigate('/approver/');
    } catch (err) {
      console.log(err);
      showError('Something went wrong');
    }
  };

  return (
    <div
      className={`flex ${entriesData?.length > 0 ? 'min-h-screen' : ''} w-full flex-col bg-white py-6`}
    >
      <Link
        prefetch="intent"
        className="flex w-fit cursor-pointer items-center gap-2 transition-all duration-150 ease-in-out group px-4 md:px-10 lg:px-25"
        to={
          previousLocation && previousLocation !== 'pending'
            ? `/approver/${previousLocation}`
            : '/approver'
        }
      >
        <FaArrowLeft
          className="text-primary-200 group-hover:-translate-x-0.5"
          size={16}
        />
        <p className="text-sm font-medium text-primary-200">
          {previousLocation && previousLocation !== 'pending'
            ? `Back to ${previousLocation}`
            : 'Back to dashboard'}
        </p>
      </Link>

      {isLoadingChecklistEntries ? (
        <Loader size="h-12 w-12 !border-primary-200 mt-20" />
      ) : entriesData?.length < 1 ? (
        <div className="flex justify-center mt-20 px-4 md:px-10 lg:px-25">
          <p className="text-sm font-semibold text-primary font-geist">
            No entries available
          </p>
        </div>
      ) : (
        <div className="h-full mt-5 flex-1 px-4 md:px-10 lg:px-25">
          {/* ?.sort((a, b) => (a.order ?? 999) - (b.order ?? 999)) */}
          {entriesData.reverse().map((entry) => {
            const entryKey = entry.id || entry.entryId || entry.name;
            return (
              <div key={entryKey} className="space-y-5">
                {(entry.type === 'text' ||
                  entry.type === 'date' ||
                  entry.type === 'time' ||
                  entry.type === 'number') && (
                  <BasicForm
                    entry={entry}
                    formData={formData}
                    setFormData={setFormData}
                    readOnly={previousLocation === 'pending' ? false : true}
                  />
                )}
                {entry.type === 'enum' && (
                  <EnumForm
                    entry={entry}
                    formData={formData}
                    setFormData={setFormData}
                    readOnly={previousLocation === 'pending' ? false : true}
                  />
                )}
                {entry.type === 'dropdown' && (
                  <DropdownForm
                    entry={entry}
                    formData={formData}
                    setFormData={setFormData}
                    readOnly={previousLocation === 'pending' ? false : true}
                  />
                )}
                {entry.type === 'section' && (
                  <SectionForm
                    entry={entry}
                    formData={formData}
                    setFormData={setFormData}
                    readOnly={previousLocation === 'pending' ? false : true}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isLoadingChecklistEntries && (
        <div className="border border-secondary-200 mt-6 py-3 px-4 md:px-10 lg:px-25 flex items-center w-full">
          <h2 className="w-1/2 text-primary text-sm font-medium">
            Submitted by
          </h2>
          <div className="flex w-1/2 flex-col items-start gap-1">
            <h2 className="text-primary text-sm font-medium">
              {operator?.firstName} {operator?.lastName}
            </h2>
            <p className="text-tertiary text-xs">Operator</p>
          </div>
        </div>
      )}

      {!isLoadingChecklistEntries && previousLocation === 'pending' && (
        <div className="border-t border-secondary-200 mt-6 pt-6 px-4 md:px-10 lg:px-25 flex items-center gap-3">
          <Button
            className="bg-tertiary-200 py-2.5 px-5 rounded-2xl text-base font-semibold text-secondary flex gap-2 w-full sm:w-auto justify-center sm:justify-start"
            onClick={() => {
              setIsConfirmationModalOpen(true);
              setAction('reject');
            }}
            disabled={isRejectingEntries || isLoadingChecklistEntries}
          >
            Reject
            {isRejectingEntries && <Loader size="h-4.5 w-4.5 border-white!" />}
          </Button>

          <Button
            className="bg-primary-200 py-2.5 px-5 rounded-2xl text-base font-semibold text-white flex gap-2 w-full sm:w-auto justify-center sm:justify-start"
            onClick={() => {
              setIsConfirmationModalOpen(true);
              setAction('approve');
            }}
            disabled={isApprovingEntries || isLoadingChecklistEntries}
          >
            Approve
            {isApprovingEntries && <Loader size="h-4.5 w-4.5 border-white!" />}
          </Button>
        </div>
      )}

      <ApproverConfirmationModal
        isConfirmationModalOpen={isConfirmationModalOpen}
        setIsConfirmationModalOpen={setIsConfirmationModalOpen}
        handleUpdate={handleApprove}
        isUpdating={isApprovingEntries}
        handleReject={handleReject}
        isRejecting={isRejectingEntries}
        action={action}
      />
    </div>
  );
}
