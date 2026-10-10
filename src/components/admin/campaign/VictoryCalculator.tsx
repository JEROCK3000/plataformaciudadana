'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Target, 
  TrendingUp, 
  Users, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  ArrowLeft, 
  RotateCcw,
  Percent,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Flame,
  Info
} from 'lucide-react';
import { saveCampaignScenarioAction } from '@/lib/actions/campaign-scenario';

interface RecintoInfo {
  id: string;
  name: string;
  parish: string;
  electors: number;
  juntas: any[];
}

interface VictoryCalculatorProps {
  initialScenario: any;
  recintos: RecintoInfo[];
  candidateName?: string;
  campaignListNumber?: string;
}

export default function VictoryCalculator({
  initialScenario,
  recintos,
  candidateName = 'Brandon Aliaga',
  campaignListNumber = 'PSC 6 - PK 18',
}: VictoryCalculatorProps) {
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Parámetros cantonales oficiales Quijos
  const TOTAL_ELECTORS = 5738;

  // Estados de simulación
  const [turnoutRate, setTurnoutRate] = useState<number>(
    initialScenario?.expectedTurnoutRate ?? 85.5
  );
  const [nullBlankRate, setNullBlankRate] = useState<number>(
    initialScenario?.nullBlankRate ?? 11.0
  );

  // Metas por Parroquia (votos asignados a nuestra candidatura)
  const defaultParishVotes: Record<string, number> = {
    'Baeza': 660,
    'San Francisco de Borja': 580,
    'Papallacta': 220,
    'Cuyuja': 165,
    'Cosanga': 155,
    'Sumaco': 110,
  };

  const initialParishVotes = initialScenario?.parishGoals
    ? Object.keys(defaultParishVotes).reduce((acc, p) => {
        acc[p] = initialScenario.parishGoals[p]?.targetVotes || defaultParishVotes[p];
        return acc;
      }, {} as Record<string, number>)
    : defaultParishVotes;

  const [parishVotes, setParishVotes] = useState<Record<string, number>>(initialParishVotes);

  // Distribución de rivales (porcentajes de los votos válidos restantes)
  const [rivalPctRenan, setRivalPctRenan] = useState<number>(32.0); // Renán Balladares
  const [rivalPctKerlyn, setRivalPctKerlyn] = useState<number>(15.5); // Kerlyn Ruiz
  const [rivalPctWilliam, setRivalPctWilliam] = useState<number>(9.5); // William Guerrero

  // Cálculos dinámicos
  const totalVoters = Math.round(TOTAL_ELECTORS * (turnoutRate / 100));
  const nullBlankVotes = Math.round(totalVoters * (nullBlankRate / 100));
  const validVotes = totalVoters - nullBlankVotes;

  // Suma de votos de nuestra candidatura
  const targetMyVotes = Object.values(parishVotes).reduce((sum, v) => sum + v, 0);
  const myPctValid = validVotes > 0 ? (targetMyVotes / validVotes) * 100 : 0;

  // Votos estimados de rivales
  const remainingVotes = Math.max(0, validVotes - targetMyVotes);
  const totalRivalPct = rivalPctRenan + rivalPctKerlyn + rivalPctWilliam;
  
  const renanVotes = Math.round(validVotes * (rivalPctRenan / 100));
  const kerlynVotes = Math.round(validVotes * (rivalPctKerlyn / 100));
  const williamVotes = Math.max(0, validVotes - targetMyVotes - renanVotes - kerlynVotes);

  // Diferencia contra el segundo lugar
  const leadOverSecond = targetMyVotes - renanVotes;
  const isWinning = targetMyVotes > renanVotes && targetMyVotes > kerlynVotes;

  const handleParishChange = (parish: string, value: number) => {
    setParishVotes(prev => ({
      ...prev,
      [parish]: Math.max(0, value),
    }));
  };

  const resetDefaults = () => {
    setTurnoutRate(85.5);
    setNullBlankRate(11.0);
    setParishVotes(defaultParishVotes);
    setRivalPctRenan(32.0);
    setRivalPctKerlyn(15.5);
    setRivalPctWilliam(9.5);
  };

  const handleSaveScenario = () => {
    startTransition(async () => {
      setSaveMessage(null);
      const parishGoalsPayload: Record<string, any> = {};
      
      const parishElectorsMap: Record<string, { electors: number; juntas: number }> = {
        'Baeza': { electors: 1980, juntas: 7 },
        'San Francisco de Borja': { electors: 1720, juntas: 6 },
        'Papallacta': { electors: 680, juntas: 2 },
        'Cuyuja': { electors: 520, juntas: 2 },
        'Cosanga': { electors: 510, juntas: 2 },
        'Sumaco': { electors: 328, juntas: 1 },
      };

      Object.entries(parishVotes).forEach(([p, votes]) => {
        const pInfo = parishElectorsMap[p] || { electors: 500, juntas: 2 };
        parishGoalsPayload[p] = {
          electors: pInfo.electors,
          juntas: pInfo.juntas,
          targetVotes: votes,
          targetPct: Number(((votes / pInfo.electors) * 100).toFixed(1)),
        };
      });

      const rivalEstimates = [
        { candidate: candidateName, party: campaignListNumber, estimatedVotes: targetMyVotes, estimatedPct: Number(myPctValid.toFixed(1)) },
        { candidate: 'Renán Balladares', party: 'ADN Lista 7', estimatedVotes: renanVotes, estimatedPct: Number(rivalPctRenan.toFixed(1)) },
        { candidate: 'Kerlyn Ruiz', party: 'Alianza 3-8 / PSP', estimatedVotes: kerlynVotes, estimatedPct: Number(rivalPctKerlyn.toFixed(1)) },
        { candidate: 'William Guerrero', party: 'Unidos por Quijos', estimatedVotes: williamVotes, estimatedPct: Number(rivalPctWilliam.toFixed(1)) },
      ];

      const res = await saveCampaignScenarioAction({
        name: `Escenario Simulado (${targetMyVotes} votos - ${myPctValid.toFixed(1)}%)`,
        description: `Simulación guardada con ${turnoutRate}% participación y ${nullBlankRate}% nulos/blancos`,
        expectedTurnoutRate: turnoutRate,
        nullBlankRate: nullBlankRate,
        targetCandidateVotes: targetMyVotes,
        parishGoals: parishGoalsPayload,
        rivalEstimates: rivalEstimates,
        isDefault: true,
      });

      if (res.success) {
        setSaveMessage('¡Escenario guardado exitosamente en base de datos!');
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        setSaveMessage(`Error: ${res.error}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER TÁCTICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/admin" 
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft size={18} />
            </Link>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <Calculator size={13} />
              Motor de Simulación Electoral
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
              Quijos • 5,738 Electores
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Calculadora del Umbral de Victoria Cantonal
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Simula la cuota electoral matemática necesaria para que <strong className="text-amber-400">{candidateName} ({campaignListNumber})</strong> gane la alcaldía de Quijos frente a los 3 contendientes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetDefaults}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-all border border-slate-700"
            title="Restablecer a valores estándar de elecciones seccionales"
          >
            <RotateCcw size={14} />
            Valores Base
          </button>
          <button
            onClick={handleSaveScenario}
            disabled={isPending}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <Save size={14} />
            {isPending ? 'Guardando...' : 'Guardar Escenario'}
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-fade-in ${
          saveMessage.includes('Error') 
            ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
        }`}>
          <CheckCircle2 size={16} />
          {saveMessage}
        </div>
      )}

      {/* TARJETA PRINCIPAL DEL RESULTADO: SEMÁFORO DE VICTORIA */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isWinning 
          ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/40 shadow-xl shadow-emerald-500/5' 
          : 'bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-950 border-red-500/40 shadow-xl shadow-red-500/5'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          
          {/* Indicador de Estado */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              {isWinning ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  UMBRAL DE VICTORIA ALCANZADO
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-300 border border-red-500/40">
                  <AlertTriangle size={14} className="text-red-400" />
                  ZONA DE RIESGO ELECTORAL
                </span>
              )}
              <span className="text-xs text-slate-400 font-semibold">
                Margen: {leadOverSecond >= 0 ? `+${leadOverSecond}` : leadOverSecond} votos
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                {targetMyVotes.toLocaleString()}
              </span>
              <span className="text-lg font-bold text-amber-400">
                votos proyectados ({myPctValid.toFixed(1)}% de válidos)
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {isWinning ? (
                <>
                  Con este reparto, <strong className="text-white">{candidateName}</strong> supera a Renán Balladares (ADN 7) por un margen de <strong className="text-emerald-400">+{leadOverSecond} votos</strong>. Este colchón permite absorber variaciones imprevistas en mesas periféricas.
                </>
              ) : (
                <>
                  <strong className="text-red-400">Atención:</strong> La meta actual no alcanza para superar la proyección de ADN 7. Se requieren al menos <strong className="text-white">{Math.abs(leadOverSecond) + 1} votos adicionales</strong> concentrados principalmente en Baeza y Borja.
                </>
              )}
            </p>
          </div>

          {/* Votos Válidos vs Nulos */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Universo de Votos</span>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Padrón CNE Total:</span>
              <strong className="text-white font-mono">{TOTAL_ELECTORS.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Sufragantes en urnas:</span>
              <strong className="text-slate-200 font-mono">{totalVoters.toLocaleString()} ({turnoutRate}%)</strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Blancos y Nulos:</span>
              <strong className="text-slate-400 font-mono">{nullBlankVotes.toLocaleString()} ({nullBlankRate}%)</strong>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-emerald-400 font-bold">VOTOS VÁLIDOS:</span>
              <strong className="text-emerald-400 font-mono text-sm">{validVotes.toLocaleString()}</strong>
            </div>
          </div>

          {/* Meta Mínima de Oro */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Umbral Matemático Clave</span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              ~{Math.round(validVotes * 0.385).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              38.5% es la cuota histórica promedio para ganar la alcaldía de Quijos en un escenario de 4 listas sin balotaje.
            </p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, (targetMyVotes / (validVotes * 0.385)) * 100)}%` }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* PANEL DE SLIDERS DE CONTROL CANTONAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PARÁMETROS GLOBALES DE PARTICIPACIÓN */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Percent size={18} className="text-amber-400" />
            <h2 className="text-base font-black text-white">Parámetros Globales del Cantón</h2>
          </div>

          {/* Slider 1: Participación */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300">Tasa de Participación (% que acude a sufragar)</span>
              <span className="font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-sm">
                {turnoutRate}% ({totalVoters.toLocaleString()} votantes)
              </span>
            </div>
            <input 
              type="range"
              min="70"
              max="95"
              step="0.5"
              value={turnoutRate}
              onChange={(e) => setTurnoutRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>70% (Lluvia extrema / Baja afluencia)</span>
              <span>85.5% (Promedio Seccionales)</span>
              <span>95% (Máxima histórica)</span>
            </div>
          </div>

          {/* Slider 2: Nulos y Blancos */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300">Votos Nulos y Blancos (% del total sufragante)</span>
              <span className="font-mono font-black text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-sm">
                {nullBlankRate}% ({nullBlankVotes.toLocaleString()} votos nulos)
              </span>
            </div>
            <input 
              type="range"
              min="5"
              max="20"
              step="0.5"
              value={nullBlankRate}
              onChange={(e) => setNullBlankRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>5% (Mínimo)</span>
              <span>11% (Promedio seccional)</span>
              <span>20% (Voto castigo alto)</span>
            </div>
          </div>

          {/* SIMULACIÓN DE RIVALES */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Proyección de Rivales en Voto Válido
            </span>

            {/* Renán Balladares (ADN) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Renán Balladares (ADN 7)</span>
                <span className="font-mono font-bold text-blue-400">{rivalPctRenan}% • {renanVotes.toLocaleString()} votos</span>
              </div>
              <input 
                type="range"
                min="15"
                max="45"
                step="0.5"
                value={rivalPctRenan}
                onChange={(e) => setRivalPctRenan(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Kerlyn Ruiz (Alianza 3-8 / PSP) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Kerlyn Ruiz (Alianza 3-8 / PSP)</span>
                <span className="font-mono font-bold text-purple-400">{rivalPctKerlyn}% • {kerlynVotes.toLocaleString()} votos</span>
              </div>
              <input 
                type="range"
                min="8"
                max="30"
                step="0.5"
                value={rivalPctKerlyn}
                onChange={(e) => setRivalPctKerlyn(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* William Guerrero (Unidos por Quijos) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">William Guerrero (Unidos por Quijos)</span>
                <span className="font-mono font-bold text-amber-500">{rivalPctWilliam}% • {williamVotes.toLocaleString()} votos</span>
              </div>
              <input 
                type="range"
                min="5"
                max="25"
                step="0.5"
                value={rivalPctWilliam}
                onChange={(e) => setRivalPctWilliam(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

        </div>

        {/* COMPARADOR DE CUOTAS ELECTORALES */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Award size={18} className="text-emerald-400" />
            <h2 className="text-base font-black text-white">Tablero Comparativo de Candidatos</h2>
          </div>

          <div className="space-y-4">
            
            {/* NUESTRA CANDIDATURA */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Nuestra Campaña</span>
                  <h3 className="text-sm font-black text-white">{candidateName} ({campaignListNumber})</h3>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-amber-300 font-mono">{targetMyVotes.toLocaleString()}</span>
                  <span className="text-xs text-amber-400 block font-bold">{myPctValid.toFixed(1)}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${Math.min(100, myPctValid)}%` }} />
              </div>
            </div>

            {/* RIVAL 1: RENÁN BALLADARES */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-400">Rival Directo</span>
                  <h4 className="text-sm font-bold text-slate-200">Renán Balladares (ADN 7)</h4>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-blue-300 font-mono">{renanVotes.toLocaleString()}</span>
                  <span className="text-xs text-blue-400 block">{rivalPctRenan}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, rivalPctRenan)}%` }} />
              </div>
            </div>

            {/* RIVAL 2: KERLYN RUIZ */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-400">Tercera Fuerza</span>
                  <h4 className="text-sm font-bold text-slate-200">Kerlyn Ruiz (Alianza 3-8 / PSP)</h4>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-purple-300 font-mono">{kerlynVotes.toLocaleString()}</span>
                  <span className="text-xs text-purple-400 block">{rivalPctKerlyn}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, rivalPctKerlyn)}%` }} />
              </div>
            </div>

            {/* RIVAL 3: WILLIAM GUERRERO */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-400">Cuarta Fuerza</span>
                  <h4 className="text-sm font-bold text-slate-200">William Guerrero (Unidos por Quijos)</h4>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-amber-400 font-mono">{williamVotes.toLocaleString()}</span>
                  <span className="text-xs text-amber-500 block">{rivalPctWilliam}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, rivalPctWilliam)}%` }} />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* METAS PARROQUIALES DETALLADAS (6 PARROQUIAS DE QUIJOS) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-amber-400" />
            <h2 className="text-lg font-black text-white">Desglose Territorial de Metas por Parroquia</h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Modifica la meta en cada parroquia para recalcular el resultado cantonal
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(parishVotes).map(([parish, votes]) => {
            const electorsData: Record<string, { electors: number; juntas: number; recinto: string }> = {
              'Baeza': { electors: 1980, juntas: 7, recinto: 'Unidad Educativa Baeza' },
              'San Francisco de Borja': { electors: 1720, juntas: 6, recinto: 'U.E. Juan Bautista Montini' },
              'Papallacta': { electors: 680, juntas: 2, recinto: 'Unidad Educativa Quisquis' },
              'Cuyuja': { electors: 520, juntas: 2, recinto: 'Escuela Manuel Villavicencio' },
              'Cosanga': { electors: 510, juntas: 2, recinto: 'Escuela Gil Ramírez Dávalos' },
              'Sumaco': { electors: 328, juntas: 1, recinto: 'Escuela Mixta Quijos (GAD)' },
            };

            const data = electorsData[parish] || { electors: 500, juntas: 2, recinto: 'Recinto' };
            const parishPct = ((votes / data.electors) * 100).toFixed(1);

            return (
              <div 
                key={parish}
                className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 hover:border-amber-500/40 transition-all space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-sm">{parish}</h3>
                    <p className="text-[11px] text-slate-400 truncate max-w-[180px]" title={data.recinto}>
                      {data.recinto}
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {data.juntas} JRV{data.juntas > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-400">Padrón: <strong>{data.electors}</strong></span>
                  <span className="text-amber-400 font-bold">{parishPct}% del padrón</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <label className="text-slate-300 font-semibold">Meta de Votos:</label>
                    <span className="font-black font-mono text-white text-sm">{votes}</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max={Math.round(data.electors * 0.7)}
                    step="5"
                    value={votes}
                    onChange={(e) => handleParishChange(parish, parseInt(e.target.value) || 0)}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (votes / data.electors) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CONCLUSIÓN ESTRATÉGICA */}
      <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-black uppercase tracking-wider">
          <Info size={15} />
          Directriz Estratégica de Victoria para Quijos
        </div>
        <p className="leading-relaxed">
          <strong>La clave de la elección está en Baeza y Borja:</strong> Entre ambas parroquias suman <strong>3,700 electores (64.5% del total cantonal)</strong>. Asegurar al menos el 39% en ambas garantiza 1,240 votos. Con el aporte de las 4 parroquias rurales (Papallacta, Cuyuja, Cosanga y Sumaco) sumando 650 votos más, se sella el umbral ganador de <strong>1,890 votos</strong>, tornando matemáticamente inalcanzable la alcaldía para cualquier rival.
        </p>
      </div>
    </div>
  );
}
