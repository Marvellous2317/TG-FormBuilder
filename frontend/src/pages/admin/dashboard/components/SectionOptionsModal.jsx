import { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { FiPlus } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import {
  createField,
  createFieldId,
  sectionFieldTypeOptions,
} from '../../../../shared/utils/constants';
import { LuGripVertical } from 'react-icons/lu';
import DropdownSelect from '../../../../shared/components/DropdownSelect';
import DropdownOptionsModal from './DropdownOptionsModal';
import EnumOptionsModal from './EnumOptionsModal';
import FormularModal from './FormularModal';
import useToast from '../../../../shared/hooks/useToast';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import DefaultValueModal from './DefaultValueModal';
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
import { FaCopy } from 'react-icons/fa';

function SortableFieldRow({
  field,
  index,
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
      className="grid grid-cols-[63px_minmax(0,1fr)_400px] border-b border-secondary-200 last:border-b-0 group"
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
        <div className="w-[45%]">
          <DropdownSelect
            value={field.type}
            options={sectionFieldTypeOptions}
            onChange={(value) => onFieldChange(field.id, 'type', value)}
            placeholder="Select input"
            buttonClassName="w-full! rounded-none! border-0! bg-tertiary-700! p-4! text-base! text-primary! outline-none! placeholder:text-tertiary!"
            menuClassName="left-0 right-auto"
          />
        </div>
        <div className="w-[15%]">
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
        </div>
        <div className="w-[25%] flex items-center justify-between">
          <Button
            type="button"
            onClick={() => onCopyField(field.id)}
            className="justify-center rounded-full p-2 text-black transition hidden group-hover:block"
            aria-label={`copy field ${index + 1}`}
          >
            <FaCopy size={16} />
          </Button>
          <Button
            type="button"
            onClick={() => onRemoveField(field.id)}
            className="justify-center rounded-full p-2 text-tertiary-500 transition hidden group-hover:block"
            aria-label={`Remove field ${index + 1}`}
          >
            <RiDeleteBinLine size={16} />
          </Button>
          <Button
            type="button"
            onClick={() => onFieldVisibility(field.id)}
            className="justify-center rounded-full p-2 text-black transition hidden group-hover:block"
            aria-label={`Toggle visibility for field ${index + 1}`}
          >
            {field.config?.visible === false ? (
              <IoEyeOff size={16} className="text-gray-400" />
            ) : (
              <IoEye size={16} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SectionOptionsModal({
  isSectionOptionsModal,
  setIsSectionOptionsModal,
  onSave,
  initialValue,
}) {
  const [sectionName, setSectionName] = useState(initialValue?.name ?? '');
  const [activeFieldId, setActiveFieldId] = useState(null);
  const [isDropdownOptionsModal, setIsDropdownOptionsModal] = useState(false);
  const [isEnumOptionsModal, setIsEnumOptionsModal] = useState(false);
  const [isFormularModal, setIsFormularModal] = useState(false);
  const [isShowDefaultValueModal, setIsShowDefaultValueModal] = useState(false);
  const [isSectionsOptionsModal, setIsSectionsOptionsModal] = useState(false);
  const [fields, setFields] = useState(() => {
    const items = initialValue?.items;
    return Array.isArray(items) && items.length > 0 ? items : [createField()];
  });

  const { showError } = useToast();

  const activeField = fields && fields.find((f) => f.id === activeFieldId);

  const handleModalSave = (config) => {
    setFields((current) =>
      current.map((f) =>
        f.id === activeFieldId
          ? { ...f, config: { ...f.config, ...config } }
          : f,
      ),
    );
  };

  const handleDone = () => {
    if (sectionName.length < 1) {
      showError('Please enter a section name');
      return;
    }

    onSave({ name: sectionName, items: fields });
    setIsSectionOptionsModal(false);
  };

  const handleFieldChange = (id, key, value) => {
    setFields((currentFields) => {
      const updated = currentFields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field,
      );

      if (
        key === 'type' &&
        ['number', 'text', 'formular', 'section_formular'].includes(value)
      ) {
        const field = currentFields.find((f) => f.id === id);
        if (!field?.config?.fieldRef) {
          const existingRefs = currentFields
            .filter(
              (f) =>
                ['number', 'text', 'formular', 'section_formular'].includes(
                  f.type,
                ) &&
                f.id !== id &&
                f.config?.fieldRef,
            )
            .map((f) => f.config.fieldRef);
          let n = 1;
          while (existingRefs.includes(`field${n}`)) n++;
          return updated.map((f) =>
            f.id === id
              ? { ...f, config: { ...f.config, fieldRef: `field${n}` } }
              : f,
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
        setIsSectionsOptionsModal(true);
        break;
      case 'formular':
        setActiveFieldId(id);
        setIsFormularModal(true);
        break;
      default:
        break;
    }
  };

  const handleCopyField = (id) => {
    const fieldToCopy = fields.find((f) => f.id === id);
    if (!fieldToCopy) return;

    const fieldCopy = { ...fieldToCopy };

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
              visible: !isCurrentlyVisible,
            },
          };
        }
        return field;
      }),
    );
  };

  const handleAddField = () => {
    setFields((currentFields) => [...currentFields, createField()]);
  };

  const handleRemoveField = (id) => {
    setFields((currentFields) =>
      currentFields.filter((field) => field.id !== id),
    );
  };

  const handleOpenModal = (type, fieldId) => {
    setActiveFieldId(fieldId);
    if (type === 'dropdown') setIsDropdownOptionsModal(true);
    else if (type === 'enum') setIsEnumOptionsModal(true);
    else if (type === 'section') setIsSectionsOptionsModal(true);
    else if (type === 'formular') setIsFormularModal(true);
    else if (type === 'defaultValue') setIsShowDefaultValueModal(true);
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

  const formularFields = fields.filter(
    (field) =>
      field.type === 'number' ||
      field.type === 'text' ||
      field.type === 'formular' ||
      field.type === 'section_formular',
  );

  return (
    <Modal
      isOpen={isSectionOptionsModal}
      onClose={() => setIsSectionOptionsModal(false)}
      position="right"
      width="max-w-[800px]"
    >
      <div className="flex h-full flex-col overflow-auto">
        <div className="space-y-0.5 p-5 border-b border-secondary-200">
          <p className="text-base font-semibold font-geist text-primary">
            Section
          </p>
          <p className="text-sm font-geist text-tertiary">
            Enter your section details
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center py-6 px-5">
          <InputField
            type="text"
            label="Section name"
            id="sectionName"
            required
            placeholder="Section name"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
          />

          <div className="overflow-x-auto border w-full border-secondary-200 bg-white mt-4 rounded-[10px]">
            <div className="min-w-full">
              <div className="grid grid-cols-[63px_minmax(0,1fr)_400px] border-b border-secondary-200 bg-white">
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
                      onFieldChange={handleFieldChange}
                      onRemoveField={handleRemoveField}
                      onFieldVisibility={handleFieldVisibility}
                      onOpenModal={handleOpenModal}
                      onCopyField={handleCopyField}
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
        </div>

        <div className="flex items-center mt-6 p-5 border-t border-secondary-200 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsSectionOptionsModal(false)}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white"
            onClick={() => handleDone()}
          >
            Save
          </Button>
        </div>
      </div>

      <DropdownOptionsModal
        key={`dropdown-${activeFieldId}`}
        isDropdownOptionsModal={isDropdownOptionsModal}
        setIsDropdownOptionsModal={setIsDropdownOptionsModal}
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

      <SectionOptionsModal
        key={`section-${activeFieldId}`}
        isSectionOptionsModal={isSectionsOptionsModal}
        setIsSectionOptionsModal={setIsSectionsOptionsModal}
        onSave={handleModalSave}
        initialValue={activeField?.config}
      />

      <DefaultValueModal
        key={`default-val-${activeFieldId}`}
        isShowDefaultValueModal={isShowDefaultValueModal}
        setIsShowDefaultValueModal={setIsShowDefaultValueModal}
        onSave={handleModalSave}
        initialValue={activeField?.config}
        activeField={activeField}
      />
    </Modal>
  );
}
