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
import { motion } from "motion/react";
import { useSidebar } from "./ui/Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  
  const links = [
    {
      label: "My Profile",
      href: "/profile",
      icon: <IconUser className="text-zinc-300 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Scraped Profiles",
      href: "/scraped-profiles",
      icon: <IconUsers className="text-zinc-300 h-5 w-5 flex-shrink-0" />,
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
          <SidebarBody className="justify-between h-full bg-zinc-900 border-r border-zinc-800">
            <div className="flex flex-col h-full">
              <div className="flex flex-col items-center justify-center pt-8">
                {/* Logo or branding can go here */}
              </div>
              <div className="mt-8 flex flex-col gap-2 flex-1">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
              {/* Logout Button */}
              <LogoutButton onClick={handleLogout} />
            </div>
          </SidebarBody>
        </Sidebar>
      </div>
     
      {/* Scrollable Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-black">
        <div className="p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

// Separate component for Logout button with proper animation
const LogoutButton = ({ onClick }: { onClick: () => void }) => {
  const { open, animate } = useSidebar();
  
  return (
    <div className="mt-auto">
      <div
        onClick={onClick}
        className="flex items-center justify-start gap-2 group/sidebar py-2 cursor-pointer hover:bg-zinc-800 rounded-md px-2 transition-colors"
      >
        <IconLogout className="text-zinc-300 h-5 w-5 flex-shrink-0" />
        <motion.span
          animate={{
            display: animate ? (open ? "inline-block" : "none") : "inline-block",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className="text-zinc-300 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
        >
          Logout
        </motion.span>
      </div>
    </div>
  );
};

export default Layout;