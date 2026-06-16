import { useState, useEffect } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import { LuGripVertical } from 'react-icons/lu';
import { RiDeleteBinLine } from 'react-icons/ri';
import { FaCopy } from 'react-icons/fa6';
import Button from '../../../shared/components/Button';
import DropdownSelect from '../../../shared/components/DropdownSelect';
import DropdownOptionsModal from './components/DropdownOptionsModal';
import EnumOptionsModal from './components/EnumOptionsModal';
import SectionOptionsModal from './components/SectionOptionsModal';
import {
  createField,
  createFieldId,
  fieldTypeOptions,
} from '../../../shared/utils/constants';
import FormularModal from './components/FormularModal';
import {
  useChecklistEntries,
  useCreateChecklistEntries,
  useDeleteChecklistEntries,
  useUpdateChecklistEntries,
} from '../../../shared/hooks/admin/useChecklist';
import Loader from '../../../shared/components/Loader';
import useToast from '../../../shared/hooks/useToast';
import AssignLogbookModal from './components/AssignLogbookModal';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import DefaultValueModal from './components/DefaultValueModal';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SectionFormularModal from './components/SectionFormularModal';
import { getFormDraft, saveFormDraft } from '../../../lib/offlineCache';

function SortableFieldRow({
  field,
  index,
  isDeletingEntries,
  onFieldChange,
  onRemoveField,
  onCopyField,
  onFieldVisibility,
  onOpenModal,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[72px_minmax(0,1fr)_650px] border-b border-secondary-200 last:border-b-0 group"
    >
      <div className="flex items-center gap-2 border-r border-secondary-200 px-4 py-2.5 text-secondary">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none text-secondary-300"
          aria-label="Drag to reorder"
        >
          <LuGripVertical size={18} />
        </button>
        <span className="text-sm">{index + 1}</span>
      </div>

      <div className="border-r border-secondary-200 px-4 py-2.5">
        <input
          type="text"
          value={field.name}
          onChange={(e) => onFieldChange(field.id, 'name', e.target.value)}
          placeholder="Enter text"
          className="w-full rounded-none border-0 bg-tertiary-700 p-4 text-base text-primary outline-none placeholder:text-tertiary"
        />
      </div>

      <div className="border-r flex items-center justify-between w-full border-secondary-200 px-4 py-2.5">
        <div className="w-[50%]">
          <DropdownSelect
            value={field.type}
            options={fieldTypeOptions}
            onChange={(value) => onFieldChange(field.id, 'type', value)}
            placeholder="Select input"
            buttonClassName="w-full! rounded-none! border-0! bg-tertiary-700! p-4! text-base! text-primary! outline-none! placeholder:text-tertiary!"
            menuClassName="left-0 right-auto"
          />
        </div>
        <div className="w-[20%]">
          {['number', 'text'].includes(field.type) &&
            field.config &&
            !field.config.visible && (
              <p
                onClick={() => onOpenModal('defaultValue', field.id)}
                className="underline text-sm text-primary-200 line-clamp-1 cursor-pointer"
              >
                {field.config.defaultValue}
              </p>
            )}
          {field.type === 'enum' && field.config && (
            <p
              onClick={() => onOpenModal('enum', field.id)}
              className="underline text-sm text-primary-200 line-clamp-1 cursor-pointer"
            >
              {field.config.option}
            </p>
          )}
          {field.type === 'dropdown' && field.config && (
            <p
              onClick={() => onOpenModal('dropdown', field.id)}
              className="underline text-sm text-primary-200 line-clamp-1 cursor-pointer"
            >
              {field.config.title}
            </p>
          )}
          {field.type === 'section' && field.config && (
            <p
              onClick={() => onOpenModal('section', field.id)}
              className="underline text-sm text-primary-200 line-clamp-1 cursor-pointer"
            >
              {field.config.name}
            </p>
          )}
          {field.type === 'formular' && field.config && (
            <p
              onClick={() => onOpenModal('formular', field.id)}
              className="underline text-sm text-primary-200 line-clamp-1 cursor-pointer"
            >
              {field.config.expression || 'Formular'}
            </p>
          )}
          {field.type === 'section_formular' && field.config && (
            <p
              onClick={() => onOpenModal('sectionFormular', field.id)}
              className="underline text-sm text-primary-200 line-clamp-1 cursor-pointer"
            >
              {field.config.name || 'SF'}
            </p>
          )}
        </div>
        <div className="w-[15%] flex items-center justify-between">
          <Button
            type="button"
            onClick={() => onCopyField(field.id)}
            className="justify-center rounded-full p-2 text-black transition hidden group-hover:block"
            aria-label={`copy field ${index + 1}`}
          >
            <FaCopy size={18} />
          </Button>
          <Button
            type="button"
            onClick={() => onRemoveField(field.id, field?.entryId)}
            className="justify-center rounded-full p-2 text-tertiary-500 transition hidden group-hover:block"
            aria-label={`Remove field ${index + 1}`}
            disabled={isDeletingEntries}
          >
            {isDeletingEntries ? <Loader /> : <RiDeleteBinLine size={18} />}
          </Button>
          <Button
            type="button"
            onClick={() => onFieldVisibility(field.id)}
            className="justify-center rounded-full p-2 text-black transition hidden group-hover:block"
            aria-label={`Toggle visibility for field ${index + 1}`}
          >
            {field.config?.visible === false ? (
              <IoEyeOff size={18} className="text-gray-400" />
            ) : (
              <IoEye size={18} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CreateEntries() {
  let { id: checklistId, title: checklistTitle } = useLoaderData();

  const [isDropdownOptionsModal, setIsDropdownOptionsModal] = useState(false);
  const [isEnumOptionsModal, setIsEnumOptionsModal] = useState(false);
  const [isSectionOptionsModal, setIsSectionOptionsModal] = useState(false);
  const [isSectionFormularModal, setIsSectionFormularModal] = useState(false);
  const [isFormularModal, setIsFormularModal] = useState(false);
  const [isShowAssignLogbookModal, setIsShowAssignLogbookModal] =
    useState(false);
  const [activeFieldId, setActiveFieldId] = useState(null);
  const [isShowDefaultValueModal, setIsShowDefaultValueModal] = useState(false);
  const [fields, setFields] = useState([createField()]);

  useEffect(() => {
    getFormDraft(checklistId).then((draft) => {
      if (draft) setFields(draft);
    });
  }, [checklistId]);

  useEffect(() => {
    if (Object.keys(fields).length === 0) return;
    const timer = setTimeout(() => saveFormDraft(checklistId, fields), 1000);
    return () => clearTimeout(timer);
  }, [fields, checklistId]);

  const { data, isPending: isLoadingChecklistEntries } =
    useChecklistEntries(checklistId);

  const entriesData = data?.data?.entries;

  const { mutateAsync: createEntries, isPending: isCreatingEntries } =
    useCreateChecklistEntries(checklistId);

  const { mutateAsync: updateEntries, isPending: isUpdatingEntries } =
    useUpdateChecklistEntries(checklistId);

  const { mutateAsync: deleteEntries, isPending: isDeletingEntries } =
    useDeleteChecklistEntries();

  const { showError, showSuccess } = useToast();

  // Sync fields when entriesData is fetched from API
  useEffect(() => {
    if (entriesData && entriesData.length > 0) {
      const formattedFields = entriesData.map((entry) => ({
        ...entry,
        // Ensure every field has a unique ID for React keys if not provided by API
        id:
          entry.id ||
          entry.checklistEntryId ||
          Math.random().toString(36).substr(2, 9),
      }));
      setFields(formattedFields);
    } else if (entriesData && entriesData.length === 0) {
      // If API returns empty list, ensure we have at least one field
      setFields([createField()]);
    }
  }, [entriesData]);

  const activeField = fields.find((f) => f.id === activeFieldId);

  const handleModalSave = (config) => {
    setFields((current) =>
      current.map((f) => (f.id === activeFieldId ? { ...f, config } : f)),
    );
  };

  const handleFieldChange = (id, key, value) => {
    setFields((currentFields) => {
      const updated = currentFields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field,
      );

      if (
        key === 'type' &&
        ['number', 'text', 'section_formular', 'formular'].includes(value)
      ) {
        const field = currentFields.find((f) => f.id === id);
        if (!field?.config?.fieldRef) {
          const existingRefs = currentFields
            .filter(
              (f) =>
                f.type === 'number' ||
                (f.type === 'text' && f.id !== id && f.config?.fieldRef),
            )
            .map((f) => f.config.fieldRef);
          let n = 1;
          while (existingRefs.includes(`field${n}`)) n++;
          return updated.map((f) =>
            f.id === id ? { ...f, config: { fieldRef: `field${n}` } } : f,
          );
        }
      }

      return updated;
    });

    switch (value) {
      case 'dropdown':
        setActiveFieldId(id);
        setIsDropdownOptionsModal(true);
        break;
      case 'enum':
        setActiveFieldId(id);
        setIsEnumOptionsModal(true);
        break;
      case 'section':
        setActiveFieldId(id);
        setIsSectionOptionsModal(true);
        break;
      case 'formular':
        setActiveFieldId(id);
        setIsFormularModal(true);
        break;
      case 'section_formular':
        setActiveFieldId(id);
        setIsSectionFormularModal(true);
        break;
      default:
        break;
    }
  };

  const handleAddField = () => {
    setFields((currentFields) => [...currentFields, createField()]);
  };

  const handleFieldVisibility = (id) => {
    setFields((currentFields) =>
      currentFields.map((field) => {
        if (field.id === id) {
          const isCurrentlyVisible = field.config?.visible !== false;
          const willBeVisible = !isCurrentlyVisible;

          if (
            ['number', 'text'].includes(field.type) &&
            willBeVisible === false
          ) {
            setActiveFieldId(id);
            setIsShowDefaultValueModal(true);
          }

          return {
            ...field,
            config: {
              ...field.config,
              visible: willBeVisible,
            },
          };
        }
        return field;
      }),
    );
  };

  const handleRemoveField = async (id, entryId) => {
    if (entriesData?.length > 0 && entryId) {
      try {
        await deleteEntries(entryId);
        showSuccess('Entry deleted successfully');
      } catch (err) {
        console.log(await err.response.data.message);
      }
    }
    setFields((currentFields) =>
      currentFields.filter((field) => field.id !== id),
    );
  };

  const handleCopyField = (id) => {
    const fieldToCopy = fields.find((f) => f.id === id);
    if (!fieldToCopy) return;

    const fieldCopy = { ...fieldToCopy };
    delete fieldCopy.entryId;

    const newField = {
      ...fieldCopy,
      id: createFieldId(),
      name: `${fieldToCopy.name} (copy)`,
      config:
        typeof structuredClone === 'function'
          ? structuredClone(fieldToCopy.config)
          : JSON.parse(JSON.stringify(fieldToCopy.config ?? {})),
    };

    setFields((currentFields) => [...currentFields, newField]);
  };

  const handleSaveEntries = async () => {
    if (!fields || fields.length === 0) {
      showError('Please add a field');
      return;
    }

    // Basic validation: ensure names are filled
    const hasEmptyNames = fields.some((f) => !f.name.trim());
    if (hasEmptyNames) {
      showError('Please fill in all field names');
      return;
    }

    const orderedFields = fields.map((f, i) => ({ ...f, order: i }));

    try {
      if (entriesData && entriesData.length > 0) {
        await updateEntries({ entries: orderedFields });
        showSuccess('Entries updated successfully');
      } else {
        await createEntries({ entries: orderedFields });
        showSuccess('Entries saved successfully');
        setIsShowAssignLogbookModal(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setFields((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id);
      const newIndex = prev.findIndex((f) => f.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleOpenModal = (type, fieldId) => {
    setActiveFieldId(fieldId);
    if (type === 'dropdown') setIsDropdownOptionsModal(true);
    else if (type === 'enum') setIsEnumOptionsModal(true);
    else if (type === 'section') setIsSectionOptionsModal(true);
    else if (type === 'formular') setIsFormularModal(true);
    else if (type === 'defaultValue') setIsShowDefaultValueModal(true);
    else if (type === 'sectionFormular') setIsSectionFormularModal(true);
  };

  const formularFields = fields.filter(
    (field) =>
      field.type === 'number' ||
      field.type === 'text' ||
      field.type === 'formular' ||
      field.type === 'section_formular',
  );

  const sectionFields = fields.filter((field) => field.type === 'section');

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <header className="flex flex-col items-start justify-between gap-3 border-b border-secondary-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <Link
          prefetch="intent"
          className="flex w-full cursor-pointer items-center gap-2 transition-all duration-150 ease-in-out group sm:w-1/3"
          to="/admin/"
        >
          <FaArrowLeft
            className="text-primary-200 group-hover:-translate-x-0.5"
            size={16}
          />
          <p className="text-sm font-medium text-primary-200">
            Back to dashboard
          </p>
        </Link>

        <div className="flex w-full items-center justify-start sm:w-1/3 sm:justify-center">
          <h2 className="text-base font-medium text-primary">
            {checklistTitle}
          </h2>
        </div>

        <div className="hidden w-1/3 sm:block" />
      </header>

      <section className="flex-1 overflow-y-auto bg-secondary-200/45 p-4 sm:p-6 lg:p-8">
        {isLoadingChecklistEntries ? (
          <Loader size="h-12 w-12 !border-primary-200 mt-20" />
        ) : (
          <div className="overflow-x-auto border border-secondary-200 bg-white">
            <div className="min-w-205">
              <div className="grid grid-cols-[72px_minmax(0,1fr)_650px] border-b border-secondary-200 bg-white">
                <div className="border-r border-secondary-200 px-5 py-5 text-sm font-medium text-secondary">
                  #
                </div>
                <div className="border-r border-secondary-200 px-5 py-5 text-sm font-medium text-secondary">
                  Name
                </div>
                <div className="border-r border-secondary-200 px-5 py-5 text-sm font-medium text-secondary">
                  Type
                </div>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {fields.map((field, index) => (
                    <SortableFieldRow
                      key={field.id}
                      field={field}
                      index={index}
                      isDeletingEntries={isDeletingEntries}
                      onFieldChange={handleFieldChange}
                      onRemoveField={handleRemoveField}
                      onCopyField={handleCopyField}
                      onFieldVisibility={handleFieldVisibility}
                      onOpenModal={handleOpenModal}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            <div className="border-t border-secondary-200 px-5 py-6">
              <Button
                type="button"
                onClick={handleAddField}
                className="gap-2 bg-transparent px-0 py-0 text-base font-medium text-primary-200"
              >
                <FiPlus size={20} />
                Add Field
              </Button>
            </div>
          </div>
        )}
      </section>

      <footer className="flex flex-col-reverse justify-end gap-3 border-t border-secondary-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <Button
          onClick={handleSaveEntries}
          type="button"
          disabled={fields.length < 1 || isCreatingEntries || isUpdatingEntries}
          className="justify-center rounded-[10px] bg-tertiary-200 px-3 py-2.5 text-secondary disabled:cursor-not-allowed disabled:opacity-70 flex items-center gap-2"
        >
          {entriesData?.length > 0 ? 'Update logbook' : 'Save logbook'}
          {(isCreatingEntries || isUpdatingEntries) && (
            <Loader size="h-4 w-4" />
          )}
        </Button>
        {/* <Button
          type="button"
          disabled={fields.length < 1}
          onClick={() => setIsShowAssignLogbookModal(true)}
          className="justify-center rounded-[10px] bg-primary-200 px-3 py-2.5 text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          Assign logbook
        </Button> */}
      </footer>

      <DropdownOptionsModal
        key={`dropdown-${activeFieldId}`}
        isDropdownOptionsModal={isDropdownOptionsModal}
        setIsDropdownOptionsModal={setIsDropdownOptionsModal}
        onSave={handleModalSave}
        initialValue={activeField?.config}
      />

      <SectionOptionsModal
        key={`section-${activeFieldId}`}
        isSectionOptionsModal={isSectionOptionsModal}
        setIsSectionOptionsModal={setIsSectionOptionsModal}
        onSave={handleModalSave}
        initialValue={activeField?.config}
      />

      <EnumOptionsModal
        key={`enum-${activeFieldId}`}
        isEnumOptionsModal={isEnumOptionsModal}
        setIsEnumOptionsModal={setIsEnumOptionsModal}
        onSave={handleModalSave}
        initialValue={activeField?.config}
      />

      <FormularModal
        key={`formular-${activeFieldId}`}
        isFormularModal={isFormularModal}
        setIsFormularModal={setIsFormularModal}
        onSave={handleModalSave}
        initialValue={activeField?.config}
        formularFields={formularFields}
      />

      <SectionFormularModal
        key={`section-formular-${activeFieldId}`}
        isSectionFormularModal={isSectionFormularModal}
        setIsSectionFormularModal={setIsSectionFormularModal}
        onSave={handleModalSave}
        initialValue={activeField?.config}
        formularFields={formularFields}
        sectionFields={sectionFields}
      />

      {/* <AssignLogbookModal
        isShowAssignLogbookModal={isShowAssignLogbookModal}
        setIsShowAssignLogbookModal={setIsShowAssignLogbookModal}
        checklistId={checklistId}
        action="assign"
      /> */}

      <DefaultValueModal
        key={`default-val-${activeFieldId}`}
        isShowDefaultValueModal={isShowDefaultValueModal}
        setIsShowDefaultValueModal={setIsShowDefaultValueModal}
        onSave={handleModalSave}
        initialValue={activeField?.config}
        activeField={activeField}
      />
    </div>
  );
}
