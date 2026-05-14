import React, { useState } from 'react';
import InputField from '../../shared/components/InputField';
import Button from '../../shared/components/Button';
import Images from '../../assets/images';
import useAuth from '../../shared/hooks/useAuth';
import Loader from '../../shared/components/Loader';
import useToast from '../../shared/hooks/useToast';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { login, isLoggingIn } = useAuth();

  const { showError } = useToast();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      showError('Invalid Email');
      return;
    }

    await login(formData);
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
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 flex flex-col items-start justify-end p-6 pb-12 md:p-10 lg:p-20">
          <img
            src={Images.logo}
            alt="logo"
            className="h-8 w-8 md:h-11 md:w-11"
          />
          <h1 className="mt-4 font-geist text-2xl font-semibold leading-tight text-white md:text-[32px] md:leading-12">
            Digitalization Logbook
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
            Welcome to Digitalization Portal
          </h1>
          <p className="mb-6 mt-1 font-geist text-xs text-tertiary md:mb-7">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <InputField
              id="email"
              name="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              autoFocus
            />

            <InputField
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <a
              href="/forgot-password"
              className="text-xs font-geist flex items-end justify-end -mt-2 text-primary hover:underline"
            >
              Forgot password?
            </a>

            <Button
              type="submit"
              className="mt-3 w-full rounded-2xl bg-primary-200 px-4 py-3.5 font-geist text-base font-medium text-white hover:opacity-90  disabled:bg-primary disabled:opacity-50 flex items-center justify-center"
              disabled={!formData.email || !formData.password || isLoggingIn}
            >
              {isLoggingIn ? <Loader /> : 'Login'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Login;
