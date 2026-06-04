import React, { useState } from 'react';
import {
  useLoaderData,
  useNavigate,
  Link,
  useSearchParams,
} from 'react-router-dom';
import { evaluateFormula } from '../../../shared/utils/formula';
import {
  useChecklistsSubmission,
  useUpdateChecklistsSubmissions,
} from '../../../shared/hooks/admin/useChecklist';
import { FaArrowLeft } from 'react-icons/fa';
import BasicForm from '../../../shared/components/entries/BasicForm';
import EnumForm from '../../../shared/components/entries/EnumForm';
import DropdownForm from '../../../shared/components/entries/DropdownForm';
import SectionForm from '../../../shared/components/entries/SectionForm';
import Button from '../../../shared/components/Button';
import Loader from '../../../shared/components/Loader';
import useToast from '../../../shared/hooks/useToast';

export default function ViewAdminEntries() {
  let {
    id: checklistId,
    back: previousLocation,
    submissionId,
  } = useLoaderData();

  const [searchParams] = useSearchParams();
  const checklistTitle = searchParams.get('title');

  const { showSuccess } = useToast();

  const { data, isPending } = useChecklistsSubmission(
    checklistId,
    submissionId,
  );

  const { mutateAsync: updateEntries, isPending: isUpdatingEntries } =
    useUpdateChecklistsSubmissions();

  const [formData, setFormData] = useState({});

  const entriesData = data?.data?.submission?.entries;

  const operator = data?.data?.submission?.assignment?.operator;

  const approver = data?.data?.submission?.approver;

  const navigate = useNavigate();

  const computeFormulaValue = (entry) => {
    const expression = entry.config?.expression;
    if (!expression) return '';
    const scope = {};
    entriesData?.forEach((e) => {
      if (e.type === 'number' && e.config?.fieldRef) {
        const rawValue =
          formData[e.entryId]?.value ?? e.value ?? e?.config?.defaultValue;

        scope[e.config.fieldRef] =
          rawValue === '' || rawValue == null ? 0 : Number(rawValue);
      }
    });
    const { value, error } = evaluateFormula(expression, scope);
    if (error || (typeof value === 'number' && !isFinite(value))) {
      console.log(error);
      return 0;
    }

    return value ?? 0;
  };

  const handleUpdate = async () => {
    const formDataArray = (entriesData ?? [])
      .filter((entry) => entry.entryId)
      .map((entry) => ({
        entryId: entry.entryId,
        value: formData[entry.entryId]?.value ?? entry.value ?? '',
      }));

    try {
      await updateEntries({
        checklistId,
        submissionId,
        payload: { data: formDataArray },
      });
      showSuccess('Checklist updated successfully');
      navigate(`/admin/entries/${checklistId}/submissions/`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className={`flex ${entriesData?.length > 0 ? 'min-h-screen' : ''} w-full flex-col overflow-y-auto bg-white py-6`}
    >
      <div className="flex items-center w-full px-4 pb-2.5 border-b border-secondary-200">
        <Link
          prefetch="intent"
          className="flex w-1/3 cursor-pointer items-center gap-2 transition-all duration-150 ease-in-out group "
          to={`/admin/entries/${checklistId}/submissions/`}
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

        <h1 className="flex items-center justify-start md:justify-center w-1/3 text-base mt-4 md:mt-0 lg:text-lg font-semibold text-primary font-geist">
          {checklistTitle}
        </h1>
      </div>

      {isPending ? (
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

      {!isPending && (
        <div className="border border-secondary-200 mt-6 py-3 px-4 md:px-10 lg:px-25 flex items-center w-full">
          <h2 className="w-1/2 text-primary text-sm font-medium">
            Approved by
          </h2>
          <div className="flex w-1/2 flex-col items-start gap-1">
            <h2 className="text-primary text-sm font-medium">
              {approver?.firstName} {approver?.lastName}
            </h2>
            <p className="text-tertiary text-xs">Approver</p>
          </div>
        </div>
      )}

      {!isPending && (
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

      {!isPending && (
        <div className="border-t border-secondary-200 mt-6 pt-6 px-4 md:px-10 lg:px-25 flex items-center gap-3">
          <Button
            className="bg-primary-200 py-2.5 px-5 rounded-2xl text-base font-semibold text-white flex gap-2 w-full sm:w-auto justify-center sm:justify-start"
            onClick={() => handleUpdate()}
            disabled={isUpdatingEntries || isPending}
          >
            Update
            {isUpdatingEntries && <Loader size="h-4.5 w-4.5 border-white!" />}
          </Button>
        </div>
      )}
    </div>
  );
}
