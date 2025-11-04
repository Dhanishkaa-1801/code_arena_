import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/', '/login', '/auth/callback'];
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  const isAuthRoute = pathname.startsWith('/auth');

  if (isPublicRoute || isAuthRoute) {
    return response;
  }

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // --- NEW: Combine profile and role check into one query ---
  const { data: profile } = await supabase
    .from('profiles')
    .select('profile_complete, role')
    .eq('id', session.user.id)
    .single();

  // If profile isn't complete, enforce setup
  if (profile && !profile.profile_complete) {
    if (pathname !== '/setup-profile') {
      return NextResponse.redirect(new URL('/setup-profile', request.url));
    }
  }

  // If profile is complete but they are on setup page, redirect away
  if (profile && profile.profile_complete && pathname === '/setup-profile') {
    return NextResponse.redirect(new URL('/contests', request.url));
  }

  // --- NEW: Admin Role Check ---
  // If the user is trying to access an admin route
  if (pathname.startsWith('/admin')) {
    // And their role is NOT 'admin', redirect them away
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/contests', request.url)); // Or a '/403' access-denied page
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};