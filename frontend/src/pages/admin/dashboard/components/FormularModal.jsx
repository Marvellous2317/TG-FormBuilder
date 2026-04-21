import { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';

const mathematical = ['SUM', 'subtract', 'multiply', 'divide', 'average'];
const aggregation = ['count', 'min', 'max'];
const advanced = ['if', 'round', 'abs', 'concat'];
const fields = ['field1', 'field2', 'field3'];

export default function FormularModal({
  isFormularModal,
  setIsFormularModal,
  onSave,
  initialValue,
}) {
  const [expression, setExpression] = useState(initialValue?.expression ?? '');

  const handleSave = () => {
    onSave({ expression });
    setIsFormularModal(false);
  };

  return (
    <Modal
      isOpen={isFormularModal}
      onClose={() => setIsFormularModal(false)}
      position="right"
      width="max-w-[460px]"
      className="overflow-auto"
    >
      <div className="flex h-full flex-col">
        <div className="space-y-0.5 p-5 border-b border-secondary-200">
          <h2 className="text-base font-semibold font-geist text-primary">
            Formular
          </h2>
          <p className="text-sm font-geist text-tertiary">
            Create a calculate field using functions and fields
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center py-6 px-5">
          <div className="w-full">
            <InputField
              label="Formular expression"
              placeholder="Build your formular using functions and fields"
              type="textarea"
              inputClassName="bg-tertiary-700! placeholder:text-tertiary!"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
            />
            <div className="flex items-start gap-3 w-full justify-start">
              <p
                className="text-tertiary text-sm cursor-pointer"
                onClick={() => setExpression('')}
              >
                Clear
              </p>
              <p className="underline text-primary-200 text-sm cursor-pointer">
                Test formular
              </p>
            </div>
          </div>

          <div className="w-full mt-6">
            <h2 className="text-base font-semibold font-geist text-primary">
              Quick functions
            </h2>
            <div className="mt-2 flex flex-col items-start">
              <p className="text-sm text-tertiary">Mathematical</p>
              <ul className="mt-2 flex items-center gap-3">
                {mathematical.map((item, index) => (
                  <li
                    key={index}
                    className="border border-secondary-200 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Button className=" text-secondary text-sm uppercase">
                      {item}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 flex flex-col items-start">
              <p className="text-sm text-tertiary">Aggregation</p>
              <ul className="mt-2 flex items-center gap-3">
                {aggregation.map((item, index) => (
                  <li
                    key={index}
                    className="border border-secondary-200 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Button className=" text-secondary text-sm uppercase">
                      {item}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 flex flex-col items-start">
              <p className="text-sm text-tertiary">Advanced</p>
              <ul className="mt-2 flex items-center gap-3">
                {advanced.map((item, index) => (
                  <li
                    key={index}
                    className="border border-secondary-200 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Button className=" text-secondary text-sm uppercase">
                      {item}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full mt-6">
            <h2 className="text-base font-semibold font-geist text-primary">
              Available fields
            </h2>
            <div className="mt-2 flex flex-col items-start border border-secondary-200">
              <ul className="flex flex-col items-center w-full bg-tertiary-700">
                {fields.map((item, index) => {
                  const isLastItem = index === fields.length - 1;
                  return (
                    <li
                      key={index}
                      className={`border-b flex items-center justify-between border-secondary-200 cursor-pointer w-full p-3.5 ${
                        isLastItem && 'border-b-0'
                      }`}
                    >
                      <p className=" text-secondary text-sm uppercase">
                        {item}
                      </p>
                      <div className="flex items-center gap-3">
                        <p className="text-tertiary text-sm">Number</p>
                        <Button className="text-primary-200 text-sm">
                          Insert field
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center mt-6 p-5 border-t border-secondary-200 justify-end gap-3">
          <Button
            type="button"
            onClick={() => setIsFormularModal(false)}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white"
          >
            Save formula
          </Button>
        </div>
      </div>
    </Modal>
  );
}
