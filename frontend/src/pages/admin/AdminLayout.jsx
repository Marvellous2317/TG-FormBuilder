import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const navDetails = [
  {
    icon: '/icons/dashboard.png',
    title: 'Dashboard',
    to: '/admin/dashboard',
  },
  {
    icon: '/icons/user.png',
    title: 'User management',
    to: '/admin/user-management',
  },
  {
    icon: '/icons/settings.png',
    title: 'Settings',
    to: '/admin/settings',
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary-300 text-white flex flex-col">
        <div className="p-4 border-b border-secondary-500 flex items-center gap-2">
          <img src="/images/logo.png" alt="logo" className="w-10 h-10" />
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-white text-sm font-geist font-semibold">
              Packaging Logbook
            </h1>
            <p className="text-xs text-secondary-400 font-geist font-medium">
              Digitalization Portal
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          {navDetails.map(({ icon, title, to }, index) => (
            <Link
              key={index}
              to={to}
              className="flex items-center gap-2 py-2 px-2.5 hover:bg-secondary-600 rounded-[10px]"
            >
              <img src={icon} alt={`{title}_icon`} className="w-4 h-4" />
              <p className="font-geist text-sm text-tertiary">{title}</p>
            </Link>
          ))}
        </nav>

        <button className="cursor-pointer transition-all duration-150 active:scale-95 flex gap-2 items-center mb-8 bg-secondary-600 rounded-[14px] mx-4 justify-center p-2.5">
          <div className="p-2 bg-primary-200 text-sm rounded-full font-geist font-semibold">
            CL
          </div>
          <div className="gap-0.5 flex flex-col items-start">
            <h1 className="text-white font-geist text-sm">Charles Lennox</h1>
            <p className="text-tertiary font-geist text-xs">
              lennox.charles@tolaram.com
            </p>
          </div>
        </button>
      </aside>

      <Outlet />
    </div>
  );
}
