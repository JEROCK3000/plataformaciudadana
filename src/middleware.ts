import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminToken = request.cookies.get('admin_token')?.value;
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Para simplificar, en Next.js Edge Middleware no podemos usar jsonwebtoken fácilmente (usa Node APIs).
    // Con la existencia del token asumimos autenticación. Las validaciones finas se pueden hacer en Server Actions o Layouts.
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
