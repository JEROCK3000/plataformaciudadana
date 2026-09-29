import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { requireTenantAdmin } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import QRCodesClient from '@/components/admin/QRCodesClient';

export const dynamic = 'force-dynamic';

export default async function QRCodesPage() {
  const { tenantId } = await requireTenantAdmin();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    redirect('/admin');
  }

  const parishes = Array.isArray(tenant.parishes) 
    ? (tenant.parishes as string[]) 
    : [];

  return (
    <QRCodesClient
      tenant={{
        name: tenant.name,
        canton: tenant.canton,
        slug: tenant.slug,
        parishes,
        candidateName: tenant.candidateName,
        campaignSlogan: tenant.campaignSlogan,
        campaignListNumber: tenant.campaignListNumber,
        campaignMode: !!tenant.campaignMode,
        candidatePhotoUrl: tenant.candidatePhotoUrl,
        partyLogoUrl: tenant.partyLogoUrl,
      }}
    />
  );
}
