import React from 'react';
import {
  FaEye,
  FaUserShield,
  FaClipboardList,
  FaCheckCircle,
  FaListOl,
  FaBolt,
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
      <SectionDivider />
      <section className="w-full px-32">
        <SOPScreenshot key={`13`} src={`/sop/13.png`} alt={`13 image`} />
        <SOPScreenshot key={`14`} src={`/sop/14.png`} alt={`14 image`} />
      </section>
      <section className="w-full px-32">
        <div className="mt-6">
          <SOPCallout>
            The &ldquo;Requires Approval&rdquo; toggle when unselected are for
            logbooks that are used purely for record-keeping and do not require
            any approval process.
          </SOPCallout>
        </div>

        <div className="mt-9">
          <StagePanel
            label="Stage 2: Define the Fields"
            description="Once the setup form is submitted, define the data fields the logbook will capture. Each row needs:"
            cards={logbookFieldDefinitions}
          />
        </div>
      </section>
      <SectionDivider />
      <section className="w-full px-32">
        <SOPScreenshot key={`15`} src={`/sop/15.png`} alt={`15 image`} />
        <SOPScreenshot key={`16`} src={`/sop/16.png`} alt={`16 image`} />
      </section>
      <section className="w-full px-32">
        <div className="mt-6">
          <SOPCallout>
            Operator and Approver assignment happens at the point of logbook
            creation, not as a separate step in User Management.
          </SOPCallout>
        </div>

        <div className="mt-12">
          <SubSectionHeading number="5.4" title="Approval Modes" />
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
          <SubSectionHeading number="5.5" title="Field types" />

          <div className="mt-6">
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
      <section className="w-full px-32">
        <SOPScreenshot key={`17`} src={`/sop/17.png`} alt={`17 image`} />
        <SOPScreenshot key={`18`} src={`/sop/18.png`} alt={`18 image`} />
        <SOPScreenshot key={`19`} src={`/sop/19.png`} alt={`19 image`} />
        <SOPScreenshot key={`20`} src={`/sop/20.png`} alt={`20 image`} />
      </section>
      <section className="w-full px-32">
        <div className="mt-12">
          <div className="mt-6">
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
      <section className="w-full px-32">
        <SOPScreenshot key={`21`} src={`/sop/21.png`} alt={`21 image`} />
        <SOPScreenshot key={`22`} src={`/sop/22.png`} alt={`22 image`} />
      </section>
      <section className="w-full px-32">
        <div className="mt-12">
          <div className="mt-6">
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
      <section className="w-full px-32">
        <SOPScreenshot key={`23`} src={`/sop/23.png`} alt={`23 image`} />
        <SOPScreenshot key={`24`} src={`/sop/24.png`} alt={`24 image`} />
      </section>

      <SectionDivider />

      <section className="w-full px-32">
        <div className="mt-12">
          <div className="mt-6">
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
      <section className="w-full px-32">
        <SOPScreenshot key={`25`} src={`/sop/25.png`} alt={`25 image`} />
        <SOPScreenshot key={`26`} src={`/sop/26.png`} alt={`26 image`} />
        <SOPScreenshot key={`27`} src={`/sop/27.png`} alt={`27 image`} />
      </section>

      <SectionDivider />

      <section className="w-full px-32">
        <SubSectionHeading number="5.6" title="Action menus" />

        <div className="my-6">
          <StagePanel
            label="1. Export"
            description={
              'Exports all submissions for a specific date range you select (Start date/End date), delivered as an XLS file.'
            }
          />
        </div>

        <section className="w-full">
          <SOPScreenshot key={`28`} src={`/sop/28.png`} alt={`28 image`} />
          <SOPScreenshot key={`29`} src={`/sop/29.png`} alt={`29 image`} />
        </section>
      </section>

      <section className="w-full px-32">
        <div className="my-6">
          <StagePanel
            label="2. Entries"
            description={
              'Opens the individual data entries already logged for that logbook, where they can be edited.'
            }
          />
        </div>

        <section className="w-full">
          <SOPScreenshot key={`30`} src={`/sop/30.png`} alt={`30 image`} />
        </section>
      </section>

      <section className="w-full px-32">
        <div className="my-6">
          <StagePanel
            label="3. Edit log"
            description={
              "Edits the logbook's own configuration details (title, document number, whether approval is required, etc.) rather than the entries themselves."
            }
          />
        </div>

        <section className="w-full">
          <SOPScreenshot key={`31`} src={`/sop/31.png`} alt={`31 image`} />
        </section>
      </section>

      <section className="w-full px-32">
        <div className="my-6">
          <StagePanel
            label="4. Delete  log"
            description={'Deletes the logbook but can always be restored.'}
          />
        </div>
      </section>

      <section className="w-full px-32">
        <div className="my-6">
          <StagePanel
            label="5. Duplicate"
            description={
              'Creates a copy of the logbook as a starting point for a new one.'
            }
          />
        </div>
      </section>

      <section className="w-full px-32">
        <div className="my-6">
          <StagePanel
            label="6. Submissions"
            description={
              'Shows every submission made by Operators that has been approved by an Approver, including who approved it and when.'
            }
          />
        </div>

        <section className="w-full">
          <SOPScreenshot key={`32`} src={`/sop/32.png`} alt={`32 image`} />
          <SOPScreenshot key={`33`} src={`/sop/33.png`} alt={`33 image`} />
        </section>
      </section>

      <section className="w-full px-32">
        <div className="my-6">
          <StagePanel
            label="7. Version History"
            description={
              'Shows a log of every past version of how the form itself was built. Selecting a version shows the exact field configuration at that point in time (including saved formulas, section fields, and dropdown sources), and you can tap Preview Form to see exactly how an Operator would have seen the form at that version, not just the current version.'
            }
          />
        </div>

        <section className="w-full">
          <SOPScreenshot key={`32`} src={`/sop/32.png`} alt={`34 image`} />
          <SOPScreenshot key={`33`} src={`/sop/33.png`} alt={`35 image`} />
          <SOPScreenshot key={`33`} src={`/sop/33.png`} alt={`36 image`} />
        </section>
      </section>
    </div>
  );
}
