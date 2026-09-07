import React from 'react';
import { createTenant } from '@/lib/actions/tenants';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function NewTenantPage() {
  async function handleCreate(formData: FormData) {
    "use server";
    const result = await createTenant(formData);
    if (result.success) {
      redirect("/superadmin/tenants");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/superadmin/tenants"
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full transition-colors"
          title="Volver al listado"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Building2 className="text-purple-400" size={24} /> Aprovisionar Nuevo Municipio (Tenant)
          </h2>
          <p className="text-sm text-gray-400">Configure los datos territoriales y el alcance del nuevo GAD suscrito.</p>
        </div>
      </div>

      <form action={handleCreate} className="bg-gray-800/80 rounded-2xl border border-gray-700/60 p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-200 mb-1">
              Nombre Oficial del GAD <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="ej. GAD Municipal del Cantón Tena"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1">
              Slug URL (identificador único) <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2.5 bg-gray-900 border border-r-0 border-gray-700 text-gray-500 text-sm rounded-l-xl">
                /
              </span>
              <input
                type="text"
                name="slug"
                required
                placeholder="tena"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-r-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Solo minúsculas sin espacios (ej. quijos)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1">
              Plan SaaS
            </label>
            <select
              name="plan"
              defaultValue="PRO"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="STARTER">Starter</option>
              <option value="PRO">Pro</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1">
              Cantón <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="canton"
              required
              placeholder="ej. Tena"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1">
              Provincia
            </label>
            <input
              type="text"
              name="province"
              defaultValue="Napo"
              required
              placeholder="ej. Napo"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-200 mb-1">
              Parroquias del Cantón (separadas por coma) <span className="text-red-400">*</span>
            </label>
            <textarea
              name="parishes"
              rows={2}
              required
              placeholder="ej. Tena, Ahuano, Chonta Punta, Pano, Puerto Misahuallí, Puerto Napo, Tálag"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
            />
            <p className="text-[11px] text-gray-400 mt-1">Estas parroquias aparecerán en el selector del formulario ciudadano.</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-200 mb-1">
              Prompt Maestro de IA Personalizado (Opcional)
            </label>
            <textarea
              name="aiPromptMaster"
              rows={3}
              placeholder="Dejar en blanco para usar el prompt maestro global del sistema..."
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-xs font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700/60 flex items-center justify-end gap-3">
          <Link
            href="/superadmin/tenants"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-950/40 transition-all hover:scale-105"
          >
            <Save size={16} /> Crear Municipio
          </button>
        </div>
      </form>
    </div>
  );
}
