import React from 'react';
import { prisma } from '@/lib/db/prisma';
import CitizenPortalView from '@/components/portal/CitizenPortalView';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Buscar la instancia cantonal de Quijos
  let tenant = await prisma.tenant.findUnique({
    where: { slug: 'quijos' },
    include: {
      reports: {
        where: {
          moderationStatus: { not: 'DISCARDED' },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!tenant) {
    tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
      include: {
        reports: {
          where: {
            moderationStatus: { not: 'DISCARDED' },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  const parishes = Array.isArray(tenant?.parishes)
    ? (tenant.parishes as string[])
    : ['Baeza', 'Cosanga', 'Cuyuja', 'Papallacta', 'San Francisco de Borja', 'Sumaco'];

  const reports = (tenant?.reports || []).map((r) => ({
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
        id: tenant?.id || 'default',
        name: tenant?.name || 'GAD Municipal del Cantón Quijos',
        canton: tenant?.canton || 'Quijos',
        province: tenant?.province || 'Napo',
        slug: tenant?.slug || 'quijos',
        parishes,
        campaignMode: !!tenant?.campaignMode,
        candidateName: tenant?.candidateName || null,
        campaignSlogan: tenant?.campaignSlogan || null,
        campaignListNumber: tenant?.campaignListNumber || null,
        candidatePhotoUrl: tenant?.candidatePhotoUrl || null,
        partyLogoUrl: tenant?.partyLogoUrl || null,
        logoUrl: tenant?.logoUrl || null,
        citizenTermSingularM: tenant?.citizenTermSingularM || null,
        citizenTermSingularF: tenant?.citizenTermSingularF || null,
      }}
      reports={reports}
    />
  );
}
