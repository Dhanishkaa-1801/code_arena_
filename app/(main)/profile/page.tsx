import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function MyProfileRedirectPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // If not logged in, send them to the login page
    redirect('/login');
  }

  // If logged in, redirect them to their own dynamic profile page
  redirect(`/profile/${user.id}`);
}