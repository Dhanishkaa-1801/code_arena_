// In: middleware.ts

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/', '/login', '/auth/callback'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Allow all public routes and Supabase auth callback routes to pass
  if (isPublicRoute || pathname.startsWith('/auth')) {
    return response;
  }

  // If no session exists and it's not a public route, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If a session exists, we must check the user's profile status and role.
  // 🔁 use maybeSingle instead of single so "no row" doesn't throw
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('profile_complete, role')
    .eq('id', session.user.id)
    .maybeSingle();

  // ==================== DEBUG BLOCK ====================
  console.log('--- MIDDLEWARE TRACE ---');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request Path:', pathname);
  console.log('User ID:', session.user.id);

  if (error) {
    console.error('🔴 ERROR fetching profile in middleware:', error.message);
  }

  console.log('Profile Data Fetched:', profile);
  console.log('------------------------');
  // =====================================================

  // 🔁 NEW: if no profile row at all, force setup (except on /setup-profile)
  if (!profile) {
    if (pathname !== '/setup-profile') {
      return NextResponse.redirect(new URL('/setup-profile', request.url));
    }
    // already on /setup-profile, allow
    return response;
  }

  // Enforce profile setup if not complete
  if (!profile.profile_complete && pathname !== '/setup-profile') {
    console.log(' decisión: Redirecting to /setup-profile (profile incomplete)');
    return NextResponse.redirect(new URL('/setup-profile', request.url));
  }

  // Prevent access to setup page if profile is already complete
  if (profile.profile_complete && pathname === '/setup-profile') {
    console.log(' decisión: Redirecting to /contests (profile already complete)');
    return NextResponse.redirect(new URL('/contests', request.url));
  }

  // Enforce Admin Role for all /admin routes
  if (pathname.startsWith('/admin')) {
    if (profile.role !== 'admin') {
      console.log(
        `🔴 ACCESS DENIED to /admin. User role is '${profile.role}'. Redirecting to /contests.`
      );
      return NextResponse.redirect(new URL('/contests', request.url));
    }
    console.log('✅ ACCESS GRANTED to /admin route.');
  }

  // If all checks pass, allow the request to proceed
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.svg (YOUR PINK LOGO ICON)
     * - any common image extensions (.png, .jpg, etc)
     * This ensures the icon and hero images load even when logged out.
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};