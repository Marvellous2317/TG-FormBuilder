import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function CreateLogbook() {
  const [isDropdownOptionsModal, setIsDropdownOptionsModal] = useState(false);
  const [isEnumOptionsModal, setIsEnumOptionsModal] = useState(false);
  const [isSectionOptionsModal, setIsSectionOptionsModal] = useState(false);
  const [isFormularModal, setIsFormularModal] = useState(false);
  const [chosenSectionValue, setChosenSectionValue] = useState(null);
  const [chosenDropdownValue, setChosenDropdownValue] = useState(null);
  const [chosenEnumValue, setChosenEnumValue] = useState(null);
  const [chosenFormularValue, setChosenFormularValue] = useState(null);
  const [fields, setFields] = useState(() =>
    Array.from({ length: 6 }, () => createField()),
  );

  const handleFieldChange = (id, key, value) => {
    setFields((currentFields) =>
      currentFields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field,
      ),
    );

    switch (value) {
      case 'dropdown':
        setIsDropdownOptionsModal(true);
        break;
      case 'enum':
        setIsEnumOptionsModal(true);
        break;
      case 'section':
        setIsSectionOptionsModal(true);
        break;
      case 'formular':
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

  console.log(fields);

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
                    {field.type === 'enum' && chosenEnumValue && (
                      <p
                        onClick={() => setIsEnumOptionsModal(true)}
                        className="underline text-sm text-primary-200 line-clamp-1"
                      >
                        {chosenEnumValue?.option}
                      </p>
                    )}
                    {field.type === 'dropdown' && chosenDropdownValue && (
                      <p
                        onClick={() => setIsDropdownOptionsModal(true)}
                        className="underline text-sm text-primary-200 line-clamp-1"
                      >
                        {chosenDropdownValue?.title}
                      </p>
                    )}
                    {field.type === 'section' && chosenSectionValue && (
                      <p
                        onClick={() => setIsSectionOptionsModal(true)}
                        className="underline text-sm text-primary-200 line-clamp-1"
                      >
                        {chosenSectionValue?.name}
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
      </section>

      <footer className="flex flex-col-reverse justify-end gap-3 border-t border-secondary-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <Button className="justify-center rounded-[10px] bg-tertiary-200 px-3 py-2.5 text-secondary">
          Save logbook
        </Button>
        <Button className="justify-center rounded-[10px] bg-primary-200 px-3 py-2.5 text-white">
          Assign logbook
        </Button>
      </footer>

      <DropdownOptionsModal
        isDropdownOptionsModal={isDropdownOptionsModal}
        setIsDropdownOptionsModal={setIsDropdownOptionsModal}
        setChosenDropdownValue={setChosenDropdownValue}
        chosenDropdownValue={chosenDropdownValue}
      />

      <SectionOptionsModal
        isSectionOptionsModal={isSectionOptionsModal}
        setIsSectionOptionsModal={setIsSectionOptionsModal}
        setChosenSectionValue={setChosenSectionValue}
        chosenSectionValue={chosenSectionValue}
      />

      <EnumOptionsModal
        isEnumOptionsModal={isEnumOptionsModal}
        setIsEnumOptionsModal={setIsEnumOptionsModal}
        setChosenEnumValue={setChosenEnumValue}
        chosenEnumValue={chosenEnumValue}
      />

      <FormularModal
        isFormularModal={isFormularModal}
        setIsFormularModal={setIsFormularModal}
        setChosenFormularValue={setChosenFormularValue}
        chosenFormularValue={chosenFormularValue}
      />
    </div>
  );
}
