import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { hasClerkKeys } from '@/lib/clerkConfig';
import adminAuth from '@/lib/adminAuth';
import superadminAuth from '@/lib/superadminAuth';

const { isAdminRequestAuthorized } = adminAuth;
const { isSuperadminRequestAuthorized } = superadminAuth;

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

const superadminRoutes = createRouteMatcher([
  '/superadmin(.*)',
  '/api/superadmin(.*)',
]);

const superadminLoginRoute = createRouteMatcher([
  '/superadmin/login',
]);

const adminLoginRoute = createRouteMatcher([
  '/admin/login',
]);

export default function middleware(req) {
  // Superadmin routes — protected by their own cookie (never Clerk)
  if (superadminRoutes(req) && !superadminLoginRoute(req)) {
    if (!isSuperadminRequestAuthorized(req)) {
      return Response.redirect(new URL('/superadmin/login', req.url));
    }
  }

  if (!hasClerkKeys) {
    // Without Clerk: only cookie-based admin protection
    if (adminSubRoutes(req) && !isAdminRequestAuthorized(req)) {
      return Response.redirect(new URL('/admin/login', req.url));
    }
    return;
  }

  return clerkMiddleware((auth, request) => {
    if (protectedRoutes(request)) {
      auth().protect();
    }

    if (adminSubRoutes(request) && !isAdminRequestAuthorized(request)) {
      return Response.redirect(new URL('/admin/login', request.url));
    }
  })(req);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
