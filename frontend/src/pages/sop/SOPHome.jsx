import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

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
    </div>
  );
}
