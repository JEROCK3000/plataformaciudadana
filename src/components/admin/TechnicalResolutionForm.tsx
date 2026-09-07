"use client";

import React, { useState, useTransition } from 'react';
import { Department, ReportStatus } from '@prisma/client';
import { updateReportResolution } from '@/lib/actions/reports';
import { Camera, CheckCircle2, Building2, FileText, X, Loader2, Sparkles } from 'lucide-react';
import { DEPARTMENT_LABELS, STATUS_LABELS } from '@/lib/reports/excel';

// Compresión client-side de imágenes
const comprimirFoto = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 900;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
    };
  });
};

export default function TechnicalResolutionForm({
  reportId,
  currentStatus,
  currentDepartment,
  currentNotes,
  currentPhotos,
  originalPhotos,
}: {
  reportId: string;
  currentStatus: ReportStatus;
  currentDepartment: Department;
  currentNotes?: string | null;
  currentPhotos?: string[] | null;
  originalPhotos?: string[] | null;
}) {
  const [status, setStatus] = useState<ReportStatus>(currentStatus);
  const [department, setDepartment] = useState<Department>(currentDepartment);
  const [notes, setNotes] = useState<string>(currentNotes || '');
  const [resolutionPhotos, setResolutionPhotos] = useState<string[]>(currentPhotos || []);
  const [isCompressing, setIsCompressing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsCompressing(true);
    try {
      const compressed = await Promise.all(files.map((f) => comprimirFoto(f)));
      setResolutionPhotos((prev) => [...prev, ...compressed].slice(0, 3));
    } catch (err) {
      console.error('Error al comprimir evidencia:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const removeResolutionPhoto = (idx: number) => {
    setResolutionPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateReportResolution(reportId, {
        status,
        department,
        resolutionNotes: notes,
        resolutionPhotos,
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm space-y-6 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="text-emerald-500" size={20} /> Gestión y Cierre Operativo Municipal
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Asignación de Dirección Municipal, cambio de estado y registro de evidencia de solución.
          </p>
        </div>
        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-fadeIn">
            <CheckCircle2 size={14} /> ¡Cambios guardados con éxito!
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Dirección Responsable */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Dirección Municipal Responsable
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value as Department)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
          >
            {Object.entries(DEPARTMENT_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Estado del Trámite */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Estado Actual del Trámite
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ReportStatus)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
          >
            {Object.entries(STATUS_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Nota Técnica de Intervención */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
          <FileText size={14} className="text-gray-400" /> Bitácora / Nota Técnica de Intervención
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="ej. Se despachó cuadrilla técnica el 07 de septiembre. Se sustituyeron 18 metros de tubería principal y se restableció el servicio de agua en el barrio..."
          className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
        />
      </div>

      {/* Comparativa Visual: Antes vs. Después */}
      <div className="bg-gray-50 dark:bg-gray-900/40 p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-500" /> Evidencia Fotográfica: Antes vs. Después
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* El Antes (Foto Ciudadana) */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              1. Queja Ciudadana (Antes)
            </span>
            {originalPhotos && originalPhotos.length > 0 ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                <img
                  src={originalPhotos[0]}
                  alt="Problema reportado"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-xl border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-xs text-gray-400">
                Sin fotografía inicial adjunta
              </div>
            )}
          </div>

          {/* El Después (Solución Municipal) */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              2. Obra o Solución Municipal (Después)
            </span>
            {resolutionPhotos.length > 0 ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-800 bg-gray-100 dark:bg-gray-800">
                <img
                  src={resolutionPhotos[0]}
                  alt="Solución ejecutada"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeResolutionPhoto(0)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                  title="Eliminar foto"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="aspect-video rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col items-center justify-center p-4 text-center">
                <Camera size={24} className="text-emerald-600 dark:text-emerald-400 mb-1" />
                <label className="text-xs font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer hover:underline">
                  {isCompressing ? 'Procesando...' : 'Adjuntar foto de la solución'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isCompressing}
                    className="sr-only"
                  />
                </label>
                <span className="text-[10px] text-gray-400 mt-1">Prueba probatoria de cierre</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending || isCompressing}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-105 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} /> Guardar Cierre Técnico
            </>
          )}
        </button>
      </div>
    </form>
  );
}
