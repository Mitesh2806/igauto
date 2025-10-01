// src/components/Layout.tsx

import React from 'react';
import { Sidebar, SidebarBody, SidebarLink } from "./ui/Sidebar"; 
import {
  IconUser,
  IconUsers,
  IconLogout,
} from "@tabler/icons-react";
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const links = [
    {
      label: "My Profile",
      href: "/profile",
      icon: <IconUser className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Scraped Profiles",
      href: "/scraped-profiles",
      icon: <IconUsers className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* Fixed Sidebar */}
      <div className="flex-shrink-0 h-screen overflow-hidden">
        <Sidebar>
          <SidebarBody className="justify-between h-full">
            <div className="flex flex-col h-full">
              <div className="flex flex-col items-center justify-center pt-8">
               
              </div>
              <div className="mt-8 flex flex-col gap-2 flex-1">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
              {/* Logout Button */}
              <div className="mt-auto">
                <div
                  onClick={handleLogout}
                  className="flex items-center justify-start gap-2 group/sidebar py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md px-2 transition-colors"
                >
                  <IconLogout className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
                  <span className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre">
                    Logout
                  </span>
                </div>
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
      </div>
      
      {/* Scrollable Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;