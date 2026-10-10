'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Target, 
  Vote, 
  QrCode, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  Radio,
  ExternalLink,
  Calculator,
  Calendar,
  Users
} from 'lucide-react';

interface TacticalMenuProps {
  candidateName?: string | null;
  campaignListNumber?: string | null;
}

export default function AdminHeaderTacticalMenu({
  candidateName = 'Brandon Aliaga',
  campaignListNumber = 'PSC 6 - PK 18',
}: TacticalMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      {/* CÁPSULA TÁCTICA UNIFICADA (Entra 100% en 1 sola línea) */}
      <div className="flex items-center p-0.5 rounded-xl bg-gradient-to-r from-red-950/70 via-amber-950/60 to-slate-900 border border-amber-500/50 shadow-md shadow-amber-500/10">
        
        {/* Enlace Directo 1: WAR ROOM */}
        <Link
          href="/admin/war-room"
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-black text-amber-300 hover:text-white hover:bg-amber-500/20 rounded-lg transition-all"
          title="War Room: Centro de Inteligencia y Discurso de Tarima"
        >
          <Target size={14} className="text-amber-400" />
          <span className="hidden sm:inline">War Room</span>
        </Link>

        <span className="w-px h-3.5 bg-slate-700/80" />

        {/* Enlace Directo 2: DÍA D */}
        <Link
          href="/admin/control-electoral"
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-black text-red-300 hover:text-white hover:bg-red-500/20 rounded-lg transition-all"
          title="Día D: Conteo Rápido de 20 JRVs y Transmisión de Actas"
        >
          <Vote size={14} className="text-red-400" />
          <span>Día D</span>
          {/* Micro-dot titilante LIVE */}
          <span className="relative flex h-2 w-2 ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        </Link>

        <span className="w-px h-3.5 bg-slate-700/80" />

        {/* Enlace Directo 3: CÓDIGOS QR */}
        <Link
          href="/admin/qr-codes"
          className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          title="Generador de Códigos QR para Volantes Parroquiales"
        >
          <QrCode size={13} className="text-amber-400" />
          <span className="hidden md:inline">QR</span>
        </Link>

        <span className="w-px h-3.5 bg-slate-700/80" />

        {/* Botón Desplegable para Ficha Rápida */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-1.5 py-1 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-all ${
            isOpen ? 'bg-slate-800 text-amber-300' : ''
          }`}
          title="Ver resumen y opciones de campaña"
        >
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* DROPDOWN POPUP DE ALTA FIDELIDAD */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-slate-950 border border-amber-500/40 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/50 to-red-950/50 border border-amber-500/30 mb-2">
            <div className="flex items-center justify-between text-[11px] font-extrabold">
              <span className="text-amber-400 flex items-center gap-1">
                <Flame size={13} /> Elecciones Quijos 2026
              </span>
              <span className="text-slate-400 font-mono text-[10px]">{campaignListNumber}</span>
            </div>
            <p className="text-xs font-black text-white mt-0.5">
              {candidateName || 'Brandon Aliaga'}
            </p>
          </div>

          <div className="space-y-1">
            <Link
              href="/admin/war-room"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform">
                  <Target size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    War Room Territorial
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Discurso para tarima y quejas por parroquia
                  </p>
                </div>
              </div>
              <ExternalLink size={13} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
            </Link>

            <Link
              href="/admin/control-electoral"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 group-hover:scale-105 transition-transform">
                  <Vote size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-red-300 transition-colors flex items-center gap-1.5">
                    Control Electoral Día D
                    <span className="px-1.5 py-0.2 bg-red-500/30 text-red-300 text-[9px] rounded font-black">20 JRVs</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Conteo rápido y actas fotográficas oficiales
                  </p>
                </div>
              </div>
              <ExternalLink size={13} className="text-slate-600 group-hover:text-red-400 transition-colors" />
            </Link>

            {/* CALCULADORA DE UMBRAL */}
            <Link
              href="/admin/calculadora-victoria"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:scale-105 transition-transform">
                  <Calculator size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    Calculadora de Victoria
                    <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] rounded font-black">Meta 1,850</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Simulador matemático de umbral cantonal
                  </p>
                </div>
              </div>
              <ExternalLink size={13} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
            </Link>

            {/* AGENDA TERRITORIAL */}
            <Link
              href="/admin/agenda-territorial"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform">
                  <Calendar size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Agenda de Territorio
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Caminatas y discursos conectados a quejas
                  </p>
                </div>
              </div>
              <ExternalLink size={13} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </Link>

            {/* PADRÓN ELECTORAL / VOTO SEGURO */}
            <Link
              href="/admin/padron-electoral"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 group-hover:scale-105 transition-transform">
                  <Users size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                    Padrón y Voto Seguro
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Chequeo de asistencia y transporte Día D
                  </p>
                </div>
              </div>
              <ExternalLink size={13} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
            </Link>

            {/* CÓDIGOS QR */}
            <Link
              href="/admin/qr-codes"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 group-hover:scale-105 transition-transform">
                  <QrCode size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-slate-200 transition-colors">
                    Generador de QR Brigadistas
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Volantes con georreferenciación automática
                  </p>
                </div>
              </div>
              <ExternalLink size={13} className="text-slate-600 group-hover:text-slate-300 transition-colors" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
