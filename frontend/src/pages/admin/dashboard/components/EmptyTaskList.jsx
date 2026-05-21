import React from 'react';
import Button from '../../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import Icons from '../../../../assets/icons';

export default function EmptyTaskList({ setIsShowLogbookModal }) {
  return (
    <div className="items-center flex flex-col justify-center w-full mt-24">
      <img
        src={Icons.documentIcon}
        alt="empty document"
        className="w-10 mb-3"
      />

      <h1 className="font-semibold font-geist text-primary text-sm">
        Add a task list
      </h1>

      <p className="text-tertiary font-geist text-xs w-52 text-center mt-1 mb-5">
        Create your first task list and define your data structure
      </p>

      <Button
        className="bg-primary-200 gap-1 p-2.5 rounded-[10px]"
        onClick={() => setIsShowLogbookModal(true)}
      >
        <IoAddOutline className="text-white" size={14} />
        <p className="text-white font-geist font-medium text-sm">
          Add a task list
        </p>
      </Button>
    </div>
  );
}
