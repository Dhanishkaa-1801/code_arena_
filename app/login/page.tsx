// app/login/page.tsx
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { GoogleSignInButton } from './google-sign-in-button';

export default async function LoginPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // If the user is already logged in, redirect them away from the login page
  if (session) {
    return redirect('/problems');
  }

  const signInWithGoogle = async () => {
    'use server';
    const origin = headers().get('origin');
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Error signing in with Google:', error);
      // Optionally redirect to an error page
      return redirect('/login?error=Could not authenticate with Google');
    }

    if (data.url) {
      return redirect(data.url); // Redirect to Google's authentication page
    }

    return redirect('/login?error=An unknown error occurred');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-card-bg rounded-xl shadow-2xl border border-border-color">
        <div className="text-center">
          <i className="fas fa-code text-arena-pink text-5xl mb-4"></i>
          <h2 className="text-3xl font-extrabold text-gray-100">
            Sign in to Code Arena
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Compete, learn, and grow your skills.
          </p>
        </div>
        <form action={signInWithGoogle}>
          <GoogleSignInButton />
        </form>
      </div>
    </div>
  );
}