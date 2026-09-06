"use client";

import React, { useTransition } from 'react';
import { switchTenantOverrideAction } from '@/lib/actions/auth';
import { useRouter } from 'next/navigation';

interface TenantItem {
  id: string;
  slug: string;
  name: string;
  canton: string;
}

export default function SuperadminTenantSwitcher({
  tenants,
  currentSlug,
}: {
  tenants: TenantItem[];
  currentSlug: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSlug = e.target.value;
    startTransition(async () => {
      await switchTenantOverrideAction(newSlug);
      router.refresh();
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-purple-300">Cambiar GAD:</span>
      <select
        value={currentSlug}
        onChange={handleChange}
        disabled={isPending}
        className="bg-purple-900 border border-purple-700 text-white rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
      >
        {tenants.map((t) => (
          <option key={t.id} value={t.slug}>
            {t.canton} ({t.slug})
          </option>
        ))}
      </select>
    </div>
  );
}
