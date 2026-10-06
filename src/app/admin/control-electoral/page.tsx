import React from 'react';
import { getElectoralDashboardData } from '@/lib/actions/electoral';
import ControlElectoralClient from '@/components/admin/ControlElectoralClient';

export const dynamic = 'force-dynamic';

export default async function ControlElectoralPage() {
  const data = await getElectoralDashboardData();

  return <ControlElectoralClient data={data} />;
}
