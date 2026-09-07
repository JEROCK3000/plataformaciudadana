'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  AlertCircle, 
  Building2, 
  HardHat, 
  MapPin, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getReportByTicket } from '@/lib/actions/reports';

interface TicketTrackerProps {
  tenantSlug: string;
  cantonName: string;
}

const DEPARTMENT_NAMES: Record<string, string> = {
  OBRAS_PUBLICAS: 'Dirección de Obras Públicas',
  AGUA_SANEAMIENTO: 'Dirección de Agua Potable y Saneamiento',
  SERVICIOS_PUBLICOS: 'Dirección de Servicios Públicos',
  SEGURIDAD_CIUDADANA: 'Dirección de Seguridad y Control',
  PLANIFICACION_AMBIENTE: 'Dirección de Planificación y Ambiente',
  OTROS: 'Dirección General / Alcaldía',
};

export default function TicketTracker({ tenantSlug, cantonName }: TicketTrackerProps) {
  const [ticketInput, setTicketInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const result = await getReportByTicket(ticketInput.trim(), tenantSlug);
      setReport(result);
    } catch (err) {
      console.error(err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTicketInput('');
    setReport(null);
    setSearched(false);
  };

  const parsePhotos = (raw: string | null): string[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [raw];
    } catch {
      return [raw];
    }
  };

  const getStepProgress = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return 1;
      case 'EN_REVISION': return 2;
      case 'EN_PROCESO': return 3;
      case 'RESUELTO': return 4;
      default: return 1;
    }
  };

  const currentStep = report ? getStepProgress(report.status) : 1;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-xl">
          <Ticket size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Consultar Estado de Trámite / Incidencia
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ingresa el código de tu reporte para ver el avance técnico y fotos de resolución en {cantonName}.
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mt-4">
        <div className="relative flex-1">
          <Ticket size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Ejemplo: QUI-2026-0001"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-wider uppercase"
          />
          {ticketInput && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !ticketInput.trim()}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
        >
          {loading ? (
            <>
              <RotateCcw size={16} className="animate-spin" />
              Consultando...
            </>
          ) : (
            <>
              <Search size={16} />
              Consultar
            </>
          )}
        </button>
      </form>

      {/* Resultados de Búsqueda */}
      {searched && !loading && (
        <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 animate-in fade-in duration-200">
          {!report ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-amber-800 dark:text-amber-200">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-sm">No encontramos un reporte con el código &quot;{ticketInput}&quot;</p>
                <p className="mt-1">
                  Verifica que el código corresponda a {cantonName} (ej. {tenantSlug.substring(0, 3).toUpperCase()}-2026-XXXX) o contáctate con el GAD Municipal para asistencia.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900/80 rounded-xl p-5 border border-gray-200 dark:border-gray-700 space-y-4">
              {/* Encabezado del ticket */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800">
                    {report.ticketCode}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Registrado el {new Date(report.createdAt).toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <Link
                  href={`/report/${report.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Ver reporte completo <ExternalLink size={13} />
                </Link>
              </div>

              {/* Título y Dirección Asignada */}
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  {report.title}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-emerald-600" />
                    {report.parish} - {report.neighborhood}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                    <HardHat size={13} />
                    {DEPARTMENT_NAMES[report.department] || 'Dirección Técnica Municipal'}
                  </span>
                </div>
              </div>

              {/* Barra de progreso de 4 pasos */}
              <div className="pt-2">
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  <div className={`p-2 rounded-lg border transition-all ${
                    currentStep >= 1 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-semibold' 
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                  }`}>
                    1. Recibido
                  </div>
                  <div className={`p-2 rounded-lg border transition-all ${
                    currentStep >= 2 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-semibold' 
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                  }`}>
                    2. En Revisión
                  </div>
                  <div className={`p-2 rounded-lg border transition-all ${
                    currentStep >= 3 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-semibold' 
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                  }`}>
                    3. Cuadrilla en Obra
                  </div>
                  <div className={`p-2 rounded-lg border transition-all ${
                    currentStep >= 4 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-semibold' 
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                  }`}>
                    4. Resuelto ✅
                  </div>
                </div>
              </div>

              {/* Si está resuelto, mostrar fotos y acta de entrega */}
              {report.status === 'RESUELTO' && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    <CheckCircle2 size={16} />
                    <span>Incidencia solventada por el Municipio</span>
                    {report.resolvedAt && (
                      <span className="text-[11px] font-normal opacity-80">
                        • {new Date(report.resolvedAt).toLocaleDateString('es-EC')}
                      </span>
                    )}
                  </div>
                  {report.resolutionNotes && (
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed italic bg-white/70 dark:bg-gray-800/80 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900">
                      &quot;{report.resolutionNotes}&quot;
                    </p>
                  )}
                  {parsePhotos(report.resolutionPhotos).length > 0 && (
                    <div className="pt-1">
                      <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
                        Evidencia Fotográfica de Entrega:
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {parsePhotos(report.resolutionPhotos).map((photo, idx) => (
                          <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-emerald-300 dark:border-emerald-700 shrink-0">
                            <Image
                              src={photo}
                              alt="Evidencia trabajo realizado"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
