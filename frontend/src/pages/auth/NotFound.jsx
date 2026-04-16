import React from 'react';
import { TbError404 } from 'react-icons/tb';

export default function Unauthorized() {
  return (
    <div className="font-geist flex flex-col gap-2.5 h-screen items-center justify-center">
      <TbError404 className="animate-bounce" size={30} />
      <h1 className="text-sm">Page not found.</h1>
      <a className="cursor-pointer underline text-xs mt-2" href="/login">
        Back to Login
      </a>
    </div>
  );
}
