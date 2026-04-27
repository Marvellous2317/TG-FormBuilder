import { useState, useEffect } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import { LuGripVertical } from 'react-icons/lu';
import { RiDeleteBinLine } from 'react-icons/ri';
import Button from '../../../shared/components/Button';
import DropdownSelect from '../../../shared/components/DropdownSelect';
import DropdownOptionsModal from './components/DropdownOptionsModal';
import EnumOptionsModal from './components/EnumOptionsModal';
import SectionOptionsModal from './components/SectionOptionsModal';
import { createField, fieldTypeOptions } from '../../../shared/utils/constants';
import FormularModal from './components/FormularModal';
import {
  useChecklist,
  useChecklistEntries,
  useCreateChecklistEntries,
  useUpdateChecklistEntries,
} from '../../../shared/hooks/admin/useChecklist';
import Loader from '../../../shared/components/Loader';
import useToast from '../../../shared/hooks/useToast';
import AssignLogbookModal from './components/AssignLogbookModal';

export default function CreateEntries() {
  let { id: checklistId } = useLoaderData();

  const [isDropdownOptionsModal, setIsDropdownOptionsModal] = useState(false);
  const [isEnumOptionsModal, setIsEnumOptionsModal] = useState(false);
  const [isSectionOptionsModal, setIsSectionOptionsModal] = useState(false);
  const [isFormularModal, setIsFormularModal] = useState(false);
  const [isShowAssignLogbookModal, setIsShowAssignLogbookModal] =
    useState(false);
  const [activeFieldId, setActiveFieldId] = useState(null);

  const { data, isPending: isLoadingChecklistEntries } =
    useChecklistEntries(checklistId);

  const entriesData = data?.data?.entries;

  const { mutateAsync: createEntries, isPending: isCreatingEntries } =
    useCreateChecklistEntries(checklistId);

  const { mutateAsync: updateEntries, isPending: isUpdatingEntries } =
    useUpdateChecklistEntries(checklistId);

  const { showError, showSuccess } = useToast();

  const [fields, setFields] = useState([createField()]);

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
        setIsSectionOptionsModal(true);
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

    try {
      if (entriesData && entriesData.length > 0) {
        await updateEntries({ entries: fields });
        showSuccess('Entries updated successfully');
      } else {
        await createEntries({ entries: fields });
        showSuccess('Entries saved successfully');
      }
    } catch (error) {
      showError(
        error?.response?.data?.message || error.message || 'An error occurred',
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <header className="flex flex-col items-start justify-between gap-3 border-b border-secondary-200 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
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
            Packaging record
          </h2>
        </div>

        <div className="hidden w-1/3 sm:block" />
      </header>

      <section className="flex-1 bg-secondary-200/45 p-4 sm:p-6 lg:p-8">
        {isLoadingChecklistEntries ? (
          <Loader size="h-12 w-12 !border-primary-200 mt-20" />
        ) : (
          <div className="overflow-x-auto border border-secondary-200 bg-white">
            <div className="min-w-205">
              <div className="grid grid-cols-[72px_minmax(0,1fr)_500px] border-b border-secondary-200 bg-white">
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
                  className="grid grid-cols-[72px_minmax(0,1fr)_500px] border-b border-secondary-200 last:border-b-0 group"
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
                        options={fieldTypeOptions}
                        onChange={(value) =>
                          handleFieldChange(field.id, 'type', value)
                        }
                        placeholder="Select input"
                        buttonClassName="w-full! rounded-none! border-0! bg-tertiary-700! p-4! text-base! text-primary! outline-none! placeholder:text-tertiary!"
                        menuClassName="left-0 right-auto"
                      />
                    </div>
                    <div className="w-[25%]">
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
                            setIsSectionOptionsModal(true);
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
                    <div className="w-[15%]">
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
        )}
      </section>

      <footer className="flex transition-all duration-200 ease-in-out flex-col-reverse justify-end gap-3 border-t border-secondary-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
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
        <Button
          type="button"
          disabled={fields.length < 1}
          onClick={() => setIsShowAssignLogbookModal(true)}
          className="justify-center rounded-[10px] bg-primary-200 px-3 py-2.5 text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          Assign logbook
        </Button>
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
      />

      <AssignLogbookModal
        isShowAssignLogbookModal={isShowAssignLogbookModal}
        setIsShowAssignLogbookModal={setIsShowAssignLogbookModal}
        checklistId={checklistId}
        action="assign"
      />
    </div>
  );
}
