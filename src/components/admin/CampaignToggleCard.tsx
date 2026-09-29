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
  PhoneCall, 
  Image as ImageIcon,
  User,
  Flag,
  Eye,
  Check,
  RotateCcw
} from 'lucide-react';
import ImageUploadDropzone from '@/components/ui/ImageUploadDropzone';

interface CampaignToggleCardProps {
  initialCampaignMode: boolean;
  initialCandidateName?: string | null;
  initialCampaignSlogan?: string | null;
  initialCampaignListNumber?: string | null;
  initialCandidatePhotoUrl?: string | null;
  initialPartyLogoUrl?: string | null;
}

export default function CampaignToggleCard({
  initialCampaignMode,
  initialCandidateName = '',
  initialCampaignSlogan = '',
  initialCampaignListNumber = '',
  initialCandidatePhotoUrl = '',
  initialPartyLogoUrl = '',
}: CampaignToggleCardProps) {
  const [enabled, setEnabled] = useState<boolean>(initialCampaignMode);
  const [candidateName, setCandidateName] = useState<string>(initialCandidateName || '');
  const [campaignSlogan, setCampaignSlogan] = useState<string>(initialCampaignSlogan || '');
  const [campaignListNumber, setCampaignListNumber] = useState<string>(initialCampaignListNumber || '');
  const [candidatePhotoUrl, setCandidatePhotoUrl] = useState<string>(initialCandidatePhotoUrl || '');
  const [partyLogoUrl, setPartyLogoUrl] = useState<string>(initialPartyLogoUrl || '');

  // Presets rápidos para demostración ejecutiva
  const applyDemoPreset = () => {
    setCandidateName('Ing. Carlos Morales');
    setCampaignSlogan('Por el Futuro y Desarrollo de Quijos');
    setCampaignListNumber('Lista 100 - Movimiento Renovación');
    setCandidatePhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80');
    setPartyLogoUrl('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=300&h=300&q=80');
  };

  const clearLogos = () => {
    setCandidatePhotoUrl('');
    setPartyLogoUrl('');
  };

  return (
    <div 
      className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-lg ${
        enabled 
          ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/70 shadow-amber-500/10' 
          : 'bg-slate-900/90 border-slate-700/80 shadow-slate-950/50'
      }`}
    >
      {/* Hidden inputs para sincronización directa con el FormData de Server Actions */}
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
        <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 space-y-6 ${
          enabled 
            ? 'bg-slate-950/70 border-amber-500/30' 
            : 'bg-slate-950/30 border-slate-800/60 opacity-60'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className={enabled ? 'text-amber-400' : 'text-slate-500'} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Personalización Electoral (Candidato, Lista & Branding)
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={applyDemoPreset}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors font-semibold"
              >
                Cargar Datos Demo
              </button>
              <button
                type="button"
                onClick={clearLogos}
                className="text-[11px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                title="Limpiar URLs de logos"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </div>

          {/* Fila 1: Textos (Nombre, Eslogan, Lista) */}
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

          {/* Fila 2: Identidad Visual con Drag & Drop y Botón Examinar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <ImageUploadDropzone
              name="candidatePhotoUrl"
              label="Fotografía Oficial del Candidato(a)"
              helperText="Se mostrará en el cintillo del portal ciudadano, ficha de tarima y afiches QR."
              value={candidatePhotoUrl}
              onChange={(url) => setCandidatePhotoUrl(url)}
              category="candidato"
              aspectRatio="circle"
            />

            <ImageUploadDropzone
              name="partyLogoUrl"
              label="Logotipo del Partido o Lista"
              helperText="Distintivo electoral oficial (admite PNG transparente, JPG o SVG)."
              value={partyLogoUrl}
              onChange={(url) => setPartyLogoUrl(url)}
              category="partido"
              aspectRatio="square"
            />
          </div>

          {/* Simulador en Vivo: Cómo lo verá el votante en el portal ciudadano */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Eye size={14} /> Vista Previa en Vivo: Cintillo Oficial del Portal Ciudadano
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Así lucirá en el móvil del ciudadano al ingresar a la plataforma
              </span>
            </div>

            {/* Mockup del Cintillo */}
            <div className="bg-gradient-to-r from-amber-950/80 via-orange-950/60 to-slate-900 border border-amber-500/50 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                {/* Foto circular con aro ámbar */}
                <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-amber-400 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                  {candidatePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={candidatePhotoUrl} alt="Candidato" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-slate-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                      Campaña 2026
                    </span>
                    <span className="text-xs font-bold text-white">
                      {candidateName || 'Nombre del Candidato'}
                    </span>
                    <span className="text-[11px] text-amber-300 font-semibold">
                      {campaignListNumber ? `• ${campaignListNumber}` : ''}
                    </span>
                  </div>
                  <div className="text-xs text-amber-200/90 italic mt-0.5">
                    "{campaignSlogan || 'Eslogan oficial de campaña'}"
                  </div>
                </div>
              </div>

              {/* Logo del partido a la derecha */}
              <div className="w-10 h-10 rounded-lg bg-slate-900/80 border border-slate-700/80 p-1 shrink-0 flex items-center justify-center">
                {partyLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={partyLogoUrl} alt="Logo Partido" className="w-full h-full object-contain" />
                ) : (
                  <Flag size={16} className="text-slate-500" />
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
