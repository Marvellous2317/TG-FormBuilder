import { useState } from 'react';
import Modal from '../../../../shared/components/Modal';
import InputField from '../../../../shared/components/InputField';
import Button from '../../../../shared/components/Button';
import { RiLinkM } from 'react-icons/ri';
import { IoAddOutline, IoClose } from 'react-icons/io5';
import {
  useChecklistCatalogs,
  useCreateChecklistCatalogs,
  useUpdateChecklistCatalogs,
} from '../../../../shared/hooks/admin/useChecklist';
import Loader from '../../../../shared/components/Loader';
import useToast from '../../../../shared/hooks/useToast';
import DeleteCatalogModal from './DeleteCatalogModal';

export default function DropdownOptionsModal({
  isDropdownOptionsModal,
  setIsDropdownOptionsModal,
  onSave,
  initialValue,
}) {
  const [sourceName, setSourceName] = useState('');
  const [item, setItem] = useState('');
  const [items, setItems] = useState([]);
  const [createList, setCreateList] = useState(false);
  const [editList, setEditList] = useState(false);
  const [isDeleteCatalogModalOpen, setIsDeleteCatalogModalOpen] =
    useState(false);
  const [selectedId, setSelectedId] = useState(initialValue?.id ?? null);

  const { showError, showSuccess } = useToast();

  const { mutateAsync: createCatalog, isPending: isCreatingCatalog } =
    useCreateChecklistCatalogs();
  const { mutateAsync: updateCatalog, isPending: isUpdatingCatalog } =
    useUpdateChecklistCatalogs();

  const { data, isPending: isLoadingChecklistCatalogs } =
    useChecklistCatalogs();

  const catalogData = data?.data?.catalogs;

  const handleAddItem = () => {
    if (item.length < 3) {
      return;
    }
    setItems([...items, item]);
    setItem('');
  };

  const handleRemoveItem = (index) => {
    setItems(items.toSpliced(index, 1));
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
      setSourceName(list.name);
      setItems(list.list);
      setSelectedId(list?.catalogId);
      setEditList(true);
      setCreateList(false);
    } else {
      setSourceName('');
      setItems([]);
      setSelectedId(null);
      setCreateList(true);
      setEditList(false);
    }
  };

  const handleDelete = (catalogId) => {
    if (catalogId) {
      setSelectedId(catalogId);
      setIsDeleteCatalogModalOpen(true);
    } else {
      setSelectedId(null);
    }
  };

  const handleCancelEditList = () => {
    setCreateList(false);
    setEditList(false);
    setSourceName('');
    setItems([]);
    setItem('');
  };

  const handleDone = () => {
    const selected = catalogData?.find(
      ({ catalogId }) => catalogId === selectedId,
    );
    if (!selected) {
      showError('Please select a list');
      return;
    }
    onSave({ id: selected.catalogId, title: selected.name });
    setIsDropdownOptionsModal(false);
  };

  const handleCreate = async () => {
    if (!sourceName.trim()) {
      showError('Please enter a source name');
      return;
    }
    if (items.length === 0) {
      showError('Please add at least one item');
      return;
    }

    try {
      await createCatalog({
        name: sourceName,
        list: items,
      });
      showSuccess('Catalog created successfully');
      handleCancelEditList();
    } catch (error) {
      showError(error.message || 'An error occurred');
    }
  };

  const handleSave = async () => {
    if (!sourceName.trim()) {
      showError('Please enter a source name');
      return;
    }
    if (items.length === 0) {
      showError('Please add at least one item');
      return;
    }

    try {
      await updateCatalog({
        catalogId: selectedId,
        payload: {
          name: sourceName,
          list: items,
        },
      });
      showSuccess('Catalog updated successfully');
    } catch (error) {
      showError(error.message || 'An error occurred');
    }

    handleCancelEditList();
  };

  return (
    <Modal
      isOpen={isDropdownOptionsModal}
      onClose={() => setIsDropdownOptionsModal(false)}
      position="right"
      width="max-w-[460px]"
      // className="overflow-hidden"
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

        {isLoadingChecklistCatalogs ? (
          <Loader size="h-12 w-12 mt-20" />
        ) : (
          <div className="flex-1 flex flex-col items-center">
            {catalogData?.length < 1 && !createList && (
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

            {catalogData?.length > 0 && !createList && !editList && (
              <div className="flex flex-col gap-4 w-full py-6 px-5">
                {catalogData?.map(({ catalogId, name, list }) => {
                  const isActive = catalogId === selectedId;
                  const count = list?.length;
                  return (
                    <div
                      className={`flex w-full cursor-pointer items-center justify-between border  rounded-[10px] py-3 px-3.5 hover:bg-gray-50 ${isActive ? 'border-primary-200' : 'border-secondary-200'}`}
                      key={catalogId}
                      onClick={() => handleSelectId(catalogId)}
                    >
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-primary font-medium">
                          {name}
                        </p>
                        <p className="text-tertiary text-xs">{count} items</p>
                      </div>
                      <div className="flex gap-2 text-xs z-50">
                        <Button
                          className="text-primary-200"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditList({ catalogId, name, count, list });
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          className="text-tertiary"
                          onClick={() => handleDelete(catalogId)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <Button
                  className="bg-white gap-1 p-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditList();
                  }}
                >
                  <IoAddOutline className="text-primary-200" size={14} />
                  <p className="text-primary-200 font-geist font-medium text-sm">
                    Create new source
                  </p>
                </Button>
              </div>
            )}

            {(createList || editList) && (
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
                  {items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex py-3 mb-4 px-3.5 rounded-2xl border border-secondary-200 bg-tertiary-700 items-center w-full justify-between"
                    >
                      <p className="text-secondary text-sm">{item}</p>
                      <IoClose
                        size={14}
                        className="text-tertiary-500 cursor-pointer"
                        onClick={() => handleRemoveItem(index)}
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
                      disabled={item.length < 1}
                    >
                      <IoAddOutline className="text-primary" size={14} />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center mt-6 p-5 border-t border-secondary-200 justify-end gap-3">
          {createList || editList ? (
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

          {createList && (
            <Button
              type="button"
              onClick={handleCreate}
              className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white flex gap-2"
              disabled={isCreatingCatalog}
            >
              Create new list
              {isCreatingCatalog && <Loader size="h-4 w-4 border-white!" />}
            </Button>
          )}
          {catalogData?.length > 0 && !createList && !editList && (
            <Button
              type="button"
              className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white flex gap-2"
              onClick={() => handleDone()}
            >
              Continue
            </Button>
          )}
          {editList && (
            <Button
              type="button"
              className="rounded-[10px] bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white flex gap-2"
              onClick={() => handleSave()}
              disabled={isUpdatingCatalog}
            >
              Save
              {isUpdatingCatalog && <Loader size="h-4 w-4 border-white!" />}
            </Button>
          )}
        </div>
      </div>

      <DeleteCatalogModal
        isDeleteCatalogModalOpen={isDeleteCatalogModalOpen}
        setIsDeleteCatalogModalOpen={setIsDeleteCatalogModalOpen}
        catalogToDelete={selectedId}
      />
    </Modal>
  );
}
