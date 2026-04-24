import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiHome, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Images from '../../assets/images';
import DropdownSelect from '../../shared/components/DropdownSelect';
import { useAuthStore } from '../../shared/store/authStore';
import { getInitials } from '../../shared/utils/constants';

const navDetails = [
  { title: 'Dashboard', to: '/approver', icon: FiHome },
  { title: 'Approved', to: '/approver/approved', icon: FiCheckCircle },
  { title: 'Rejected', to: '/approver/rejected', icon: FiXCircle },
];

export default function ApproverWorkspaceLayout() {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col w-full h-screen bg-white relative">
      {/* HEADER */}
      <aside className="w-full fixed lg:sticky top-0 flex items-center z-50 h-16 lg:h-20 bg-secondary-300 px-4 lg:px-10 justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-6 w-full">
          {/* LOGO */}
          <div className="flex items-center gap-2 shrink-0">
            <img
              src={Images.logo}
              alt="logo"
              className="w-8 h-8 md:w-10 md:h-10"
            />

            <div className="hidden sm:flex flex-col">
              <h1 className="text-white text-sm font-semibold truncate">
                Packaging Logbook
              </h1>
              <p className="text-xs text-secondary-400 truncate">
                Digitalization Portal
              </p>
            </div>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex flex-1 items-center gap-3 overflow-x-auto">
            {navDetails.map(({ title, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/operator'}
                className={({ isActive }) => `
                  flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap
                  ${
                    isActive
                      ? 'bg-secondary-600 text-white shadow-sm'
                      : 'text-tertiary hover:bg-secondary-500/40'
                  }
                `}
              >
                <Icon className="text-lg" />
                <span className="text-sm font-medium">{title}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* RIGHT (USER INFO) */}
        <Link to="/operator/settings" className="flex items-center gap-2 ">
          <div className="p-2 bg-primary-200 text-white text-xs rounded-full font-semibold">
            {getInitials(`${user.firstName} ${user.lastName}`)}
          </div>

          {/* Hide email on small screens */}
          <h1 className="hidden md:block text-tertiary text-sm truncate max-w-50">
            {user.email}
          </h1>
        </Link>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto w-full pt-16 lg:pt-0 pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 flex justify-around items-center h-16 z-50">
        {navDetails.map(({ title, to, icon: Icon }) => {
          const isActive = location.pathname === to;

          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/operator'}
              className="flex flex-col items-center justify-center text-xs"
            >
              <Icon
                className={`text-xl transition-all ${
                  isActive ? 'text-primary-200 scale-110' : 'text-gray-400'
                }`}
              />
              <span
                className={`mt-1 ${
                  isActive ? 'text-primary-200' : 'text-gray-400'
                }`}
              >
                {title}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
