// app/components/AdminLink.tsx

import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export async function AdminLink() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // Don't show anything if not logged in
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Only render the link if the user's role is 'admin'
  if (profile?.role === 'admin') {
    return (
      <div className="p-4 bg-indigo-900/50 border border-indigo-700 rounded-lg text-center mt-8">
        <h3 className="text-lg font-semibold text-white">Admin Access</h3>
        <p className="text-indigo-200 mt-1 mb-3">You are logged in as an administrator.</p>
        <Link 
          href="/admin/contests"
          className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Go to Admin Panel
        </Link>
      </div>
    );
  }

  // If not an admin, render nothing
  return null;
}