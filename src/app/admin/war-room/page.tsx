import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { requireTenantAdmin } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import WarRoomClient from '@/components/admin/WarRoomClient';

export const dynamic = 'force-dynamic';

export default async function WarRoomPage() {
  const { tenantId } = await requireTenantAdmin();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    redirect('/admin');
  }

  const reports = await prisma.report.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      urgency: true,
      parish: true,
      neighborhood: true,
      citizenName: true,
      citizenContact: true,
      status: true,
      createdAt: true,
    }
  });

  const parishes = Array.isArray(tenant.parishes) 
    ? (tenant.parishes as string[]) 
    : [];

  return (
    <WarRoomClient
      tenant={{
        id: tenant.id,
        name: tenant.name,
        canton: tenant.canton,
        province: tenant.province,
        slug: tenant.slug,
        parishes,
        candidateName: tenant.candidateName,
        campaignSlogan: tenant.campaignSlogan,
        campaignListNumber: tenant.campaignListNumber,
        campaignMode: !!tenant.campaignMode,
        candidatePhotoUrl: tenant.candidatePhotoUrl,
        partyLogoUrl: tenant.partyLogoUrl,
        citizenTermSingularM: tenant.citizenTermSingularM,
        citizenTermSingularF: tenant.citizenTermSingularF,
        citizenTermPlural: tenant.citizenTermPlural,
      }}
      reports={reports.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString()
      }))}
    />
  );
}
