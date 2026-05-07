import React, { useState } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import {
  useCreateOperatorChecklistEntries,
  useOperatorChecklist,
} from '../../shared/hooks/operator/useOperatorChecklists';
import { FaArrowLeft } from 'react-icons/fa';
import BasicForm from '../../shared/components/entries/BasicForm';
import EnumForm from '../../shared/components/entries/EnumForm';
import Button from '../../shared/components/Button';
import useToast from '../../shared/hooks/useToast';
import Loader from '../../shared/components/Loader';
import DropdownForm from '../../shared/components/entries/DropdownForm';
import SectionForm from '../../shared/components/entries/SectionForm';
import { queueSubmission } from '../../lib/offlineQueue';
import { evaluateFormula } from '../../shared/utils/formula';

export default function CreateOperatorEntry() {
  let { id: checklistId } = useLoaderData();

  const { mutateAsync: submitEntries, isPending: isSubmittingEntries } =
    useCreateOperatorChecklistEntries(checklistId);

  const navigate = useNavigate();

  const { showError, showSuccess } = useToast();

  const [formData, setFormData] = useState({});

  // When submitting, you can convert formData object to an array if needed:
  const handleSubmit = async () => {
    const enrichedFormData = { ...formData };
    entriesData
      ?.filter((e) => e.type === 'formular')
      .forEach((entry) => {
        enrichedFormData[entry.entryId] = {
          entryId: entry.entryId,
          value: String(computeFormulaValue(entry)),
        };
      });

    const formDataArray = Object.values(enrichedFormData);

    if (!navigator.onLine) {
      await queueSubmission({ data: formDataArray });
      showSuccess('Saved offline — will sync when reconnected');
      return;
    }

    try {
      await submitEntries({ payload: { data: formDataArray } });
      showSuccess('Entries submitted successfully');
      setFormData({});
      navigate('/operator/');
    } catch (err) {
      console.log(err);
      showError('Something went wrong');
      await queueSubmission({ data: formDataArray });
      showSuccess('Saved offline — will sync when reconnected');
    }
  };

  const { data, isPending: isLoadingChecklistEntries } =
    useOperatorChecklist(checklistId);

  const entriesData = data?.data?.assignment?.checklist?.entries;

  const computeFormulaValue = (entry) => {
    const expression = entry.config?.expression;
    if (!expression) return '';
    const scope = {};
    entriesData?.forEach((e) => {
      if (e.type === 'number' && e.config?.fieldRef) {
        scope[e.config.fieldRef] = formData[e.entryId]?.value ?? e.value ?? '';
      }
    });
    const { value, error } = evaluateFormula(expression, scope);
    return error ? 'Invalid formula' : (value ?? '');
  };

  console.log(entriesData);

  return (
    <div
      className={`flex ${entriesData?.length > 0 ? 'min-h-screen' : ''} w-full flex-col bg-white py-6`}
    >
      <Link
        prefetch="intent"
        className="flex w-fit cursor-pointer items-center gap-2 transition-all duration-150 ease-in-out group px-4 md:px-10 lg:px-25"
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
          {entriesData
            ?.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
            .map((entry) => {
              const entryKey = entry.id || entry.entryId || entry.name;
              return (
                <div key={entryKey} className="space-y-5 space-x-2">
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
                  {entry.type === 'enum' && (
                    <EnumForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                    />
                  )}
                  {entry.type === 'dropdown' && (
                    <DropdownForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                    />
                  )}
                  {entry.type === 'section' && (
                    <SectionForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                    />
                  )}
                  {entry.type === 'formular' && (
                    <BasicForm
                      entry={{
                        ...entry,
                        type: 'number',
                        value: (() => {
                          const anyNumberFieldEdited = entriesData?.some(
                            (e) => e.type === 'number' && formData[e.entryId] !== undefined,
                          );
                          return anyNumberFieldEdited || entry.value == null || entry.value === ''
                            ? computeFormulaValue(entry)
                            : entry.value;
                        })(),
                      }}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly
                    />
                  )}
                </div>
              );
            })}
        </div>
      )}

      {entriesData?.length > 0 && (
        <div className="border-t border-secondary-200 mt-6 pt-6 px-4 md:px-10 lg:px-25">
          <Button
            className="bg-primary-200 py-2.5 px-5 rounded-2xl text-base font-semibold text-white flex gap-2 w-full sm:w-auto justify-center sm:justify-start"
            onClick={() => handleSubmit()}
            disabled={isLoadingChecklistEntries}
          >
            Submit
            {isSubmittingEntries && <Loader size="h-4.5 w-4.5 border-white!" />}
          </Button>
        </div>
      )}
    </div>
  );
}
