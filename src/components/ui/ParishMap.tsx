'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import type { GeoJsonObject, Feature, Geometry } from 'geojson';
import type { Layer, PathOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type ParishReportCount = {
  parish: string;
  total: number;
  resolved: number;
  pending: number;
  inProgress: number;
};

type Props = {
  data: ParishReportCount[];
};

const STATUS_LABEL: Record<string, string> = {
  resolved: 'Resueltos',
  pending: 'Pendientes',
  inProgress: 'En proceso',
};

function getColor(count: number, max: number): string {
  if (max === 0 || count === 0) return '#e5e7eb';
  const ratio = count / max;
  if (ratio >= 0.8) return '#065f46';
  if (ratio >= 0.6) return '#047857';
  if (ratio >= 0.4) return '#059669';
  if (ratio >= 0.2) return '#34d399';
  return '#a7f3d0';
}

export default function ParishMap({ data }: Props) {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    fetch('/data/quijos-parishes.geojson')
      .then(r => r.json())
      .then(setGeoData);
  }, []);

  const max = Math.max(...data.map(d => d.total), 1);
  const dataMap = Object.fromEntries(data.map(d => [d.parish, d]));

  const styleFeature = (feature?: Feature<Geometry>): PathOptions => {
    const name = feature?.properties?.name ?? '';
    const count = dataMap[name]?.total ?? 0;
    return {
      fillColor: getColor(count, max),
      weight: 2,
      opacity: 1,
      color: isDark ? '#374151' : '#ffffff',
      fillOpacity: 0.82,
    };
  };

  const onEachFeature = (feature: Feature<Geometry>, layer: Layer) => {
    const name = feature.properties?.name ?? '';
    const stat = dataMap[name];
    const total = stat?.total ?? 0;
    const tooltipContent = `
      <div style="font-family:sans-serif;min-width:160px">
        <div style="font-weight:700;font-size:14px;margin-bottom:6px;border-bottom:1px solid #e5e7eb;padding-bottom:4px">${name}</div>
        <div style="font-size:18px;font-weight:800;color:#059669">${total} <span style="font-size:12px;font-weight:400;color:#6b7280">reportes</span></div>
        ${stat ? `
          <div style="margin-top:6px;font-size:12px;color:#374151">
            <div>🟢 Resueltos: <strong>${stat.resolved}</strong></div>
            <div>🔵 En proceso: <strong>${stat.inProgress}</strong></div>
            <div>🟣 Pendientes: <strong>${stat.pending}</strong></div>
          </div>` : '<div style="font-size:12px;color:#9ca3af;margin-top:4px">Sin reportes registrados</div>'}
      </div>
    `;
    (layer as { bindTooltip: (content: string, opts: object) => void }).bindTooltip(tooltipContent, {
      sticky: true,
      direction: 'top',
      opacity: 0.97,
    });
  };

  return (
    <div className="relative w-full h-[480px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {!geoData ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <span className="text-gray-400 text-sm">Cargando mapa…</span>
        </div>
      ) : (
        <MapContainer
          center={[-0.48, -77.86]}
          zoom={10}
          scrollWheelZoom={false}
          className="w-full h-full z-0"
          style={{ background: isDark ? '#111827' : '#f9fafb' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            opacity={0.55}
          />
          <GeoJSON
            key={JSON.stringify(data)}
            data={geoData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-md text-xs space-y-1">
        <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Reportes</p>
        {[
          { color: '#065f46', label: 'Muy alto' },
          { color: '#047857', label: 'Alto' },
          { color: '#059669', label: 'Medio' },
          { color: '#34d399', label: 'Bajo' },
          { color: '#a7f3d0', label: 'Muy bajo' },
          { color: '#e5e7eb', label: 'Sin datos' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm inline-block flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
