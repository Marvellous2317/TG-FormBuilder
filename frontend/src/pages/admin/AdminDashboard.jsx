import React from 'react';
import { IoAddOutline } from 'react-icons/io5';
import Button from '../../shared/components/Button';

export default function AdminDashboard() {
  return (
    <div className="w-full min-h-screen">
      <header className="flex w-full px-8 py-2.5 border-b border-secondary-200 items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-primary text-xl font-medium font-geist">
            Dashboard
          </h1>
          <p className="text-sm text-tertiary font-geist">
            Here’s an overview of your task list
          </p>
        </div>
        <Button className="bg-primary-200 gap-1 p-2.5 rounded-[10px]">
          <IoAddOutline className="text-white" size={14} />
          <p className="text-white">Add a task list</p>
        </Button>
      </header>
    </div>
  );
}
