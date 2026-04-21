import React from 'react';
import Button from '../../shared/components/Button';
import InputField from '../../shared/components/InputField';
import Icons from '../../assets/icons';
import { useAuthStore } from '../../shared/store/authStore';

export default function Settings() {
  const userFirstName = 'Marvellous';

  const userLastName = 'Braimah';

  const userEmail = 'marvellousbraimah71@gmail.com';

  const userRole = 'Super Admin';

  const { clearAuth } = useAuthStore();

  return (
    <div className="w-full min-h-screen max-h-screen">
      <header className="flex flex-col md:flex-row gap-3 md:gap-0 w-full px-8 py-2.5 border-b border-secondary-200 md:items-center items-start justify-between">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-primary text-xl font-medium font-geist">
            Settings
          </h1>
          <p className="text-sm text-tertiary font-geist">
            Edit your profile and log out of your account
          </p>
        </div>
      </header>

      <section className="lg:max-w-300 lg:mx-auto lg:h-fit">
        <div className="flex flex-row justify-between items-center px-8 mt-5 mb-4">
          <img
            src={Icons.userProfile}
            alt="User Profile"
            className="w-12 h-12 bg-secondary-700 object-contain rounded-lg p-2 lg:ml-23"
          />

          <Button
            type="button"
            onClick={() => {
              clearAuth();
            }}
            className="bg-tertiary-500 gap-1 p-2.5 px-4 rounded-[10px] lg:mr-23"
          >
            <p className="text-white font-medium text-sm">Logout</p>
          </Button>
        </div>

        <div className="flex flex-col gap-6 p-5.5 lg:items-center lg:justify-center">
          <div className="flex flex-col gap-6 md:flex-row md:gap-6 w-full items-center justify-between">
            <InputField
              id="first name"
              name="first name"
              label="First name"
              type="text"
              value={userFirstName}
              className="w-full"
            />

            <InputField
              id="last name"
              name="last name"
              label="Last name"
              type="text"
              value={userLastName}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:gap-6 w-full items-center justify-between">
            <InputField
              id="email"
              name="email"
              label="Email address"
              type="email"
              value={userEmail}
              readOnly={true}
              inputClassName="bg-secondary-700!"
              className="w-full"
            />

            <InputField
              id="role"
              name="role"
              label="Role"
              type="text"
              value={userRole}
              readOnly={true}
              className="w-full"
              inputClassName="bg-secondary-700!"
            />
          </div>
        </div>
      </section>

      <section className="pb-10 lg:max-w-300 lg:mx-auto lg:h-fit">
        <Button
          type="button"
          onClick={() => {}}
          className="bg-primary-200 gap-1 p-2.5 px-4 rounded-[10px] mt-6.5 ml-auto mr-5.5 lg:mr-31 lg:mt-30 "
        >
          <p className="text-white font-geist font-medium text-sm">
            Save Changes
          </p>
        </Button>
      </section>
    </div>
  );
}
