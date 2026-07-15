import React, { useState, useEffect } from 'react';
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
} from 'react-router-dom';
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
import {
  evaluateFormula,
  formatComputedValue,
} from '../../shared/utils/formula';
import {
  saveToCache,
  getFromCache,
  saveDraft,
  getDraft,
  clearDraft,
} from '../../lib/offlineCache';

export default function CreateOperatorEntry() {
  let { id: checklistId } = useLoaderData();

  const { state } = useLocation();
  const checklistTitle = state?.title || '';

  const { mutateAsync: submitEntries, isPending: isSubmittingEntries } =
    useCreateOperatorChecklistEntries(checklistId);

  const navigate = useNavigate();

  const { showError, showSuccess } = useToast();

  const [formData, setFormData] = useState({});
  const [cachedChecklist, setCachedChecklist] = useState(null);

  // Load cached checklist entries and any saved draft on mount
  useEffect(() => {
    getFromCache(`checklist-${checklistId}`).then(setCachedChecklist);
    getDraft(checklistId).then((draft) => {
      if (draft) setFormData(draft);
    });
  }, [checklistId]);

  // Auto-save draft whenever formData changes (debounced 500ms)
  useEffect(() => {
    if (Object.keys(formData).length === 0) return;
    const timer = setTimeout(() => saveDraft(checklistId, formData), 1000);
    return () => clearTimeout(timer);
  }, [formData, checklistId]);

  // When submitting, you can convert formData object to an array if needed:
  const handleSubmit = async () => {
    const enrichedFormData = { ...formData };
    entriesData
      ?.filter((e) => e.type === 'formular' || e.type === 'section_formular')
      .forEach((entry) => {
        enrichedFormData[entry.entryId] = {
          entryId: entry.entryId,
          value: String(
            formatComputedValue(
              entry.type === 'section_formular'
                ? computeSectionFormulaValue(entry)
                : computeFormulaValue(entry),
            ),
          ),
        };
      });

    const formDataArray = Object.values(enrichedFormData);

    if (!navigator.onLine) {
      await queueSubmission({ checklistId, payload: { data: formDataArray } });
      showSuccess('Saved offline — will sync when reconnected');
      return;
    }

    try {
      await submitEntries({ payload: { data: formDataArray } });
      showSuccess('Entries submitted successfully');
      await clearDraft(checklistId);
      setFormData({});
      navigate('/operator/');
    } catch (err) {
      console.log(err);
      const isNetworkError = !err.response;
      if (isNetworkError) {
        await queueSubmission({
          checklistId,
          payload: { data: formDataArray },
        });
        showSuccess('Saved offline — will sync when reconnected');
      } else {
        // showError('Something went wrong');
      }
    }
  };

  const { data, isPending: isLoadingChecklistEntries } = useOperatorChecklist(
    checklistId,
    {
      placeholderData: cachedChecklist,
    },
  );

  useEffect(() => {
    if (data) saveToCache(`checklist-${checklistId}`, data);
  }, [data, checklistId]);

  const entriesData =
    data?.data?.assignment?.checklist?.entries ??
    cachedChecklist?.data?.assignment?.checklist?.entries;

  const computeSectionFormulaValue = (entry) => {
    const {
      section: sectionName,
      field: fieldName,
      operation,
    } = entry.config?.items || {};
    if (!sectionName || !fieldName || !operation) return 0;

    const sectionEntry = entriesData?.find(
      (e) => e.type === 'section' && e.name === sectionName,
    );
    if (!sectionEntry) return 0;

    const sectionEntryId =
      sectionEntry.entryId || sectionEntry.id || sectionEntry.name;
    const rawValue = formData[sectionEntryId]?.value ?? sectionEntry?.value;
    const rowsData = JSON.parse(rawValue || '[]');
    if (!rowsData.length) return 0;

    const targetField = (sectionEntry.config?.items || []).find(
      (f) => f.name === fieldName,
    );
    if (!targetField) return 0;

    const targetFieldId = targetField.entryId || targetField.id;
    const sectionSubFields = sectionEntry.config?.items || [];

    const resolveRowValue = (row) => {
      const stored = row[targetFieldId]?.value;
      if (stored !== undefined && stored !== null && stored !== '') {
        const num = Number(stored);
        return isNaN(num) ? null : num;
      }

      if (targetField.type === 'formular') {
        const expression = targetField.config?.expression;
        if (!expression) return null;
        const scope = {};
        sectionSubFields.forEach((e) => {
          if (!e.config?.fieldRef) return;
          const fieldId = e.entryId || e.id;
          const rawVal =
            row[fieldId]?.value ?? e.value ?? e?.config?.defaultValue;
          if (rawVal === '' || rawVal == null) {
            scope[e.config.fieldRef] = 0;
          } else {
            const n = Number(rawVal);
            scope[e.config.fieldRef] = isNaN(n) ? String(rawVal) : n;
          }
        });
        const { value: fVal, error } = evaluateFormula(expression, scope);
        if (error || fVal == null) return null;
        const num = Number(fVal);
        return isNaN(num) ? null : num;
      }

      return null;
    };

    const values = rowsData.map(resolveRowValue).filter((v) => v !== null);

    if (!values.length) return 0;

    switch (operation.toLowerCase()) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'subtract':
        return values.reduce((a, b) => a - b);
      case 'multiply':
        return values.reduce((a, b) => a * b, 1);
      case 'average':
      case 'mean':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'count':
        return values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'median': {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      }
      case 'mode': {
        const freq = {};
        let maxFreq = 0;
        let mode = values[0];
        values.forEach((v) => {
          freq[v] = (freq[v] || 0) + 1;
          if (freq[v] > maxFreq) {
            maxFreq = freq[v];
            mode = v;
          }
        });
        return mode;
      }
      default:
        return 0;
    }
  };

  const computeFormulaValue = (entry) => {
    const expression = entry.config?.expression;
    if (!expression) return '';
    const scope = {};
    entriesData?.forEach((e) => {
      if (!e.config?.fieldRef) return;
      const rawValue =
        formData[e.entryId]?.value ?? e.value ?? e?.config?.defaultValue;
      if (rawValue === '' || rawValue == null) {
        scope[e.config.fieldRef] = 0;
      } else {
        const num = Number(rawValue);
        scope[e.config.fieldRef] = isNaN(num) ? String(rawValue) : num;
      }
    });

    const { value, error } = evaluateFormula(expression, scope);
    if (error || value == null) return 0;
    if (typeof value === 'object') return value?.entries[0];
    if (Array.isArray(value)) return value[0];
    if (typeof value === 'number') return isFinite(value) ? value : 0;
    if (typeof value === 'string') return value;
    return 0;
  };

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

      <div className="flex items-center w-full md:my-2 my-4 md:text-lg text-base justify-center font-medium font-geist text-primary">
        <h2>{checklistTitle}</h2>
      </div>

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
                        value: formatComputedValue(computeFormulaValue(entry)),
                      }}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly
                    />
                  )}
                  {entry.type === 'section_formular' && (
                    <BasicForm
                      entry={{
                        ...entry,
                        type: 'number',
                        value: formatComputedValue(
                          computeSectionFormulaValue(entry),
                        ),
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
