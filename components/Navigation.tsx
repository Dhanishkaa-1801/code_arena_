'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const navItems = [
    { label: 'Problems', href: '/problems' },
    { label: 'Contests', href: '/contests' },
    { label: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <nav className="bg-card-bg/80 backdrop-blur-lg border-b border-border-color py-2 sticky top-[70px] z-40">
      <div className="flex justify-center gap-4 max-w-[1400px] mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg shadow-lg'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-100'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}