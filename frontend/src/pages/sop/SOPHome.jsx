import React from 'react';
import {
  FaEye,
  FaUserShield,
  FaClipboardList,
  FaCheckCircle,
  FaListOl,
  FaBolt,
  FaPencilAlt,
  FaDesktop,
  FaLock,
  FaImage,
  FaSave,
  FaMobileAlt,
  FaBan,
  FaSitemap,
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
import SOPCallout from './components/SOPCallout';
import SOPNote from './components/SOPNote';
import SOPSidebar from './components/SOPSidebar';
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

const logbookFieldDefinitions = [
  {
    title: 'Field: Name',
    description:
      'e.g. Date, Time, Name, Shift, Product, Batch no, observation?',
  },
  {
    title: 'Field: Type',
    description: 'e.g. Date, Time, Text, Number (selected from a dropdown)',
  },
];

const approvalModes = [
  {
    title: 'Sequential',
    caption: 'One at a time, in order',
    description:
      'The next approver in the sequence cannot see the entry or be notified until the approver before them has approved it.',
    icon: FaListOl,
  },
  {
    title: 'Parallel',
    caption: 'All approvers simultaneously',
    description:
      'All assigned approvers are notified at the same time, with no set order. Any one of them can approve the entry.',
    icon: FaBolt,
  },
];

const dropdownFieldSteps = [
  {
    title: 'Search existing sources, or create a new one.',
  },
  {
    title: 'New source',
    description:
      "Give it a name, then add items one at a time, note that typing an item is not enough; you must tap + Add for each one, or it won't be saved to the list.",
  },
  {
    title: 'For sources with many options, use Paste bulk items',
    description:
      'Paste a list with each item on its own line (separated by Enter), then tap + Add to commit the whole batch into the list pasting alone does not add them.',
  },
  {
    title:
      'Items can be removed individually (via the ×) before finalizing the list.',
  },
];

const formularFieldSteps = [
  {
    title: 'Build the expression using Quick functions.',
    description:
      'Mathematical (Sum, Subtract, Multiply, Divide, Average), Aggregation (Count, Min, Max), Advanced (If, Round, Abs, Concat), and Misc (Close, Comma, Compare).',
  },
  {
    title: 'Insert fields',
    description:
      'Insert fields directly from the Available Fields list using "Insert field” to calculate between entries. ',
  },
  {
    title: 'Standard mathematical symbols',
    description:
      'Standard mathematical symbols can also be typed directly (e.g., FIELD1+FIELD2) as an alternative to using the Sum function.',
  },
  {
    title: 'Test formula',
    description:
      'Once built, tap Test formular to validate the expression — a green "Valid expression" message confirms it\'s correct before saving.',
  },
];

const sectionFieldSteps = [
  {
    title:
      'Name the section, then add its fields (Name + Type) the same way individual fields are added elsewhere.',
  },
  {
    title:
      'Each time the Operator adds a new entry under that section, a fresh instance of all its fields is captured.',
  },
];

const sectionFormularFieldSteps = [
  {
    title:
      'Select the Section, then the specific field within it to calculate on.',
  },
  {
    title:
      'Select the operation; Sum, Subtract, Multiply, Average, Count, Min, Max, and other available operations.',
  },
  {
    title: 'Save the formula.',
  },
];

const operatorTabs = [
  {
    id: 'pending',
    title: 'Pending Tab',
    description:
      'Entries submitted but are yet to be approved. Changes can be made  whilst it is in pending.',
    icon: FaLock,
  },
  {
    id: 'approved',
    title: 'Approved Tab',
    description:
      'Entries that have completed the approval process and are now permanently locked.',
    icon: FaLock,
  },
  {
    id: 'rejected',
    title: 'Rejected Tab',
    description:
      'Entries that was rejected by the approver. These gets logged in the rejected tab. ',
    icon: FaLock,
  },
];

const dataEntrySteps = [
  {
    title: 'Open your assigned logbook',
    description: 'You only see logbooks you have been assigned to.',
  },
  {
    title: 'Enter all required data accurately and completely',
  },
  {
    title: 'Submit the entry',
    description:
      "It moves to your Pending tab and routes to the Approver(s) based on the logbook's approval mode.",
  },
];

const editEntrySteps = [
  {
    title: 'Open a pending task',
  },
  {
    title: 'Edit and update',
  },
];

const signatureSetupOptions = [
  {
    title: 'Draw it',
    description: 'Use the in-app drawing tool to sign directly on screen.',
    icon: FaPencilAlt,
  },
  {
    title: 'Upload it',
    description: 'Upload an image of your handwritten signature instead.',
    icon: FaImage,
  },
  {
    title: 'Saved to profile',
    description:
      'Stored once and applied automatically to every submission you make going forward.',
    icon: FaSave,
  },
];

const editSetupOptions = [
  {
    title: 'While pending',
    description:
      'Go back in and edit at any time before the Approver acts on it.',
    icon: FaPencilAlt,
  },
  {
    title: 'Once approved',
    description:
      'The entry is locked. Only a Read-and-Write Admin can make changes to an approved record.',
    icon: FaLock,
  },
];

const approverTabs = [
  {
    id: 'approved',
    title: 'Approved Tab',
    description:
      'Entries that have completed the approval process and are now permanently locked.',
    icon: FaLock,
  },
  {
    id: 'rejected',
    title: 'Rejected Tab',
    description:
      'Entries that was rejected by the approver. These gets logged in the rejected tab. ',
    icon: FaLock,
  },
];

const reviewApprovalSteps = [
  {
    title: 'Select a pending logbook sheet',
    description: 'On dashboard, select an entry submitted by an Operator.',
  },
  {
    title: 'Review the entry',
    description:
      "If a correction is needed, you may edit the entry's data directly before approving.",
  },
  {
    title: 'Approve (if the entry is correct)',
    description:
      'Your signature applies automatically. The record becomes locked and non-editable immediately.',
  },
  {
    title: 'Reject (if the Operator should fix it)',
    description:
      "Provide a clear, specific reason. It returns to the Operator's Pending tab for correction and re-submission.",
  },
];

const exportSubmissionSteps = [
  {
    title: 'Go to the Approved tab',
  },
  {
    title: 'Use the search function',
    description: 'Filter by date or logbook type to locate the record.',
  },
  {
    title: 'Open the record',
  },
  {
    title: 'Tap Export as PDF',
    description: 'The PDF includes all entries and the applied signatures.',
  },
];

const generalNotes = [
  {
    title: 'Offline Access',
    description:
      'DigiForms can be downloaded as an offline app. Entries made offline sync once the device reconnects. An active connection is recommended for real-time sync.',
    icon: FaMobileAlt,
  },
  {
    title: 'No Spreadsheet Workarounds',
    description:
      'All entries must go through the application, online or offline. Do not revert to Excel or paper logs under any circumstances.',
    icon: FaBan,
  },
  {
    title: 'Locked Records',
    description:
      'Once approved, a record cannot be edited by the Operator or Approver. Only a Read-and-Write Admin can modify an approved form.',
    icon: FaLock,
  },
  {
    title: 'Signatures are Mandatory',
    description:
      'Operators must have a signature before submitting. Approvers must have one before approving. No exceptions.',
    icon: FaPencilAlt,
  },
  {
    title: 'Role-Based Visibility',
    description:
      'All users share one link. What each person sees is determined solely by the role assigned to their account.',
    icon: FaEye,
  },
  {
    title: 'Check Your Approval Routing',
    description:
      'Know whether your logbook is Sequential or Parallel, as this determines when and how approvers are notified.',
    icon: FaSitemap,
  },
];

const sopSections = [
  { id: 'section-01', number: '01', title: 'Purpose' },
  { id: 'section-02', number: '02', title: 'Scope' },
  { id: 'section-03', number: '03', title: 'Account Setup & Login' },
  {
    id: 'section-04',
    number: '04',
    title: 'System Roles Overview',
    children: [
      { id: 'section-4-1', number: '4.1', title: 'Admin Admin: Read-Only' },
      { id: 'section-4-2', number: '4.2', title: 'Admin: Read-and-Write' },
      { id: 'section-4-3', number: '4.3', title: 'Operator' },
      { id: 'section-4-4', number: '4.4', title: 'Approver' },
    ],
  },
  {
    id: 'section-05',
    number: '05',
    title: 'Guide for Admin Users',
    children: [
      { id: 'section-5-1', number: '5.1', title: 'Admin Types' },
      { id: 'section-5-2', number: '5.2', title: 'Creating Users' },
      {
        id: 'section-5-3',
        number: '5.3',
        title: 'Creating a Logbook',
        children: [
          {
            id: 'section-5-3-1',
            number: '5.3.1',
            title: 'Stage 1: Logbook Setup Form',
          },
          {
            id: 'section-5-3-2',
            number: '5.3.2',
            title: 'Stage 2: Define the Fields',
          },
        ],
      },
      { id: 'section-5-4', number: '5.4', title: 'Approval Modes' },
      {
        id: 'section-5-5',
        number: '5.5',
        title: 'Field types',
        children: [
          { id: 'section-5-5-1', number: '5.5.1', title: 'Dropdown' },
          { id: 'section-5-5-2', number: '5.5.2', title: 'Formula' },
          { id: 'section-5-5-3', number: '5.5.3', title: 'Section' },
          { id: 'section-5-5-4', number: '5.5.4', title: 'Section Formula' },
        ],
      },
      {
        id: 'section-5-6',
        number: '5.6',
        title: 'Action menus',
        children: [
          { id: 'section-5-6-1', number: '5.6.1', title: 'Export' },
          { id: 'section-5-6-2', number: '5.6.2', title: 'Entries' },
          { id: 'section-5-6-3', number: '5.6.3', title: 'Edit Log' },
          { id: 'section-5-6-4', number: '5.6.4', title: 'Delete Log' },
          { id: 'section-5-6-5', number: '5.6.5', title: 'Duplicate' },
          { id: 'section-5-6-6', number: '5.6.6', title: 'Submissions' },
          { id: 'section-5-6-7', number: '5.6.7', title: 'Version History' },
        ],
      },
    ],
  },
  {
    id: 'section-06',
    number: '06',
    title: 'Guide for Operator Users',
    children: [
      { id: 'section-6-1', number: '6.1', title: 'Data Entry & Submission' },
      { id: 'section-6-2', number: '6.2', title: 'Signature Setup' },
      { id: 'section-6-3', number: '6.3', title: 'Editing an Entry' },
    ],
  },
  {
    id: 'section-07',
    number: '07',
    title: 'Guide for Approver Users',
    children: [
      {
        id: 'section-7-1',
        number: '7.1',
        title: 'Reviewing and Approving Entries',
      },
      { id: 'section-7-2', number: '7.2', title: 'Signature Setup' },
      {
        id: 'section-7-3',
        number: '7.3',
        title: 'Exporting Approved Submissions',
      },
    ],
  },
  { id: 'section-08', number: '08', title: 'General Notes' },
];

export default function SOPHome() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-geist">
      <SOPTopBar />

      <div className="flex w-full flex-1 items-start">
        <SOPSidebar sections={sopSections} />

        <div className="flex min-w-0 flex-1 flex-col">
          <SOPHero />
          <SectionDivider />
          <section id="section-01" className="w-full px-14.5">
            <SectionHeading number="01" title="Purpose" />
            <p className="mt-9 text-[15px] leading-6.75">
              This document defines the step-by-step procedures for using the
              Digital Packaging Logbook application. It covers how each user
              type (Admin Read-Only and Read-and-Write, Operator, and Approver)
              logs into and operates the system, so that logbook records are
              created, submitted, reviewed, and approved consistently and remain
              audit-ready.
            </p>
          </section>
          <SectionDivider />
          <section id="section-02" className="w-full px-14.5">
            <SectionHeading number="02" title="Scope" />
            <p className="mt-9 text-[15px] leading-6.75">
              This document applies to all users of the Digital Packaging
              Logbook application, regardless of assigned role. It covers login,
              account setup, and day-to-day use of the application for each
              role. It does not cover backend system configuration or IT
              infrastructure administration.
            </p>
          </section>
          <SectionDivider />
          <section id="section-03" className="w-full px-14.5">
            <SectionHeading
              number="03"
              title="Account Setup & Login"
              badge="All roles"
            />

            <p className="mt-9 text-[15px] leading-6.75">
              Every user, regardless of role, accesses the application through a{' '}
              <span className="font-bold">single shared link</span>. What they
              see after logging in is determined entirely by their assigned
              role.
            </p>

            <StepTimeline steps={accountSetupSteps} />
          </section>
          <SectionDivider />
          <section className="w-full px-14.5">
            {firstSectionImages.map((image) => (
              <SOPScreenshot
                key={image.id}
                src={image.src}
                alt={`${image.id} image`}
              />
            ))}
          </section>
          <SectionDivider />
          <section id="section-04" className="w-full px-14.5">
            <SectionHeading number="04" title="System Roles Overview" />
            <p className="mt-9 text-[15px] leading-6.75">
              Four distinct roles govern what each user can see and do inside
              DigiForms.
            </p>

            <div className="mt-9 flex flex-col gap-6">
              {systemRoles.map((role, index) => (
                <React.Fragment key={role.title}>
                  <RoleCard
                    title={role.title}
                    subtitle={role.subtitle}
                    icon={role.icon}
                    bg={role.bg}
                    permissions={role.permissions}
                    id={`section-4-${index + 1}`}
                  />
                  <SOPScreenshot
                    src={role.src}
                    alt={`${role.title} screenshot`}
                  />
                </React.Fragment>
              ))}
            </div>
          </section>
          <SectionDivider />
          <section id="section-05" className="w-full px-14.5">
            <RoleCard
              title="Guide for Admin Users"
              subtitle="Section 5: Covers both Read-Only and Read-and-Write Admin roles"
              icon={FiSettings}
              bg={'bg-sop-500'}
              showPermissions={false}
            />

            <div className="mt-12">
              <SubSectionHeading
                id="section-5-1"
                number="5.1"
                title="Admin Types"
              />
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
              <SubSectionHeading
                id="section-5-2"
                number="5.2"
                title="Creating Users"
              />
              <StepTimeline steps={creatingUsersSteps} />
            </div>
          </section>
          <SectionDivider />
          <section className="w-full px-14.5">
            <SOPScreenshot key={`11`} src={`/sop/11.png`} alt={`11 image`} />
            <SOPScreenshot key={`12`} src={`/sop/12.png`} alt={`12 image`} />
          </section>
          <section className="w-full px-14.5">
            <div className="mt-12">
              <SubSectionHeading
                id="section-5-3"
                number="5.3"
                title="Creating a Logbook"
              />
              <p className="mt-4 text-[15px] leading-6.75">
                A logbook is created in two stages: the setup form, then
                defining the data fields.
              </p>

              <div id="section-5-3-1" className="mt-6">
                <StagePanel
                  label="Stage 1: Logbook Setup Form"
                  items={logbookSetupFields}
                />
              </div>
            </div>
          </section>
          <SectionDivider />
          <section className="w-full px-14.5">
            <SOPScreenshot key={`13`} src={`/sop/13.png`} alt={`13 image`} />
            <SOPScreenshot key={`14`} src={`/sop/14.png`} alt={`14 image`} />
          </section>
          <section className="w-full px-14.5">
            <div className="mt-6">
              <SOPCallout>
                The &ldquo;Requires Approval&rdquo; toggle when unselected are
                for logbooks that are used purely for record-keeping and do not
                require any approval process.
              </SOPCallout>
            </div>

            <div id="section-5-3-2" className="mt-9">
              <StagePanel
                label="Stage 2: Define the Fields"
                description="Once the setup form is submitted, define the data fields the logbook will capture. Each row needs:"
                cards={logbookFieldDefinitions}
              />
            </div>
          </section>
          <SectionDivider />
          <section className="w-full px-14.5">
            <SOPScreenshot key={`15`} src={`/sop/15.png`} alt={`15 image`} />
            <SOPScreenshot key={`16`} src={`/sop/16.png`} alt={`16 image`} />
          </section>
          <section className="w-full px-14.5">
            <div className="mt-6">
              <SOPCallout>
                Operator and Approver assignment happens at the point of logbook
                creation, not as a separate step in User Management.
              </SOPCallout>
            </div>

            <div className="mt-12">
              <SubSectionHeading
                id="section-5-4"
                number="5.4"
                title="Approval Modes"
              />
              <div className="mt-6 grid grid-cols-2 gap-5">
                {approvalModes.map((mode) => (
                  <AdminTypeCard
                    key={mode.title}
                    title={mode.title}
                    caption={mode.caption}
                    description={mode.description}
                    icon={mode.icon}
                  />
                ))}
              </div>
            </div>

            <div className="mt-12">
              <SubSectionHeading
                id="section-5-5"
                number="5.5"
                title="Field types"
              />

              <div className="mt-6" id="section-5-5-1">
                <StagePanel
                  label="1. Dropdown"
                  description={
                    'A Dropdown field lets the Operator select from a predefined list instead of typing free text. These lists are called "sources," and they\'re reusable, a source created once (e.g., SKU, Plant, Months, Job Role, Status) can be used across multiple logbooks, forms, and records, and can be edited or deleted centrally at any time.'
                  }
                />
              </div>

              <StepTimeline steps={dropdownFieldSteps} />
            </div>
          </section>
          <SectionDivider />
          <section className="w-full px-14.5">
            <SOPScreenshot key={`17`} src={`/sop/17.png`} alt={`17 image`} />
            <SOPScreenshot key={`18`} src={`/sop/18.png`} alt={`18 image`} />
            <SOPScreenshot key={`19`} src={`/sop/19.png`} alt={`19 image`} />
            <SOPScreenshot key={`20`} src={`/sop/20.png`} alt={`20 image`} />
          </section>
          <section className="w-full px-14.5">
            <div className="mt-12">
              <div className="mt-6" id="section-5-5-2">
                <StagePanel
                  label="2. Formula"
                  description={
                    'A Formula field lets you set up a calculation using other fields on the same logbook, for whenever a logbook needs a computed value instead of manual entry.'
                  }
                />
              </div>

              <StepTimeline steps={formularFieldSteps} />
            </div>
          </section>
          <SectionDivider />
          <section className="w-full px-14.5">
            <SOPScreenshot key={`21`} src={`/sop/21.png`} alt={`21 image`} />
            <SOPScreenshot key={`22`} src={`/sop/22.png`} alt={`22 image`} />
          </section>
          <section className="w-full px-14.5">
            <div className="mt-12">
              <div className="mt-6" id="section-5-5-3">
                <StagePanel
                  label="3. Section"
                  description={
                    "A Section groups related fields together for inputs that belong as a set and, importantly, a section can be filled in more than once per submission, so it's used whenever the Operator may need to log multiple entries of the same group of fields within a single logbook record (e.g., logging several sightings or checks in one submission)."
                  }
                />
              </div>

              <StepTimeline steps={sectionFieldSteps} />
            </div>
          </section>
          <SectionDivider />
          <section className="w-full px-14.5">
            <SOPScreenshot key={`23`} src={`/sop/23.png`} alt={`23 image`} />
            <SOPScreenshot key={`24`} src={`/sop/24.png`} alt={`24 image`} />
          </section>

          <SectionDivider />

          <section className="w-full px-14.5">
            <div className="mt-12">
              <div className="mt-6" id="section-5-5-4">
                <StagePanel
                  label="4. Section Formula"
                  description={
                    'A Section Formula runs a calculation across all the entries of one specific field within a section, since a section can have multiple entries, this is how you get a single calculated value (e.g., a total or average) out of every instance of that field, rather than calculating across separate standalone fields.'
                  }
                />
              </div>

              <StepTimeline steps={sectionFormularFieldSteps} />
            </div>
          </section>
          <SectionDivider />
          <section className="w-full px-14.5">
            <SOPScreenshot key={`25`} src={`/sop/25.png`} alt={`25 image`} />
            <SOPScreenshot key={`26`} src={`/sop/26.png`} alt={`26 image`} />
            <SOPScreenshot key={`27`} src={`/sop/27.png`} alt={`27 image`} />
          </section>

          <SectionDivider />

          <section className="w-full px-14.5">
            <SubSectionHeading
              id="section-5-6"
              number="5.6"
              title="Action menus"
            />

            <div className="my-6" id="section-5-6-1">
              <StagePanel
                label="1. Export"
                description={
                  'Exports all submissions for a specific date range you select (Start date/End date), delivered as an XLS file.'
                }
              />
            </div>

            <div className="w-full">
              <SOPScreenshot key={`28`} src={`/sop/28.png`} alt={`28 image`} />
              <SOPScreenshot key={`29`} src={`/sop/29.png`} alt={`29 image`} />
            </div>
          </section>

          <section className="w-full px-14.5">
            <div className="my-6" id="section-5-6-2">
              <StagePanel
                label="2. Entries"
                description={
                  'Opens the individual data entries already logged for that logbook, where they can be edited.'
                }
              />
            </div>

            <div className="w-full">
              <SOPScreenshot key={`30`} src={`/sop/30.png`} alt={`30 image`} />
            </div>
          </section>

          <section className="w-full px-14.5">
            <div className="my-6" id="section-5-6-3">
              <StagePanel
                label="3. Edit log"
                description={
                  "Edits the logbook's own configuration details (title, document number, whether approval is required, etc.) rather than the entries themselves."
                }
              />
            </div>

            <div className="w-full">
              <SOPScreenshot key={`31`} src={`/sop/31.png`} alt={`31 image`} />
            </div>
          </section>

          <section className="w-full px-14.5">
            <div className="my-6" id="section-5-6-4">
              <StagePanel
                label="4. Delete  log"
                description={'Deletes the logbook but can always be restored.'}
              />
            </div>
          </section>

          <section className="w-full px-14.5">
            <div className="my-6" id="section-5-6-5">
              <StagePanel
                label="5. Duplicate"
                description={
                  'Creates a copy of the logbook as a starting point for a new one.'
                }
              />
            </div>
          </section>

          <section className="w-full px-14.5">
            <div className="my-6" id="section-5-6-6">
              <StagePanel
                label="6. Submissions"
                description={
                  'Shows every submission made by Operators that has been approved by an Approver, including who approved it and when.'
                }
              />
            </div>

            <div className="w-full">
              <SOPScreenshot key={`32`} src={`/sop/32.png`} alt={`32 image`} />
              <SOPScreenshot key={`33`} src={`/sop/33.png`} alt={`33 image`} />
            </div>
          </section>

          <section className="w-full px-14.5">
            <div className="my-6" id="section-5-6-7">
              <StagePanel
                label="7. Version History"
                description={
                  'Shows a log of every past version of how the form itself was built. Selecting a version shows the exact field configuration at that point in time (including saved formulas, section fields, and dropdown sources), and you can tap Preview Form to see exactly how an Operator would have seen the form at that version, not just the current version.'
                }
              />
            </div>

            <div className="w-full">
              <SOPScreenshot key={`34`} src={`/sop/34.png`} alt={`34 image`} />
              <SOPScreenshot key={`35`} src={`/sop/35.png`} alt={`35 image`} />
              <SOPScreenshot key={`36`} src={`/sop/36.png`} alt={`36 image`} />
            </div>
          </section>

          <SectionDivider />

          <section id="section-06" className="w-full px-14.5">
            <RoleCard
              title="Guide for Operator Users"
              subtitle="Section 6: Data entry, submission, and corrections"
              icon={FaPencilAlt}
              bg={'bg-sop-600'}
              showPermissions={false}
            />

            <div className="mt-9 flex flex-col gap-5">
              <AdminTypeCard
                title="Dashboard"
                description="Gives an overview of activity across all logbooks. Shows all pending logs, approved logs, and rejected logs at the top. Followed by a table of every logbook/checklist assigned to that operator with its Department, Document Number and Frequency."
                icon={FaDesktop}
              />

              <div className="grid md:grid-cols-3 gap-5">
                {operatorTabs.map((tab) => (
                  <AdminTypeCard
                    key={tab.id}
                    title={tab.title}
                    description={tab.description}
                    icon={tab.icon}
                  />
                ))}
              </div>

              <SOPScreenshot key={`37`} src={`/sop/37.png`} alt={`37 image`} />
            </div>

            <div className="mt-12">
              <SubSectionHeading
                id="section-6-1"
                number="6.1"
                title="Data Entry & Submission"
              />

              <StepTimeline steps={dataEntrySteps} />

              <div className="my-9">
                <SOPNote lead="Do this before anything else.">
                  You cannot submit an entry without a signature set up on your
                  account.
                </SOPNote>
              </div>

              <div className="w-full">
                <SOPScreenshot
                  key={`38`}
                  src={`/sop/38.png`}
                  alt={`38 image`}
                />
                <SOPScreenshot
                  key={`39`}
                  src={`/sop/39.png`}
                  alt={`39 image`}
                />
              </div>
            </div>

            <div className="mt-12">
              <SubSectionHeading
                id="section-6-2"
                number="6.2"
                title="Signature Setup (Required Before First Submission)"
              />

              <div className="mt-6 grid grid-cols-3 gap-5">
                {signatureSetupOptions.map((option) => (
                  <AdminTypeCard
                    key={option.title}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                  />
                ))}
              </div>

              <div className="w-full my-6">
                <SOPScreenshot
                  key={`40`}
                  src={`/sop/40.png`}
                  alt={`40 image`}
                />
                <SOPScreenshot
                  key={`41`}
                  src={`/sop/41.png`}
                  alt={`41 image`}
                />
              </div>
            </div>

            <div className="mt-12">
              <SubSectionHeading
                id="section-6-3"
                number="6.3"
                title="Editing an Entry"
              />

              <div className="mt-6 grid grid-cols-2 gap-5">
                {editSetupOptions.map((option) => (
                  <AdminTypeCard
                    key={option.title}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                  />
                ))}
              </div>

              <StepTimeline steps={editEntrySteps} />

              <div className="w-full my-6">
                <SOPScreenshot
                  key={`42`}
                  src={`/sop/42.png`}
                  alt={`42 image`}
                />
                <SOPScreenshot
                  key={`43`}
                  src={`/sop/43.png`}
                  alt={`43 image`}
                />
              </div>
            </div>
          </section>

          <SectionDivider />

          <section id="section-07" className="w-full px-14.5">
            <RoleCard
              title="Guide for Approver Users"
              subtitle="Section 7: Review, approve, reject, and export"
              icon={FaCheckCircle}
              bg={'bg-sop-700'}
              showPermissions={false}
            />

            <div className="mt-9 flex flex-col gap-5">
              <AdminTypeCard
                title="Dashboard"
                description="Gives an overview of activity across all logbooks. Shows all pending logs, approved logs, and rejected logs at the top. Followed by a table of every logbook/checklist assigned to that operator with its Department, Document Number and Frequency."
                icon={FaDesktop}
              />

              <div className="grid grid-cols-2 gap-5">
                {approverTabs.map((tab) => (
                  <AdminTypeCard
                    key={tab.id}
                    title={tab.title}
                    description={tab.description}
                    icon={tab.icon}
                  />
                ))}
              </div>

              <SOPScreenshot key={`44`} src={`/sop/44.png`} alt={`44 image`} />
            </div>

            <div className="mt-12">
              <SubSectionHeading
                id="section-7-1"
                number="7.1"
                title="Reviewing and Approving Entries"
              />

              <StepTimeline steps={reviewApprovalSteps} />
            </div>

            <div className="w-full my-6">
              <SOPScreenshot key={`45`} src={`/sop/45.png`} alt={`45 image`} />
              <SOPScreenshot key={`46`} src={`/sop/46.png`} alt={`46 image`} />
            </div>

            <div className="mt-12">
              <SubSectionHeading
                id="section-7-2"
                number="7.2"
                title="Signature Setup (Required Before First Approval)"
              />

              <div className="mt-6">
                <SOPNote lead="Set up your signature before your first approval.">
                  You cannot approve an entry without one on your account.
                </SOPNote>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-5">
                {signatureSetupOptions.map((option) => (
                  <AdminTypeCard
                    key={option.title}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                  />
                ))}
              </div>
            </div>

            <div className="w-full my-6">
              <SOPScreenshot key={`47`} src={`/sop/47.png`} alt={`47 image`} />
              <SOPScreenshot key={`48`} src={`/sop/48.png`} alt={`48 image`} />
            </div>

            <SOPCallout>
              <span className="font-bold">Sequential:</span> an entry only
              reaches you after every approver ahead of you has approved it. You
              won&apos;t see it before then.{' '}
              <span className="font-bold">Parallel:</span> all approvers see the
              entry simultaneously; whoever responds first completes the
              approval.
            </SOPCallout>

            <div className="mt-12">
              <SubSectionHeading
                id="section-7-3"
                number="7.3"
                title="Exporting Approved Submissions"
              />

              <StepTimeline steps={exportSubmissionSteps} />
            </div>

            <div className="w-full my-6">
              <SOPScreenshot key={`49`} src={`/sop/49.png`} alt={`49 image`} />
              <SOPScreenshot key={`50`} src={`/sop/50.png`} alt={`50 image`} />
            </div>
          </section>

          <SectionDivider />

          <section id="section-08" className="w-full px-14.5">
            <SectionHeading
              number="08"
              title="General Notes"
              badge="All roles"
            />

            <div className="mt-9 flex flex-col gap-4">
              {generalNotes.map((note) => (
                <AdminTypeCard
                  key={note.title}
                  title={note.title}
                  description={note.description}
                  icon={note.icon}
                />
              ))}
            </div>
          </section>
          <SectionDivider />
        </div>
      </div>
    </div>
  );
}
