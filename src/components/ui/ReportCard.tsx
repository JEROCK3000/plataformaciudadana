"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, User, CheckCircle, Home, Shield, Droplets, Zap, Leaf, GraduationCap, List } from 'lucide-react';
import type { Report } from '@prisma/client';
import { voteReport } from '@/lib/actions/reports';

const CATEGORY_META: Record<string, { label: string, icon: any, color: string }> = {
  INFRASTRUCTURE: { label: 'Infraestructura', icon: Home, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  SECURITY: { label: 'Seguridad', icon: Shield, color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  WATER: { label: 'Agua y Saneamiento', icon: Droplets, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300' },
  SERVICES: { label: 'Servicios', icon: Zap, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  ENVIRONMENT: { label: 'Medio Ambiente', icon: Leaf, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  EDUCATION: { label: 'Educación', icon: GraduationCap, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  OTHER: { label: 'Otros', icon: List, color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
};

const URGENCY_META: Record<string, { label: string, color: string }> = {
  LOW: { label: 'Baja', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-800' },
  MEDIUM: { label: 'Media', color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400 dark:border-yellow-800' },
  HIGH: { label: 'Alta (Urgente)', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800' },
};

export default function ReportCard({ report }: { report: Report }) {
  const [votes, setVotes] = useState(report.votes);
  const [isVoting, setIsVoting] = useState(false);

  const photos = report.photos as string[] | null;
  const coverPhoto = photos && photos.length > 0 ? photos[0] : null;

  const metaCat = CATEGORY_META[report.category] || CATEGORY_META['OTHER'];
  const metaUrg = URGENCY_META[report.urgency] || URGENCY_META['MEDIUM'];
  const Icon = metaCat.icon;

  const handleVote = async () => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      const res = await voteReport(report.id);
      if (res.success) {
        setVotes(v => v + 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
      <Link href={`/report/${report.id}`} className="absolute inset-0 z-0"></Link>
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
      
      <div className="flex justify-between items-start mb-3 relative z-10 pointer-events-none">
        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${metaCat.color}`}>
          <Icon size={14} />
          {metaCat.label}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${metaUrg.color}`}>
          {metaUrg.label}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 leading-tight relative z-10">{report.title}</h3>
      
      {coverPhoto && (
        <div className="mb-4 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm bg-gray-50 dark:bg-gray-900 relative z-10">
          <img src={coverPhoto} alt={report.title} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow line-clamp-3 relative z-10">
        {report.description}
      </p>
      
      <div className="flex flex-col gap-2 mb-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 relative z-10">
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium text-gray-700 dark:text-gray-300">{report.parish}</span>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <span className="text-gray-600 dark:text-gray-400">{report.neighborhood}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User size={16} className="text-gray-400 dark:text-gray-500" />
          <span className="text-gray-600 dark:text-gray-400 italic">Reportado por: {report.citizenName || 'Ciudadano Anónimo'}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 relative z-10">
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {new Date(report.createdAt).toLocaleDateString('es-EC')}
        </div>
        <button 
          onClick={handleVote}
          disabled={isVoting}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors font-medium text-sm border border-emerald-100 dark:border-emerald-800 disabled:opacity-50"
        >
          <CheckCircle size={16} />
          Apoyar iniciativa ({votes})
        </button>
      </div>
    </div>
  );
}
