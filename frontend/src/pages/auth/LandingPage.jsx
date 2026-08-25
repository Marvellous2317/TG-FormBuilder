import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icons from '../../assets/icons';
import Images from '../../assets/images';
import { FaArrowRight } from 'react-icons/fa6';
import { IoBookOutline } from 'react-icons/io5';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState('All departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [portalModalOpen, setPortalModalOpen] = useState(false);
  const [sopGuideOpen, setSopGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLogRow, setSelectedLogRow] = useState(null);
  const navigate = useNavigate();

  const LoginPage = () => {
    navigate('/login');
  };

  const sopGuide = ()=> {
    navigate('/guide');
  };

  const currentYear = new Date().getFullYear();

  // Form state for interactive portal simulation
  const [demoFormState, setDemoFormState] = useState({
    batchNumber: 'PKG-2024-8841',
    lineId: 'Line 04 (Aseptic Packaging)',
    targetWeight: 500,
    grossWeight: 512.4,
    tareWeight: 12.2,
    sealTemperature: 185,
    operatorSignature: '',
    isSigned: false,
    notes: 'Seal pressure and visual inspection calibrated within tolerance.',
  });

  const netWeight = (
    Number(demoFormState.grossWeight) - Number(demoFormState.tareWeight)
  ).toFixed(2);
  const weightVariance = (
    netWeight - Number(demoFormState.targetWeight)
  ).toFixed(2);
  const isWeightValid = Math.abs(Number(weightVariance)) <= 2.5;

  // Mock dashboard log records matching screenshot
  const initialLogs = [
    {
      id: 1,
      checklist: 'Pest Sighting-Incidence Log',
      department: 'Quality Control (QC)',
      docNumber: 'FM/QCPC_PSIL/P-5',
      createdBy: 'Egoba Kelvinmy',
      createdDate: 'Jul 15, 2024',
      status: 'Pending',
      statusType: 'pending',
      severity: 'Medium',
    },
    {
      id: 2,
      checklist: 'RM Fumigation Summary and Tracking',
      department: 'Quality Control (QC)',
      docNumber: 'FM/QCPC_FST/P-2',
      createdBy: 'Sarah Chen',
      createdDate: 'Jul 15, 2024',
      status: 'Approved',
      statusType: 'approved',
      severity: 'Low',
    },
    {
      id: 3,
      checklist: 'Packaging Seal Integrity Verification',
      department: 'Line 4 Packaging',
      docNumber: 'FM/PKG_SIV/P-9',
      createdBy: 'Marcus Bell',
      createdDate: 'Jul 14, 2024',
      status: 'In Review',
      statusType: 'review',
      severity: 'High',
    },
    {
      id: 4,
      checklist: 'Sanitization & Pre-Op Clearance Log',
      department: 'Hygiene & QA',
      docNumber: 'FM/HYG_SPO/P-1',
      createdBy: 'Elena Rostov',
      createdDate: 'Jul 14, 2024',
      status: 'Approved',
      statusType: 'approved',
      severity: 'Low',
    },
  ];

  const filteredLogs = initialLogs.filter((item) => {
    const matchesDept =
      selectedDept === 'All departments' ||
      item.department.toLowerCase().includes(selectedDept.toLowerCase());
    const matchesSearch =
      item.checklist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      id="landing-page-root"
      className="min-h-screen bg-[#FAF8FF] text-[#191B23] antialiased flex flex-col font-sans selection:bg-[#2463EB] selection:text-white"
    >
      {/* Top Navigation Bar */}
      <nav
        id="top-navbar"
        className="fixed top-0 left-0 right-0 w-full z-50 bg-[#FAF8FF]/90 backdrop-blur-md border-b border-[#E1E2ED]/70 shadow-xs transition-colors"
      >
        <div className="flex justify-between items-center px-6 lg:px-12 py-4 max-w-[1440px] mx-auto w-full">
          {/* Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <img src={Icons.logo} className="w-5 h-5 " />
            </div>
            <span className="text-xl font-bold text-[#004BC6] tracking-tight font-headline">
              DigiForms
            </span>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-1">
            <button
              onClick={LoginPage}
              className="bg-[#004BC6] hover:bg-[#003EA7] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <span>Login</span>
              <FaArrowRight className="w-3 h-3" />
            </button>

            {/* Mobile Menu Button */}
            {/* <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#434655] hover:bg-[#E1E2ED]/50"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button> */}
          </div>
        </div>

        {/* Mobile Dropdown */}
        {/* {mobileMenuOpen && (
          <div id="mobile-nav-menu" className="md:hidden px-6 py-4 bg-white border-b border-[#E1E2ED] shadow-md flex flex-col gap-2">
            <button
              onClick={() => scrollToSection('capabilities-section')}
              className="text-left py-2 px-3 text-[14px] font-medium text-[#434655] hover:bg-[#F3F3FE] rounded-md"
            >
              Features & Capabilities
            </button>
            <button
              onClick={() => scrollToSection('capabilities-section')}
              className="text-left py-2 px-3 text-[14px] font-medium text-[#434655] hover:bg-[#F3F3FE] rounded-md"
            >
              Workflows & SOPs
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); setPortalModalOpen(true); }}
              className="text-left py-2 px-3 text-[14px] font-medium text-[#434655] hover:bg-[#F3F3FE] rounded-md"
            >
              Live Formula Engine
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); setSopGuideOpen(true); }}
              className="text-left py-2 px-3 text-[14px] font-medium text-[#434655] hover:bg-[#F3F3FE] rounded-md"
            >
              Training SOP Guide
            </button>
          </div>
        )} */}
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
            {/* Tag / Badge */}
            {/* <div 
              id="hero-controlled-doc-badge"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C3C6D7]/60 bg-white shadow-2xs mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#BA1A1A] animate-pulse"></span>
              <span className="text-[11px] lg:text-[12px] font-semibold text-[#5F5E5E] tracking-wider uppercase font-sans">
                CONTROLLED DOCUMENT • AUDIT-READY PACKAGING PLATFORM
              </span>
            </div> */}

            {/* Main Headline */}
            <h1
              id="hero-title"
              className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-bold text-[#191B23] leading-[1.18] tracking-tight font-headline mb-6"
            >
              Transform Packaging Checklists into Real-Time{' '}
              <span className="text-[#004BC6]">Operational Intelligence</span>.
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
                className="bg-[#004BC6] hover:bg-[#003EA7] text-white px-7 py-3.5 rounded-xl text-[15px] font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Login</span>
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

            {/* Subtext Trust Indicators */}
            {/* <div className="mt-8 pt-6 border-t border-[#E1E2ED]/80 flex flex-wrap items-center gap-6 text-[12px] text-[#737686]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>FDA 21 CFR Part 11 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>GMP / HACCP Audit Ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instant Offline Sync</span>
              </div>
            </div> */}
          </div>

          {/* Right Column: High Fidelity Interactive UI Dashboard Mockup */}
          <div id="hero-right-mockup" className="lg:col-span-6 w-full">
            <div className="relative w-full rounded-2xl bg-white border border-[#E1E2ED] ambient-shadow p-3 sm:p-5 lg:p-6 overflow-hidden">
             <img src={Images.formSnippet} className='object-contain w-full h-auto'/>
              
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
              className="text-2xl sm:text-3xl lg:text-[36px] font-bold text-[#191B23] tracking-tight font-headline mb-3"
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
                <h3 className="text-[18px] font-bold text-[#191B23] mb-2 font-headline">
                  Smart Logbook Builder
                </h3>
                <p className="text-[14px] text-[#434655] leading-relaxed">
                  Digitize complex operational forms with a drag-and-drop
                  builder tailored for manufacturing.
                </p>
              </div>
              {/* <div className="mt-4 pt-3 flex items-center text-[12px] font-semibold text-[#004BC6] group-hover:translate-x-1 transition-transform">
                <span>Configure custom templates</span>
                <FaArrowRight className="w-3.5 h-3.5 ml-1" />
              </div> */}
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
                <h3 className="text-[18px] font-bold text-[#191B23] mb-2 font-headline">
                  Live Formula Engine
                </h3>
                <p className="text-[14px] text-[#434655] leading-relaxed">
                  Automate calculations instantly. Reduces human error in weight
                  checks and yield calculations.
                </p>
              </div>
              {/* <div className="mt-4 pt-3 flex items-center text-[12px] font-semibold text-[#004BC6] group-hover:translate-x-1 transition-transform">
                <span>Test dynamic formulas</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div> */}
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
                <h3 className="text-[18px] font-bold text-[#191B23] mb-2 font-headline">
                  Role-Based Workflows
                </h3>
                <p className="text-[14px] text-[#434655] leading-relaxed">
                  Enforce strict SOPs with multi-tier approval routing for QA
                  and Production Supervisors.
                </p>
              </div>
              {/* <div className="mt-4 pt-3 flex items-center text-[12px] font-semibold text-[#004BC6] group-hover:translate-x-1 transition-transform">
                <span>Multi-tier approval paths</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div> */}
            </div>

            {/* Card 4: Cryptographic Signatures */}
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
                <h3 className="text-[18px] font-bold text-[#191B23] mb-2 font-headline">
                  Cryptographic Signatures
                </h3>
                <p className="text-[14px] text-[#434655] leading-relaxed">
                  Ensure compliance with Part 11 compliant digital signatures
                  and immutable audit trails.
                </p>
              </div>
              {/* <div className="mt-4 pt-3 flex items-center text-[12px] font-semibold text-[#004BC6] group-hover:translate-x-1 transition-transform">
                <span>21 CFR Part 11 compliant</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div> */}
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
                <h3 className="text-[18px] font-bold text-[#191B23] mb-2 font-headline">
                  Offline-First PWA
                </h3>
                <p className="text-[14px] text-[#434655] leading-relaxed">
                  Keep working even in deep warehouse dead-zones. Auto-syncs
                  when connectivity returns.
                </p>
              </div>
              {/* <div className="mt-4 pt-3 flex items-center text-[12px] font-semibold text-[#004BC6] group-hover:translate-x-1 transition-transform">
                <span>Local IndexedDB caching</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div> */}
            </div>

            {/* Card 6: Compliance Export */}
            <div
              id="capability-card-6"
              className="bg-white border border-[#E1E2ED] rounded-2xl p-6 lg:p-7 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#FFDAD6] text-[#93000A] flex items-center justify-center mb-5 shadow-xs group-hover:scale-105 transition-transform">
                  <img src={Icons.compliance} className="w-10 h-10" />
                </div>
                <h3 className="text-[18px] font-bold text-[#191B23] mb-2 font-headline">
                  Compliance Export
                </h3>
                <p className="text-[14px] text-[#434655] leading-relaxed">
                  Generate instant, audit-ready PDF reports and raw data exports
                  for regulatory bodies.
                </p>
              </div>
              {/* <div className="mt-4 pt-3 flex items-center text-[12px] font-semibold text-[#004BC6] group-hover:translate-x-1 transition-transform">
                <span>Instant audit-ready packages</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div> */}
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
                <img src={Icons.logo} className="w-5 h-5 " />
              </div>
              <span className="text-[18px] font-bold text-[#191B23] font-headline">
                DigiForms
              </span>
            </div>
            <p className="mt-2 text-[13px] text-[#5F5E5E]">
              © {currentYear} DigiForms v1.0. All rights reserved. Controlled
              Documentation System.
            </p>
          </div>

          {/* Footer Links */}
          {/* <div className="flex flex-wrap gap-x-8 gap-y-2 text-[13px] text-[#5F5E5E]">
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  'DigiForms is built according to GAMP 5 & FDA 21 CFR Part 11 privacy and data encryption standards.',
                );
              }}
              className="hover:text-[#004BC6] hover:underline transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  'Terms of Service: Enterprise SLA with 99.99% logbook uptime guarantee.',
                );
              }}
              className="hover:text-[#004BC6] hover:underline transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#security"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  'Security Compliance: SOC 2 Type II, ISO 27001, Part 11 electronic records certified.',
                );
              }}
              className="hover:text-[#004BC6] hover:underline transition-colors"
            >
              Security Compliance
            </a>
            <a
              href="#status"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  'All packaging sync clusters operating at 100% efficiency.',
                );
              }}
              className="hover:text-[#004BC6] hover:underline transition-colors"
            >
              Status
            </a>
            <a
              href="#support"
              onClick={(e) => {
                e.preventDefault();
                setSopGuideOpen(true);
              }}
              className="hover:text-[#004BC6] hover:underline transition-colors"
            >
              Contact Support
            </a>
          </div> */}
        </div>
      </footer>
    </div>
  );
}
