import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { prisma } from '@/lib/db/prisma';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';

export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
  tenantId: string | null;
}

export interface SessionUser extends TokenPayload {
  name: string;
  tenantSlug?: string;
  tenantName?: string;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;

  const payload = verifyToken(token) as TokenPayload | null;
  if (!payload || !payload.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    include: { tenant: true },
  });

  if (!user) return null;

  // Si el usuario pertenece a un tenant, verificar que el tenant esté activo
  if (user.tenantId && user.tenant && !user.tenant.isActive) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    tenantSlug: user.tenant?.slug,
    tenantName: user.tenant?.name,
  };
}

export async function requireAuth(allowedRoles?: Role[]): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    // Si es superadmin intentando acceder a admin, se permite
    if (session.role === 'SUPERADMIN') {
      return session;
    }
    redirect('/login');
  }

  return session;
}

export async function requireTenantAdmin(): Promise<{ session: SessionUser; tenantId: string }> {
  const session = await requireAuth(['ADMIN', 'MODERATOR', 'SUPERADMIN']);
  
  // Si es superadmin, puede venir con una cookie de tenant_override o por defecto el primer tenant activo
  if (session.role === 'SUPERADMIN' && !session.tenantId) {
    const cookieStore = await cookies();
    const overrideSlug = cookieStore.get('superadmin_tenant_override')?.value;
    
    let tenant = null;
    if (overrideSlug) {
      tenant = await prisma.tenant.findUnique({ where: { slug: overrideSlug } });
    }
    if (!tenant) {
      tenant = await prisma.tenant.findFirst({ where: { isActive: true } });
    }
    
    if (!tenant) {
      redirect('/superadmin');
    }
    
    return { session, tenantId: tenant.id };
  }

  if (!session.tenantId) {
    redirect('/login');
  }

  return { session, tenantId: session.tenantId };
}
