const createFieldId = () =>
  `field-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createField = () => ({
  id: createFieldId(),
  name: '',
  type: '',
  config: null,
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

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export {
  createFieldId,
  createField,
  fieldTypeOptions,
  sectionFieldTypeOptions,
  formatDate,
};
