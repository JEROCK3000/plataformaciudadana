import React from 'react';
import fs from 'fs';
import path from 'path';
import { FileCode2, Calendar, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SuperadminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ file?: string }>;
}) {
  const { file } = await searchParams;
  const logDir = path.join(process.cwd(), 'storage', 'logs');

  let logFiles: string[] = [];
  if (fs.existsSync(logDir)) {
    logFiles = fs
      .readdirSync(logDir)
      .filter((f) => f.endsWith('.log'))
      .sort()
      .reverse();
  }

  const selectedFile = file && logFiles.includes(file) ? file : logFiles[0] || null;
  let logLines: string[] = [];

  if (selectedFile) {
    const filePath = path.join(logDir, selectedFile);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      logLines = content
        .split('\n')
        .filter((l) => l.trim().length > 0)
        .reverse(); // Más recientes primero
    } catch (e) {
      console.error('Error leyendo archivo de log:', e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileCode2 className="text-purple-400" size={24} /> Auditoría y Trazabilidad de Logs
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Registro cronológico inmutable de eventos de seguridad, cambios de estado y actividad SaaS.
          </p>
        </div>

        {/* Selector de archivo de log */}
        {logFiles.length > 0 && (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <div className="flex flex-wrap gap-1.5">
              {logFiles.map((f) => (
                <Link
                  key={f}
                  href={`/superadmin/logs?file=${f}`}
                  className={`text-xs px-3 py-1.5 rounded-lg font-mono font-medium transition-colors ${
                    f === selectedFile
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {f}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contenedor de registros */}
      <div className="bg-gray-800/80 rounded-2xl border border-gray-700/60 p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-700/60 pb-3">
          <div className="text-xs font-mono text-gray-400">
            Archivo activo: <span className="text-purple-300 font-bold">{selectedFile || 'Ninguno'}</span> ({logLines.length} entradas)
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
            Almacenamiento: /storage/logs
          </span>
        </div>

        {logLines.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm font-mono">
            No se encontraron registros de log para esta fecha.
          </div>
        ) : (
          <div className="space-y-2 font-mono text-xs max-h-[600px] overflow-y-auto pr-2">
            {logLines.map((line, idx) => {
              // Parse: [2026-05-25 14:32:10] [INFO] [tenant:acme] [user:42] Mensaje
              const match = line.match(/^\[(.*?)\]\s*\[(.*?)\]\s*\[tenant:(.*?)\]\s*\[user:(.*?)\]\s*(.*)$/);
              
              if (!match) {
                return (
                  <div key={idx} className="p-2.5 bg-gray-900/80 rounded-lg text-gray-300 border border-gray-800">
                    {line}
                  </div>
                );
              }

              const [, timestamp, level, tenant, user, message] = match;

              const levelColors: Record<string, string> = {
                SECURITY: 'bg-red-950 text-red-300 border-red-800',
                ERROR: 'bg-red-950 text-red-300 border-red-800',
                WARN: 'bg-amber-950 text-amber-300 border-amber-800',
                AUDIT: 'bg-purple-950 text-purple-300 border-purple-800',
                INFO: 'bg-blue-950 text-blue-300 border-blue-800',
              };

              return (
                <div
                  key={idx}
                  className="p-3 bg-gray-900/90 rounded-xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-500">{timestamp}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                        levelColors[level] || 'bg-gray-800 text-gray-300 border-gray-700'
                      }`}
                    >
                      {level}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-purple-300 text-[10px] font-semibold">
                      tenant:{tenant}
                    </span>
                    <span className="text-gray-400 text-[11px]">
                      user:{user}
                    </span>
                  </div>
                  <div className="text-gray-200 text-xs sm:text-right font-sans">
                    {message}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
