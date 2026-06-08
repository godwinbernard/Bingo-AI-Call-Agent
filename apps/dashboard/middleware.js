import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { hasClerkKeys } from '@/lib/clerkConfig';
import adminAuth from '@/lib/adminAuth';

const { isAdminRequestAuthorized } = adminAuth;

const protectedRoutes = createRouteMatcher([
  '/dashboard(.*)',
  '/campaigns(.*)',
  '/calls(.*)',
  '/scripts(.*)',
  '/contacts(.*)',
  '/settings(.*)',
  '/billing(.*)',
  '/team(.*)',
]);

const adminSubRoutes = createRouteMatcher([
  '/admin/customers(.*)',
  '/admin/revenue(.*)',
]);

export default function middleware(req) {
  if (!hasClerkKeys) {
    if (adminSubRoutes(req) && !isAdminRequestAuthorized(req)) {
      return Response.redirect(new URL('/admin', req.url));
    }

    return;
  }

  return clerkMiddleware((auth, request) => {
    if (protectedRoutes(request)) {
      auth().protect();
    }

    if (adminSubRoutes(request) && !isAdminRequestAuthorized(request)) {
      return Response.redirect(new URL('/admin', request.url));
    }
  })(req);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
