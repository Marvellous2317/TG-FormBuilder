import React, { useState } from 'react';
import Button from '../../shared/components/Button';
import InputField from '../../shared/components/InputField';
import Icons from '../../assets/icons';
import { useAuthStore } from '../../shared/store/authStore';
import useToast from '../../shared/hooks/useToast';

export default function Settings() {
  const { clearAuth, user } = useAuthStore();
  const { showSuccess } = useToast();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || 'Marvellous',
    lastName: user?.lastName || 'Braimah',
    email: user?.email || 'marvellousbraimah71@gmail.com',
    role: user?.role?.roleName || 'Super Admin',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    showSuccess('Profile updated successfully');
  };

  return (
    <div className="w-full min-h-screen bg-secondary-200/20">
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

      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-row justify-between items-center mb-8">
          <img
            src={Icons.userProfile}
            alt="User Profile"
            className="w-16 h-16 bg-secondary-700 object-contain rounded-2xl p-3 border border-secondary-200 shadow-sm"
          />

          <Button
            type="button"
            onClick={() => {
              clearAuth();
            }}
            className="bg-tertiary-500 gap-1 p-2.5 px-6 rounded-[12px] transition-all hover:bg-tertiary-600"
          >
            <p className="text-white font-medium text-sm">Logout</p>
          </Button>
        </div>

        <div className="bg-white rounded-3xl border border-secondary-200 p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <InputField
              id="first name"
              name="firstName"
              label="First name"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full"
            />

            <InputField
              id="last name"
              name="lastName"
              label="Last name"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="email"
              name="email"
              label="Email address"
              type="email"
              value={formData.email}
              readOnly={true}
              inputClassName="bg-secondary-700!"
              className="w-full"
            />

            <InputField
              id="role"
              name="role"
              label="Role"
              type="text"
              value={formData.role}
              readOnly={true}
              className="w-full"
              inputClassName="bg-secondary-700!"
            />
          </div>

          <div className="flex justify-end mt-10">
            <Button
              type="button"
              onClick={handleSaveChanges}
              className="bg-primary-200 gap-1 p-3 px-8 rounded-[12px] transition-all hover:opacity-90 active:scale-95"
            >
              <p className="text-white font-geist font-medium text-sm">
                Save Changes
              </p>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
