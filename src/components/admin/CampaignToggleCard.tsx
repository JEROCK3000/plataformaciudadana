'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Target, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  QrCode, 
  FileText, 
  PhoneCall, 
  ArrowRight,
  Info
} from 'lucide-react';

interface CampaignToggleCardProps {
  initialCampaignMode: boolean;
  initialCandidateName?: string | null;
  initialCampaignSlogan?: string | null;
  initialCampaignListNumber?: string | null;
}

export default function CampaignToggleCard({
  initialCampaignMode,
  initialCandidateName = '',
  initialCampaignSlogan = '',
  initialCampaignListNumber = '',
}: CampaignToggleCardProps) {
  const [enabled, setEnabled] = useState<boolean>(initialCampaignMode);
  const [candidateName, setCandidateName] = useState<string>(initialCandidateName || '');
  const [campaignSlogan, setCampaignSlogan] = useState<string>(initialCampaignSlogan || '');
  const [campaignListNumber, setCampaignListNumber] = useState<string>(initialCampaignListNumber || '');

  return (
    <div 
      className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-lg ${
        enabled 
          ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/70 shadow-amber-500/10' 
          : 'bg-slate-900/90 border-slate-700/80 shadow-slate-950/50'
      }`}
    >
      {/* Hidden input for form submission */}
      <input 
        type="checkbox" 
        name="campaignMode" 
        value="on" 
        checked={enabled} 
        onChange={() => {}} 
        className="hidden" 
      />

      {/* Header del Card */}
      <div className="p-6 sm:p-7 border-b border-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Lado izquierdo: Título e Identidad */}
          <div className="flex items-start gap-4">
            <div 
              className={`p-3.5 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-all duration-300 ${
                enabled 
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-amber-500/30 ring-2 ring-amber-400/30' 
                  : 'bg-slate-800 text-slate-400 ring-1 ring-slate-700'
              }`}
            >
              {enabled ? <Flame size={26} className="animate-pulse" /> : <Building2 size={26} />}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Módulo de Campaña & Inteligencia Territorial
                </h2>
                
                <span 
                  className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border transition-all ${
                    enabled 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-amber-400 animate-ping' : 'bg-slate-500'}`} />
                  {enabled ? 'Modo Campaña Activo' : 'Modo Institucional GAD'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Conmuta en un solo clic la arquitectura del sistema: como <strong className="text-amber-300">cerebro electoral para la contienda política</strong> o como <strong className="text-emerald-300">mesa formal de servicios y fiscalización del GAD Municipal</strong>.
              </p>
            </div>
          </div>

          {/* Lado derecho: Switch Component Ultra-Profesional */}
          <div className="flex items-center gap-4 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 self-start lg:self-center shrink-0 shadow-inner">
            <div className="text-right">
              <div className="text-xs font-bold text-white">
                {enabled ? 'Modo Campaña' : 'Modo Formal GAD'}
              </div>
              <div className={`text-[11px] font-extrabold ${enabled ? 'text-amber-400' : 'text-slate-400'}`}>
                {enabled ? 'HABILITADO' : 'DESACTIVADO'}
              </div>
            </div>

            {/* Toggle Switch Pill */}
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                enabled ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-slate-800 border border-slate-700'
              }`}
            >
              <span className="sr-only">Habilitar Modo Campaña</span>
              <span
                className={`pointer-events-none flex items-center justify-center h-6 w-6 transform rounded-full bg-white text-slate-950 shadow-md ring-0 transition duration-300 ease-in-out ${
                  enabled ? 'translate-x-8' : 'translate-x-0'
                }`}
              >
                {enabled ? (
                  <Flame size={13} className="text-amber-600 fill-amber-500" />
                ) : (
                  <Building2 size={13} className="text-slate-600" />
                )}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Cuerpo del Card: Explicación de Cambios & Campos de Parametrización */}
      <div className="p-6 sm:p-7 space-y-6">
        
        {/* Grilla Informativa de Capacidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
              <Target size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">War Room & Discurso de Tarima</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Filtro parroquial en vivo, síntesis de necesidades ciudadanas y generación de ficha ejecutiva A4 para llevar al atril.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
              <QrCode size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Generador de QR Parroquiales</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Genera códigos QR de alta densidad con inyección de parroquia (<code>?parish=...</code>) para afiches y brigadas de calle.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
              <PhoneCall size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Captura de Contacto WhatsApp</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                El formulario ciudadano captura el teléfono del simpatizante para crear el directorio de votantes y convocatorias.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
              <Building2 size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Transición Limpia al GAD Oficial</div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Al ganar la alcaldía, apagar el switch vuelve el sistema 100% institucional preservando todos los reportes históricos.
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Parametrización del Candidato */}
        <div className={`p-5 rounded-2xl border transition-all duration-300 ${
          enabled 
            ? 'bg-slate-950/70 border-amber-500/30' 
            : 'bg-slate-950/30 border-slate-800/60 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className={enabled ? 'text-amber-400' : 'text-slate-500'} />
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Datos de Personalización Electoral (Cintillo & Afiches)
              </h3>
            </div>
            {!enabled && (
              <span className="text-[11px] text-slate-400 italic">
                (Se aplicarán al activar el switch)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="candidateName" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nombre del Candidato(a)
              </label>
              <input
                type="text"
                name="candidateName"
                id="candidateName"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Ej. Ing. Juan Pérez"
                className="block w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="campaignSlogan" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Eslogan de Campaña
              </label>
              <input
                type="text"
                name="campaignSlogan"
                id="campaignSlogan"
                value={campaignSlogan}
                onChange={(e) => setCampaignSlogan(e.target.value)}
                placeholder="Ej. Por el Futuro y Desarrollo"
                className="block w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="campaignListNumber" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Lista / Movimiento Político
              </label>
              <input
                type="text"
                name="campaignListNumber"
                id="campaignListNumber"
                value={campaignListNumber}
                onChange={(e) => setCampaignListNumber(e.target.value)}
                placeholder="Ej. Lista 100 - Movimiento Renovación"
                className="block w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
