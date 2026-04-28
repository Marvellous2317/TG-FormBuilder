import React, { useEffect, useState } from 'react';
import Button from '../../shared/components/Button';
import InputField from '../../shared/components/InputField';
import Icons from '../../assets/icons';
import { useAuthStore } from '../../shared/store/authStore';
import useToast from '../../shared/hooks/useToast';
import { useProfile, useProfileUpdate } from '../../shared/hooks/useAuth';
import Loader from '../../shared/components/Loader';

export default function Settings() {
  const { clearAuth, user } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.role?.roleName || '',
  });

  const { data: profile, isPending: isLoadingProfile } = useProfile();

  const profileData = profile?.data?.user;

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useProfileUpdate();

  useEffect(() => {
    setFormData({
      firstName: profileData?.firstName || user?.firstName || '',
      lastName: profileData?.lastName || user?.lastName || '',
      email: user?.email || '',
      role: user?.role?.roleName || '',
    });
  }, [user, profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      showSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error', error);
      showError('Unable to update profile. Please try again.');
    }
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

      {isLoadingProfile ? (
        <Loader size="h-12 w-12 !border-primary-200 mt-20" />
      ) : (
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
              className="bg-tertiary-500 gap-1 p-2.5 px-6 rounded-xl transition-all hover:bg-tertiary-600"
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
                // readOnly={true}
                disabled
                // inputClassName="bg-secondary-700! cursor-not-allowed"
                // className="w-full cursor-not-allowed"
              />

              <InputField
                id="role"
                name="role"
                label="Role"
                type="text"
                value={formData.role}
                // readOnly={true}
                disabled
                // inputClassName="bg-secondary-700! cursor-not-allowed"
                // className="w-full cursor-not-allowed"
              />
            </div>

            <div className="flex justify-end mt-10">
              <Button
                type="button"
                onClick={handleSaveChanges}
                className="bg-primary-200 p-3 px-5 rounded-xl flex items-center gap-2"
              >
                <p className="text-white font-geist font-medium text-sm">
                  Save Changes
                </p>
                {isUpdatingProfile && (
                  <Loader size="border-white! h-4.5 w-4.5" />
                )}
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
