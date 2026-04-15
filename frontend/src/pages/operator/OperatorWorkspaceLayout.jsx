import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Images from '../../assets/images';

const navDetails = [
  {
    title: 'Pending Task',
    to: '/operator',
  },
  {
    title: 'Approved Task',
    to: '/operator/approved',
  },
  {
    title: 'Settings',
    to: '/operator/settings',
  },
];

export default function OperatorWorkspaceLayout() {
  return (
    <div className="flex flex-col w-full h-screen bg-white relative">
      <aside className="w-full fixed lg:sticky lg:top-0 flex items-center transition-all duration-300 ease-in-out z-50 lg:z-auto h-20 bg-secondary-300 px-25 justify-between">
        <div className="w-full flex items-center gap-14 justify-start">
          <div className="p-4 border-b border-secondary-500 flex items-center lg:justify-start gap-2 shrink-0">
            <img
              src={Images.logo}
              alt="logo"
              className="w-8 h-8 md:w-10 md:h-10 shrink-0"
            />

            <div className="flex flex-col items-start gap-0.5 md:gap-1 overflow-hidden">
              <h1 className="text-white text-xs md:text-sm font-geist font-semibold truncate">
                Packaging Logbook
              </h1>
              <p className="text-xs text-secondary-400 font-geist font-medium hidden sm:block truncate">
                Digitalization Portal
              </p>
            </div>
          </div>

          <nav className="flex-1 p-3 md:p-4 flex items-center gap-4 overflow-y-auto">
            {navDetails.map(({ title, to }) => {
              const isActive = location.pathname === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => {}}
                  prefetch="intent"
                  className={() => `
                flex items-center gap-2 md:gap-3 py-2 px-2.5 
                rounded-[10px] transition-colors
                ${
                  isActive
                    ? 'bg-secondary-600 text-white'
                    : 'hover:bg-secondary-600 text-tertiary'
                }
               
              `}
                  title={title}
                >
                  <p className="font-geist text-xs md:text-sm truncate">
                    {title}
                  </p>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1.5 text-white md:p-2 bg-primary-200 text-xs md:text-sm rounded-full font-geist font-semibold shrink-0">
            CL
          </div>
          <h1 className="text-tertiary font-geist text-sm md:text-sm truncate max-w-[50%] md:max-w-[90%]">
            lennox.charles@tolaram.com
          </h1>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto w-full lg:w-auto lg:h-auto h-full">
        <div className="pt-14 lg:pt-0 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
