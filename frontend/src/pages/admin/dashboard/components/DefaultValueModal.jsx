import React, { useEffect, useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';

export default function DefaultValueModal({
  isShowDefaultValueModal,
  setIsShowDefaultValueModal,
  onSave,
  initialValue,
}) {
  const [defaultValue, setDefaultValue] = useState('');

  useEffect(() => {
    if (isShowDefaultValueModal) {
      setDefaultValue(initialValue?.defaultValue || '');
    }
  }, [isShowDefaultValueModal, initialValue]);

  const handleInputChange = (event) => {
    setDefaultValue(event.target.value);
  };

  const handleCancel = () => {
    setDefaultValue(initialValue?.defaultValue || '');
    setIsShowDefaultValueModal(false);
  };

  const handleSave = () => {
    onSave({
      ...initialValue,
      defaultValue: defaultValue,
    });
    setIsShowDefaultValueModal(false);
  };

  return (
    <Modal
      isOpen={isShowDefaultValueModal}
      onClose={() => setIsShowDefaultValueModal(false)}
      position="center"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        <div className="space-y-0.5">
          <p className="text-base font-semibold font-geist text-primary">
            Default value
          </p>
          <p className="text-sm font-geist text-tertiary">
            Enter default value for this number field
          </p>
        </div>

        <div className="flex-1 gap-3 flex flex-col mt-7">
          <InputField
            label="Default value"
            id="defaultValue"
            required
            className="mb-1"
            type="number"
            value={defaultValue}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={() => handleCancel()}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white flex gap-2"
            onClick={() => handleSave()}
            disabled={!defaultValue || defaultValue.toString().trim() === ''}
          >
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
