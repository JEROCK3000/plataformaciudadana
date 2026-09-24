import React from 'react';
import { getTenantSettings, updateTenantSettings } from '@/lib/actions/settings';
import { Settings, Save, Shield, ArrowLeft, Building2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getTenantSettings();

  async function handleSave(formData: FormData) {
    "use server";
    await updateTenantSettings(formData);
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-12">
      <header className="bg-gray-900 dark:bg-black text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Link href="/admin" className="p-2 hover:bg-gray-800 rounded-full transition-colors" title="Volver al panel">
              <ArrowLeft size={20} />
            </Link>
            <Settings size={24} className="text-emerald-400" />
            <div>
              <h1 className="text-xl font-bold">Configuración de {settings.canton ? `Cantón ${settings.canton}` : 'la Plataforma'}</h1>
              <p className="text-xs text-gray-400">Ajustes específicos para {settings.platformName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <form action={handleSave} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            
            {/* MÓDULO CAMPAÑA POLÍTICA VS MODO INSTITUCIONAL */}
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-emerald-950/30 p-6 rounded-2xl border-2 border-amber-300 dark:border-amber-700/60 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                    <Shield size={22} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        Módulos de Campaña Política & Inteligencia Territorial
                      </h2>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                        {settings.campaignMode ? 'MODO CAMPAÑA ACTIVO' : 'MODO INSTITUCIONAL GAD'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      Activa con un solo clic el cerebro tecnológico para la contienda electoral o la gestión municipal institucional.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer select-none self-start sm:self-center">
                  <input
                    type="checkbox"
                    name="campaignMode"
                    id="campaignModeToggle"
                    defaultChecked={settings.campaignMode}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                  <span className="ml-3 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
                    Habilitar Modo Campaña
                  </span>
                </label>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-400 bg-white/70 dark:bg-gray-900/70 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40 leading-relaxed">
                <strong>¿Qué ocurre al activar este switch?</strong>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-gray-700 dark:text-gray-300">
                  <li><strong>War Room & Ficha de Tarima:</strong> Se habilita el panel para generar en 1 clic el resumen de prioridades barriales y nombres de vecinos para los discursos del candidato.</li>
                  <li><strong>Generador de Códigos QR:</strong> Descarga de QR inteligentes por parroquia y brigada para material físico (afiches, volantes, microperforados).</li>
                  <li><strong>Formulario de Captura Electoral:</strong> El formulario ciudadano solicita WhatsApp/teléfono del vecino para construir la base de simpatizantes de la campaña.</li>
                  <li><strong>Al desactivarlo:</strong> El sistema vuelve al modo 100% formal e institucional del GAD Municipal sin dejar rastros electorales.</li>
                </ul>
              </div>

              {/* Metadatos de Campaña */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label htmlFor="candidateName" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Candidato(a)
                  </label>
                  <input
                    type="text"
                    name="candidateName"
                    id="candidateName"
                    defaultValue={settings.candidateName}
                    placeholder="Ej. Ing. Juan Pérez"
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-xs text-gray-900 dark:text-white focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="campaignSlogan" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Eslogan de Campaña
                  </label>
                  <input
                    type="text"
                    name="campaignSlogan"
                    id="campaignSlogan"
                    defaultValue={settings.campaignSlogan}
                    placeholder="Ej. El Quijos que Soñamos"
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-xs text-gray-900 dark:text-white focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="campaignListNumber" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Lista o Movimiento Político
                  </label>
                  <input
                    type="text"
                    name="campaignListNumber"
                    id="campaignListNumber"
                    defaultValue={settings.campaignListNumber}
                    placeholder="Ej. Lista 100 - Movimiento Renovación"
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-xs text-gray-900 dark:text-white focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Building2 size={20} className="text-gray-400" /> Información Institucional
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="platformName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre Oficial del GAD / Municipio
                  </label>
                  <input
                    type="text"
                    name="platformName"
                    id="platformName"
                    defaultValue={settings.platformName}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-gray-900 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500">Este nombre aparecerá en la cabecera del portal ciudadano de su cantón.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Cantón</label>
                    <input type="text" disabled value={settings.canton} className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Provincia</label>
                    <input type="text" disabled value={settings.province} className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                Reglas del Motor de Análisis Inteligente para {settings.canton}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Define los criterios y lineamientos con los que el motor analítico evalúa y prioriza los reportes ciudadanos de este cantón. Puedes personalizar normativas territoriales.
              </p>
              <div>
                <label htmlFor="aiPromptMaster" className="sr-only">Prompt Maestro</label>
                <textarea
                  name="aiPromptMaster"
                  id="aiPromptMaster"
                  rows={8}
                  defaultValue={settings.aiPromptMaster}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-gray-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Configuración de Apoyos Ciudadanos */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <CheckCircle size={20} className="text-emerald-500" /> Validación de Apoyos Ciudadanos a Iniciativas
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Controla el mecanismo de verificación cuando los ciudadanos apoyan una iniciativa o reporte en el portal público.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="requireCedulaForVotes"
                    defaultChecked={settings.requireCedulaForVotes}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      Exigir número de cédula ecuatoriana para validar apoyos
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Si está activado, el ciudadano deberá ingresar su número de cédula válido (validación Módulo 10 del Registro Civil) para registrar su apoyo (1 cédula = 1 voto). Si está desactivado, el sistema valida automáticamente por huella digital de dispositivo (anti-spam sin fricción).
                    </p>
                  </div>
                </label>
              </div>
            </div>

          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center items-center gap-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <Save size={16} /> Guardar Configuración
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
