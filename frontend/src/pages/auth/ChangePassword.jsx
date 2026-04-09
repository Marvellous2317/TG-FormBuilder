import React, { useState } from 'react';
import InputField from '../../shared/components/InputField';
import Button from '../../shared/components/Button';
import Images from '../../assets/images';
import useToast from '../../shared/hooks/useToast';
import useAuth from '../../shared/hooks/useAuth';

function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { showError } = useToast();

  const { changePassword, isChangingPassword } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      showError(
        'Invalid password',
        'New password and confirm password do not match',
      );
      return;
    }
    await changePassword(formData);
  };

  return (
    <div className="flex h-screen w-full flex-col md:flex-row">
      {/* Left / Top Section with Image and Text */}
      <section className="relative h-64 w-full md:h-full md:w-1/2">
        <img
          src={Images.loginBg}
          alt="login image"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-start justify-end p-6 pb-12 md:p-10 lg:p-20">
          <img
            src={Images.logo}
            alt="logo"
            className="h-8 w-8 md:h-11 md:w-11"
          />
          <h1 className="mt-4 font-geist text-2xl font-semibold leading-tight text-white md:text-[32px] md:leading-12">
            KTNL Logbook
          </h1>
          <p className="mt-2 text-sm font-medium text-white md:mt-1.25 md:text-base lg:w-120 font-geist">
            Track, manage, and secure your operational records in one
            centralized platform. Stay compliant, stay organized, and never miss
            a critical entry.
          </p>
        </div>
      </section>

      {/* Right / Bottom Section with Form */}
      <section className="flex w-full flex-col items-center justify-center overflow-y-auto p-4 md:w-1/2 md:p-10 lg:p-16">
        <div className="w-full max-w-99">
          <h1 className="font-geist text-xl font-semibold text-primary">
            Change Password
          </h1>
          <p className="mb-6 mt-1 font-geist text-xs text-tertiary md:mb-7">
            Change your default password
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <InputField
              id="currentPassword"
              name="currentPassword"
              label="Old password"
              type="password"
              // placeholder="Old password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />

            <InputField
              id="newPassword"
              name="newPassword"
              label="New password"
              type="password"
              // placeholder="New password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />

            <InputField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              // placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="mt-3 w-full rounded-2xl bg-primary-200 px-4 py-3.5 font-geist text-base font-medium text-white hover:opacity-90 disabled:bg-primary disabled:opacity-50 flex items-center justify-center"
              disabled={
                !formData.currentPassword ||
                !formData.newPassword ||
                !formData.confirmPassword ||
                isChangingPassword
              }
            >
              {isChangingPassword ? 'Changing...' : 'Change password'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default ChangePassword;
