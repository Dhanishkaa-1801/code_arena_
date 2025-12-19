'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type User } from '@supabase/supabase-js';
import { LayoutDashboard, Eye, LogOut, Code2 } from 'lucide-react';

// --- FIXED: This export is required for your Admin Layout to compile ---
export type NavItem = {
  label: string;
  href: string;
};

const SignOutButton = () => {
  return (
    <form action="/auth/sign-out" method="post">
      <button type="submit" className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:bg-red-600/20 hover:text-red-400 rounded-b-md transition-colors flex items-center gap-2">
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
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
              isActive
                ? 'bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg shadow-lg shadow-arena-pink/20'
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
  userRole?: string;
}

export default function Header({ user, customNavItems, userRole }: HeaderProps) {
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userAvatarUrl = user?.user_metadata?.avatar_url;

  // Logic from your previous code preserved exactly
  const defaultNavItems: NavItem[] = [
    { label: 'Contests', href: '/contests' },
    { label: 'Problems', href: '/problems' },
  ];

  const itemsToRender = customNavItems || defaultNavItems;
  const isAdminView = !!customNavItems;
  const isUserAdmin = userRole === 'admin';

  return (
    <header className="bg-[#020617] border-b border-white/10 h-[76px] sticky top-0 z-50 font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-full flex items-center justify-between">
        
        {/* Left Section: Logo logic updated to point to "/" only */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-arena-pink/50 transition-all">
               <Code2 className="text-arena-pink" size={24} strokeWidth={2} />
            </div>
            <span className="text-arena-pink text-2xl font-bold tracking-tight uppercase">CODE ARENA</span>
            {isAdminView && (
              <span className="bg-arena-pink/20 text-arena-pink text-[10px] font-bold px-2 py-0.5 rounded border border-arena-pink/30 tracking-widest ml-1 uppercase">
                ADMIN PANEL
              </span>
            )}
          </Link>
          <div className="hidden md:flex">
             <NavLinks items={itemsToRender} />
          </div>
        </div>
        
        {/* Right Section: Logic preserved from your previous code */}
        {user && (
          <div className="flex items-center gap-4">
            
            {/* Admin Dashboard Button - Solid Pink */}
            {isUserAdmin && !isAdminView && (
              <Link 
                href="/admin/contests"
                className="hidden md:flex items-center gap-2 bg-arena-pink text-dark-bg font-bold px-4 py-2 rounded-full text-xs hover:bg-white transition-all shadow-lg shadow-arena-pink/20"
              >
                <LayoutDashboard size={14} />
                Admin Dashboard
              </Link>
            )}

            {/* Student View Button - Solid Blue */}
            {isUserAdmin && isAdminView && (
              <Link 
                href="/contests"
                className="hidden md:flex items-center gap-2 bg-arena-blue text-white font-bold px-4 py-2 rounded-full text-xs hover:bg-white hover:text-arena-blue transition-all shadow-lg border border-arena-blue/30"
              >
                <Eye size={14} />
                Student View
              </Link>
            )}

            <div className="group relative h-full flex items-center">
              <div className="flex items-center gap-3 pl-3 pr-1 py-1 bg-white/5 rounded-full cursor-pointer hover:bg-white/10 border border-white/10 transition-all">
                <span className="font-bold text-xs text-gray-300 hidden sm:block ml-1">{userName}</span>
                {userAvatarUrl ? (
                  <img src={userAvatarUrl} alt={userName} className="w-8 h-8 rounded-full border border-white/10" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-arena-pink to-arena-blue flex items-center justify-center font-bold text-[10px] text-dark-bg uppercase">
                    {userName.charAt(0)}
                  </div>
                )}
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full right-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl py-1.5 overflow-hidden">
                  <Link 
                    href="/profile" 
                    className="block px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors border-b border-white/5"
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