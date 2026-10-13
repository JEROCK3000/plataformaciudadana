'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, Home, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function OfflineFallbackPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsChecking(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setIsChecking(false);
      }
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <WifiOff className="w-10 h-10" />
        </div>

        <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          {isOnline ? '🟢 Señal Detectada' : '📶 Sin Cobertura de Red'}
        </span>

        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Estás en Modo Sin Conexión
        </h1>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
          {isOnline
            ? 'Detectamos que tu conexión a internet ha regresado. Haz clic en el botón inferior para recargar la página.'
            : 'No pudimos cargar esta sección porque te encuentras en una zona rural o sin señal móvil. Si abriste el formulario previamente, tus datos siguen protegidos en este teléfono.'}
        </p>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Verificando red...' : 'Reintentar Conexión'}</span>
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-650 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-all text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Ir al Formulario Principal</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700/80 text-left">
          <div className="flex items-start gap-2.5 text-xs text-gray-500 dark:text-gray-400">
            <ShieldAlert className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              <strong>Garantía de Inteligencia Territorial:</strong> Ningún reporte o dato levantado por brigadistas se pierde al no haber señal. La cola PWA sincroniza en segundo plano.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
