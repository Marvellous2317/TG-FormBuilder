const createFieldId = () =>
  `field-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createField = () => ({
  id: createFieldId(),
  name: '',
  type: '',
});

const fieldTypeOptions = [
  { label: 'Text', value: 'text' },
  { label: 'Section', value: 'section' },
  { label: 'Number', value: 'number' },
  { label: 'Dropdown', value: 'dropdown' },
  { label: 'Date', value: 'date' },
  { label: 'Time', value: 'time' },
  { label: 'Enum', value: 'enum' },
  { label: 'Formular', value: 'formular' },
];

const sectionFieldTypeOptions = [
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Dropdown', value: 'dropdown' },
  { label: 'Date', value: 'date' },
  { label: 'Time', value: 'time' },
  { label: 'Enum', value: 'enum' },
  { label: 'Formular', value: 'formular' },
];

export {
  createFieldId,
  createField,
  fieldTypeOptions,
  sectionFieldTypeOptions,
};
