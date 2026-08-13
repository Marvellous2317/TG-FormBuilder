import React from 'react';
import {
  FaChevronRight,
  FaEye,
  FaUserShield,
  FaClipboardList,
  FaCheckCircle,
} from 'react-icons/fa';

const accountSetupSteps = [
  {
    title: 'Invitation by Email',
    description: 'An Admin invites the user via email.',
  },
  {
    title: 'Receive a One-Time Password (OTP)',
    description: 'The invited user receives an OTP in their inbox.',
  },
  {
    title: 'First Login',
    description: 'Log in with the invited email address and the OTP.',
  },
  {
    title: 'Set a Permanent Password',
    description: 'On first login you are required to create your own password.',
  },
  {
    title: 'All Subsequent Logins',
    description:
      'Use your email and the password you created. No OTP needed going forward.',
  },
];

const firstSectionImages = [
  {
    id: 1,
    src: '/sop/1.png',
  },
  {
    id: 2,
    src: '/sop/2.png',
  },
  {
    id: 3,
    src: '/sop/3.png',
  },
  {
    id: 4,
    src: '/sop/4.png',
  },
  {
    id: 5,
    src: '/sop/5.png',
  },
  {
    id: 6,
    src: '/sop/6.png',
  },
];

const systemRoles = [
  {
    title: 'Admin: Read-Only',
    subtitle: 'View and export only',
    icon: FaEye,
    bg: 'bg-sop-500',
    permissions: [
      'View submissions list',
      'Export records to .xls',
      'No user creation',
      'No form editing',
      'No record deletion',
      'No logbook creation',
    ],
    src: '/sop/7.png',
  },
  {
    title: 'Admin: Read-and-Write',
    subtitle: 'Full system access',
    icon: FaUserShield,
    bg: 'bg-sop-600',
    permissions: [
      'Create & manage users',
      'Create & manage logbooks',
      'Manage assignments',
      'Export records to .xls',
      'Edit approved forms (exclusive)',
      'View submissions list',
    ],
    src: '/sop/8.png',
  },
  {
    title: 'Operator',
    subtitle: 'Fills and submits logbook entries',
    icon: FaClipboardList,
    bg: 'bg-sop-700',
    permissions: [
      'Enter logbook data',
      'Submit entries',
      'Edit while pending only',
      'Correct rejected entries',
      'Assigned logbooks only',
    ],
    src: '/sop/9.png',
  },
  {
    title: 'Approver',
    subtitle: 'Reviews and approves submissions',
    icon: FaCheckCircle,
    bg: 'bg-sop-300',
    permissions: [
      'Review submitted entries',
      'Edit before approving',
      'Approve with signature',
      'Reject with reason',
      'Record locks on approval',
    ],
    src: '/sop/10.png',
  },
];

export default function SOPHome() {
  return (
    <div className="flex min-h-screen w-full flex-col font-inter bg-white">
      <section className="flex items-center justify-between w-full px-10 py-3.5 border-b border-sop-200">
        <p className="flex items-center gap-2">
          <span className="font-bold text-sop-400 text-sm">Digiforms</span>
          <FaChevronRight className="text-sop-100 m-1" size={12} />
          <span className=" text-sop-100 text-sm">
            Standard Operating Procedure
          </span>
        </p>

        <p className="font-bold text-sm text-sop-100 mx-4 my-1">VERSION 1.0</p>
      </section>

      <section className="w-full mt-10 px-32">
        <div className="uppercase border rounded-full border-sop-400/25 bg-sop-400/8 text-sop-400 px-4 py-1.5 text-xs font-bold w-fit my-10">
          Controlled document
        </div>

        <h1 className="text-6xl font-extrabold flex flex-col mt-5">
          <span>Standard</span>
          <span className="text-sop-400">Operating</span>
          <span>Procedure</span>
        </h1>

        <p className="text-sop-800 mt-4.5">
          Digital Forms and Logbook Application.
        </p>

        <div className="mt-9 border-sop-200 rounded-xl border flex w-full">
          <div className="flex flex-col pt-4 pl-5 w-full border-r border-sop-200 h-22.75 bg-sop-300">
            <span className="font-bold text-sop-100 uppercase text-xs">
              version
            </span>
            <span className="text-sop-800 font-bold text-sm">1.0</span>
          </div>
          <div className="flex flex-col pt-4 pl-5 w-full border-r border-sop-200 h-22.75">
            <span className="font-bold text-sop-100 uppercase text-xs">
              prepared by
            </span>
            <span className="text-sop-800 font-bold text-sm">
              Roseline Amarachi
            </span>
          </div>
          <div className="flex flex-col pt-4 pl-5 w-full h-22.75 bg-sop-300">
            <span className="font-bold text-sop-100 uppercase text-xs">
              applies to
            </span>
            <span className="text-sop-800 font-bold text-sm">
              Admin, Operator, Approver
            </span>
          </div>
        </div>
      </section>

      <section className="my-16 w-full block px-32">
        <div className="w-full border border-sop-200"></div>
      </section>

      <section className="w-full px-32">
        <div className="flex flex-col">
          <span className="text-sop-400 text-sm font-bold">01</span>
          <span className="font-extrabold my-2.5 text-4xl">Purpose</span>
          <span className="w-9 border-sop-400 rounded-full border-2"></span>
        </div>
        <p className="mt-9 text-[15px] leading-6.75">
          This SOP defines the step-by-step procedures for using the Digital
          Packaging Logbook application. It covers how each user type (Admin
          Read-Only and Read-and-Write, Operator, and Approver) logs into and
          operates the system, so that logbook records are created, submitted,
          reviewed, and approved consistently and remain audit-ready.
        </p>
      </section>

      <section className="my-16 w-full block px-32">
        <div className="w-full border border-sop-200"></div>
      </section>

      <section className="w-full px-32">
        <div className="flex flex-col">
          <span className="text-sop-400 text-sm font-bold">02</span>
          <span className="font-extrabold my-2.5 text-4xl">Scope</span>
          <span className="w-9 border-sop-400 rounded-full border-2"></span>
        </div>
        <p className="mt-9 text-[15px] leading-6.75">
          This SOP applies to all users of the Digital Packaging Logbook
          application, regardless of assigned role. It covers login, account
          setup, and day-to-day use of the application for each role. It does
          not cover backend system configuration or IT infrastructure
          administration.
        </p>
      </section>

      <section className="my-16 w-full block px-32">
        <div className="w-full border border-sop-200"></div>
      </section>

      <section className="w-full px-32">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="text-sop-400 text-sm font-bold">03</span>
            <span className="uppercase border rounded-full border-sop-400/25 bg-sop-400/8 text-sop-400 px-3 py-1 text-[11px] font-bold">
              All roles
            </span>
          </div>
          <span className="font-extrabold my-2.5 text-4xl">
            Account Setup &amp; Login
          </span>
          <span className="w-9 border-sop-400 rounded-full border-2"></span>
        </div>

        <p className="mt-9 text-[15px] leading-6.75">
          Every user, regardless of role, accesses the application through a{' '}
          <span className="font-bold">single shared link</span>. What they see
          after logging in is determined entirely by their assigned role.
        </p>

        <div className="mt-9 relative flex flex-col gap-7">
          <span className="absolute left-3 top-3 bottom-3 w-px bg-sop-200" />
          {accountSetupSteps.map((step, idx) => (
            <div key={step.title} className="relative z-10 flex gap-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sop-400 text-xs font-bold text-white">
                {idx + 1}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-bold">{step.title}</span>
                <span className="mt-1 text-sm text-sop-800">
                  {step.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="my-16 w-full block px-32">
        <div className="w-full border border-sop-200"></div>
      </section>

      <section className="w-full px-32">
        {firstSectionImages.map((image) => (
          <img
            key={image.id}
            src={image.src}
            alt={`${image.id} image`}
            className="w-full my-1"
          />
        ))}
      </section>

      <section className="my-16 w-full block px-32">
        <div className="w-full border border-sop-200"></div>
      </section>

      <section className="w-full px-32">
        <div className="flex flex-col">
          <span className="text-sop-400 text-sm font-bold">04</span>
          <span className="font-extrabold my-2.5 text-4xl">
            System Roles Overview
          </span>
          <span className="w-9 border-sop-400 rounded-full border-2"></span>
        </div>
        <p className="mt-9 text-[15px] leading-6.75">
          Four distinct roles govern what each user can see and do inside
          DigiForms.
        </p>

        <div className="mt-9 flex flex-col gap-6">
          {systemRoles.map((role) => (
            <>
              <div
                key={role.title}
                className="w-full overflow-hidden rounded-xl border border-sop-200"
              >
                <div className={`flex items-center gap-3 px-5 py-4 ${role.bg}`}>
                  <role.icon className="text-lg text-sop-800" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{role.title}</span>
                    <span className="text-sm text-sop-800">
                      {role.subtitle}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-sop-200 px-5 py-4">
                  {role.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sop-400" />
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
              <img
                key={role.src}
                src={role.src}
                alt={`image`}
                className="w-full my-1"
              />
            </>
          ))}
        </div>
      </section>
    </div>
  );
}
