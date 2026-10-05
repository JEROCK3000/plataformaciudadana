'use client';

import React, { useState } from 'react';
import { Users, Sparkles, Check, MessageSquare, Quote, Eye } from 'lucide-react';
import { TERMINOLOGY_PRESETS } from '@/lib/utils/terminology';

interface CitizenTerminologyCardProps {
  initialSingularM?: string | null;
  initialSingularF?: string | null;
  initialPlural?: string | null;
}

export default function CitizenTerminologyCard({
  initialSingularM = 'Ciudadano',
  initialSingularF = 'Ciudadana',
  initialPlural = 'Ciudadanos',
}: CitizenTerminologyCardProps) {
  const [singularM, setSingularM] = useState(initialSingularM || 'Ciudadano');
  const [singularF, setSingularF] = useState(initialSingularF || 'Ciudadana');
  const [plural, setPlural] = useState(initialPlural || 'Ciudadanos');

  // Detect which preset is currently selected
  const activePreset = TERMINOLOGY_PRESETS.find(
    (p) =>
      p.id !== 'custom' &&
      p.singularM.toLowerCase() === singularM.trim().toLowerCase() &&
      p.singularF.toLowerCase() === singularF.trim().toLowerCase() &&
      p.plural.toLowerCase() === plural.trim().toLowerCase()
  )?.id || 'custom';

  const [selectedPresetId, setSelectedPresetId] = useState<string>(activePreset);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = TERMINOLOGY_PRESETS.find((p) => p.id === presetId);
    if (preset && preset.id !== 'custom') {
      setSingularM(preset.singularM);
      setSingularF(preset.singularF);
      setPlural(preset.plural);
    }
  };

  const cleanSingularM = singularM.trim() || 'Ciudadano';
  const cleanSingularF = singularF.trim() || 'Ciudadana';
  const cleanPlural = plural.trim() || 'Ciudadanos';

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all">
      {/* Header */}
      <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 mb-2">
              <Users size={13} className="text-blue-600 dark:text-blue-400" />
              <span>Tratamiento y Estilo de Comunicación</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Terminología Ciudadana Personalizada
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Configura las palabras con las que el sistema, el candidato y el War Room se dirigirán a las personas en el discurso de tarima, mensajes de WhatsApp, fichas ejecutivas y reportes públicos.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-7 space-y-6">
        {/* Preset Selector Grid */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Selecciona el tono de tu campaña o administración:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TERMINOLOGY_PRESETS.filter((p) => p.id !== 'custom').map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`relative p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {preset.label.split('/')[0].trim()}
                    </span>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {preset.description}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                    <span>{preset.singularM}</span> • <span>{preset.singularF}</span> • <span>{preset.plural}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs Específicos (Masculino, Femenino y Plural) */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Formas Gramaticales en Uso:
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {selectedPresetId === 'custom' ? 'Modo personalizado activo' : 'Puedes ajustar cualquier campo libremente'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="citizenTermSingularM" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Singular Masculino
              </label>
              <input
                type="text"
                name="citizenTermSingularM"
                id="citizenTermSingularM"
                value={singularM}
                onChange={(e) => {
                  setSingularM(e.target.value);
                  setSelectedPresetId('custom');
                }}
                required
                placeholder="ej: Ciudadano, Amigo"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">Ej: &ldquo;El {cleanSingularM}&rdquo;, &ldquo;Hola {cleanSingularM}&rdquo;</p>
            </div>

            <div>
              <label htmlFor="citizenTermSingularF" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Singular Femenino
              </label>
              <input
                type="text"
                name="citizenTermSingularF"
                id="citizenTermSingularF"
                value={singularF}
                onChange={(e) => {
                  setSingularF(e.target.value);
                  setSelectedPresetId('custom');
                }}
                required
                placeholder="ej: Ciudadana, Amiga"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">Ej: &ldquo;La {cleanSingularF}&rdquo;</p>
            </div>

            <div>
              <label htmlFor="citizenTermPlural" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Plural Colectivo
              </label>
              <input
                type="text"
                name="citizenTermPlural"
                id="citizenTermPlural"
                value={plural}
                onChange={(e) => {
                  setPlural(e.target.value);
                  setSelectedPresetId('custom');
                }}
                required
                placeholder="ej: Ciudadanos, Amigos"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">Ej: &ldquo;¡{cleanPlural} de Quijos!&rdquo;</p>
            </div>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 via-slate-50 to-amber-50/30 dark:from-blue-950/20 dark:via-slate-900/50 dark:to-amber-950/10 p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
            <Eye size={15} />
            <span>Vista Previa en Tiempo Real de Aplicación en el Sistema</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Tarima Preview */}
            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                <Quote size={13} />
                <span>En Discurso de Tarima & Ficha PDF:</span>
              </div>
              <p className="italic text-slate-700 dark:text-slate-300 leading-relaxed">
                &ldquo;¡<strong>{cleanPlural}</strong> de San Francisco de Borja! No vengo a adivinar... como nos reportó el <strong>{cleanSingularM.toLowerCase()}</strong> Carlos Pérez en El Rosal, ¡esta necesidad no puede esperar más!&rdquo;
              </p>
            </div>

            {/* WhatsApp Preview */}
            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                <MessageSquare size={13} />
                <span>En Mensajería de WhatsApp 1-a-1:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                &ldquo;Hola María, te saludamos del equipo de campaña. Agradecemos tu valioso reporte como <strong>{cleanSingularF.toLowerCase()}</strong> comprometida de Baeza...&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
