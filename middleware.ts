// In: middleware.ts

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const { data: { session } } = await supabase.auth.getSession();
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
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('profile_complete, role')
    .eq('id', session.user.id)
    .single();

  // ==================== THE "TRUTH-TELLER" DEBUG BLOCK ====================
  // This will print to your `npm run dev` terminal on every protected page load.
  console.log('--- MIDDLEWARE TRACE ---');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request Path:', pathname);
  console.log('User ID:', session.user.id);
  
  if (error) {
    // This is a CRITICAL log. If you see this, RLS on the `profiles` table is likely wrong.
    console.error('🔴 ERROR fetching profile in middleware:', error.message);
  }
  
  console.log('Profile Data Fetched:', profile);
  console.log('------------------------');
  // ========================================================================

  // Enforce profile setup if not complete
  if (profile && !profile.profile_complete) {
    if (pathname !== '/setup-profile') {
      console.log(' decisión: Redirecting to /setup-profile (profile incomplete)');
      return NextResponse.redirect(new URL('/setup-profile', request.url));
    }
  }

  // Prevent access to setup page if profile is already complete
  if (profile && profile.profile_complete && pathname === '/setup-profile') {
    console.log(' decisión: Redirecting to /contests (profile already complete)');
    return NextResponse.redirect(new URL('/contests', request.url));
  }

  // Enforce Admin Role for all /admin routes
  if (pathname.startsWith('/admin')) {
    // If the profile doesn't exist or the role is not 'admin'
    if (!profile || profile.role !== 'admin') {
      console.log(`🔴 ACCESS DENIED to /admin. User role is '${profile?.role}'. Redirecting to /contests.`);
      return NextResponse.redirect(new URL('/contests', request.url));
    }
    // If we reach here, user is an admin and can access the route.
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
     * This ensures the middleware runs on every page navigation.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};