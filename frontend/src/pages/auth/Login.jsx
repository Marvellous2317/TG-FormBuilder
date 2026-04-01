import React, { useState } from 'react';
import InputField from '../../components/InputField';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: connect to auth API
    console.log('Login form submitted:', formData);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <section className="h-full w-1/2">
        <img
          src="/images/login-bg.png"
          alt="login image"
          className="h-full w-full object-cover"
        />
      </section>

      <section className="flex w-1/2 flex-col items-center justify-center px-10">
        <div className="w-full max-w-md">
          <h1 className="font-geist text-xl font-semibold text-primary">
            Welcome to KTNL Portal
          </h1>
          <p className="mt-1 font-geist text-xs text-tertiary">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <InputField
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
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
              autoComplete="current-password"
            />

            <button
              type="submit"
              className="w-full rounded-2xl bg-primary-200 px-4 py-3.5 font-geist text-base font-medium text-white transition-all duration-150 ease-in-out hover:opacity-90 active:scale-95 cursor-pointer disabled:bg-primary"
              disabled={!formData.email || !formData.password}
            >
              Login
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Login;
