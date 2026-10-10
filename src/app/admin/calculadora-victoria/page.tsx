import React from 'react';
import { requireTenantAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import VictoryCalculator from '@/components/admin/campaign/VictoryCalculator';
import Link from 'next/link';
import { Calculator } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CalculadoraVictoriaPage() {
  const { session, tenantId } = await requireTenantAdmin();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  const scenario = await prisma.campaignScenario.findFirst({
    where: { tenantId, isDefault: true },
  }) || await prisma.campaignScenario.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });

  const recintos = await prisma.electoralRecinto.findMany({
    where: { tenantId },
    include: { juntas: true },
    orderBy: { electors: 'desc' },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <VictoryCalculator
          initialScenario={scenario}
          recintos={recintos}
          candidateName={tenant?.candidateName || 'Brandon Aliaga'}
          campaignListNumber={tenant?.campaignListNumber || 'PSC 6 - PK 18'}
        />
      </div>
    </div>
  );
}
