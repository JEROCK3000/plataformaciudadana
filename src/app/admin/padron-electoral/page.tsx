import React from 'react';
import { requireTenantAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import VoterRollManager from '@/components/admin/campaign/VoterRollManager';

export const dynamic = 'force-dynamic';

export default async function PadronElectoralPage() {
  const { session, tenantId } = await requireTenantAdmin();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  const [voters, totalCount, totalVotedCount, recintos] = await Promise.all([
    prisma.voterRoll.findMany({
      where: { tenantId },
      include: { recinto: true, junta: true },
      orderBy: [{ parish: 'asc' }, { fullName: 'asc' }],
      take: 200,
    }),
    prisma.voterRoll.count({ where: { tenantId } }),
    prisma.voterRoll.count({ where: { tenantId, hasVoted: true } }),
    prisma.electoralRecinto.findMany({
      where: { tenantId },
      include: { juntas: true },
      orderBy: { electors: 'desc' },
    }),
  ]);

  const parishes = Array.isArray(tenant?.parishes)
    ? (tenant.parishes as string[])
    : ['Baeza', 'San Francisco de Borja', 'Papallacta', 'Cuyuja', 'Cosanga', 'Sumaco'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <VoterRollManager
          initialVoters={voters as any}
          recintos={recintos as any}
          totalRegistered={totalCount}
          totalVoted={totalVotedCount}
          candidateName={tenant?.candidateName || 'Brandon Aliaga'}
          campaignListNumber={tenant?.campaignListNumber || 'PSC 6 - PK 18'}
          parishes={parishes}
        />
      </div>
    </div>
  );
}
