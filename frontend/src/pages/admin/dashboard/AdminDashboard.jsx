import React from 'react';
import { IoAddOutline } from 'react-icons/io5';
import Button from '../../../shared/components/Button';
import AdminCard from './components/AdminCard';
import TaskList from './components/TaskList';
import EmptyTaskList from './components/EmptyTaskList';

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
          <p className="text-white font-geist font-medium text-sm">
            Add a task list
          </p>
        </Button>
      </header>

      <section className="py-6 px-8">
        <div className="flex flex-col md:flex-row items-center w-full gap-9 ">
          <AdminCard
            icon="/icons/created-icon.png"
            title="Created logs"
            count="150"
          />
          <AdminCard
            icon="/icons/submit-icon.png"
            title="Submitted logs"
            count="150"
          />
          <AdminCard
            icon="/icons/pending-icon.png"
            title="Pending logs"
            count="150"
          />
        </div>
      </section>

      <section className="py-6 px-8">
        {[1].length > 0 ? <TaskList /> : <EmptyTaskList />}
      </section>
    </div>
  );
}
