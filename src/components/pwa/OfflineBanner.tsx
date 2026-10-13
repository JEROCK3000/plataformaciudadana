'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import {
  getPendingCount,
  getOfflineReports,
  syncOfflineReports,
  removeOfflineReport,
  onOfflineQueueChange,
  OfflineReport,
} from '@/lib/offline/offlineStorage';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [reportsList, setReportsList] = useState<OfflineReport[]>([]);

  // Actualizar estado de red y cola
  const updateStatus = useCallback(() => {
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
    const count = getPendingCount();
    setPendingCount(count);
    setReportsList(getOfflineReports());
  }, []);

  const handleSync = useCallback(async () => {
    if (isSyncing || pendingCount === 0 || !navigator.onLine) return;

    setIsSyncing(true);
    setSyncSuccessMsg(null);

    try {
      const result = await syncOfflineReports();
      if (result.successCount > 0) {
        setSyncSuccessMsg(
          `¡${result.successCount} reporte${result.successCount > 1 ? 's' : ''} sincronizado${
            result.successCount > 1 ? 's' : ''
          } exitosamente!`
        );
        setTimeout(() => setSyncSuccessMsg(null), 6000);
      }
    } catch (err) {
      console.error('[OfflineBanner] Error en sincronización:', err);
    } finally {
      setIsSyncing(false);
      updateStatus();
    }
  }, [isSyncing, pendingCount, updateStatus]);

  useEffect(() => {
    updateStatus();

    const handleOnlineEvent = () => {
      setIsOnline(true);
      updateStatus();
      // Auto-sincronizar tras 1.5 segundos de reconectar
      setTimeout(() => {
        if (getPendingCount() > 0) {
          handleSync();
        }
      }, 1500);
    };

    const handleOfflineEvent = () => {
      setIsOnline(false);
      updateStatus();
    };

    window.addEventListener('online', handleOnlineEvent);
    window.addEventListener('offline', handleOfflineEvent);
    const unsubscribe = onOfflineQueueChange(() => updateStatus());

    return () => {
      window.removeEventListener('online', handleOnlineEvent);
      window.removeEventListener('offline', handleOfflineEvent);
      unsubscribe();
    };
  }, [updateStatus, handleSync]);

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Eliminar este reporte pendiente del almacenamiento local?')) {
      removeOfflineReport(id);
      updateStatus();
    }
  };

  // Si está online, no hay pendientes y no hay mensaje de éxito, no mostrar nada
  if (isOnline && pendingCount === 0 && !syncSuccessMsg) {
    return null;
  }

  return (
    <>
      {/* Banner Principal Fijo Superior */}
      <aside aria-label="Estado de conexión a internet" className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        {/* Caso 1: Sin conexión a internet */}
        {!isOnline && (
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-amber-800/80 rounded-full animate-pulse">
                <WifiOff className="w-4 h-4 text-amber-200" />
              </span>
              <div>
                <strong className="font-bold">Modo Sin Conexión Activo:</strong>{' '}
                <span className="opacity-95">
                  Tus reportes y votos se guardan de forma segura en este teléfono.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1 sm:mt-0">
              {pendingCount > 0 && (
                <button
                  onClick={() => setShowDrawer(!showDrawer)}
                  className="flex items-center gap-1.5 bg-amber-900/60 hover:bg-amber-900 text-amber-100 px-2.5 py-1 rounded-md text-xs font-semibold border border-amber-500/50 transition-colors"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{pendingCount} en cola</span>
                  {showDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Caso 2: Con conexión pero con pendientes por sincronizar */}
        {isOnline && pendingCount > 0 && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-emerald-800/80 rounded-full">
                <Wifi className="w-4 h-4 text-emerald-200" />
              </span>
              <div>
                <strong className="font-bold">Señal Recuperada:</strong>{' '}
                <span>
                  Hay {pendingCount} reporte{pendingCount > 1 ? 's' : ''} guardado{pendingCount > 1 ? 's' : ''} listo{pendingCount > 1 ? 's' : ''} para subir.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1 sm:mt-0">
              <button
                onClick={() => setShowDrawer(!showDrawer)}
                className="text-emerald-100 hover:text-white px-2 py-1 text-xs font-medium underline underline-offset-2"
              >
                {showDrawer ? 'Ocultar' : 'Ver lista'}
              </button>

              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3 py-1 rounded-md text-xs font-bold shadow-sm transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Caso 3: Mensaje de confirmación de sincronización exitosa */}
        {syncSuccessMsg && (
          <div className="bg-emerald-700 text-white px-4 py-2 shadow-md flex items-center justify-between text-xs sm:text-sm animate-in fade-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{syncSuccessMsg}</span>
            </div>
            <button
              onClick={() => setSyncSuccessMsg(null)}
              className="text-xs text-emerald-200 hover:text-white font-semibold ml-4"
            >
              Cerrar
            </button>
          </div>
        )}
      </aside>

      {/* Cajón Desplegable de Registros Guardados en Memoria Local */}
      {showDrawer && pendingCount > 0 && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-850">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                  Cola Local de Reportes ({pendingCount})
                </h3>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs sm:text-sm">
              <p className="text-gray-500 dark:text-gray-400">
                Estos registros se levantaron en territorio sin cobertura celular. Están almacenados con cifrado en la memoria de este navegador.
              </p>

              {reportsList.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700/80 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-gray-100">{item.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                        {item.parish}
                      </span>
                    </div>
                    {item.neighborhood && (
                      <p className="text-gray-600 dark:text-gray-300 text-xs">
                        Sector: <strong>{item.neighborhood}</strong>
                      </p>
                    )}
                    <p className="text-gray-500 dark:text-gray-400 line-clamp-2 text-xs">
                      {item.description}
                    </p>
                    <div className="text-[11px] text-gray-400 flex items-center gap-2">
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {item.photos?.length > 0 && (
                        <span>• {item.photos.length} foto(s)</span>
                      )}
                      {item.errorMessage && (
                        <span className="text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {item.errorMessage}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    title="Descartar reporte"
                    className="text-gray-400 hover:text-red-600 p-1.5 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 flex items-center justify-between">
              <button
                onClick={() => setShowDrawer(false)}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                Cerrar
              </button>

              {isOnline && (
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Todos'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
