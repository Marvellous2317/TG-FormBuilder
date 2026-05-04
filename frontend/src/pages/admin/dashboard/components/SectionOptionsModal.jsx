import { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { FiPlus } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import {
  createField,
  sectionFieldTypeOptions,
} from '../../../../shared/utils/constants';
import { LuGripVertical } from 'react-icons/lu';
import DropdownSelect from '../../../../shared/components/DropdownSelect';
import DropdownOptionsModal from './DropdownOptionsModal';
import EnumOptionsModal from './EnumOptionsModal';
import FormularModal from './FormularModal';
import useToast from '../../../../shared/hooks/useToast';

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
  const [isSectionsOptionsModal, setIsSectionsOptionsModal] = useState(false);
  const [fields, setFields] = useState(
    () => initialValue?.items ?? Array.from({ length: 1 }, () => createField()),
  );

  const { showError } = useToast();

  const activeField = fields.find((f) => f.id === activeFieldId);

  const handleModalSave = (config) => {
    setFields((current) =>
      current.map((f) => (f.id === activeFieldId ? { ...f, config } : f)),
    );
  };

  const handleDone = () => {
    if (sectionName.length < 3) {
      showError('Please enter a section name');
      return;
    }

    onSave({ name: sectionName, items: fields });
    setIsSectionOptionsModal(false);
  };

  const handleFieldChange = (id, key, value) => {
    setFields((currentFields) =>
      currentFields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field,
      ),
    );

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

  const handleAddField = () => {
    setFields((currentFields) => [...currentFields, createField()]);
  };

  const handleRemoveField = (id) => {
    setFields((currentFields) =>
      currentFields.filter((field) => field.id !== id),
    );
  };

  return (
    <Modal
      isOpen={isSectionOptionsModal}
      onClose={() => setIsSectionOptionsModal(false)}
      position="right"
      width="max-w-[700px]"
      // className="overflow-hidden"
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

          <div className="overflow-x-auto border border-secondary-200 bg-white mt-4 rounded-[10px]">
            <div className="min-w-full">
              <div className="grid grid-cols-[60px_minmax(0,1fr)_300px] border-b border-secondary-200 bg-white">
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

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[60px_minmax(0,1fr)_300px] border-b border-secondary-200 last:border-b-0 group"
                >
                  <div className="flex items-center gap-2 border-r border-secondary-200 px-4 py-2.5 text-secondary">
                    <LuGripVertical size={18} className="text-secondary-300" />
                    <span className="text-sm">{index + 1}</span>
                  </div>

                  <div className="border-r border-secondary-200 px-4 py-2.5">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(event) =>
                        handleFieldChange(field.id, 'name', event.target.value)
                      }
                      placeholder="Enter text"
                      className="w-full rounded-none border-0 bg-tertiary-700 p-4 text-base text-primary outline-none placeholder:text-tertiary"
                    />
                  </div>

                  <div className="border-r flex items-center justify-between w-full border-secondary-200 px-4 py-2.5">
                    <div className="w-[50%]">
                      <DropdownSelect
                        value={field.type}
                        options={sectionFieldTypeOptions}
                        onChange={(value) =>
                          handleFieldChange(field.id, 'type', value)
                        }
                        placeholder="Select input"
                        buttonClassName="w-full! rounded-none! border-0! bg-tertiary-700! p-4! text-base! text-primary! outline-none! placeholder:text-tertiary!"
                        menuClassName="left-0 right-auto"
                      />
                    </div>
                    <div className="w-[20%]">
                      {field.type === 'enum' && field.config && (
                        <p
                          onClick={() => {
                            setActiveFieldId(field.id);
                            setIsEnumOptionsModal(true);
                          }}
                          className="underline text-sm text-primary-200 line-clamp-1 cursor-pointer"
                        >
                          {field.config.option}
                        </p>
                      )}
                      {field.type === 'dropdown' && field.config && (
                        <p
                          onClick={() => {
                            setActiveFieldId(field.id);
                            setIsDropdownOptionsModal(true);
                          }}
                          className="underline text-sm text-primary-200 line-clamp-1 cursor-pointer"
                        >
                          {field.config.title}
                        </p>
                      )}
                      {field.type === 'section' && field.config && (
                        <p
                          onClick={() => {
                            setActiveFieldId(field.id);
                            setIsSectionsOptionsModal(true);
                          }}
                          className="underline text-sm text-primary-200 line-clamp-1 cursor-pointer"
                        >
                          {field.config.name}
                        </p>
                      )}
                      {field.type === 'formular' && field.config && (
                        <p
                          onClick={() => {
                            setActiveFieldId(field.id);
                            setIsFormularModal(true);
                          }}
                          className="underline text-sm text-primary-200 line-clamp-1 cursor-pointer"
                        >
                          {field.config.expression || 'Formular'}
                        </p>
                      )}
                    </div>
                    <div className="w-[10%]">
                      <Button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        className="justify-center rounded-full p-2 text-tertiary-500 transition hidden group-hover:block"
                        aria-label={`Remove field ${index + 1}`}
                      >
                        <RiDeleteBinLine size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
      />

      <SectionOptionsModal
        key={`section-${activeFieldId}`}
        isSectionOptionsModal={isSectionsOptionsModal}
        setIsSectionOptionsModal={setIsSectionsOptionsModal}
        onSave={handleModalSave}
        initialValue={activeField?.config}
      />
    </Modal>
  );
}
