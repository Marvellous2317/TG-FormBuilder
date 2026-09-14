import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icons from '../../assets/icons';
import Images from '../../assets/images';
import { FaArrowRight } from 'react-icons/fa6';
import { IoBookOutline } from 'react-icons/io5';
import { GiUdder } from 'react-icons/gi';

export default function LandingPage() {
  const navigate = useNavigate();

  const LoginPage = () => {
    navigate('/login');
  };

  const sopGuide = () => {
    navigate('/guide');
  };

  const currentYear = new Date().getFullYear();

  return (
    <div
      id="landing-page-root"
      className="min-h-screen bg-white text-[#191B23] antialiased flex flex-col selection:bg-[#2463EB] selection:text-white font-geist"
    >
      {/* Top Navigation Bar */}
      <nav
        id="top-navbar"
        className="fixed top-0 left-0 right-0 w-full z-50 bg-white backdrop-blur-md border-b border-[#E1E2ED]/70 shadow-xs transition-colors"
      >
        <div className="flex justify-between items-center px-6 lg:px-12 py-4 max-w-360 mx-auto w-full">
          {/* Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <img src={Images.logo} className="w-5 h-5 " />
            </div>
            <span className="text-xl font-bold text-tertiary-500 tracking-tight font-geist">
              DigiForms
            </span>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-1">
            <button
              onClick={LoginPage}
              className="bg-tertiary-500 hover:bg-tertiary-500/70 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <span>Login</span>
              <FaArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Page Content */}
      <main className="pt-24 lg:pt-28 pb-16 flex-1">
        {/* HERO SECTION */}
        <section
          id="hero-section"
          className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8 lg:py-16 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center"
        >
          {/* Left Column: Headline & Messaging */}
          <div
            id="hero-left-content"
            className="lg:col-span-6 flex flex-col items-start"
          >
            {/* Main Headline */}
            <h1
              id="hero-title"
              className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-bold text-[#191B23] leading-[1.18] tracking-tight font-geist mb-6"
            >
              Transform Checklists into Real-Time{' '}
              <span className="text-tertiary-500">
                Operational Intelligence
              </span>
              .
            </h1>
            {/* Subtitle */}
            <p
              id="hero-description"
              className="text-[15px] sm:text-[16px] lg:text-[17px] text-[#434655] leading-relaxed max-w-xl mb-8"
            >
              Eliminate paper logbooks and disconnected spreadsheets. DigiForms
              empowers packaging operators, automated formula calculations,
              multi-tier approvals, and digital signatures—online or offline.
            </p>
            {/* Action Buttons */}
            <div
              id="hero-cta-group"
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              <button
                onClick={LoginPage}
                className="bg-tertiary-500 hover:bg-tertiary-500/70 text-white px-7 py-3.5 rounded-xl text-[15px] font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Get Started</span>
                <FaArrowRight className="w-3 h-3" />
              </button>

              <button
                onClick={sopGuide}
                className="border border-[#737686] bg-transparent text-[#434655] hover:bg-black/5 hover:text-[#191B23] px-6 py-3.5 rounded-xl text-[15px] font-medium transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View the Guide</span>
                <IoBookOutline className="w-4 h-4 text-[#5F5E5E]" />
              </button>
            </div>
          </div>

          {/* Right Column: High Fidelity Interactive UI Dashboard Mockup */}
          <div id="hero-right-mockup" className="lg:col-span-6 w-full">
            <div className="relative w-full rounded-2xl bg-white border border-[#E1E2ED] ambient-shadow p-3 sm:p-5 lg:p-6 overflow-hidden">
              <img
                src={Images.formSnippet}
                className="object-contain w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* CORE CAPABILITIES SECTION */}
        <section
          id="capabilities-section"
          className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 lg:py-24"
        >
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2
              id="capabilities-title"
              className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-[#191B23] tracking-tight font-geist mb-3"
            >
              Core Capabilities
            </h2>
            <p
              id="capabilities-subtitle"
              className="text-[15px] sm:text-[16px] text-[#434655] max-w-2xl mx-auto leading-relaxed"
            >
              Built for the high-stakes environment of B2B digital packaging
              logbooks.
            </p>
          </div>

          {/* 6 Capabilities Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {/* Card 1: Smart Logbook Builder */}
            <div
              id="capability-card-1"
              className="bg-white border border-[#E1E2ED] rounded-2xl p-6 lg:p-7 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#2463EB] text-white flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                  <img src={Icons.logbook} className="w-10 h-10" />
                </div>
                <h3 className="text-[18px] font-bold text-[#191B23] mb-2 font-geist">
                  Smart Logbook Builder
                </h3>
                <p className="text-[14px] text-[#434655] leading-relaxed">
                  Digitize complex operational forms with a drag-and-drop
                  builder tailored for manufacturing.
                </p>
              </div>
            </div>

            {/* Card 2: Live Formula Engine */}
            <div
              id="capability-card-2"
              className="bg-white border border-[#E1E2ED] rounded-2xl p-6 lg:p-7 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#0053DA]/10  flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                  <img src={Icons.formula} className="w-10 h-10" />
                </div>
                <h3 className="text-[18px] font-bold text-[#191B23] mb-2 font-geist">
                  Live Formula Engine
                </h3>
                <p className="text-[14px] text-[#434655] leading-relaxed">
                  Automate calculations instantly. Reduces human error in weight
                  checks and yield calculations.
                </p>
              </div>
            </div>

            {/* Card 3: Role-Based Workflows */}
            <div
              id="capability-card-3"
              className="bg-white border border-[#E1E2ED] rounded-2xl p-6 lg:p-7 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#726C69] text-white flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                  <img src={Icons.roleBased} className="w-10 h-10" />
                </div>
                <h3 className="text-[18px] font-bold text-[#191B23] mb-2 font-geist">
                  Role-Based Workflows
                </h3>
                <p className="text-[14px] text-[#434655] leading-relaxed">
                  Enforce strict SOPs with multi-tier approval routing for QA
                  and Production Supervisors.
                </p>
              </div>
            </div>

            {/* Card 4: Electronic Signatures */}
            <div
              id="capability-card-4"
              className="bg-white border border-[#E1E2ED] rounded-2xl p-6 lg:p-7 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E5E2E1] text-[#1C1B1B] flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                  <img
                    src={Icons.cryptographic}
                    className="w-10 h-10 text-[#1C1B1B]"
                  />
                </div>
                <h3 className="text-[18px] font-bold text-[#191B23] mb-2 font-geist">
                  Electronic Signatures
                </h3>
                <p className="text-[14px] text-[#434655] leading-relaxed">
                  Capture drawn or uploaded signatures for seamless sign-offs,
                  multi-tier approvals, and audit trails.
                </p>
              </div>
            </div>

            {/* Card 5: Offline-First PWA */}
            <div
              id="capability-card-5"
              className="bg-white border border-[#E1E2ED] rounded-2xl p-6 lg:p-7 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#2463EB] text-white flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                  <img src={Icons.offline} className="w-10 h-10" />
                </div>
                <h3 className="text-[18px] font-bold text-[#191B23] mb-2 font-geist">
                  Offline-First PWA
                </h3>
                <p className="text-[14px] text-[#434655] leading-relaxed">
                  Keep working even in deep warehouse dead-zones. Auto-syncs
                  when connectivity returns.
                </p>
              </div>
            </div>

            {/* Card 6: Compliance Export */}
            <div
              id="capability-card-6"
              className="bg-white border border-[#E1E2ED] rounded-2xl p-6 lg:p-7 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-tertiary-500/40 text-[# ] flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                  <img src={Icons.compliance} className="w-10 h-10" />
                </div>
                <h3 className="text-[18px] font-bold text-[#191B23] mb-2 font-geist">
                  Compliance Export
                </h3>
                <p className="text-[14px] text-[#434655] leading-relaxed">
                  Generate instant, audit-ready PDF reports and raw data exports
                  for regulatory bodies.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer
        id="page-footer"
        className="bg-white w-full border-t border-[#E1E2ED]/80 mt-auto"
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 lg:py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <img src={Images.logo} className="w-5 h-5 " />
              </div>
              <span className="text-xl font-bold text-tertiary-500 tracking-tight font-geist">
                DigiForms
              </span>
            </div>
            <p className="mt-2 text-[13px] text-[#5F5E5E]">
              © {currentYear} DigiForms v1.0. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
