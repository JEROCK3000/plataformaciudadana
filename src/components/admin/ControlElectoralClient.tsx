'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Vote,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Camera,
  Users,
  Building,
  Phone,
  MessageSquare,
  AlertTriangle,
  Award,
  RefreshCw,
  Eye,
  X,
  FileCheck2,
  ExternalLink
} from 'lucide-react';
import ImageUploadDropzone from '@/components/ui/ImageUploadDropzone';
import { saveElectoralActa, updateDelegate, syncOfficialCneRecintos } from '@/lib/actions/electoral';

interface ControlElectoralProps {
  data: {
    tenant: {
      id: string;
      name: string;
      canton: string;
      candidateName: string;
      campaignListNumber: string;
      campaignSlogan: string;
      candidatePhotoUrl?: string | null;
      partyLogoUrl?: string | null;
    };
    summary: {
      totalJuntas: number;
      digitizedJuntas: number;
      pendingJuntas: number;
      progressPct: number;
      totalElectors: number;
      totalVotersProcessed: number;
      participationPct: number;
      candidateVotes: number;
      candidatePct: number;
      balladaresVotes?: number;
      balladaresPct?: number;
      ruizVotes?: number;
      ruizPct?: number;
      guerreroVotes?: number;
      guerreroPct?: number;
      rivalVotes: number;
      rivalPct: number;
      otherVotes: number;
      otherPct: number;
      blankVotes: number;
      blankPct: number;
      nullVotes: number;
      nullPct: number;
      leadVotes: number;
      actasConInconsistencia: number;
    };
    parishBreakdown: Array<{
      parish: string;
      totalJuntas: number;
      digitizedJuntas: number;
      candidateVotes: number;
      rivalVotes: number;
      totalVotes: number;
      progressPct: number;
      winner: 'CANDIDATE' | 'RIVAL' | 'TIE' | 'NO_DATA';
    }>;
    recintos: Array<any>;
    allActas: Array<any>;
  };
}

export default function ControlElectoralClient({ data }: ControlElectoralProps) {
  const [activeTab, setActiveTab] = useState<'TABLERO' | 'TRANSMITIR' | 'VEEDORES'>('TABLERO');
  const [selectedActaPhoto, setSelectedActaPhoto] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Estado para el formulario de transmisión de acta
  const [selectedRecintoId, setSelectedRecintoId] = useState<string>(data.recintos[0]?.id || '');
  const activeRecinto = data.recintos.find(r => r.id === selectedRecintoId) || data.recintos[0];
  const [selectedJuntaId, setSelectedJuntaId] = useState<string>(activeRecinto?.juntas[0]?.id || '');
  const activeJunta = activeRecinto?.juntas.find((j: any) => j.id === selectedJuntaId) || activeRecinto?.juntas[0];

  // 4 Candidatos Oficiales de Quijos + Blancos/Nulos
  const [candidateVotes, setCandidateVotes] = useState<number>(0); // Brandon Aliaga (PSC-PK)
  const [balladaresVotes, setBalladaresVotes] = useState<number>(0); // Renán Balladares (ADN 7)
  const [ruizVotes, setRuizVotes] = useState<number>(0); // Aracely Ruiz (Alianza 3-8)
  const [guerreroVotes, setGuerreroVotes] = useState<number>(0); // William Guerrero (Unidos por Quijos)
  const [blankVotes, setBlankVotes] = useState<number>(0);
  const [nullVotes, setNullVotes] = useState<number>(0);
  const [actaPhotoUrl, setActaPhotoUrl] = useState<string>('');
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal para editar delegado
  const [editingJunta, setEditingJunta] = useState<any | null>(null);
  const [delegateName, setDelegateName] = useState<string>('');
  const [delegatePhone, setDelegatePhone] = useState<string>('');
  const [delegateStatus, setDelegateStatus] = useState<string>('PENDIENTE');

  const totalCalculado = candidateVotes + balladaresVotes + ruizVotes + guerreroVotes + blankVotes + nullVotes;
  const padronMesa = activeJunta?.electors || 350;
  const excedePadron = totalCalculado > padronMesa;

  const handleRecintoChange = (recintoId: string) => {
    setSelectedRecintoId(recintoId);
    const r = data.recintos.find(rec => rec.id === recintoId);
    if (r && r.juntas.length > 0) {
      setSelectedJuntaId(r.juntas[0].id);
      loadExistingActa(r.juntas[0]);
    }
  };

  const handleJuntaChange = (juntaId: string) => {
    setSelectedJuntaId(juntaId);
    const j = activeRecinto?.juntas.find((jun: any) => jun.id === juntaId);
    if (j) {
      loadExistingActa(j);
    }
  };

  const loadExistingActa = (j: any) => {
    if (j.acta) {
      setCandidateVotes(j.acta.candidateVotes || 0);
      setBalladaresVotes(j.acta.balladaresVotes ?? j.acta.rivalVotes ?? 0);
      setRuizVotes(j.acta.ruizVotes ?? Math.round((j.acta.otherVotes || 0) / 2));
      setGuerreroVotes(j.acta.guerreroVotes ?? Math.floor((j.acta.otherVotes || 0) / 2));
      setBlankVotes(j.acta.blankVotes || 0);
      setNullVotes(j.acta.nullVotes || 0);
      setActaPhotoUrl(j.acta.photoUrl || '');
    } else {
      setCandidateVotes(0);
      setBalladaresVotes(0);
      setRuizVotes(0);
      setGuerreroVotes(0);
      setBlankVotes(0);
      setNullVotes(0);
      setActaPhotoUrl('');
    }
  };

  const handleSubmitActa = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage(null);

    const formData = new FormData();
    formData.append('juntaId', selectedJuntaId);
    formData.append('candidateVotes', candidateVotes.toString());
    formData.append('balladaresVotes', balladaresVotes.toString());
    formData.append('ruizVotes', ruizVotes.toString());
    formData.append('guerreroVotes', guerreroVotes.toString());
    formData.append('rivalVotes', balladaresVotes.toString());
    formData.append('otherVotes', (ruizVotes + guerreroVotes).toString());
    formData.append('blankVotes', blankVotes.toString());
    formData.append('nullVotes', nullVotes.toString());
    if (actaPhotoUrl) formData.append('photoUrl', actaPhotoUrl);

    startTransition(async () => {
      const res = await saveElectoralActa(formData);
      if (res.success) {
        setSubmitMessage({
          type: 'success',
          text: res.hasInconsistency
            ? '¡Acta transmitida con éxito! Alerta: Se registró con bandera de inconsistencia numérica.'
            : '¡Acta oficial transmitida y verificada correctamente!'
        });
      } else {
        setSubmitMessage({ type: 'error', text: res.error || 'Error al guardar el acta.' });
      }
    });
  };

  const handleSaveDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJunta) return;

    const formData = new FormData();
    formData.append('juntaId', editingJunta.id);
    formData.append('delegateName', delegateName);
    formData.append('delegatePhone', delegatePhone);
    formData.append('delegateStatus', delegateStatus);

    startTransition(async () => {
      await updateDelegate(formData);
      setEditingJunta(null);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* HEADER SUPERIOR */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
                title="Volver al panel principal"
              >
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20">
                  <Vote size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                      CONTROL ELECTORAL <span className="text-amber-400">• DÍA D</span>
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping mr-0.5" />
                      ESCRUTINIO EN VIVO
                    </span>
                    <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider">
                      CNE OFICIAL • 20 JUNTAS • 5.738 ELECTORES
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Cantón {data.tenant.canton} • Conteo Rápido y Transmisión Móvil de Actas
                  </p>
                </div>
              </div>
            </div>

            {/* Selector de Pestañas */}
            <div className="flex items-center bg-slate-850 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('TABLERO')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'TABLERO'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp size={14} /> Tablero en Vivo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('TRANSMITIR')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'TRANSMITIR'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera size={14} /> Transmitir Acta
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('VEEDORES')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'VEEDORES'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users size={14} /> Recintos & Mesas
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* ============================================================== */}
        {/* PESTAÑA 1: TABLERO EN VIVO (CONTEO RÁPIDO & RESULTADOS)        */}
        {/* ============================================================== */}
        {activeTab === 'TABLERO' && (
          <div className="space-y-6">
            
            {/* KPI CARDS RESUMEN - LOS 4 CANDIDATOS OFICIALES DE QUIJOS */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avance Escrutinio</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-black text-amber-400">{data.summary.progressPct}%</span>
                  <span className="text-[10px] text-slate-400">
                    ({data.summary.digitizedJuntas}/{data.summary.totalJuntas})
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${data.summary.progressPct}%` }}
                  />
                </div>
              </div>

              {/* Brandon Aliaga */}
              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block truncate">
                  ★ Brandon Aliaga
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">{data.summary.candidateVotes}</span>
                  <span className="text-[10px] font-extrabold text-emerald-300">({data.summary.candidatePct}%)</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5 truncate">PSC 6 - PK 18</span>
              </div>

              {/* Renán Balladares */}
              <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-3.5 sm:p-4">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block truncate">
                  Renán Balladares
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-black text-purple-400">
                    {data.summary.balladaresVotes ?? data.summary.rivalVotes}
                  </span>
                  <span className="text-[10px] font-extrabold text-purple-300">
                    ({data.summary.balladaresPct ?? data.summary.rivalPct}%)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5 truncate">ADN Lista 7</span>
              </div>

              {/* Aracely Ruiz */}
              <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-3.5 sm:p-4">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block truncate">
                  Aracely Ruiz
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-black text-rose-400">
                    {data.summary.ruizVotes ?? 0}
                  </span>
                  <span className="text-[10px] font-extrabold text-rose-300">
                    ({data.summary.ruizPct ?? 0}%)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5 truncate">Alianza 3-8 / PSP</span>
              </div>

              {/* William Guerrero */}
              <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-3.5 sm:p-4">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block truncate">
                  William Guerrero
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-black text-sky-400">
                    {data.summary.guerreroVotes ?? 0}
                  </span>
                  <span className="text-[10px] font-extrabold text-sky-300">
                    ({data.summary.guerreroPct ?? 0}%)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5 truncate">Unidos por Quijos</span>
              </div>

              {/* Margen de Ventaja */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ventaja</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className={`text-xl sm:text-2xl font-black ${data.summary.leadVotes >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {data.summary.leadVotes > 0 ? `+${data.summary.leadVotes}` : data.summary.leadVotes}
                  </span>
                  <span className="text-[10px] text-slate-400">votos</span>
                </div>
                <span className="text-[10px] text-amber-400/90 font-medium block mt-0.5 truncate">
                  {data.summary.actasConInconsistencia > 0 ? `⚠️ ${data.summary.actasConInconsistencia} alerta` : '✓ Cuadradas'}
                </span>
              </div>
            </div>

            {/* GRAN MARCADOR COMPARATIVO DE CANDIDATOS */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-850 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Award className="text-amber-400" size={22} />
                    Tendencia Proyectada a la Alcaldía de {data.tenant.canton}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Resultados basados en {data.summary.totalVotersProcessed.toLocaleString()} votos procesados en actas oficiales.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Participación estimada: <strong className="text-white">{data.summary.participationPct}%</strong>
                </span>
              </div>

              {/* Barra Proporcional de los 4 Candidatos Reales de Quijos */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between text-xs font-extrabold gap-2">
                  <span className="text-emerald-400">Brandon Aliaga (PSC-PK): {data.summary.candidatePct}%</span>
                  <span className="text-purple-400">Renán Balladares (ADN 7): {data.summary.balladaresPct ?? data.summary.rivalPct}%</span>
                  <span className="text-rose-400">Aracely Ruiz (Alianza 3-8): {data.summary.ruizPct ?? 0}%</span>
                  <span className="text-sky-400">William Guerrero (Unidos): {data.summary.guerreroPct ?? 0}%</span>
                </div>
                <div className="h-6 w-full bg-slate-800 rounded-xl overflow-hidden flex shadow-inner">
                  <div
                    className="bg-emerald-500 h-full flex items-center justify-center text-[11px] font-black text-slate-950 transition-all duration-700"
                    style={{ width: `${Math.max(data.summary.candidatePct, 2)}%` }}
                    title={`Brandon Aliaga: ${data.summary.candidateVotes} votos`}
                  >
                    {data.summary.candidatePct > 7 ? `${data.summary.candidatePct}%` : ''}
                  </div>
                  <div
                    className="bg-purple-500 h-full flex items-center justify-center text-[11px] font-black text-white transition-all duration-700"
                    style={{ width: `${Math.max(data.summary.balladaresPct ?? data.summary.rivalPct, 2)}%` }}
                    title={`Renán Balladares: ${data.summary.balladaresVotes ?? data.summary.rivalVotes} votos`}
                  >
                    {(data.summary.balladaresPct ?? data.summary.rivalPct) > 7 ? `${data.summary.balladaresPct ?? data.summary.rivalPct}%` : ''}
                  </div>
                  <div
                    className="bg-rose-500 h-full flex items-center justify-center text-[11px] font-black text-white transition-all duration-700"
                    style={{ width: `${Math.max(data.summary.ruizPct ?? 0, 2)}%` }}
                    title={`Aracely Ruiz: ${data.summary.ruizVotes ?? 0} votos`}
                  >
                    {(data.summary.ruizPct ?? 0) > 7 ? `${data.summary.ruizPct}%` : ''}
                  </div>
                  <div
                    className="bg-sky-500 h-full flex items-center justify-center text-[11px] font-black text-slate-950 transition-all duration-700"
                    style={{ width: `${Math.max(data.summary.guerreroPct ?? 0, 2)}%` }}
                    title={`William Guerrero: ${data.summary.guerreroVotes ?? 0} votos`}
                  >
                    {(data.summary.guerreroPct ?? 0) > 7 ? `${data.summary.guerreroPct}%` : ''}
                  </div>
                  <div
                    className="bg-slate-600 h-full flex items-center justify-center text-[10px] text-slate-300"
                    style={{ width: `${Math.max(data.summary.blankPct + data.summary.nullPct, 2)}%` }}
                    title={`Blancos y Nulos: ${data.summary.blankVotes + data.summary.nullVotes}`}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Brandon Aliaga ({data.summary.candidateVotes})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Renán Balladares ({data.summary.balladaresVotes ?? data.summary.rivalVotes})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Aracely Ruiz ({data.summary.ruizVotes ?? 0})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> William Guerrero ({data.summary.guerreroVotes ?? 0})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Blancos/Nulos ({data.summary.blankVotes + data.summary.nullVotes})</span>
                </div>
              </div>
            </div>

            {/* TERMÓMETRO POR PARROQUIA (MAPEO DEL VOTO) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building size={18} className="text-amber-400" />
                Desglose Territorial por Parroquias
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {data.parishBreakdown.map((p) => {
                  const isWinning = p.winner === 'CANDIDATE';
                  const isLosing = p.winner === 'RIVAL';
                  const noData = p.winner === 'NO_DATA';

                  return (
                    <div
                      key={p.parish}
                      className={`p-4 rounded-2xl border transition-all ${
                        noData
                          ? 'bg-slate-850/60 border-slate-800 text-slate-400'
                          : isWinning
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                          : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-sm text-white">{p.parish}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                          noData ? 'bg-slate-800 text-slate-400' : isWinning ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/30 text-rose-300'
                        }`}>
                          {noData ? 'Sin actas' : isWinning ? 'Ganando' : 'Atrás'}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Candidato:</span>
                          <strong className="text-emerald-400 font-mono">{p.candidateVotes}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rival:</span>
                          <strong className="text-rose-400 font-mono">{p.rivalVotes}</strong>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                          <span className="text-slate-400">Mesas:</span>
                          <span className="font-mono">{p.digitizedJuntas} / {p.totalJuntas} ({p.progressPct}%)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AUDITORÍA FOTOGRÁFICA DE ACTAS TRANSMITIDAS */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileCheck2 size={18} className="text-amber-400" />
                    Actas de Escrutinio Transmitidas ({data.allActas.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Evidencias fotográficas para blindaje legal ante el CNE e impugnaciones inmediatas.
                  </p>
                </div>
              </div>

              {data.allActas.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
                  <Camera size={32} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400">Aún no se han transmitido actas electorales.</p>
                  <p className="text-xs text-slate-500 mt-1">Usa la pestaña &ldquo;Transmitir Acta&rdquo; para registrar los primeros resultados con foto.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.allActas.map((acta) => (
                    <div
                      key={acta.id}
                      className={`p-4 rounded-2xl border transition-all bg-slate-850/80 ${
                        acta.hasInconsistency ? 'border-amber-500/80 ring-1 ring-amber-500/30' : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="font-bold text-sm text-white block">{acta.recintoName}</span>
                          <span className="text-xs text-slate-400">
                            Mesa #{acta.juntaNumber} ({acta.gender}) • {acta.parish}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          acta.hasInconsistency
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {acta.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-900/90 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Candidato</span>
                          <span className="text-emerald-400 font-bold text-sm">{acta.candidateVotes}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Rival</span>
                          <span className="text-rose-400 font-bold text-sm">{acta.rivalVotes}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Total Sufragantes</span>
                          <span className="text-white font-medium">{acta.totalVoters}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Digitado por</span>
                          <span className="text-slate-400 truncate block text-[10px]">{acta.digitizedBy || 'Delegado'}</span>
                        </div>
                      </div>

                      {acta.hasInconsistency && (
                        <p className="text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-500/30 p-2 rounded-lg mb-3">
                          {acta.inconsistencyNote || 'Inconsistencia numérica detectada.'}
                        </p>
                      )}

                      {acta.photoUrl ? (
                        <button
                          type="button"
                          onClick={() => setSelectedActaPhoto(acta.photoUrl)}
                          className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Eye size={13} /> Ver Foto del Acta Oficial
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic block text-center py-1">Sin fotografía adjunta</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 2: TRANSMISIÓN RÁPIDA DE ACTA DESDE CELULAR O PC       */}
        {/* ============================================================== */}
        {activeTab === 'TRANSMITIR' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              
              <div className="border-b border-slate-800 pb-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 mb-2">
                  <Camera size={13} />
                  <span>Módulo Móvil para Veedores y Brigadistas</span>
                </div>
                <h2 className="text-lg font-black text-white">Digitalización y Transmisión de Acta de Escrutinio</h2>
                <p className="text-xs text-slate-400">
                  Ingresa los votos del acta emitida por la Junta Receptora del Voto y adjunta la fotografía nítida.
                </p>
              </div>

              {submitMessage && (
                <div className={`p-4 rounded-xl border text-xs font-bold ${
                  submitMessage.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                }`}>
                  {submitMessage.text}
                </div>
              )}

              <form onSubmit={handleSubmitActa} className="space-y-6">
                
                {/* Selector de Recinto y Junta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Recinto Electoral
                    </label>
                    <select
                      value={selectedRecintoId}
                      onChange={(e) => handleRecintoChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      {data.recintos.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.parish})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Mesa / Junta (JRV)
                    </label>
                    <select
                      value={selectedJuntaId}
                      onChange={(e) => handleJuntaChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      {activeRecinto?.juntas.map((j: any) => (
                        <option key={j.id} value={j.id}>
                          Mesa #{j.juntaNumber} - {j.gender} (Padrón: {j.electors}) {j.acta ? '• [YA DIGITADA]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Campos Numéricos de Votación */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
                    Votos Registrados en el Acta Oficial:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Votos Brandon Aliaga */}
                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/40">
                      <label className="block text-xs font-bold text-emerald-400 mb-1">
                        ★ Brandon Aliaga (PSC-PK)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={candidateVotes}
                        onChange={(e) => setCandidateVotes(parseInt(e.target.value || '0', 10))}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-emerald-500/50 rounded-xl text-lg font-black text-emerald-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                      />
                    </div>

                    {/* Votos Renán Balladares */}
                    <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/40">
                      <label className="block text-xs font-bold text-purple-400 mb-1">
                        Renán Balladares (ADN 7)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={balladaresVotes}
                        onChange={(e) => setBalladaresVotes(parseInt(e.target.value || '0', 10))}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-purple-500/50 rounded-xl text-lg font-black text-purple-300 focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                      />
                    </div>

                    {/* Votos Aracely Ruiz */}
                    <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/40">
                      <label className="block text-xs font-bold text-rose-400 mb-1">
                        Aracely Ruiz (Alianza 3-8)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={ruizVotes}
                        onChange={(e) => setRuizVotes(parseInt(e.target.value || '0', 10))}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-rose-500/50 rounded-xl text-lg font-black text-rose-300 focus:ring-2 focus:ring-rose-500 outline-none font-mono"
                      />
                    </div>

                    {/* Votos William Guerrero */}
                    <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/40">
                      <label className="block text-xs font-bold text-sky-400 mb-1">
                        William Guerrero (Unidos)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={guerreroVotes}
                        onChange={(e) => setGuerreroVotes(parseInt(e.target.value || '0', 10))}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-sky-500/50 rounded-xl text-lg font-black text-sky-300 focus:ring-2 focus:ring-sky-500 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Votos en Blanco</label>
                      <input
                        type="number"
                        min="0"
                        value={blankVotes}
                        onChange={(e) => setBlankVotes(parseInt(e.target.value || '0', 10))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-bold text-slate-200 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Votos Nulos</label>
                      <input
                        type="number"
                        min="0"
                        value={nullVotes}
                        onChange={(e) => setNullVotes(parseInt(e.target.value || '0', 10))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-bold text-slate-200 outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Cuadre Matemático en Vivo */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    excedePadron
                      ? 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      {excedePadron ? <AlertTriangle size={16} className="text-rose-400" /> : <ShieldCheck size={16} className="text-emerald-400" />}
                      <span>
                        Total calculado en mesa: <strong className="font-mono text-white">{totalCalculado}</strong> votos
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      Padrón asignado: {padronMesa}
                    </span>
                  </div>
                </div>

                {/* Subida de Fotografía del Acta */}
                <div>
                  <ImageUploadDropzone
                    name="actaPhoto"
                    label="Fotografía Nítida del Acta Oficial Firmada (CNE)"
                    helperText="Toma una foto con tu celular o arrastra la imagen del acta de escrutinio con las firmas de los miembros de mesa."
                    value={actaPhotoUrl}
                    onChange={(url) => setActaPhotoUrl(url)}
                    category="institucional"
                  />
                </div>

                {/* Botón de Envío */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Transmitiendo Acta...
                    </>
                  ) : (
                    <>
                      <Vote size={18} /> Transmitir y Cuadrar Acta Oficial
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 3: ESTRUCTURA TERRITORIAL & VEEDORES DE MESA            */}
        {/* ============================================================== */}
        {activeTab === 'VEEDORES' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Users className="text-amber-400" size={20} />
                    Despliegue de Veedores y Delegados por Recinto
                  </h2>
                  <p className="text-xs text-slate-400">
                    Controla que cada mesa electoral del cantón tenga su delegado acreditado con contacto directo.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300">
                    Padrón CNE Oficial • 20 Juntas • 5.738 Electores
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('¿Deseas restablecer los recintos y juntas a la estructura oficial del CNE (20 Juntas • 5.738 Electores)?')) {
                        startTransition(async () => {
                          await syncOfficialCneRecintos();
                        });
                      }
                    }}
                    disabled={isPending}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                    title="Sincronizar estructura oficial CNE"
                  >
                    <RefreshCw size={13} className={isPending ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Lista por Recinto */}
              <div className="space-y-6">
                {data.recintos.map((r) => (
                  <div key={r.id} className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                    
                    {/* Encabezado del Recinto */}
                    <div className="p-4 sm:p-5 bg-slate-850/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building size={16} className="text-amber-400" />
                          <h3 className="font-extrabold text-sm sm:text-base text-white">{r.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                            {r.parish}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{r.address || 'Ubicación central'}</p>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        {r.coordinatorName && (
                          <div className="text-right hidden sm:block">
                            <span className="text-slate-400 text-[11px] block">Coordinador de Recinto:</span>
                            <span className="font-bold text-white">{r.coordinatorName}</span>
                          </div>
                        )}
                        {r.coordinatorPhone && (
                          <a
                            href={`https://wa.me/593${r.coordinatorPhone.replace(/\D/g, '').replace(/^0/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            title="WhatsApp Coordinador"
                          >
                            <MessageSquare size={16} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Tabla de Mesas / Juntas del Recinto */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-800">
                          <tr>
                            <th className="py-2.5 px-4">Junta</th>
                            <th className="py-2.5 px-4">Género</th>
                            <th className="py-2.5 px-4">Electores</th>
                            <th className="py-2.5 px-4">Delegado / Veedor</th>
                            <th className="py-2.5 px-4">Estado</th>
                            <th className="py-2.5 px-4">Acta</th>
                            <th className="py-2.5 px-4 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {r.juntas.map((j: any) => {
                            const cleanPhone = j.delegatePhone ? j.delegatePhone.replace(/\D/g, '') : null;
                            const waUrl = cleanPhone
                              ? `https://wa.me/593${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(
                                  `Hola ${j.delegateName || 'compañero'}, te saludamos del Centro de Cómputo de ${data.tenant.candidateName}. ¿Cómo avanza la Junta #${j.juntaNumber} (${j.gender}) en ${r.name}? Recuerda transmitir el acta en cuanto empiece el escrutinio.`
                                )}`
                              : null;

                            return (
                              <tr key={j.id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="py-2.5 px-4 font-mono font-bold text-white">Mesa #{j.juntaNumber}</td>
                                <td className="py-2.5 px-4 text-slate-300">{j.gender}</td>
                                <td className="py-2.5 px-4 font-mono text-slate-400">{j.electors}</td>
                                <td className="py-2.5 px-4">
                                  {j.delegateName ? (
                                    <div>
                                      <span className="font-bold text-white block">{j.delegateName}</span>
                                      {j.delegatePhone && (
                                        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                                          <Phone size={10} className="text-emerald-400" /> {j.delegatePhone}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-500 italic">Sin delegado asignado</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    j.delegateStatus === 'EN_MESA'
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : j.delegateStatus === 'CONFIRMADO'
                                      ? 'bg-blue-500/20 text-blue-300'
                                      : 'bg-amber-500/20 text-amber-300'
                                  }`}>
                                    {j.delegateStatus}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4">
                                  {j.acta ? (
                                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                                      <CheckCircle2 size={12} /> {j.acta.candidateVotes} votos
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                                      <Clock size={12} /> Pendiente
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {waUrl && (
                                      <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                                        title="Escribir por WhatsApp"
                                      >
                                        <MessageSquare size={13} />
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingJunta(j);
                                        setDelegateName(j.delegateName || '');
                                        setDelegatePhone(j.delegatePhone || '');
                                        setDelegateStatus(j.delegateStatus || 'PENDIENTE');
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] transition-colors"
                                    >
                                      Asignar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

      </main>

      {/* MODAL DE ASIGNACIÓN DE DELEGADO */}
      {editingJunta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base">Asignar Delegado / Veedor</h3>
                <p className="text-xs text-slate-400">Mesa #{editingJunta.juntaNumber} ({editingJunta.gender})</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingJunta(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDelegate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={delegateName}
                  onChange={(e) => setDelegateName(e.target.value)}
                  placeholder="Ej. Roberto Salazar"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Celular / WhatsApp</label>
                <input
                  type="text"
                  value={delegatePhone}
                  onChange={(e) => setDelegatePhone(e.target.value)}
                  placeholder="0991234567"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Estado de Presencia</label>
                <select
                  value={delegateStatus}
                  onChange={(e) => setDelegateStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="PENDIENTE">PENDIENTE DE CONFIRMAR</option>
                  <option value="CONFIRMADO">CONFIRMADO PARA EL DÍA D</option>
                  <option value="EN_MESA">EN LA MESA (PRESENTE)</option>
                  <option value="AUSENTE">AUSENTE / REPORTAR ALERTA</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingJunta(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition-colors"
                >
                  Guardar Delegado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VISOR FOTOGRÁFICO DE ACTA */}
      {selectedActaPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSelectedActaPhoto(null)}
              className="absolute -top-12 right-0 p-2 text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="overflow-auto max-h-[85vh] rounded-2xl border border-slate-700 shadow-2xl bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedActaPhoto}
                alt="Acta Oficial"
                className="w-full h-auto object-contain"
              />
            </div>
            <a
              href={selectedActaPhoto}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <ExternalLink size={13} /> Abrir imagen en pestaña independiente
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
