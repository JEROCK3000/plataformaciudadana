import React from 'react';
import { getTenantSettings, updateTenantSettings } from '@/lib/actions/settings';
import { Settings, Save, Shield, ArrowLeft, Building2 } from 'lucide-react';
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
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Shield size={20} className="text-gray-400" /> Información Institucional
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
