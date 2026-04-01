import React from 'react';

export default function Unauthorized() {
  return (
    <div className="font-geist flex flex-col h-screen items-center justify-center">
      <h1 className="">You are not authorized to access this page.</h1>
      <a className="cursor-pointer underline text-sm mt-2" href="/login">
        Back to Login
      </a>
    </div>
  );
}
