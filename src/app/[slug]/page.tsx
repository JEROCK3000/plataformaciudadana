import React from 'react';
import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import CitizenPortalView from '@/components/portal/CitizenPortalView';

export const dynamic = 'force-dynamic';

export default async function TenantPublicPortal({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ parish?: string; brigade?: string }>;
}) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const initialParish = query?.parish;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      reports: {
        where: {
          moderationStatus: { not: 'DISCARDED' },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!tenant || !tenant.isActive) {
    notFound();
  }

  const parishes = Array.isArray(tenant.parishes)
    ? (tenant.parishes as string[])
    : [tenant.canton];

  const reports = tenant.reports.map((r) => ({
    id: r.id,
    ticketCode: r.ticketCode,
    title: r.title,
    description: r.description,
    category: r.category as string,
    department: r.department as string,
    urgency: r.urgency as string,
    status: r.status as string,
    parish: r.parish,
    neighborhood: r.neighborhood,
    citizenName: r.citizenName,
    photos: r.photos,
    resolutionPhotos: r.resolutionPhotos,
    resolutionNotes: r.resolutionNotes,
    resolvedAt: r.resolvedAt,
    moderationStatus: r.moderationStatus as string,
    duplicateCount: r.duplicateCount,
    supportCount: r.supportCount,
    votes: r.votes,
    createdAt: r.createdAt,
  }));

  return (
    <CitizenPortalView
      tenant={{
        id: tenant.id,
        name: tenant.name,
        canton: tenant.canton,
        province: tenant.province,
        slug: tenant.slug,
        parishes,
        campaignMode: !!tenant.campaignMode,
        candidateName: tenant.candidateName,
        campaignSlogan: tenant.campaignSlogan,
        campaignListNumber: tenant.campaignListNumber,
        candidatePhotoUrl: tenant.candidatePhotoUrl,
        partyLogoUrl: tenant.partyLogoUrl,
        logoUrl: tenant.logoUrl,
        citizenTermSingularM: tenant.citizenTermSingularM,
        citizenTermSingularF: tenant.citizenTermSingularF,
      }}
      reports={reports}
      initialParish={initialParish}
    />
  );
}
