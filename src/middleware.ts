import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_APP_URL } from '@/lib/adminApp';

/**
 * The admin screens and the email portal moved to the admin app. Old links and
 * bookmarks (/admin/users, /email-portal/compose?draft=…) go to the same page
 * there; the paths match, apart from the portal's old login. Runs only for
 * these two paths (see `matcher`), so no other page is affected.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  let target: string;
  if (pathname === '/email-portal/login') target = '/signin';
  else if (pathname.startsWith('/admin')) target = pathname.slice('/admin'.length) || '/';
  else target = pathname;
  // Temporary (307), so it can be changed later without browsers remembering it.
  return NextResponse.redirect(`${ADMIN_APP_URL}${target}${search}`, 307);
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/email-portal', '/email-portal/:path*'],
};
