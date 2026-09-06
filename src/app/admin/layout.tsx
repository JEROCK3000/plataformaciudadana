import { requireTenantAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { ShieldAlert, ExternalLink } from 'lucide-react';
import SuperadminTenantSwitcher from '@/components/admin/SuperadminTenantSwitcher';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, tenantId } = await requireTenantAdmin();

  const currentTenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  const allTenants = session.role === 'SUPERADMIN' 
    ? await prisma.tenant.findMany({ select: { id: true, slug: true, name: true, canton: true } })
    : [];

  return (
    <>
      {session.role === 'SUPERADMIN' && (
        <div className="bg-purple-950 text-purple-200 border-b border-purple-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50">
          <div className="flex items-center gap-2 font-medium">
            <ShieldAlert size={16} className="text-purple-400" />
            <span>Modo Auditoría Superadmin: Administrando</span>
            <span className="font-bold text-white bg-purple-900/80 px-2 py-0.5 rounded border border-purple-700">
              {currentTenant?.name || 'Tenant Actual'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <SuperadminTenantSwitcher tenants={allTenants} currentSlug={currentTenant?.slug || ''} />
            <Link
              href="/superadmin"
              className="flex items-center gap-1 font-bold text-white bg-purple-700 hover:bg-purple-600 px-3 py-1 rounded transition-colors"
            >
              Panel Superadmin <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
