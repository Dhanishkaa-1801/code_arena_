// components/Header.tsx
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

const SignOutButton = () => {
  return (
    <form action="/auth/sign-out" method="post">
      <button type="submit" className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-red-600/50 rounded-b-md">
        Sign Out
      </button>
    </form>
  );
};

export default async function Header() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userAvatarUrl = user?.user_metadata?.avatar_url;

  return (
    <header className="bg-card-bg/80 backdrop-blur-lg border-b border-border-color h-[70px] sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-full flex items-center justify-between">
        <Link href="/problems" className="flex items-center gap-3">
          <i className="fas fa-code text-arena-pink text-3xl"></i>
          <span className="hidden sm:block text-xl font-bold text-arena-pink tracking-wider">CODE ARENA</span>
        </Link>
        
        {user && (
          <div className="flex items-center gap-3">
            <div className="group relative">
              <div className="flex items-center gap-3 px-3 py-1.5 bg-dark-bg/70 rounded-full cursor-pointer hover:bg-arena-blue/20 transition-all">
                {userAvatarUrl ? (
                  <img src={userAvatarUrl} alt={userName} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-arena-pink to-arena-blue flex items-center justify-center font-bold text-dark-bg">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-sm hidden sm:block">{userName}</span>
              </div>
              {/* Dropdown Menu */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-card-bg border border-border-color rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                <div className="py-1">
                  {/* You can add more links here like "Profile", "Settings", etc. */}
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