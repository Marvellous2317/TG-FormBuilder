import React, { useState } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import {
  useCreateOperatorChecklistEntries,
  useOperatorChecklist,
} from '../../shared/hooks/operator/useOperatorChecklists';
import { FaArrowLeft } from 'react-icons/fa';
import BasicForm from '../../shared/components/entries/BasicForm';
import Button from '../../shared/components/Button';
import useToast from '../../shared/hooks/useToast';
import Loader from '../../shared/components/Loader';

export default function CreateOperatorEntry() {
  let { id: checklistId } = useLoaderData();

  const { mutateAsync: submitEntries, isPending: isSubmittingEntries } =
    useCreateOperatorChecklistEntries(checklistId);

  const navigate = useNavigate();

  const { showError, showSuccess } = useToast();

  const [formData, setFormData] = useState({});

  // When submitting, you can convert formData object to an array if needed:
  const handleSubmit = async () => {
    const formDataArray = Object.values(formData);

    try {
      await submitEntries({ payload: { data: formDataArray } });
      showSuccess('Entries submitted successfully');
      setFormData({});
      navigate('/operator/');
    } catch (err) {
      console.log(err);
      showError('Something went wrong');
    }
  };

  const { data, isPending: isLoadingChecklistEntries } =
    useOperatorChecklist(checklistId);

  const entriesData = data?.data?.assignment?.checklist?.entries;

  return (
    <div className="flex min-h-screen w-full flex-col bg-white py-6">
      <Link
        prefetch="intent"
        className="flex w-full cursor-pointer items-center gap-2 transition-all duration-150 ease-in-out group sm:w-1/3 px-25"
        to="/operator/"
      >
        <FaArrowLeft
          className="text-primary-200 group-hover:-translate-x-0.5"
          size={16}
        />
        <p className="text-sm font-medium text-primary-200">
          Back to dashboard
        </p>
      </Link>

      {entriesData?.length < 1 ? (
        <div className="flex items-center justify-center h-full mt-20 px-25">
          <p className="text-sm font-semibold text-primary font-geist">
            No entries available
          </p>
        </div>
      ) : (
        <div className="h-full mt-5 flex-1 px-25">
          {entriesData
            ?.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
            .map((entry) => {
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
                    />
                  )}
                </div>
              );
            })}
        </div>
      )}

      <div className="border-t border-secondary-200 pt-6 px-25">
        <Button
          className="bg-primary-200 py-2.5 px-5 rounded-2xl text-base font-semibold text-white flex gap-2"
          onClick={() => handleSubmit()}
          disabled={isLoadingChecklistEntries}
        >
          Submit
          {isSubmittingEntries && <Loader size="h-4.5 w-4.5 border-white!" />}
        </Button>
      </div>
    </div>
  );
}
