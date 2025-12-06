import Header, { NavItem } from '@/components/Header';
import { createClient } from '@/utils/supabase/server';

// Define the specific links for the Admin Panel
const adminNavItems: NavItem[] = [
  { label: 'View Contests', href: '/admin/contests' },
  { label: 'Host New Contest', href: '/admin/host' },
  // You can add Leaderboard here if you have a specific admin leaderboard route
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // We need the user data to populate the Header profile
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col">
      {/* 
        Reusing the standard Header component. 
        We pass 'adminNavItems' so it shows admin links instead of student links.
      */}
      <Header user={user} customNavItems={adminNavItems} />

      <main className="flex-1 w-full">
        {/* 
           We keep a container here for admin pages so tables don't stretch too wide. 
           If you want full width for admin too, remove 'max-w-7xl mx-auto px-8'.
        */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}