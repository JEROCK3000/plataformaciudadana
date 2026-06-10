'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, type PieLabelRenderProps,
} from 'recharts';

export type ParishStat = {
  parish: string;
  total: number;
  RECEIVED: number;
  IN_REVIEW: number;
  IN_PROGRESS: number;
  RESOLVED: number;
  REJECTED: number;
};

export type CategoryStat = {
  category: string;
  count: number;
};

export type UrgencyStat = {
  urgency: string;
  count: number;
};

const STATUS_COLORS: Record<string, string> = {
  RECEIVED: '#6366f1',
  IN_REVIEW: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  RESOLVED: '#10b981',
  REJECTED: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Recibido',
  IN_REVIEW: 'En revisión',
  IN_PROGRESS: 'En proceso',
  RESOLVED: 'Resuelto',
  REJECTED: 'Rechazado',
};

const CATEGORY_COLORS = [
  '#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'
];

const CATEGORY_LABELS: Record<string, string> = {
  INFRASTRUCTURE: 'Infraestructura',
  SECURITY: 'Seguridad',
  WATER: 'Agua',
  SERVICES: 'Servicios',
  ENVIRONMENT: 'Medio Ambiente',
  EDUCATION: 'Educación',
  OTHER: 'Otro',
};

const URGENCY_COLORS: Record<string, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
};

const URGENCY_LABELS: Record<string, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
};

function shortParish(name: string) {
  const map: Record<string, string> = {
    'San Francisco de Borja': 'S.F. Borja',
  };
  return map[name] ?? name;
}

export function ParishBarChart({ data }: { data: ParishStat[] }) {
  const chartData = data.map(d => ({ ...d, parish: shortParish(d.parish) }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="parish" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ borderRadius: 8, fontSize: 13 }}
          formatter={(val) => [val, 'Reportes']}
        />
        <Bar dataKey="total" name="Total reportes" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ParishStackedChart({ data }: { data: ParishStat[] }) {
  const chartData = data.map(d => ({ ...d, parish: shortParish(d.parish) }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="parish" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
        <Legend formatter={(val) => STATUS_LABELS[val] ?? val} wrapperStyle={{ fontSize: 12 }} />
        {Object.keys(STATUS_COLORS).map(status => (
          <Bar key={status} dataKey={status} name={status} stackId="a" fill={STATUS_COLORS[status]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryPieChart({ data }: { data: CategoryStat[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={90}
          dataKey="count"
          nameKey="category"
          label={({ name, percent }: PieLabelRenderProps) =>
            `${CATEGORY_LABELS[name as string] ?? name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(val, name) => [val, CATEGORY_LABELS[name as string] ?? name]}
          contentStyle={{ borderRadius: 8, fontSize: 13 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function UrgencyPieChart({ data }: { data: UrgencyStat[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={90}
          dataKey="count"
          nameKey="urgency"
          label={({ name, percent }: PieLabelRenderProps) =>
            `${URGENCY_LABELS[name as string] ?? name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((entry) => (
            <Cell key={entry.urgency} fill={URGENCY_COLORS[entry.urgency] ?? '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip
          formatter={(val, name) => [val, URGENCY_LABELS[name as string] ?? name]}
          contentStyle={{ borderRadius: 8, fontSize: 13 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
