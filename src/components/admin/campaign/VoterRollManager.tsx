'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  ArrowLeft, 
  Phone, 
  Car, 
  MapPin, 
  AlertTriangle, 
  Trash2, 
  X,
  Vote,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { 
  toggleVoterCheckAction, 
  createVoterAction, 
  deleteVoterAction,
  CreateVoterInput
} from '@/lib/actions/voter-roll';
import { CommitmentLevel, JuntaGender } from '@prisma/client';

interface RecintoItem {
  id: string;
  name: string;
  parish: string;
  electors: number;
  juntas: any[];
}

interface VoterItem {
  id: string;
  cedula: string;
  fullName: string;
  parish: string;
  recintoId: string | null;
  juntaId: string | null;
  juntaNumber: number | null;
  gender: string | null;
  phone: string | null;
  neighborhood: string | null;
  commitmentLevel: CommitmentLevel;
  hasVoted: boolean;
  votedAt: string | Date | null;
  needsTransport: boolean;
  transportAddress: string | null;
  volunteerAssigned: string | null;
  notes: string | null;
  recinto?: { name: string } | null;
}

interface VoterRollManagerProps {
  initialVoters: VoterItem[];
  recintos: RecintoItem[];
  totalRegistered: number;
  totalVoted: number;
  candidateName?: string;
  campaignListNumber?: string;
  parishes?: string[];
}

export default function VoterRollManager({
  initialVoters,
  recintos,
  totalRegistered,
  totalVoted,
  candidateName = 'Brandon Aliaga',
  campaignListNumber = 'PSC 6 - PK 18',
  parishes = ['Baeza', 'San Francisco de Borja', 'Papallacta', 'Cuyuja', 'Cosanga', 'Sumaco'],
}: VoterRollManagerProps) {
  const [voters, setVoters] = useState<VoterItem[]>(initialVoters);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [filterParish, setFilterParish] = useState('TODAS');
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'VOTARON' | 'PENDIENTES' | 'TRANSPORTE'>('TODOS');
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Formulario nuevo votante
  const [newVoter, setNewVoter] = useState<CreateVoterInput>({
    cedula: '',
    fullName: '',
    parish: 'Baeza',
    juntaNumber: 1,
    phone: '',
    neighborhood: '',
    commitmentLevel: CommitmentLevel.SEGURO,
    needsTransport: false,
    transportAddress: '',
    volunteerAssigned: '',
  });

  // Métricas dinámicas calculadas sobre el estado local
  const currentTotal = voters.length;
  const currentVoted = voters.filter(v => v.hasVoted).length;
  const currentPending = currentTotal - currentVoted;
  const currentTransport = voters.filter(v => v.needsTransport).length;
  const turnoutPercentage = currentTotal > 0 ? ((currentVoted / currentTotal) * 100).toFixed(1) : '0';

  // Filtrado reactivo en cliente para búsqueda ultrarrápida (ideal para el Día D)
  const filteredVoters = useMemo(() => {
    return voters.filter(v => {
      if (filterParish !== 'TODAS' && v.parish !== filterParish) return false;
      if (filterStatus === 'VOTARON' && !v.hasVoted) return false;
      if (filterStatus === 'PENDIENTES' && v.hasVoted) return false;
      if (filterStatus === 'TRANSPORTE' && !v.needsTransport) return false;
      
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = v.fullName.toLowerCase().includes(q);
        const matchesCedula = v.cedula.includes(q);
        const matchesPhone = v.phone ? v.phone.includes(q) : false;
        const matchesBarrio = v.neighborhood ? v.neighborhood.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesCedula && !matchesPhone && !matchesBarrio) return false;
      }
      return true;
    });
  }, [voters, filterParish, filterStatus, search]);

  const handleToggleVote = (id: string) => {
    startTransition(async () => {
      // Optimistic update
      setVoters(prev => prev.map(v => {
        if (v.id === id) {
          const nextVoted = !v.hasVoted;
          return {
            ...v,
            hasVoted: nextVoted,
            votedAt: nextVoted ? new Date().toISOString() : null,
          };
        }
        return v;
      }));

      const res = await toggleVoterCheckAction(id);
      if (!res.success) {
        // Rollback on error
        alert('Error al actualizar voto: ' + res.error);
      }
    });
  };

  const handleCreateVoter = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      setMessage(null);
      // Asignar recinto automático según la parroquia
      const recintoMatch = recintos.find(r => r.parish === newVoter.parish);
      const payload: CreateVoterInput = {
        ...newVoter,
        recintoId: recintoMatch?.id,
      };

      const res = await createVoterAction(payload);
      if (res.success && res.voter) {
        setVoters(prev => [res.voter as any, ...prev]);
        setShowAddModal(false);
        setMessage(`Elector ${res.voter.fullName} agregado correctamente al padrón.`);
        setTimeout(() => setMessage(null), 3000);
        // Reset form
        setNewVoter({
          cedula: '',
          fullName: '',
          parish: 'Baeza',
          juntaNumber: 1,
          phone: '',
          neighborhood: '',
          commitmentLevel: CommitmentLevel.SEGURO,
          needsTransport: false,
          transportAddress: '',
          volunteerAssigned: '',
        });
      } else {
        setMessage(`Error: ${res.error}`);
      }
    });
  };

  const handleDeleteVoter = (id: string, name: string) => {
    if (!confirm(`¿Eliminar a ${name} del padrón de simpatizantes?`)) return;
    startTransition(async () => {
      const res = await deleteVoterAction(id);
      if (res.success) {
        setVoters(prev => prev.filter(v => v.id !== id));
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1.5">
              <Vote size={13} />
              Día D • Control de Asistencia y Movilización
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
              {candidateName} ({campaignListNumber})
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Padrón Electoral y Chequeo de Voto Seguro
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Control de asistencia de votantes afines por recinto y mesa en tiempo real. Identifica quiénes aún no han votado para activar movilización y transporte puerta a puerta.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/control-electoral"
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700"
          >
            <ShieldCheck size={14} className="text-amber-400" />
            Mesas y Actas Día D
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 rounded-xl transition-all shadow-lg shadow-red-500/20"
          >
            <Plus size={16} />
            + Registrar Elector
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-fade-in ${
          message.includes('Error') 
            ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
        }`}>
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      {/* DASHBOARD EN VIVO DEL DÍA D (TERMÓMETRO DE MOVILIZACIÓN) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Simpatizantes */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Padrón Comprometido</span>
          <div className="text-2xl font-black text-white mt-1 font-mono">{currentTotal}</div>
          <span className="text-[11px] text-slate-400">Votantes seguros registrados</span>
        </div>

        {/* Ya Votaron */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">Ya Sufragaron</span>
            <span className="text-xs font-black text-emerald-400 font-mono">{turnoutPercentage}%</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{currentVoted}</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${turnoutPercentage}%` }}
            />
          </div>
        </div>

        {/* Pendientes de Votar (Alerta Operación Remolque) */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">Pendientes por Votar</span>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">{currentPending}</div>
          <span className="text-[11px] text-amber-400/80">Objetivo de movilización urgente</span>
        </div>

        {/* Requieren Transporte */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-blue-400 font-bold uppercase tracking-wider block">Requieren Transporte</span>
          <div className="text-2xl font-black text-blue-400 mt-1 font-mono">{currentTransport}</div>
          <span className="text-[11px] text-slate-400">Camionetas / Mototaxis asignados</span>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS INSTANTÁNEOS */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Input Buscador */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cédula, apellidos, teléfono o barrio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtro por Estado de Voto */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shrink-0">
            <button
              onClick={() => setFilterStatus('TODOS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'TODOS' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({voters.length})
            </button>
            <button
              onClick={() => setFilterStatus('PENDIENTES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'PENDIENTES' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              Pendientes ({currentPending})
            </button>
            <button
              onClick={() => setFilterStatus('VOTARON')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'VOTARON' ? 'bg-emerald-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              Ya Votaron ({currentVoted})
            </button>
            <button
              onClick={() => setFilterStatus('TRANSPORTE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'TRANSPORTE' ? 'bg-blue-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-blue-300'
              }`}
            >
              Transporte ({currentTransport})
            </button>
          </div>

        </div>

        {/* Filtro de Parroquia */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-bold text-slate-400 mr-1">Parroquia:</span>
          <button
            onClick={() => setFilterParish('TODAS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              filterParish === 'TODAS' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todas
          </button>
          {parishes.map(p => (
            <button
              key={p}
              onClick={() => setFilterParish(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterParish === p ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE PADRÓN ELECTORAL INTERACTIVA */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">Voto</th>
                <th className="py-3.5 px-4">Elector / Cédula</th>
                <th className="py-3.5 px-4">Parroquia / Recinto</th>
                <th className="py-3.5 px-4 text-center">JRV #</th>
                <th className="py-3.5 px-4">Contacto / Barrio</th>
                <th className="py-3.5 px-4">Logística Día D</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <Users size={32} className="mx-auto mb-2 text-slate-600" />
                    No se encontraron electores para los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredVoters.map((voter) => {
                  return (
                    <tr 
                      key={voter.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        voter.hasVoted ? 'bg-emerald-950/10' : ''
                      }`}
                    >
                      {/* Checkbox de Voto Instantáneo */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleVote(voter.id)}
                          disabled={isPending}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            voter.hasVoted
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 hover:text-amber-400 hover:border-amber-400 border border-slate-700'
                          }`}
                          title={voter.hasVoted ? 'Marcar como pendiente' : 'Registrar voto efectuado'}
                        >
                          {voter.hasVoted ? <CheckCircle2 size={18} className="stroke-[3]" /> : <Circle size={18} />}
                        </button>
                      </td>

                      {/* Nombre y Cédula */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">{voter.fullName}</div>
                        <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
                          <span>{voter.cedula}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-600" />
                          <span className="text-amber-400 font-sans font-semibold text-[10px] uppercase">
                            {voter.commitmentLevel}
                          </span>
                        </div>
                      </td>

                      {/* Parroquia y Recinto */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{voter.parish}</div>
                        <div className="text-slate-400 text-[11px] truncate max-w-[200px]" title={voter.recinto?.name || ''}>
                          {voter.recinto?.name || 'Recinto Central'}
                        </div>
                      </td>

                      {/* JRV # */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-mono font-bold text-xs">
                          Mesa {voter.juntaNumber || 1}
                        </span>
                        {voter.gender && (
                          <span className="text-[10px] text-slate-500 block mt-0.5">{voter.gender}</span>
                        )}
                      </td>

                      {/* Contacto y Barrio */}
                      <td className="py-3 px-4">
                        {voter.phone ? (
                          <a 
                            href={`https://wa.me/593${voter.phone.replace(/^0/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <Phone size={11} /> {voter.phone}
                          </a>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Sin teléfono</span>
                        )}
                        {voter.neighborhood && (
                          <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                            <MapPin size={10} className="text-slate-500" />
                            <span className="truncate max-w-[150px]">{voter.neighborhood}</span>
                          </div>
                        )}
                      </td>

                      {/* Estado y Movilización */}
                      <td className="py-3 px-4">
                        {voter.hasVoted ? (
                          <div className="flex items-center gap-1 text-emerald-400 font-bold">
                            <CheckCircle2 size={13} />
                            <span>VOTÓ</span>
                            {voter.votedAt && (
                              <span className="text-[10px] text-slate-400 font-mono ml-1">
                                {new Date(voter.votedAt).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        ) : voter.needsTransport ? (
                          <div className="text-[11px] text-blue-300 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 space-y-0.5">
                            <div className="flex items-center gap-1 font-bold text-blue-400">
                              <Car size={11} /> REQUIERE MOVILIZACIÓN
                            </div>
                            {voter.volunteerAssigned && (
                              <div className="text-[10px] text-slate-300">Asig: {voter.volunteerAssigned}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-400/90 font-semibold text-[11px] flex items-center gap-1">
                            <Clock size={11} /> Pendiente
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteVoter(voter.id, voter.fullName)}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                          title="Eliminar elector del padrón"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRAR ELECTOR */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Plus size={18} className="text-red-400" />
                Registrar Elector en Padrón de Campaña
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateVoter} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Cédula de Identidad *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="1500xxxxxx"
                    value={newVoter.cedula}
                    onChange={(e) => setNewVoter({ ...newVoter, cedula: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Teléfono WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="099xxxxxxx"
                    value={newVoter.phone || ''}
                    onChange={(e) => setNewVoter({ ...newVoter, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombres y Apellidos Completos *</label>
                <input
                  type="text"
                  required
                  placeholder="Apellidos y Nombres"
                  value={newVoter.fullName}
                  onChange={(e) => setNewVoter({ ...newVoter, fullName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Parroquia *</label>
                  <select
                    value={newVoter.parish}
                    onChange={(e) => setNewVoter({ ...newVoter, parish: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    {parishes.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Junta Receptora del Voto (JRV)</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={newVoter.juntaNumber || 1}
                    onChange={(e) => setNewVoter({ ...newVoter, juntaNumber: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Barrio o Comunidad</label>
                  <input
                    type="text"
                    placeholder="Ej: Baeza Colonial, Salahonda"
                    value={newVoter.neighborhood || ''}
                    onChange={(e) => setNewVoter({ ...newVoter, neighborhood: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nivel de Compromiso</label>
                  <select
                    value={newVoter.commitmentLevel}
                    onChange={(e) => setNewVoter({ ...newVoter, commitmentLevel: e.target.value as CommitmentLevel })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value={CommitmentLevel.SEGURO}>Voto Seguro (Militante / Afín)</option>
                    <option value={CommitmentLevel.PROBABLE}>Probable (Favorable)</option>
                    <option value={CommitmentLevel.INDECISO}>Indeciso (Por convencer)</option>
                    <option value={CommitmentLevel.RIVAL}>Opositor / Rival</option>
                  </select>
                </div>
              </div>

              {/* Movilización Día D */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
                  <input
                    type="checkbox"
                    checked={newVoter.needsTransport || false}
                    onChange={(e) => setNewVoter({ ...newVoter, needsTransport: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-500 bg-slate-900 border-slate-700"
                  />
                  <span>Requiere transporte / vehículo el Día D</span>
                </label>

                {newVoter.needsTransport && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 animate-fade-in">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Dirección para Recoger</label>
                      <input
                        type="text"
                        placeholder="Finca, casa o referencia"
                        value={newVoter.transportAddress || ''}
                        onChange={(e) => setNewVoter({ ...newVoter, transportAddress: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Chofer o Móvil Asignado</label>
                      <input
                        type="text"
                        placeholder="Ej: Camioneta 04 / Don Tito"
                        value={newVoter.volunteerAssigned || ''}
                        onChange={(e) => setNewVoter({ ...newVoter, volunteerAssigned: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-slate-950 font-black bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 rounded-xl text-xs shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {isPending ? 'Guardando...' : 'Registrar en Padrón'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
