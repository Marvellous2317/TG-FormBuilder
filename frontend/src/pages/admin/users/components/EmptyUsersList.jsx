import React from 'react';
import Button from '../../../../shared/components/Button';
import { IoAddOutline } from 'react-icons/io5';
import Icons from '../../../../assets/icons';

export default function EmptyUsersList({ setIsInviteModalOpen }) {
  return (
    <div className="items-center flex flex-col justify-center w-full mt-24">
      <img
        src={Icons.inviteUserIcon}
        alt="empty document"
        className="w-10 mb-3"
      />

      <h1 className="font-semibold font-geist text-primary text-sm">
        Invite a user
      </h1>

      <p className="text-tertiary font-geist text-xs w-52 text-center mt-1 mb-5">
        Invite users within your entity to start using the platform
      </p>

      <Button
        className="bg-primary-200 gap-1 p-2.5 rounded-[10px]"
        onClick={() => setIsInviteModalOpen(true)}
      >
        <IoAddOutline className="text-white" size={14} />
        <p className="text-white font-geist font-medium text-sm">
          Invite users
        </p>
      </Button>
    </div>
  );
}
