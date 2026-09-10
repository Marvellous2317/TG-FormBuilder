import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoaderData, Link, useSearchParams } from 'react-router-dom';
import {
  evaluateFormula,
  formatComputedValue,
} from '../../../shared/utils/formula';
import { FaArrowLeft } from 'react-icons/fa';
import BasicForm from '../../../shared/components/entries/BasicForm';
import EnumForm from '../../../shared/components/entries/EnumForm';
import DropdownForm from '../../../shared/components/entries/DropdownForm';
import SectionForm from '../../../shared/components/entries/SectionForm';
import Button from '../../../shared/components/Button';
import Loader from '../../../shared/components/Loader';
import { useSuperAdminSubmission } from '@/shared/hooks/superadmin/useCompanies';

export default function ViewSuperAdminEntries() {
  let { id: submissionId } = useLoaderData();

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const { data, isPending } = useSuperAdminSubmission(submissionId);

  const isReadAdmin = true;

  const [formData, setFormData] = useState({});

  const entriesData = data?.data?.entries;
  const checklistTitle = data?.data?.title;

  const operator = data?.data?.submitter;

  const approver = data?.data?.approver;

  const computeFormulaValue = (entry) => {
    const expression = entry.config?.expression;
    if (!expression) return '';
    const scope = {};
    entriesData?.forEach((e) => {
      if (e.config?.fieldRef) {
        const rawValue =
          formData[e.entryId]?.value ?? e.value ?? e?.config?.defaultValue;

        if (rawValue === '' || rawValue == null) {
          scope[e.config.fieldRef] = 0;
        } else {
          const num = Number(rawValue);
          scope[e.config.fieldRef] = isNaN(num) ? String(rawValue) : num;
        }
      }
    });
    const { value, error } = evaluateFormula(expression, scope);
    if (error || (typeof value === 'number' && !isFinite(value))) {
      console.log(error);
      return 0;
    }

    return value ?? 0;
  };

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
    const values = rowsData
      .map((row) => {
        const raw = row[targetFieldId]?.value;
        const num = Number(raw);
        return isNaN(num) ? null : num;
      })
      .filter((v) => v !== null);

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

  return (
    <div
      className={`flex ${entriesData?.length > 0 ? 'min-h-screen' : ''} w-full flex-col overflow-y-auto bg-white py-6`}
    >
      <div className="mb-6 flex p-3 w-full max-w-6xl items-start justify-start sm:mb-10">
        <Button
          onClick={() => navigate(-1)}
          className="flex border border-secondary-200 rounded-full gap-1.5 items-center py-1.5 px-3 text-secondary text-sm font-medium"
        >
          <FaArrowLeft className="text-primary" size={12} />
          Back
        </Button>
      </div>
      <div className="flex items-center justify-center w-full px-4 pb-2.5 border-b border-secondary-200">
        <h1 className="flex items-center  md:justify-center w-1/3 text-base mt-4 md:mt-0 lg:text-lg font-semibold text-primary font-geist">
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
                      readOnly={isReadAdmin}
                    />
                  )}
                  {entry.type === 'enum' && (
                    <EnumForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly={isReadAdmin}
                    />
                  )}
                  {entry.type === 'dropdown' && (
                    <DropdownForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly={isReadAdmin}
                    />
                  )}
                  {entry.type === 'section' && (
                    <SectionForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly={isReadAdmin}
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

      {!isPending && !isReadAdmin && (
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
