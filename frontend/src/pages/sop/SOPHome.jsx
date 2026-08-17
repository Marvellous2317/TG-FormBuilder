import React from 'react';
import {
  FaEye,
  FaUserShield,
  FaClipboardList,
  FaCheckCircle,
} from 'react-icons/fa';
import SOPTopBar from './components/SOPTopBar';
import SOPHero from './components/SOPHero';
import SectionDivider from './components/SectionDivider';
import SectionHeading from './components/SectionHeading';
import StepTimeline from './components/StepTimeline';
import RoleCard from './components/RoleCard';
import SOPScreenshot from './components/SOPScreenshot';
import SubSectionHeading from './components/SubSectionHeading';
import AdminTypeCard from './components/AdminTypeCard';
import StagePanel from './components/StagePanel';
import { FiSettings } from 'react-icons/fi';

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

const adminTypes = [
  {
    title: 'Read-Only Admin',
    description:
      'Can view the Submissions list and export submissions. Cannot create, edit, or delete logbooks or forms.',
    icon: FaEye,
  },
  {
    title: 'Read-and-Write Admin',
    description:
      "Full permissions: creates users, creates and edits logbooks, and is the only role able to edit a form's data after it has already been approved.",
    icon: FiSettings,
  },
];

const creatingUsersSteps = [
  {
    title: 'Log in with a Read-and-Write Admin account',
  },
  {
    title: 'Navigate to User Management',
  },
  {
    title: 'Create a new user account',
    description:
      'Set their role: Operator, Approver, Admin(Read-Only, or Admin – Read-and-Write), select their department, add their names and their email address.',
  },
  {
    title: 'System sends an OTP email to the invited user',
    description: 'They follow the login flow in Section 3.',
  },
];

const logbookSetupFields = [
  'Department',
  'Frequency (hourly / daily / weekly)',
  'Requires approval? (toggle)',
  'Approval mode: Sequential or Parallel',
  'Assigned Approvers',
  'Assigned Operators',
  'Logbook title',
  'Document number',
  'Issued number',
];

export default function SOPHome() {
  return (
    <div className="flex min-h-screen w-full flex-col font-inter bg-white">
      <SOPTopBar />

      <SOPHero />

      <SectionDivider />

      <section className="w-full px-32">
        <SectionHeading number="01" title="Purpose" />
        <p className="mt-9 text-[15px] leading-6.75">
          This SOP defines the step-by-step procedures for using the Digital
          Packaging Logbook application. It covers how each user type (Admin
          Read-Only and Read-and-Write, Operator, and Approver) logs into and
          operates the system, so that logbook records are created, submitted,
          reviewed, and approved consistently and remain audit-ready.
        </p>
      </section>

      <SectionDivider />

      <section className="w-full px-32">
        <SectionHeading number="02" title="Scope" />
        <p className="mt-9 text-[15px] leading-6.75">
          This SOP applies to all users of the Digital Packaging Logbook
          application, regardless of assigned role. It covers login, account
          setup, and day-to-day use of the application for each role. It does
          not cover backend system configuration or IT infrastructure
          administration.
        </p>
      </section>

      <SectionDivider />

      <section className="w-full px-32">
        <SectionHeading
          number="03"
          title="Account Setup & Login"
          badge="All roles"
        />

        <p className="mt-9 text-[15px] leading-6.75">
          Every user, regardless of role, accesses the application through a{' '}
          <span className="font-bold">single shared link</span>. What they see
          after logging in is determined entirely by their assigned role.
        </p>

        <StepTimeline steps={accountSetupSteps} />
      </section>

      <SectionDivider />

      <section className="w-full px-32">
        {firstSectionImages.map((image) => (
          <SOPScreenshot
            key={image.id}
            src={image.src}
            alt={`${image.id} image`}
          />
        ))}
      </section>

      <SectionDivider />

      <section className="w-full px-32">
        <SectionHeading number="04" title="System Roles Overview" />
        <p className="mt-9 text-[15px] leading-6.75">
          Four distinct roles govern what each user can see and do inside
          DigiForms.
        </p>

        <div className="mt-9 flex flex-col gap-6">
          {systemRoles.map((role) => (
            <React.Fragment key={role.title}>
              <RoleCard
                title={role.title}
                subtitle={role.subtitle}
                icon={role.icon}
                bg={role.bg}
                permissions={role.permissions}
              />
              <SOPScreenshot src={role.src} alt={`${role.title} screenshot`} />
            </React.Fragment>
          ))}
        </div>
      </section>

      <SectionDivider />

      <section className="w-full px-32">
        <RoleCard
          title="SOP for Admin Users"
          subtitle="Section 5: Covers both Read-Only and Read-and-Write Admin roles"
          icon={FiSettings}
          bg={'bg-sop-500'}
          showPermissions={false}
        />

        <div className="mt-12">
          <SubSectionHeading number="5.1" title="Admin Types" />
          <div className="mt-6 grid grid-cols-2 gap-5">
            {adminTypes.map((adminType) => (
              <AdminTypeCard
                key={adminType.title}
                title={adminType.title}
                description={adminType.description}
                icon={adminType.icon}
              />
            ))}
          </div>
        </div>

        <div className="mt-12">
          <SubSectionHeading number="5.2" title="Creating Users" />
          <StepTimeline steps={creatingUsersSteps} />
        </div>
      </section>

      <SectionDivider />

      <section className="w-full px-32">
        <SOPScreenshot key={`11`} src={`/sop/11.png`} alt={`11 image`} />
        <SOPScreenshot key={`12`} src={`/sop/12.png`} alt={`12 image`} />
      </section>

      <section className="w-full px-32">
        <div className="mt-12">
          <SubSectionHeading number="5.3" title="Creating a Logbook" />
          <p className="mt-4 text-[15px] leading-6.75">
            A logbook is created in two stages: the setup form, then defining
            the data fields.
          </p>

          <div className="mt-6">
            <StagePanel
              label="Stage 1: Logbook Setup Form"
              items={logbookSetupFields}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
