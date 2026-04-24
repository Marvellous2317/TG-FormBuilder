import React, { useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { useOperatorSubmittedChecklist } from '../../shared/hooks/operator/useOperatorChecklists';
import BasicForm from '../../shared/components/entries/BasicForm';
import { FaArrowLeft } from 'react-icons/fa';
import Loader from '../../shared/components/Loader';
import EnumForm from '../../shared/components/entries/EnumForm';
import DropdownForm from '../../shared/components/entries/DropdownForm';
import SectionForm from '../../shared/components/entries/SectionForm';

export default function ViewOperatorEntries() {
  let { id: checklistId, back: previousLocation } = useLoaderData();

  const { data, isPending: isLoadingChecklistEntries } =
    useOperatorSubmittedChecklist(checklistId);

  const [formData, setFormData] = useState({});

  const entriesData = data?.data?.submission?.entries;

  return (
    <div
      className={`flex ${entriesData?.length > 0 ? 'min-h-screen' : ''} w-full flex-col bg-white py-6`}
    >
      <Link
        prefetch="intent"
        className="flex w-fit cursor-pointer items-center gap-2 transition-all duration-150 ease-in-out group px-4 md:px-10 lg:px-25"
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
                <div key={entryKey} className="space-y-5">
                  {(entry.type === 'text' ||
                    entry.type === 'date' ||
                    entry.type === 'time' ||
                    entry.type === 'number') && (
                    <BasicForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly={true}
                    />
                  )}
                  {entry.type === 'enum' && (
                    <EnumForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly={true}
                    />
                  )}
                  {entry.type === 'dropdown' && (
                    <DropdownForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly={true}
                    />
                  )}
                  {entry.type === 'section' && (
                    <SectionForm
                      entry={entry}
                      formData={formData}
                      setFormData={setFormData}
                      readOnly={true}
                    />
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
