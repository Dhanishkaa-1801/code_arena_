import Header, { NavItem } from '@/components/Header';
import { createClient } from '@/utils/supabase/server';

// Define the specific links for the Admin Panel
const adminNavItems: NavItem[] = [
  { label: 'View Contests', href: '/admin/contests' },
  { label: 'Host New Contest', href: '/admin/host' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col">
      {/* Passed userRole="admin" to enable the 'Student View' button */}
      <Header user={user} customNavItems={adminNavItems} userRole="admin" />

      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}