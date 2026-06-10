'use client';

import dynamic from 'next/dynamic';
import type { ParishReportCount } from './ParishMap';

const ParishMap = dynamic(() => import('./ParishMap'), { ssr: false });

export default function ParishMapWrapper({ data }: { data: ParishReportCount[] }) {
  return <ParishMap data={data} />;
}
