import React, { useState } from 'react';
import {
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  useOperatorSubmittedChecklist,
  useUpdateOperatorChecklistEntries,
} from '../../shared/hooks/operator/useOperatorChecklists';
import BasicForm from '../../shared/components/entries/BasicForm';
import { FaArrowLeft } from 'react-icons/fa';
import Loader from '../../shared/components/Loader';
import EnumForm from '../../shared/components/entries/EnumForm';
import DropdownForm from '../../shared/components/entries/DropdownForm';
import SectionForm from '../../shared/components/entries/SectionForm';
import useToast from '../../shared/hooks/useToast';
import Button from '../../shared/components/Button';
import { evaluateFormula } from '../../shared/utils/formula';

export default function ViewOperatorEntries() {
  let { id: checklistId, back: previousLocation } = useLoaderData();

  const [searchParams] = useSearchParams();
  const title = searchParams.get('title');

  const { data, isPending: isLoadingChecklistEntries } =
    useOperatorSubmittedChecklist(checklistId);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({});

  const { showError, showSuccess } = useToast();

  const entriesData = data?.data?.submission?.entries;

  const approver = data?.data?.submission?.approver;

  const submittedId = data?.data?.submission?.submittedChecklistId;

  const { mutateAsync: updateEntries, isPending: isUpdatingEntries } =
    useUpdateOperatorChecklistEntries(submittedId);

  const handleUpdate = async () => {
    const formDataArray = Object.values(formData);

    try {
      await updateEntries({ payload: { data: formDataArray } });
      showSuccess('Entries updated successfully');
      setFormData({});
      navigate('/operator/');
    } catch (err) {
      console.log(err);
      showError('Something went wrong');
    }
  };

  const computeFormulaValue = (entry) => {
    const expression = entry.config?.expression;
    if (!expression) return '';
    const scope = {};
    entriesData?.forEach((e) => {
      if (e.type === 'number' && e.config?.fieldRef) {
        const rawValue = formData[e.entryId]?.value ?? e.value;

        scope[e.config.fieldRef] =
          rawValue === '' || rawValue == null ? 0 : Number(rawValue);
      }
    });
    const { value, error } = evaluateFormula(expression, scope);
    if (error || (typeof value === 'number' && !isFinite(value))) {
      return 'Invalid formula';
    }

    return value ?? '';
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Sticky header */}
      <div className="shrink-0 bg-white py-4 px-4 md:px-10 lg:px-25 border-b border-secondary-200 grid md:grid-cols-3 items-center">
        <Link
          prefetch="intent"
          className="flex w-fit cursor-pointer items-center gap-2 transition-all duration-150 ease-in-out group"
          to={previousLocation ? `/operator/${previousLocation}` : '/operator'}
        >
          <FaArrowLeft
            className="text-primary-200 group-hover:-translate-x-0.5"
            size={16}
          />
          <p className="text-sm font-medium text-primary-200">
            {previousLocation
              ? `Back to ${previousLocation}`
              : 'Back to dashboard'}
          </p>
        </Link>

        <h1 className="flex items-center justify-start md:justify-center w-full text-base mt-4 md:mt-0 lg:text-lg font-semibold text-primary font-geist">
          {title}
        </h1>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 md:px-10 lg:px-25">
        {isLoadingChecklistEntries ? (
          <Loader size="h-12 w-12 !border-primary-200 mt-20" />
        ) : entriesData?.length < 1 ? (
          <div className="flex justify-center mt-20">
            <p className="text-sm font-semibold text-primary font-geist">
              No entries available
            </p>
          </div>
        ) : (
          <div className="mt-5">
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
                    {entry.type === 'formular' && (
                      <BasicForm
                        entry={{
                          ...entry,
                          type: 'number',
                          value: computeFormulaValue(entry),
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
      </div>

      {previousLocation !== 'pending' && (
        <div className="shrink-0 border-t border-secondary-200 flex items-center w-full bg-white py-4 px-4 md:px-10 lg:px-25">
          <h2 className="w-1/2 text-primary text-sm font-medium">Checked by</h2>
          <div className="flex w-1/2 flex-col items-start gap-1">
            <h2 className="text-primary text-sm font-medium">
              {approver?.firstName} {approver?.lastName}
            </h2>
            <p className="text-tertiary text-xs">Approver</p>
          </div>
        </div>
      )}

      {/* Sticky footer */}
      {!isLoadingChecklistEntries && previousLocation === 'pending' && (
        <div className="shrink-0 border-t border-secondary-200 bg-white py-4 px-4 md:px-10 lg:px-25">
          <Button
            className="bg-primary-200 py-2.5 px-5 rounded-2xl text-sm lg:text-base font-semibold text-white flex gap-2 w-full sm:w-auto justify-center sm:justify-start"
            onClick={() => handleUpdate()}
            disabled={isLoadingChecklistEntries || isUpdatingEntries}
          >
            Update
            {isUpdatingEntries && <Loader size="h-4.5 w-4.5 border-white!" />}
          </Button>
        </div>
      )}
    </div>
  );
}
