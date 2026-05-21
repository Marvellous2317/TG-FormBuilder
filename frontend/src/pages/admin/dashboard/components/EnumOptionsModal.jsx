import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import Button from '../../../../shared/components/Button';

const enumOptions = [
  { id: 1, option: 'Yes / No', description: 'Binary yes or no selection' },
  { id: 2, option: 'True / False', description: 'Binary true or false value' },
  {
    id: 3,
    option: 'Active / Inactive',
    description: 'Status toggle for active state',
  },
];

export default function EnumOptionsModal({
  isEnumOptionsModal,
  setIsEnumOptionsModal,
  onSave,
  initialValue,
}) {
  const [selectedId, setSelectedId] = useState(initialValue?.id ?? null);

  const handleSelectId = (id) => {
    if (selectedId === id) {
      setSelectedId(null);
      return;
    }
    setSelectedId(id);
  };

  const handleDone = () => {
    const selected = enumOptions.find(({ id }) => id === selectedId);
    onSave({ id: selected.id, option: selected.option });
    setIsEnumOptionsModal(false);
  };

  return (
    <Modal
      isOpen={isEnumOptionsModal}
      onClose={() => setIsEnumOptionsModal(false)}
      position="center"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Enum type
          </p>
          <p className="text-sm font-geist text-tertiary">
            Select an enum value
          </p>
        </div>

        <div className="flex-1 gap-4 flex flex-col mt-7">
          {enumOptions.map(({ id, option, description }) => {
            const isActive = id === selectedId;
            return (
              <div
                className={`flex cursor-pointer w-full items-center justify-between border  rounded-[10px] p-3.5 hover:bg-gray-50 ${isActive ? 'border-primary-200' : 'border-secondary-200'}`}
                key={id}
                onClick={() => handleSelectId(id)}
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-primary font-medium">{option}</p>
                  <p className="text-tertiary text-xs">{description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => {
              setSelectedId(null);
              setIsEnumOptionsModal(false);
            }}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white"
            onClick={() => handleDone()}
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
