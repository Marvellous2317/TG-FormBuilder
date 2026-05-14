import React, { useEffect, useState } from 'react';
import Button from '../../shared/components/Button';
import InputField from '../../shared/components/InputField';
import Icons from '../../assets/icons';
import { useAuthStore } from '../../shared/store/authStore';
import useToast from '../../shared/hooks/useToast';
import { useProfile, useProfileUpdate } from '../../shared/hooks/useAuth';
import Loader from '../../shared/components/Loader';
import SignatureModal from '../approver/components/SignatureModal';
import clearAllCaches from '../../lib/clearCache';

export default function Settings() {
  const { clearAuth, user, setUser } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.role?.roleName || '',
  });

  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

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
    if (profileData) setUser(profileData);
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

  const handleLogout = () => {
    clearAuth();
    clearAllCaches();
  };

  return (
    <div className="w-full min-h-screen bg-secondary-200/20">
      <section className="py-5 px-4 sm:px-6 lg:px-25 gap-1 border-b border-secondary-200">
        <h2 className="font-medium text-primary text-xl">Settings</h2>
        <p className="text-xs text-tertiary">
          Edit your profile and log out of your account
        </p>
      </section>

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
              onClick={() => handleLogout()}
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

              {user?.role?.roleName?.toLowerCase() === 'approval' &&
                profileData?.signature && (
                  <div className="flex flex-col md:flex-row gap-2 items-end">
                    <div>
                      <h2 className=" mb-2 block font-geist text-sm font-regular text-secondary">
                        Approver signature
                      </h2>
                      <img
                        src={profileData?.signature}
                        alt="User Profile"
                        className="w-16 h-16 bg-secondary-700 object-contain rounded-2xl p-3 border border-secondary-200 shadow-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      className="bg-primary-200 px-3 py-3 rounded-xl"
                      onClick={() => setIsSignatureModalOpen(true)}
                    >
                      <p className="text-white font-geist font-medium text-sm">
                        Update signature
                      </p>
                    </Button>
                  </div>
                )}
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
      <SignatureModal
        isSignatureModalOpen={isSignatureModalOpen}
        setIsSignatureModalOpen={setIsSignatureModalOpen}
      />
    </div>
  );
}
