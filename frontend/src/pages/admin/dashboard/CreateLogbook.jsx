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

const fieldTypeOptions = [
  { label: 'Text', value: 'text' },
  { label: 'Section', value: 'section' },
  { label: 'Number', value: 'number' },
  { label: 'Dropdown', value: 'dropdown' },
  { label: 'Date', value: 'date' },
  { label: 'Time', value: 'time' },
  { label: 'Enum', value: 'enum' },
  { label: 'Formula', value: 'formula' },
];

const createFieldId = () =>
  `field-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createField = () => ({
  id: createFieldId(),
  name: '',
  type: '',
});

export default function CreateLogbook() {
  const [isDropdownOptionsModal, setIsDropdownOptionsModal] = useState(false);
  const [isEnumOptionsModal, setIsEnumOptionsModal] = useState(false);
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
            <div className="grid grid-cols-[72px_minmax(0,1fr)_340px_88px] border-b border-secondary-200 bg-white">
              <div className="border-r border-secondary-200 px-5 py-5 text-sm font-medium text-secondary">
                #
              </div>
              <div className="border-r border-secondary-200 px-5 py-5 text-sm font-medium text-secondary">
                Name
              </div>
              <div className="border-r border-secondary-200 px-5 py-5 text-sm font-medium text-secondary">
                Type
              </div>
              <div className="px-5 py-5 text-sm font-medium text-secondary" />
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-[72px_minmax(0,1fr)_340px_88px] border-b border-secondary-200 last:border-b-0"
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

                <div className="border-r border-secondary-200 px-4 py-2.5">
                  <DropdownSelect
                    value={field.type}
                    options={fieldTypeOptions}
                    onChange={(value) =>
                      handleFieldChange(field.id, 'type', value)
                    }
                    placeholder="Select input"
                    buttonClassName="w-full rounded-none! border-0! bg-tertiary-700! p-4! text-base! text-primary! outline-none! placeholder:text-tertiary!"
                    menuClassName="left-0 right-auto"
                  />
                </div>

                <div className="flex items-center justify-center px-4 py-2.5">
                  <Button
                    type="button"
                    onClick={() => handleRemoveField(field.id)}
                    className="justify-center rounded-full p-2 text-tertiary-500 transition"
                    aria-label={`Remove field ${index + 1}`}
                  >
                    <RiDeleteBinLine size={18} />
                  </Button>
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
      />

      <EnumOptionsModal
        isEnumOptionsModal={isEnumOptionsModal}
        setIsEnumOptionsModal={setIsEnumOptionsModal}
      />
    </div>
  );
}
