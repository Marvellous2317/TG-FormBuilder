import React, { useMemo, useEffect, useState } from 'react';
import DropdownSelect from '../DropdownSelect';
import { useChecklistCatalog } from '../../hooks/admin/useChecklist';
import Loader from '../Loader';
import { saveToCache, getFromCache } from '../../../lib/offlineCache';

export default function DropdownForm({
  entry,
  formData,
  setFormData,
  readOnly,
}) {
  const catalogId = entry?.config?.id;
  const entryId = entry?.entryId;

  const [cachedCatalog, setCachedCatalog] = useState(null);

  useEffect(() => {
    if (!catalogId) return;
    getFromCache(`catalog-${catalogId}`).then(setCachedCatalog);
  }, [catalogId]);

  const { data, isPending: isFetchingCatalog } = useChecklistCatalog(
    catalogId,
    { placeholderData: cachedCatalog },
  );

  useEffect(() => {
    if (data && catalogId) saveToCache(`catalog-${catalogId}`, data);
  }, [data, catalogId]);

  const catalogData = data?.data?.catalog ?? cachedCatalog?.data?.catalog;

  const options = useMemo(() => {
    if (!catalogData?.list) return [];
    return catalogData.list.map((opt) =>
      typeof opt === 'object' && opt.label && opt.value
        ? opt
        : { label: String(opt), value: String(opt) },
    );
  }, [catalogData]);

  const handleChange = (value) => {
    if (!entryId) return;

    setFormData((prev) => ({
      ...prev,
      [entryId]: {
        entryId: entryId,
        value: value,
      },
    }));
  };

  const currentValue = formData[entryId]?.value || entry?.value || '';

  const isVisible = entry?.config?.visible ? entry?.config?.visible : true;

  // Ensure a prefilled/default value is included in formData even if the
  // user never edits the field, so it still gets submitted.
  useEffect(() => {
    if (!entryId) return;
    if (formData[entryId] !== undefined) return;
    if (!currentValue) return;

    setFormData((prev) => ({
      ...prev,
      [entryId]: {
        entryId,
        value: currentValue,
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId, currentValue, formData[entryId]]);

  if (!isVisible) return null;

  return (
    <div className="mt-5 flex flex-col items-center justify-between w-full gap-2">
      <h2 className="block w-full font-geist text-sm text-secondary">
        {entry.name}
      </h2>
      <div className="w-full flex gap-2 items-center justify-end">
        <DropdownSelect
          value={currentValue}
          options={options}
          onChange={(value) => handleChange(value)}
          placeholder="Select input"
          className="w-full"
          buttonClassName="w-full! bg-tertiary-700! p-4! text-base! text-primary! outline-none! rounded-xl! placeholder:text-tertiary!"
          menuClassName="left-0 right-auto"
          disabled={readOnly}
          searchable
          readOnly={readOnly}
        />
        {isFetchingCatalog && <Loader size="h-4.5 w-4.5" />}
      </div>
    </div>
  );
}
