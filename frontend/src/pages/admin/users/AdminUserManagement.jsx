import React from 'react';
import Button from '../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import AdminCard from '../dashboard/components/AdminCard';
import UserList from './components/UserList';
import EmptyUsersList from './components/EmptyUsersList';

export default function AdminUserManagement() {
  return (
    <div className="w-full min-h-screen max-h-screen">
      <header className="flex flex-col sm:flex-row gap-3 md:gap-0 w-full px-8 py-2.5 border-b border-secondary-200 md:items-center items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-primary text-xl font-medium font-geist">Users</h1>
          <p className="text-sm text-tertiary font-geist">
            Invite and manage user roles and logbook access for your entity
          </p>
        </div>
        <Button className="bg-primary-200 gap-1 p-2.5 rounded-[10px]">
          <IoAddOutline className="text-white" size={14} />
          <p className="text-white font-geist font-medium text-sm">
            Invite users
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
        {[].length > 0 ? <UserList /> : <EmptyUsersList />}
      </section>
    </div>
  );
}
