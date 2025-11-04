'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Re-ordered to match the new default page
const navLinks = [
  { name: 'View Contests', href: '/admin/contests' },
  { name: 'Host Contest', href: '/admin/host' },
  { name: 'Leaderboard', href: '/admin/leaderboard' },
];

function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-4">
      {navLinks.map((link) => {
        // This logic is more precise for highlighting the correct link.
        // It checks for an exact match for parent routes like /admin/contests.
        const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/admin/contests');
        
        // A special case to handle the /admin/contests/[id] pages
        if (link.href === '/admin/contests' && pathname.startsWith('/admin/contests/')) {
            const isActive = true;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-arena-pink text-dark-bg'
                    : 'text-gray-300 hover:bg-card-bg hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            );
        }

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname.startsWith(link.href)
                ? 'bg-arena-pink text-dark-bg'
                : 'text-gray-300 hover:bg-card-bg hover:text-white'
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}

export default AdminNavigation;