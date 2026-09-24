'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { 
  ArrowLeft, 
  QrCode, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  MapPin, 
  Users, 
  FileText 
} from 'lucide-react';

interface QRCodesProps {
  tenant: {
    name: string;
    canton: string;
    slug: string;
    parishes: string[];
    candidateName?: string | null;
    campaignSlogan?: string | null;
    campaignListNumber?: string | null;
  };
}

export default function QRCodesClient({ tenant }: QRCodesProps) {
  const [selectedType, setSelectedType] = useState<'GENERAL' | 'PARISH' | 'BRIGADE'>('PARISH');
  const [selectedParish, setSelectedParish] = useState<string>(tenant.parishes[0] || 'Baeza');
  const [brigadeName, setBrigadeName] = useState<string>('Brigada 1 - Juventudes');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Determinar dominio base (en cliente window.location.origin)
  const [origin, setOrigin] = useState<string>('https://plataforma.quijos.gob.ec');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Construir la URL de destino
  const targetUrl = React.useMemo(() => {
    const baseUrl = `${origin}/${tenant.slug}`;
    if (selectedType === 'GENERAL') {
      return `${baseUrl}?utm_source=qr_general`;
    }
    if (selectedType === 'PARISH') {
      return `${baseUrl}?parish=${encodeURIComponent(selectedParish)}&utm_source=qr_${encodeURIComponent(selectedParish.toLowerCase().replace(/\s+/g, '_'))}`;
    }
    return `${baseUrl}?brigade=${encodeURIComponent(brigadeName)}&utm_source=qr_brigada`;
  }, [origin, tenant.slug, selectedType, selectedParish, brigadeName]);

  // Generar Código QR en alta resolución
  useEffect(() => {
    QRCode.toDataURL(targetUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#0B132B', // Azul marino corporativo
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generando QR:', err));
  }, [targetUrl]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    const filename = selectedType === 'PARISH' 
      ? `QR_Campana_${tenant.canton}_${selectedParish.replace(/\s+/g, '_')}.png`
      : selectedType === 'BRIGADE'
      ? `QR_Campana_${tenant.canton}_${brigadeName.replace(/\s+/g, '_')}.png`
      : `QR_Campana_${tenant.canton}_General.png`;
    a.download = filename;
    a.click();
  };

  const candidateDisplayName = tenant.candidateName || 'El Candidato';
  const sloganDisplayName = tenant.campaignSlogan || 'El Quijos que Soñamos';
  const listDisplayName = tenant.campaignListNumber || 'Lista Oficial';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white" title="Volver al panel">
                <ArrowLeft size={20} />
              </Link>
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <QrCode size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-white flex items-center gap-2">
                  GENERADOR DE CÓDIGOS QR <span className="text-amber-400">• Campaña Electoral</span>
                </h1>
                <p className="text-xs text-slate-400">
                  Material digital e imprimible para volantes, afiches, vallas y brigadas de territorio
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link 
                href="/admin/war-room" 
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Ir al War Room
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Controles de Configuración */}
        <div className="bg-slate-850 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 print:hidden">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-amber-400" /> Configura el Código QR de Activación
            </h2>
            <p className="text-xs text-slate-400">
              Selecciona el tipo de material para el que deseas generar el código QR. Al escanearse, abrirá la plataforma adaptada con los parámetros seleccionados.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedType('PARISH')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedType === 'PARISH'
                  ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin size={20} className={selectedType === 'PARISH' ? 'text-amber-400 mb-2' : 'text-slate-500 mb-2'} />
              <div className="font-bold text-sm">QR por Parroquia Específica</div>
              <div className="text-xs text-slate-400 mt-1">Preselecciona la parroquia para volantes locales.</div>
            </button>

            <button
              onClick={() => setSelectedType('GENERAL')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedType === 'GENERAL'
                  ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText size={20} className={selectedType === 'GENERAL' ? 'text-amber-400 mb-2' : 'text-slate-500 mb-2'} />
              <div className="font-bold text-sm">QR General Cantonal</div>
              <div className="text-xs text-slate-400 mt-1">Para vallas, afiches masivos y redes sociales.</div>
            </button>

            <button
              onClick={() => setSelectedType('BRIGADE')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedType === 'BRIGADE'
                  ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users size={20} className={selectedType === 'BRIGADE' ? 'text-amber-400 mb-2' : 'text-slate-500 mb-2'} />
              <div className="font-bold text-sm">QR por Brigada de Calle</div>
              <div className="text-xs text-slate-400 mt-1">Mide qué equipo levanta más reportes cívicos.</div>
            </button>
          </div>

          {/* Opciones según el tipo */}
          {selectedType === 'PARISH' && (
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                Selecciona la Parroquia Destino:
              </label>
              <div className="flex flex-wrap gap-2">
                {tenant.parishes.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedParish(p)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedParish === p
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                        : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    📍 {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedType === 'BRIGADE' && (
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
                Nombre de la Brigada o Voluntario:
              </label>
              <input
                type="text"
                value={brigadeName}
                onChange={(e) => setBrigadeName(e.target.value)}
                placeholder="Ej. Brigada 1 - San Francisco de Borja"
                className="w-full max-w-md px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          )}

          {/* Enlace generado */}
          <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-500 font-mono truncate flex-1">{targetUrl}</span>
            <button
              onClick={handleCopyUrl}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar URL'}
            </button>
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Probar enlace"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* ============================================================ */}
        {/* VISTA PREVIA Y PLANTILLA DE AFICHE IMPRIMIBLE (TAMAÑO A4)    */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Tarjeta de Descarga Inmediata */}
          <div className="bg-slate-850 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-center print:hidden">
            <h3 className="text-base font-bold text-white">Código QR de Alta Resolución (PNG)</h3>
            <p className="text-xs text-slate-400">
              Generado con corrección de errores nivel alto (High). Listo para imprentas, gigantografías y serigrafía.
            </p>

            <div className="inline-block p-4 bg-white rounded-3xl shadow-2xl border-4 border-amber-500/40">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="Código QR de Campaña" 
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-slate-400 text-xs">Generando QR...</div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Download size={16} /> Descargar PNG para Imprenta
              </button>
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Imprimir Afiche A4
              </button>
            </div>
          </div>

          {/* Afiche Modelo A4 (Visible en pantalla y 100% perfecto al imprimir con window.print()) */}
          <div className="bg-white text-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl border-4 border-amber-500 text-center space-y-6 print:border-none print:shadow-none print:p-0 print:m-0">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold tracking-widest uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {listDisplayName} • CANTÓN {tenant.canton.toUpperCase()}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-2">
                {candidateDisplayName.toUpperCase()}
              </h2>
              <p className="text-sm font-bold text-amber-600 italic">
                "{sloganDisplayName}"
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900">
                {selectedType === 'PARISH' 
                  ? `¿QUÉ NECESITA TU BARRIO EN ${selectedParish.toUpperCase()}?` 
                  : '¿QUÉ NECESITA TU BARRIO?'}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                No venimos a prometer, venimos a escuchar. Escanea este código, sube tu foto y construyamos juntos el Plan de Obras Prioritarias.
              </p>
            </div>

            {/* QR gigante para escanear */}
            <div className="py-2">
              {qrDataUrl && (
                <img 
                  src={qrDataUrl} 
                  alt="QR para Escanear" 
                  className="w-64 h-64 sm:w-72 sm:h-72 object-contain mx-auto shadow-md rounded-2xl border-2 border-slate-300 p-2"
                />
              )}
            </div>

            <div className="space-y-1 text-xs text-slate-700">
              <p className="font-extrabold text-slate-900">
                1. Abre la cámara de tu celular • 2. Apunta al código • 3. Sube tu reporte en 30 segundos
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {targetUrl}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 font-medium">
              Campaña Electoral Ciudadana • Plataforma Tecnológica de Escucha Barrial SOLINTEEC
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
