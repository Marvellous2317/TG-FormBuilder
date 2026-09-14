import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Button from '../../shared/components/Button';
import { FiMenu, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Icons from '../../assets/icons';
import Images from '../../assets/images';
import { useAuthStore } from '../../shared/store/authStore';
import { getInitials } from '../../shared/utils/constants';
import { LuLogOut } from 'react-icons/lu';
import clearAllCaches from '../../lib/clearCache';
import { useQueryClient } from '@tanstack/react-query';

const navDetails = [
  {
    icon: Icons.dashboardActive,
    icon2: Icons.dashboardInactive,
    title: 'Dashboard',
    to: '/admin',
  },
  {
    icon: Icons.userActive,
    icon2: Icons.userInactive,
    title: 'User management',
    to: '/admin/users',
  },
  {
    icon: Icons.settingsActive,
    icon2: Icons.settingsInactive,
    title: 'Settings',
    to: '/admin/settings',
  },
];

const navDetailsRead = [
  {
    icon: Icons.dashboardActive,
    icon2: Icons.dashboardInactive,
    title: 'Dashboard',
    to: '/admin',
  },
  {
    icon: Icons.settingsActive,
    icon2: Icons.settingsInactive,
    title: 'Settings',
    to: '/admin/settings',
  },
];

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const queryClient = useQueryClient();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    clearAllCaches();
    queryClient.clear();
  };

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isDesktop) setIsCollapsed(!isCollapsed);
    else setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navigate = useNavigate();

  const adminNavDetails =
    user?.accessLevel && user.accessLevel === 'read'
      ? navDetailsRead
      : navDetails;

  const workspaceName = user?.company?.companyName ?? 'DigiForms';
  const isCorporateAdmin =
    user?.role?.roleName.toLowerCase() === 'corporateadmin';

  return (
    <div className="flex h-screen w-full bg-white relative">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-primary-200 rounded-lg text-white lg:hidden shadow-lg"
      >
        <FiMenu size={20} />
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-auto lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky lg:top-0
          flex flex-col bg-secondary-300 text-white
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'left-0' : '-left-64 lg:left-0'}
          ${isCollapsed && isDesktop ? 'lg:w-20' : 'lg:w-64'}
          w-64 h-full lg:h-screen
          z-50 lg:z-auto
        `}
      >
        {/* Collapse Toggle Button (only on desktop) */}
        {/* {isDesktop && (
          <Button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 transform -translate-y-1/2
                       bg-primary-200
                       rounded-full p-1.5 shadow-md
                       transition-all duration-200 z-50"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <FiChevronRight size={14} />
            ) : (
              <FiChevronLeft size={14} />
            )}
          </Button>
        )} */}

        {/* Logo Section */}
        <div
          className={`
          p-4 border-b border-secondary-500 flex items-center
          ${isCollapsed && isDesktop ? 'lg:justify-center' : 'lg:justify-start'}
          gap-2 shrink-0
        `}
        >
          <img
            src={Images.logo}
            alt="logo"
            className="w-8 h-8 md:w-10 md:h-10 shrink-0"
          />
          {(!isCollapsed || !isDesktop) && (
            <div className="flex items-end justify-between w-full">
              <a
                href="/"
                className="flex flex-col items-start gap-0.5 md:gap-1 overflow-hidden"
              >
                <h1 className="text-white text-xs md:text-sm font-geist font-semibold truncate">
                  DigiForms
                </h1>
                <p className="text-xs text-secondary-400 font-geist font-medium hidden sm:block truncate">
                  Digitalization Portal
                </p>
              </a>
              <Button
                onClick={toggleSidebar}
                className=" transform -translate-y-1/2
                       bg-primary-200
                       rounded-full p-1.5 shadow-md
                       transition-all duration-200"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <FiChevronRight size={14} />
                ) : (
                  <FiChevronLeft size={14} />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Navigation - scrollable */}
        <nav className="flex-1 p-3 md:p-4 space-y-2 md:space-y-3 overflow-y-auto">
          {adminNavDetails.map(({ icon, title, to, icon2 }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              onClick={closeMobileMenu}
              prefetch="intent"
              className={({ isActive }) => `
                flex items-center gap-2 md:gap-3 py-2 px-2.5 
                rounded-[10px] transition-colors
                ${
                  isActive
                    ? 'bg-secondary-600 text-white'
                    : 'hover:bg-secondary-600 text-tertiary'
                }
                ${isCollapsed && isDesktop ? 'lg:justify-center' : ''}
              `}
              title={isCollapsed && isDesktop ? title : ''}
            >
              {({ isActive }) => (
                <>
                  <img
                    src={isActive ? icon : icon2}
                    alt={title}
                    className="w-4 h-4 md:w-5 md:h-5 object-contain shrink-0"
                  />

                  {(!isCollapsed || !isDesktop) && (
                    <p className="font-geist text-xs md:text-sm text-tertiary truncate">
                      {title}
                    </p>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-center">
          {isDesktop && isCollapsed && (
            <Button
              onClick={toggleSidebar}
              className="transform -translate-y-1/2
                       bg-primary-200
                       rounded-full p-1.5 shadow-md
                       transition-all duration-200 w-fit"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <FiChevronRight size={14} />
              ) : (
                <FiChevronLeft size={14} />
              )}
            </Button>
          )}
        </div>

        {/* User Profile - fixed at bottom */}
        <div className="shrink-0 mt-auto px-4">
          <Button
            className={`
            w-full gap-2 mb-4 md:mb-6 bg-secondary-600 rounded-[14px] mx-0 
            justify-center p-2 md:p-2.5
            ${isCollapsed && isDesktop ? 'lg:px-2' : ''}
          `}
            onClick={() => navigate('/admin/settings')}
          >
            <div className="p-1.5 md:p-2 bg-primary-200 text-xs md:text-sm rounded-full font-geist font-semibold flex-shrink-0">
              {getInitials(`${user.firstName} ${user.lastName}`)}
            </div>
            {(!isCollapsed || !isDesktop) && (
              <div className="gap-0.5 flex flex-col items-start overflow-hidden">
                <h1 className="text-white font-geist text-xs md:text-sm truncate max-w-25 md:max-w-30">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-tertiary font-geist text-xs truncate max-w-32 md:max-w-36">
                  {user.email}
                </p>
              </div>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleLogout}
            className="bg-tertiary-500 justify-center items-center gap-1 p-2.5 rounded-xl transition-all hover:bg-tertiary-600 mb-5 w-full flex"
          >
            {!isCollapsed && isDesktop ? (
              <div className="gap-0.5 flex flex-col items-start overflow-hidden">
                <p className="text-white font-medium text-sm">Logout</p>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LuLogOut className="text-white" size={18} />
              </div>
            )}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col w-full lg:w-auto h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto pt-14 lg:pt-0 relative">
          <Outlet />
        </div>
        {isCorporateAdmin && (
          <div className="sticky bottom-0 border-t shadow-lg w-full border-tertiary-400 font-geist flex items-center justify-center p-1 text-sm bg-white font-medium z-10 shrink-0">
            Current workspace - {workspaceName}
          </div>
        )}
      </main>
    </div>
  );
}
