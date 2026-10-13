/**
 * Gestor de Cola de Almacenamiento Local Offline (Offline-First)
 * Permite a brigadistas, delegados de mesa y ciudadanos en territorio registrar
 * reportes ciudadanos y actas electorales sin conexión, sincronizándolos automáticamente
 * en cuanto recuperan cobertura celular o WiFi.
 */

import { createReport } from '@/lib/actions/reports';
import { saveElectoralActa } from '@/lib/actions/electoral';

export interface OfflineReport {
  id: string;
  timestamp: number;
  tenantSlug?: string;
  title: string;
  category: string;
  parish: string;
  neighborhood?: string;
  description: string;
  urgency: string;
  citizenName?: string;
  citizenContact?: string;
  privacyAccepted: boolean;
  photos: string[];
  status: 'pending' | 'syncing' | 'failed';
  errorMessage?: string;
}

export interface OfflineActa {
  id: string;
  timestamp: number;
  juntaId: string;
  candidateVotes: number;
  balladaresVotes: number;
  ruizVotes: number;
  guerreroVotes: number;
  rivalVotes: number;
  otherVotes: number;
  blankVotes: number;
  nullVotes: number;
  photoUrl?: string;
  status: 'pending' | 'syncing' | 'failed';
  errorMessage?: string;
}

const REPORTS_KEY = 'solinteec_offline_reports_v1';
const ACTAS_KEY = 'solinteec_offline_actas_v1';
const EVENT_NAME = 'offline-queue-changed';

/**
 * Notifica a todos los componentes que la cola offline ha cambiado
 */
function notifyQueueChange() {
  if (typeof window === 'undefined') return;
  const count = getPendingCount();
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { count } }));
}

// ---------------------------------------------------------------------------
// REPORTES CIUDADANOS OFFLINE
// ---------------------------------------------------------------------------

export function getOfflineReports(): OfflineReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('[OfflineStorage] Error al leer reportes locales:', error);
    return [];
  }
}

export function saveOfflineReport(
  data: Omit<OfflineReport, 'id' | 'timestamp' | 'status' | 'errorMessage'>
): OfflineReport {
  const reports = getOfflineReports();
  const newReport: OfflineReport = {
    ...data,
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: Date.now(),
    status: 'pending',
  };

  reports.unshift(newReport);
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  } catch (error) {
    console.warn('[OfflineStorage] Espacio insuficiente, guardando reporte sin adjuntos de imagen');
    newReport.photos = [];
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  }

  notifyQueueChange();
  return newReport;
}

export function removeOfflineReport(id: string): void {
  if (typeof window === 'undefined') return;
  const reports = getOfflineReports().filter((r) => r.id !== id);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  notifyQueueChange();
}

// ---------------------------------------------------------------------------
// ACTAS ELECTORALES DEL DÍA D OFFLINE
// ---------------------------------------------------------------------------

export function getOfflineActas(): OfflineActa[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ACTAS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('[OfflineStorage] Error al leer actas locales:', error);
    return [];
  }
}

export function saveOfflineActa(
  data: Omit<OfflineActa, 'id' | 'timestamp' | 'status' | 'errorMessage'>
): OfflineActa {
  const actas = getOfflineActas();
  const newActa: OfflineActa = {
    ...data,
    id: `acta_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: Date.now(),
    status: 'pending',
  };

  actas.unshift(newActa);
  try {
    localStorage.setItem(ACTAS_KEY, JSON.stringify(actas));
  } catch (error) {
    console.warn('[OfflineStorage] Exceso de cuota, guardando acta sin fotografía');
    newActa.photoUrl = undefined;
    localStorage.setItem(ACTAS_KEY, JSON.stringify(actas));
  }

  notifyQueueChange();
  return newActa;
}

export function removeOfflineActa(id: string): void {
  if (typeof window === 'undefined') return;
  const actas = getOfflineActas().filter((a) => a.id !== id);
  localStorage.setItem(ACTAS_KEY, JSON.stringify(actas));
  notifyQueueChange();
}

// ---------------------------------------------------------------------------
// CONTEO TOTAL Y AUTO-SINCRONIZACIÓN
// ---------------------------------------------------------------------------

export function getPendingCount(): number {
  const reports = getOfflineReports().filter((r) => r.status === 'pending' || r.status === 'failed');
  const actas = getOfflineActas().filter((a) => a.status === 'pending' || a.status === 'failed');
  return reports.length + actas.length;
}

export async function syncOfflineReports(): Promise<{
  total: number;
  successCount: number;
  failedCount: number;
}> {
  if (typeof window === 'undefined') {
    return { total: 0, successCount: 0, failedCount: 0 };
  }

  const reports = getOfflineReports();
  const pendingReports = reports.filter((r) => r.status === 'pending' || r.status === 'failed');
  const actas = getOfflineActas();
  const pendingActas = actas.filter((a) => a.status === 'pending' || a.status === 'failed');

  const total = pendingReports.length + pendingActas.length;
  if (total === 0) {
    return { total: 0, successCount: 0, failedCount: 0 };
  }

  let successCount = 0;
  let failedCount = 0;

  // 1. Sincronizar reportes ciudadanos
  for (const item of pendingReports) {
    try {
      item.status = 'syncing';
      localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
      notifyQueueChange();

      const response = await createReport({
        tenantSlug: item.tenantSlug,
        title: item.title,
        category: item.category as any,
        parish: item.parish,
        neighborhood: item.neighborhood || '',
        description: item.description,
        urgency: item.urgency as any,
        citizenName: item.citizenName,
        citizenContact: item.citizenContact,
        privacyAccepted: item.privacyAccepted,
        photos: item.photos,
      });

      if (response && response.success) {
        successCount++;
        removeOfflineReport(item.id);
      } else {
        failedCount++;
        item.status = 'failed';
        item.errorMessage = response?.error || 'Error al procesar en servidor';
      }
    } catch (err: any) {
      failedCount++;
      item.status = 'failed';
      item.errorMessage = err?.message || 'Error de red';
    }
  }

  // 2. Sincronizar actas electorales
  for (const acta of pendingActas) {
    try {
      acta.status = 'syncing';
      localStorage.setItem(ACTAS_KEY, JSON.stringify(actas));
      notifyQueueChange();

      const formData = new FormData();
      formData.append('juntaId', acta.juntaId);
      formData.append('candidateVotes', acta.candidateVotes.toString());
      formData.append('balladaresVotes', acta.balladaresVotes.toString());
      formData.append('ruizVotes', acta.ruizVotes.toString());
      formData.append('guerreroVotes', acta.guerreroVotes.toString());
      formData.append('rivalVotes', acta.rivalVotes.toString());
      formData.append('otherVotes', acta.otherVotes.toString());
      formData.append('blankVotes', acta.blankVotes.toString());
      formData.append('nullVotes', acta.nullVotes.toString());
      if (acta.photoUrl) formData.append('photoUrl', acta.photoUrl);

      const res = await saveElectoralActa(formData);
      if (res && res.success) {
        successCount++;
        removeOfflineActa(acta.id);
      } else {
        failedCount++;
        acta.status = 'failed';
        acta.errorMessage = res?.error || 'Error al procesar acta';
      }
    } catch (err: any) {
      failedCount++;
      acta.status = 'failed';
      acta.errorMessage = err?.message || 'Error de red';
    }
  }

  // Refrescar persistencia local
  localStorage.setItem(REPORTS_KEY, JSON.stringify(getOfflineReports()));
  localStorage.setItem(ACTAS_KEY, JSON.stringify(getOfflineActas()));
  notifyQueueChange();

  return { total, successCount, failedCount };
}

export function onOfflineQueueChange(callback: (count: number) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<{ count: number }>;
    callback(customEvent.detail?.count ?? getPendingCount());
  };

  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
