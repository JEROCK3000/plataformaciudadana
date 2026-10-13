'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  GitMerge,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  Users
} from 'lucide-react';
import {
  updateModerationStatus,
  mergeReport,
  unmergeReport,
  findSimilarReports,
} from '@/lib/actions/moderation';

interface ReportModerationModalProps {
  report: {
    id: string;
    ticketCode: string | null;
    title: string;
    description: string;
    category: string;
    parish: string;
    neighborhood: string;
    moderationStatus?: string;
    moderationNotes?: string | null;
    parentReportId?: string | null;
    duplicateCount?: number;
    supportCount?: number;
    createdAt: Date | string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReportModerationModal({
  report,
  onClose,
  onSuccess,
}: ReportModerationModalProps) {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [notes, setNotes] = useState(report.moderationNotes || '');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadCandidates() {
      const res = await findSimilarReports(report.id);
      setCandidates(res);
      if (res.length > 0) {
        setSelectedParentId(res[0].id);
      }
    }
    loadCandidates();
  }, [report.id]);

  const handleUpdateStatus = async (status: 'APPROVED' | 'DISCARDED' | 'PENDING') => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await updateModerationStatus(report.id, status as any, notes);
      if (res.success) {
        setMessage({ type: 'success', text: `Estado actualizado a ${status}` });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setMessage({ type: 'error', text: res.error || 'Error al actualizar estado' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error en la petición' });
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!selectedParentId) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await mergeReport(report.id, selectedParentId);
      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Reporte fusionado con éxito' });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setMessage({ type: 'error', text: res.error || 'Error al fusionar' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error en la petición' });
    } finally {
      setLoading(false);
    }
  };

  const handleUnmerge = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await unmergeReport(report.id);
      if (res.success) {
        setMessage({ type: 'success', text: 'Reporte desvinculado con éxito' });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setMessage({ type: 'error', text: res.error || 'Error al desvincular' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error en la petición' });
    } finally {
      setLoading(false);
    }
  };

  const currentModStatus = report.moderationStatus || 'APPROVED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              <GitMerge size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Moderación & Deduplicación de Reportes
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ticket: <strong>{report.ticketCode || report.id}</strong> • Parroquia {report.parish}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Tarjeta de Resumen del Reporte Seleccionado */}
          <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Reporte Actual</span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  currentModStatus === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                    : currentModStatus === 'MERGED'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                    : currentModStatus === 'DISCARDED'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                }`}
              >
                {currentModStatus === 'APPROVED' && 'Aprobado y Visible en Mapa'}
                {currentModStatus === 'MERGED' && 'Fusionado (Duplicado)'}
                {currentModStatus === 'DISCARDED' && 'Descartado / No procede'}
                {currentModStatus === 'PENDING' && 'Pendiente de Revisión'}
              </span>
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white">{report.title}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{report.description}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
              <span className="flex items-center gap-1"><MapPin size={13} /> {report.parish} - {report.neighborhood}</span>
              <span className="flex items-center gap-1"><Clock size={13} /> {new Date(report.createdAt).toLocaleDateString()}</span>
              {report.duplicateCount && report.duplicateCount > 0 ? (
                <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                  <Users size={13} /> {report.duplicateCount} reportes agrupados (+{report.supportCount || 1} vecinos)
                </span>
              ) : null}
            </div>
          </div>

          {/* Sección 1: Fusión y Deduplicación */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <GitMerge size={16} className="text-purple-500" />
                Deduplicación Territorial (Agrupar como Duplicado)
              </h4>
              <span className="text-[11px] text-gray-400">
                Evita 20 pines en el mapa para el mismo problema
              </span>
            </div>

            {report.parentReportId ? (
              <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl space-y-3">
                <p className="text-xs text-purple-800 dark:text-purple-300">
                  Este reporte está actualmente fusionado dentro de un caso principal. No aparece duplicado en el mapa público, pero sus datos y el apoyo vecinal están sumados al caso madre.
                </p>
                <button
                  onClick={handleUnmerge}
                  disabled={loading}
                  className="px-3.5 py-1.5 bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-gray-700 border border-purple-300 dark:border-purple-700 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  Desvincular y restaurar como caso independiente
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Si este reporte corresponde al mismo problema que otro reporte previo en <strong>{report.neighborhood}</strong>, vincúlalo como duplicado. El mapa mostrará 1 solo punto consolidado con contador de vecinos afectados.
                </p>

                {candidates.length === 0 ? (
                  <div className="p-3.5 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-800 text-xs text-gray-500 italic">
                    No se detectaron reportes similares recientes en {report.parish} - {report.neighborhood}.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Seleccionar Caso Principal en esta zona:
                    </label>
                    <select
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                    >
                      {candidates.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.ticketCode || 'TICKET'}] {c.title} • {c.neighborhood} ({new Date(c.createdAt).toLocaleDateString()})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleMerge}
                      disabled={loading || !selectedParentId}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
                    >
                      <GitMerge size={14} />
                      <span>🔗 Fusionar con el Caso Principal Seleccionado</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sección 2: Moderación General de Estado */}
          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldAlert size={16} className="text-emerald-500" />
              Filtro y Visibilidad Pública
            </h4>

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                Nota de moderación interna (opcional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Validado por inspección de cuadrilla / Competencia MTOP..."
                className="w-full text-xs p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => handleUpdateStatus('APPROVED')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
              >
                <CheckCircle size={14} />
                <span>Aprobar y Publicar</span>
              </button>

              <button
                onClick={() => handleUpdateStatus('DISCARDED')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
              >
                <XCircle size={14} />
                <span>Descartar / No Procede</span>
              </button>

              <button
                onClick={() => handleUpdateStatus('PENDING')}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
              >
                <Clock size={14} />
                <span>Dejar en Revisión</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pie de ventana */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
