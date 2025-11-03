// app/auth/sign-out/route.ts
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    // You can handle the error here, maybe redirect to an error page
  }

  // Redirect to the homepage after signing out
  return redirect('/');
}