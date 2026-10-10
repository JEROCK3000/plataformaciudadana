import React from 'react';
import { requireTenantAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import TerritorialAgenda from '@/components/admin/campaign/TerritorialAgenda';

export const dynamic = 'force-dynamic';

export default async function AgendaTerritorialPage() {
  const { session, tenantId } = await requireTenantAdmin();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  const activities = await prisma.campaignActivity.findMany({
    where: { tenantId },
    orderBy: { date: 'asc' },
  });

  const topReportsByParish = await prisma.report.groupBy({
    by: ['parish', 'category'],
    where: { tenantId },
    _count: { id: true },
    _sum: { votes: true },
  });

  const parishes = Array.isArray(tenant?.parishes)
    ? (tenant.parishes as string[])
    : ['Baeza', 'San Francisco de Borja', 'Papallacta', 'Cuyuja', 'Cosanga', 'Sumaco'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <TerritorialAgenda
          initialActivities={activities}
          topReportsByParish={topReportsByParish}
          candidateName={tenant?.candidateName || 'Brandon Aliaga'}
          campaignListNumber={tenant?.campaignListNumber || 'PSC 6 - PK 18'}
          parishes={parishes}
        />
      </div>
    </div>
  );
}
