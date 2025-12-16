'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type User } from '@supabase/supabase-js';
import { LayoutDashboard, Eye, LogOut } from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
};

const SignOutButton = () => {
  return (
    <form action="/auth/sign-out" method="post">
      <button type="submit" className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-red-600/50 rounded-b-md transition-colors flex items-center gap-2">
        <LogOut size={14} />
        Sign Out
      </button>
    </form>
  );
};

const NavLinks = ({ items }: { items: NavItem[] }) => {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 ${
              isActive
                ? 'bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg shadow-md'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
};

interface HeaderProps {
  user: User | null;
  customNavItems?: NavItem[];
  userRole?: string; // We need this to know if we should show the toggle buttons
}

export default function Header({ user, customNavItems, userRole }: HeaderProps) {
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userAvatarUrl = user?.user_metadata?.avatar_url;

  // Default links for Students
  const defaultNavItems: NavItem[] = [
    { label: 'Contests', href: '/contests' },
    { label: 'Problems', href: '/problems' },
  ];

  const itemsToRender = customNavItems || defaultNavItems;
  const isAdminView = !!customNavItems; // If we have custom items, we are in the Admin Panel
  const isUserAdmin = userRole === 'admin';

  return (
    <header className="bg-card-bg/80 backdrop-blur-lg border-b border-border-color h-[70px] sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-full flex items-center justify-between">
        
        {/* Left Section: Logo and Nav Links */}
        <div className="flex items-center gap-6">
          <Link href={isAdminView ? "/admin/contests" : "/contests"} className="flex items-center gap-3">
            <i className="fas fa-code text-arena-pink text-3xl"></i>
            <span className="hidden sm:block text-xl font-bold text-arena-pink tracking-wider">CODE ARENA</span>
            {isAdminView && (
              <span className="bg-arena-pink/20 text-arena-pink text-[10px] font-bold px-2 py-0.5 rounded border border-arena-pink/30 tracking-widest ml-1">
                ADMIN PANEL
              </span>
            )}
          </Link>
          <div className="hidden md:flex">
             <NavLinks items={itemsToRender} />
          </div>
        </div>
        
        {/* Right Section: User Profile Dropdown */}
        {user && (
          <div className="flex items-center gap-4">
            
            {/* --- BUTTON 1: Admin Dashboard (Visible only to Admins inside Student View) --- */}
            {isUserAdmin && !isAdminView && (
              <Link 
                href="/admin/contests"
                className="hidden md:flex items-center gap-2 bg-arena-pink text-dark-bg font-bold px-4 py-1.5 rounded-full text-xs hover:bg-white hover:text-arena-pink transition-all shadow-lg shadow-arena-pink/20"
              >
                <LayoutDashboard size={14} />
                Admin Dashboard
              </Link>
            )}

            {/* --- BUTTON 2: Student View (Visible only to Admins inside Admin View) --- */}
            {isUserAdmin && isAdminView && (
              <Link 
                href="/contests"
                className="hidden md:flex items-center gap-2 bg-arena-blue/10 text-arena-blue border border-arena-blue/30 font-bold px-4 py-1.5 rounded-full text-xs hover:bg-arena-blue hover:text-dark-bg transition-all"
              >
                <Eye size={14} />
                Student View
              </Link>
            )}

            <div className="group relative h-full flex items-center">
              <div className="flex items-center gap-3 px-3 py-1.5 bg-dark-bg/70 rounded-full cursor-pointer hover:bg-arena-blue/20 transition-all border border-transparent hover:border-arena-blue/30">
                {userAvatarUrl ? (
                  <img src={userAvatarUrl} alt={userName} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-arena-pink to-arena-blue flex items-center justify-center font-bold text-dark-bg">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-sm hidden sm:block">{userName}</span>
              </div>
              
              {/* Dropdown Menu - Fixed with pt-2 invisible bridge */}
              <div className="absolute top-full right-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-50">
                <div className="bg-card-bg border border-border-color rounded-md shadow-lg py-1">
                  <Link 
                    href="/profile" 
                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-arena-pink/10 hover:text-arena-pink transition-colors border-b border-border-color/50"
                  >
                    Profile & Stats
                  </Link>
                  <SignOutButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}