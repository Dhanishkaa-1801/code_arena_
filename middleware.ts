// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // This will refresh the session cookie if it's expired.
  await supabase.auth.getSession();

  // Define public routes that anyone can access
  const publicRoutes = ['/', '/login', '/auth/callback'];
  const { pathname } = request.nextUrl;

  // Check if the current route is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route);

  // If it's not a public route, proceed to check for a session
  if (!isPublicRoute) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // If there's no session and the route is protected, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to add other public assets here.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};