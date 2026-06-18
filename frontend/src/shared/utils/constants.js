const createFieldId = () =>
  `field-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createField = () => ({
  id: createFieldId(),
  name: '',
  type: '',
  config: {},
});

const fieldTypeOptions = [
  { label: 'Text', value: 'text' },
  { label: 'Section', value: 'section' },
  { label: 'Number', value: 'number' },
  { label: 'Dropdown', value: 'dropdown' },
  { label: 'Date', value: 'date' },
  { label: 'Time', value: 'time' },
  { label: 'Enum', value: 'enum' },
  { label: 'Image', value: 'image' },
  { label: 'Formular', value: 'formular' },
  { label: 'Section Formular', value: 'section_formular' },
];

const sectionFieldTypeOptions = [
  { label: 'Text', value: 'text' },
  // { label: 'Section', value: 'section' },
  { label: 'Number', value: 'number' },
  { label: 'Dropdown', value: 'dropdown' },
  { label: 'Date', value: 'date' },
  { label: 'Time', value: 'time' },
  { label: 'Enum', value: 'enum' },
  { label: 'Formular', value: 'formular' },
  { label: 'Image', value: 'image' },
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

const getInitials = (value) => {
  const names = value.split(' ');
  const initials = names.map((n) => n.charAt(0).toUpperCase());
  return initials.join('');
};

const statusOptions = [
  { title: 'Active', value: 'active' },
  { title: 'Suspended', value: 'suspended' },
];

const statusOptionss = [
  { title: 'Active', value: 'active' },
  { title: 'Inactive', value: 'inactive' },
];

const deletedOptions = [
  { title: 'All', value: 'all' },
  { title: 'True', value: 'true' },
  { title: 'False', value: 'false' },
];

const getChecklistOperatorIds = (checklist) => {
  if (!checklist) return [];

  if (Array.isArray(checklist.operators)) {
    return checklist.operators.map((operator) => operator.userId ?? operator);
  }

  if (Array.isArray(checklist.operatorIds)) {
    return checklist.operatorIds;
  }

  if (Array.isArray(checklist.assignments)) {
    return checklist.assignments
      .map((assignment) => assignment.operator?.userId ?? assignment.assignedTo)
      .filter(Boolean);
  }

  return [];
};

const getChecklistApprovers = (checklist) => {
  if (!checklist) return [];

  const approvers = checklist.approverConfigs ?? checklist.approvers ?? [];

  if (!Array.isArray(approvers)) {
    return [];
  }

  return approvers
    .map((approver, index) => ({
      approverId:
        approver.approverId ?? approver.userId ?? approver.approver?.userId,
      step: approver.step ?? index,
    }))
    .filter(({ approverId }) => Boolean(approverId));
};

export {
  createFieldId,
  createField,
  getInitials,
  fieldTypeOptions,
  sectionFieldTypeOptions,
  formatDate,
  statusOptions,
  statusOptionss,
  deletedOptions,
  getChecklistApprovers,
  getChecklistOperatorIds,
};
