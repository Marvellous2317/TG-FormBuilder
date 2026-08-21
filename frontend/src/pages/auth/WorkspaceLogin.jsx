import React, { useState } from 'react';
import Button from '../../shared/components/Button';
import Images from '../../assets/images';
import Loader from '../../shared/components/Loader';
import useToast from '../../shared/hooks/useToast';
import { useAuthStore } from '@/shared/store/authStore';
import { useSwitchWorkspace } from '@/shared/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const SAMPLE_WORKSPACES = [
  {
    id: 1,
    name: 'Packaging Line A',
  },
  {
    id: 2,
    name: 'Quality Assurance Lab',
  },
  {
    id: 3,
    name: 'Central Warehouse',
  },
  {
    id: 4,
    name: 'Bottling & Assembly Hub',
  },
  {
    id: 5,
    name: 'Maintenance & Operations',
  },
  {
    id: 6,
    name: 'Research & Development',
  },
  {
    id: 7,
    name: 'Global Supply Chain',
  },
];

function WorkspaceLogin() {
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const { showError, showSuccess } = useToast();
  const { user } = useAuthStore();

  const workspaceCompanies = user?.companies;

  const navigate = useNavigate();

  const { mutateAsync: switchWorkspace, isPending: isSwitchingWorkspace } =
    useSwitchWorkspace();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedWorkspace) {
      showError('Please select a workspace to continue');
      return;
    }

    try {
      await switchWorkspace({ companyId: selectedWorkspace.companyId });
      showSuccess('Workspace switched successfully');
      navigate('/admin');
    } catch (error) {
      console.error(error);
    }
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
            Welcome to Workspace
          </h1>
          <p className="mb-6 mt-1 font-geist text-xs text-tertiary md:mb-7">
            Select your workspace to continue
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="max-h-64 overflow-y-auto rounded-2xl border border-gray-200 p-2 space-y-2">
              {workspaceCompanies.map((workspace) => {
                const isSelected =
                  selectedWorkspace?.companyId === workspace.companyId;
                return (
                  <div
                    key={workspace.companyId}
                    onClick={() => setSelectedWorkspace(workspace)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary-200 bg-primary-50/40 text-primary shadow-xs'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg font-geist font-semibold text-sm ${
                          isSelected
                            ? 'bg-primary-200 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {workspace.companyName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-geist text-sm font-medium text-gray-900">
                          {workspace.companyName}
                        </h4>
                      </div>
                    </div>

                    <div className="ml-3 shrink-0">
                      {isSelected ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-200 text-white">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="3"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-gray-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              type="submit"
              className="mt-3 w-full rounded-2xl bg-primary-200 px-4 py-3.5 font-geist text-base font-medium text-white hover:opacity-90 disabled:bg-primary disabled:opacity-50 flex items-center justify-center cursor-pointer"
              disabled={!selectedWorkspace || isSwitchingWorkspace}
              onClick={handleSubmit}
            >
              {isSwitchingWorkspace ? <Loader /> : 'Continue'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default WorkspaceLogin;
