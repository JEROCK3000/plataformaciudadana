'use client';

import { useEffect } from 'react';

/**
 * Registrador silencioso del Service Worker para compatibilidad PWA en navegadores móviles
 * (iOS Safari, Android Chrome, etc.)
 */
export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Registrar el Service Worker generado por Serwist
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          // Registro exitoso en segundo plano
          registration.update();
        })
        .catch((error) => {
          // En entornos sin HTTPS o desarrollo local sin certificados, registra advertencia suave
          console.debug('Service Worker PWA no activo:', error.message);
        });
    }
  }, []);

  return null;
}
