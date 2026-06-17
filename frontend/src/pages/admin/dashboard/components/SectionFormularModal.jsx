import { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import DropdownSelect from '../../../../shared/components/DropdownSelect';
import useToast from '../../../../shared/hooks/useToast';

const operations = [
  'Sum',
  'Subtract',
  'Multiply',
  'Average',
  'Count',
  'Min',
  'Max',
  'Mean',
  'Median',
  'Mode',
];

export default function SectionFormularModal({
  isSectionFormularModal,
  setIsSectionFormularModal,
  onSave,
  initialValue,
  sectionFields,
}) {
  const [formData, setFormData] = useState(
    initialValue?.items ?? {
      section: '',
      field: '',
      operation: '',
    },
  );

  const { showError } = useToast();

  const handleSave = () => {
    if (
      formData.section.length < 1 ||
      formData.field.length < 1 ||
      formData.operation.length < 1
    ) {
      showError('Please fill all fields');
      return;
    }
    onSave({ name: `SF-${formData.section}`, items: formData });
    setIsSectionFormularModal(false);
  };

  const onFieldChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const sections = sectionFields.map((f) => f.name);

  const fieldsInSection =
    sectionFields
      .filter((f) => f.name === formData.section)?.[0]
      ?.config?.items.map((f) => f.name) || [];

  return (
    <Modal
      isOpen={isSectionFormularModal}
      onClose={() => setIsSectionFormularModal(false)}
      position="right"
      width="max-w-[500px]"
      className="overflow-auto"
    >
      <div className="flex h-full flex-col">
        <div className="space-y-0.5 p-5 border-b border-secondary-200">
          <h2 className="text-base font-semibold font-geist text-primary">
            Section Formular
          </h2>
          <p className="text-sm font-geist text-tertiary">
            Create a calculate field using for sections
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center py-6 px-5">
          <div className="w-full">
            <InputField
              label="Select section"
              id="section"
              className=""
              value={formData.section}
              required
              options={sections}
              type="select"
              onChange={(e) => onFieldChange('section', e.target.value)}
            />
          </div>

          <div className="w-full mt-5">
            <InputField
              label="Select section field"
              id="field"
              className=""
              value={formData.field}
              required
              options={fieldsInSection}
              type="select"
              onChange={(e) => onFieldChange('field', e.target.value)}
            />
          </div>

          <div className="w-full mt-5">
            <InputField
              label="Select operation"
              id="operation"
              className=""
              value={formData.operation}
              required
              options={operations}
              type="select"
              onChange={(e) => onFieldChange('operation', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center mt-6 p-5 border-t border-secondary-200 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsSectionFormularModal(false)}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white"
          >
            Save formular
          </Button>
        </div>
      </div>
    </Modal>
  );
}
