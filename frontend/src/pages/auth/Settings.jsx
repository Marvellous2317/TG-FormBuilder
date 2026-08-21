import React, { useEffect, useState } from 'react';
import Button from '../../shared/components/Button';
import InputField from '../../shared/components/InputField';
import Icons from '../../assets/icons';
import { useAuthStore } from '../../shared/store/authStore';
import useToast from '../../shared/hooks/useToast';
import useAuth from '../../shared/hooks/useAuth';
import {
  useProfile,
  useProfileUpdate,
  useSwitchWorkspace,
} from '../../shared/hooks/useAuth';
import Loader from '../../shared/components/Loader';
import SignatureModal from '../approver/components/SignatureModal';
import clearAllCaches from '../../lib/clearCache';
import { useQueryClient } from '@tanstack/react-query';

export default function Settings() {
  const queryClient = useQueryClient();
  const { clearAuth, user } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const [selectedWorkspace, setSelectedWorkspace] = useState('');

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    role: user?.role?.roleName || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { changePassword, isChangingPassword } = useAuth();
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  const { data: profile, isPending: isLoadingProfile } = useProfile();
  const profileData = profile?.data?.user;

  const workspaceCompanies = (user?.companies ?? []).map((c) => {
    return { label: c.companyName, value: c.companyId };
  });

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useProfileUpdate();
  const { mutateAsync: switchWorkspace, isPending: isSwitchingWorkspace } =
    useSwitchWorkspace();

  // Role validation for Corporate Admin
  const currentRole = (
    profileData?.role?.roleName ||
    user?.role?.roleName ||
    profileData?.role ||
    user?.role ||
    ''
  )
    .toString()
    .toLowerCase()
    .replace(/[_\s-]+/g, ' ')
    .trim();

  const isCorporateAdmin =
    currentRole === 'corporate admin' || currentRole.includes('corporate');

  const handleWorkspaceSelectChange = async (companyId) => {
    if (!companyId || companyId === selectedWorkspace) return;

    try {
      await switchWorkspace({ companyId });
      setSelectedWorkspace(companyId);
      showSuccess('Workspace switched successfully');
    } catch (error) {
      showError(
        error?.response?.data?.message || 'Failed to switch workspace',
      );
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New password and confirm password do not match');
      return;
    }

    try {
      await changePassword(passwordData);
    } catch (error) {
      console.error('Error', error);
    }
  };

  useEffect(() => {
    setFormData({
      firstName: profileData?.firstName || user?.firstName || '',
      lastName: profileData?.lastName || user?.lastName || '',
      email: user?.email || '',
      role: user?.role?.roleName || '',
    });
  }, [user, profile]);

  useEffect(() => {
    const currentCompanyId =
      profileData?.companyId ??
      profileData?.company?.companyId ??
      user?.companyId ??
      user?.company?.companyId ??
      '';

    setSelectedWorkspace(currentCompanyId);
  }, [profileData, user]);

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
    }
  };

  const handleLogout = () => {
    clearAuth();
    clearAllCaches();
    queryClient.clear();
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
            <div className="flex items-center gap-4 w-2/4">
              <img
                src={Icons.userProfile}
                alt="User Profile"
                className="w-16 h-16 bg-secondary-700 object-contain rounded-2xl p-3 border border-secondary-200 shadow-sm"
              />

              {/* Workspace dropdown rendered only for Corporate Admin */}
              {isCorporateAdmin && (
                <InputField
                  id="workspace"
                  name="workspace"
                  label="Workspace"
                  options={workspaceCompanies}
                  value={selectedWorkspace}
                  onChange={(e) =>
                    handleWorkspaceSelectChange(e.target.value)
                  }
                  placeholder="Select Workspace"
                  className="w-full"
                  type="select"
                  readOnly={isSwitchingWorkspace}
                />
              )}
            </div>

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
                disabled
              />

              <InputField
                id="role"
                name="role"
                label="Role"
                type="text"
                value={formData.role}
                disabled
              />

              <div className="flex flex-col md:flex-row gap-2 items-end">
                <div>
                  <h2 className="mb-2 block font-geist text-sm font-regular text-secondary">
                    Approver signature
                  </h2>
                  {profileData?.signature && (
                    <img
                      src={profileData?.signature}
                      alt="User Profile"
                      className="w-16 h-16 bg-secondary-700 object-contain rounded-2xl p-3 border border-secondary-200 shadow-sm"
                    />
                  )}
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

          <div className="bg-white rounded-3xl border border-secondary-200 p-6 md:p-8 shadow-sm mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputField
                id="current password"
                name="currentPassword"
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full"
              />

              <InputField
                id="new password"
                name="newPassword"
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                id="confirm password"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="flex justify-end mt-10">
              <Button
                type="button"
                onClick={handleSavePassword}
                className="bg-primary-200 p-3 px-5 rounded-xl flex items-center gap-2"
              >
                <p className="text-white font-geist font-medium text-sm">
                  Save Password
                </p>
                {isChangingPassword && (
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
        toUpdate={true}
      />
    </div>
  );
}
