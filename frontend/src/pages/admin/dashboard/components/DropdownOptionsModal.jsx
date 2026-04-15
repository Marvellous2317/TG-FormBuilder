import React, { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { RiLinkM } from 'react-icons/ri';
import { IoAddOutline, IoClose } from 'react-icons/io5';

const sourcelist = [
  {
    id: 1,
    title: 'Global source',
    count: 40,
    items: [
      { id: 1, value: 'dkfjslfkjdslfksj' },
      { id: 2, value: 'dkfjslfkjdslfksj' },
      { id: 3, value: 'dkfjslfkjdslfksj' },
    ],
  },
  {
    id: 2,
    title: 'Local source',
    count: 20,
    items: [
      { id: 1, value: 'dkfjslfkjdslfksj' },
      { id: 2, value: 'dkfjslfkjdslfksj' },
      { id: 3, value: 'dkfjslfkjdslfksj' },
    ],
  },
  {
    id: 3,
    title: 'Public source',
    count: 20,
    items: [
      { id: 1, value: 'dkfjslfkjdslfksj' },
      { id: 2, value: 'dkfjslfkjdslfksj' },
      { id: 3, value: 'dkfjslfkjdslfksj' },
    ],
  },
];

export default function DropdownOptionsModal({
  isDropdownOptionsModal,
  setIsDropdownOptionsModal,
  setChosenDropdownValue,
  chosenDropdownValue,
}) {
  const [sourceName, setSourceName] = useState('');
  const [item, setItem] = useState('');
  const [items, setItems] = useState([]);
  const [createList, setCreateList] = useState(false);
  const [selectedId, setSelectedId] = useState(chosenDropdownValue?.id ?? null);
  // const [itemToEdit, setItemToEdit] = useState(null);

  const handleAddItem = () => {
    if (item.length < 3) {
      return;
    }
    setItems([...items, { id: Date.now(), value: item }]);
    setItem('');
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (e) => {
    setItem(e.target.value);
  };

  const handleSelectId = (id) => {
    if (selectedId === id) {
      setSelectedId(null);
      return;
    }
    setSelectedId(id);
  };

  const handleEditList = (list = null) => {
    if (list) {
      setSourceName(list.title);
      setItems(list.items);
      // setItemToEdit(list);
    } else {
      setSourceName('');
      setItems([]);
      // setItemToEdit(null);
    }
    setCreateList(true);
    setSelectedId(list?.id || null);
  };

  const handleCancelEditList = () => {
    setCreateList(false);
    // setSelectedId(null);
    // setItemToEdit(null);
    setSourceName('');
    setItems([]);
    setItem('');
  };

  const handleDone = () => {
    setChosenDropdownValue(sourcelist.find(({ id }) => id === selectedId));
    setIsDropdownOptionsModal(false);
    // setSelectedId(null);
  };

  return (
    <Modal
      isOpen={isDropdownOptionsModal}
      onClose={() => setIsDropdownOptionsModal(false)}
      position="right"
      width="max-w-[460px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col">
        <div className="space-y-0.5 p-5 border-b border-secondary-200">
          <p className="text-base font-semibold font-geist text-primary">
            Dropdown options
          </p>
          <p className="text-sm font-geist text-tertiary">
            Set-up dropdown list
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center">
          {sourcelist.length < 1 && !createList && (
            <div className="items-center flex flex-col justify-center w-full mt-38.5">
              <RiLinkM size={24} className="text-tertiary-800" />
              <h1 className="font-medium mt-1 font-geist text-primary text-sm">
                Add a task list
              </h1>

              <p className="text-tertiary font-geist text-xs w-52 text-center mt-1 mb-5">
                Create a reusable list source to use across checklists.
              </p>

              <Button
                className="bg-white gap-1 p-2.5 rounded-[10px] border border-secondary-200"
                onClick={() => setCreateList(true)}
              >
                <IoAddOutline className="text-primary-200" size={14} />
                <p className="text-primary-200 font-geist font-medium text-sm">
                  Create new list
                </p>
              </Button>
            </div>
          )}

          {sourcelist.length > 1 && !createList && (
            <div className="flex flex-col gap-4 w-full py-6 px-5">
              {sourcelist.map(({ id, title, count, items }) => {
                const isActive = id === selectedId;
                return (
                  <div
                    className={`flex w-full items-center justify-between border  rounded-[10px] py-3 px-3.5 hover:bg-gray-50 ${isActive ? 'border-primary-200' : 'border-secondary-200'}`}
                    key={id}
                    onClick={() => handleSelectId(id)}
                  >
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-primary font-medium">
                        {title}
                      </p>
                      <p className="text-tertiary text-xs">{count} items</p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <Button
                        className="text-primary-200"
                        onClick={() =>
                          handleEditList({ id, title, count, items })
                        }
                      >
                        Edit
                      </Button>
                      <Button className="text-tertiary">Delete</Button>
                    </div>
                  </div>
                );
              })}

              <Button
                className="bg-white gap-1 p-1"
                onClick={() => handleEditList()}
              >
                <IoAddOutline className="text-primary-200" size={14} />
                <p className="text-primary-200 font-geist font-medium text-sm">
                  Create new source
                </p>
              </Button>
            </div>
          )}

          {createList && (
            <div className="flex flex-col w-full py-6 px-5">
              <InputField
                label="Source name"
                id="sourceName"
                className="mb-1"
                value={sourceName}
                required
                onChange={(e) => setSourceName(e.target.value)}
              />

              <div className="w-full mt-4">
                <label
                  htmlFor={'items'}
                  className={`mb-2 block font-geist text-sm font-regul text-secondary`}
                >
                  Items
                </label>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex py-3 mb-4 px-3.5 rounded-2xl border border-secondary-200 bg-tertiary-700 items-center w-full justify-between"
                  >
                    <p className="text-secondary text-sm">{item.value}</p>
                    <IoClose
                      size={14}
                      className="text-tertiary-500"
                      onClick={() => handleRemoveItem(item.id)}
                    />
                  </div>
                ))}
                <div className="flex items-center gap-4">
                  <input
                    id={'items'}
                    name={'items'}
                    type="text"
                    value={item}
                    onChange={(e) => handleItemChange(e)}
                    placeholder={'Enter item'}
                    onKeyDown={(e) => {
                      if (e.key.toLowerCase() === 'enter') {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    className={
                      'w-full rounded-2xl border border-secondary-200 bg-white px-4 py-4 font-geist text-sm text-primary outline-none transition placeholder:text-secondary focus:border-primary-200/75 focus:ring-2 focus:ring-primary/10'
                    }
                  />
                  <Button
                    className="flex gap-1 items-center p-3 border-primary-300 border bg-tertiary-700 rounded-[10px] disabled:opacity-30"
                    onClick={handleAddItem}
                    disabled={item.length < 3}
                  >
                    <IoAddOutline className="text-primary" size={14} />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center mt-6 p-5 border-t border-secondary-200 justify-end gap-3">
          {createList ? (
            <Button
              type="button"
              onClick={() => handleCancelEditList()}
              className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setIsDropdownOptionsModal(false)}
              className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
            >
              Cancel
            </Button>
          )}

          {sourcelist.length < 1 && !createList && (
            <Button
              type="button"
              className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white"
            >
              Create new list
            </Button>
          )}
          {sourcelist.length > 1 && !createList && (
            <Button
              type="button"
              className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white"
              onClick={() => handleDone()}
            >
              Continue
            </Button>
          )}
          {createList && (
            <Button
              type="button"
              className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white"
            >
              Save
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
