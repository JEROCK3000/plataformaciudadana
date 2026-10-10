'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Footprints, 
  Car, 
  Megaphone, 
  Home, 
  HeartHandshake, 
  FileText, 
  Trash2, 
  Sparkles,
  Phone,
  Package,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';
import { 
  createCampaignActivityAction, 
  updateCampaignActivityStatusAction, 
  deleteCampaignActivityAction,
  CreateActivityInput
} from '@/lib/actions/campaign-activity';
import { ActivityType, ActivityStatus, Category } from '@prisma/client';

interface TerritorialAgendaProps {
  initialActivities: any[];
  topReportsByParish: any[];
  candidateName?: string;
  campaignListNumber?: string;
  parishes?: string[];
}

export default function TerritorialAgenda({
  initialActivities,
  topReportsByParish,
  candidateName = 'Brandon Aliaga',
  campaignListNumber = 'PSC 6 - PK 18',
  parishes = ['Baeza', 'San Francisco de Borja', 'Papallacta', 'Cuyuja', 'Cosanga', 'Sumaco'],
}: TerritorialAgendaProps) {
  const [activities, setActivities] = useState(initialActivities);
  const [selectedParish, setSelectedParish] = useState<string>('TODAS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  // Formulario nueva actividad
  const [formData, setFormData] = useState<CreateActivityInput>({
    title: '',
    type: ActivityType.CAMINATA,
    parish: 'Baeza',
    sector: '',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    status: ActivityStatus.PLANIFICADA,
    responsibleName: '',
    responsiblePhone: '',
    meetingPoint: '',
    estimatedAttendees: 50,
    logisticsNotes: '',
    speechFocus: '',
  });

  // Filtrado de actividades
  const filteredActivities = activities.filter(act => {
    if (selectedParish !== 'TODAS' && act.parish !== selectedParish) return false;
    if (selectedStatus !== 'TODOS' && act.status !== selectedStatus) return false;
    return true;
  });

  // Parroquias cubiertas
  const parishesCovered = new Set(activities.map(a => a.parish));

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.CAMINATA:
        return <Footprints size={15} className="text-amber-400" />;
      case ActivityType.CARAVANA:
        return <Car size={15} className="text-blue-400" />;
      case ActivityType.MITIN:
        return <Megaphone size={15} className="text-red-400" />;
      case ActivityType.PUERTA_A_PUERTA:
        return <Home size={15} className="text-emerald-400" />;
      default:
        return <Users size={15} className="text-purple-400" />;
    }
  };

  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case ActivityStatus.CONFIRMADA:
        return <span className="px-2 py-0.5 rounded text-[11px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40">CONFIRMADA</span>;
      case ActivityStatus.EN_CURSO:
        return <span className="px-2 py-0.5 rounded text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">EN CURSO</span>;
      case ActivityStatus.COMPLETADA:
        return <span className="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">COMPLETADA</span>;
      case ActivityStatus.CANCELADA:
        return <span className="px-2 py-0.5 rounded text-[11px] font-black bg-red-500/20 text-red-300 border border-red-500/40">CANCELADA</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-black bg-slate-800 text-slate-300 border border-slate-700">PLANIFICADA</span>;
    }
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      setMessage(null);
      const res = await createCampaignActivityAction(formData);
      if (res.success && res.activity) {
        setActivities(prev => [...prev, res.activity].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setShowModal(false);
        setMessage('Actividad creada exitosamente.');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(`Error: ${res.error}`);
      }
    });
  };

  const handleStatusChange = (id: string, newStatus: ActivityStatus) => {
    startTransition(async () => {
      const res = await updateCampaignActivityStatusAction(id, newStatus);
      if (res.success) {
        setActivities(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta actividad?')) return;
    startTransition(async () => {
      const res = await deleteCampaignActivityAction(id);
      if (res.success) {
        setActivities(prev => prev.filter(a => a.id !== id));
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
              <Calendar size={13} />
              Despliegue Territorial de Campaña
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
              Quijos • 6 Parroquias
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Agenda Táctica de Territorio y Caminatas
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Planifica recorridos, brigadas y mítines conectando el discurso de tarima de <strong className="text-amber-400">{candidateName}</strong> directamente con los reportes ciudadanos de cada barrio.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          type="button"
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 rounded-xl transition-all shadow-lg shadow-red-500/20"
        >
          <Plus size={16} />
          + Nueva Actividad Territorial
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      {/* MÉTRICAS DE COBERTURA TERRITORIAL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Actividades</span>
          <div className="text-2xl font-black text-white mt-1 font-mono">{activities.length}</div>
          <span className="text-[11px] text-slate-400">En cronograma oficial</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Cobertura Parroquial</span>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">{parishesCovered.size} / 6</div>
          <span className="text-[11px] text-slate-400">Parroquias con presencia</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Contactos Estimados</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
            {activities.reduce((acc, a) => acc + (a.estimatedAttendees || 0), 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">Ciudadanos en territorio</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Estado de Campaña</span>
          <div className="text-xl font-black text-blue-400 mt-1 flex items-center gap-1.5">
            <Sparkles size={16} /> Activa
          </div>
          <span className="text-[11px] text-slate-400">Fase de penetración barrial</span>
        </div>
      </div>

      {/* FILTROS Y CONTROLES */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Parroquia:</span>
          <button
            onClick={() => setSelectedParish('TODAS')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedParish === 'TODAS' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todas ({activities.length})
          </button>
          {parishes.map(p => (
            <button
              key={p}
              onClick={() => setSelectedParish(p)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedParish === p ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p} ({activities.filter(a => a.parish === p).length})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Estado:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PLANIFICADA">Planificadas</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="EN_CURSO">En Curso</option>
            <option value="COMPLETADA">Completadas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
        </div>
      </div>

      {/* LISTADO DE ACTIVIDADES */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <Calendar size={36} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white">No hay actividades para los filtros seleccionados</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Programa una nueva caminata o reunión vecinal para movilizar al equipo territorial.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all"
          >
            + Programar Actividad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActivities.map((act) => {
            const dateObj = new Date(act.date);
            const dateStr = dateObj.toLocaleDateString('es-EC', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            });
            const timeStr = dateObj.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

            return (
              <div 
                key={act.id} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-4 transition-all"
              >
                {/* Header de Tarjeta */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                      {getActivityIcon(act.type)}
                    </span>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        {act.type} • {act.parish}
                      </span>
                      <h3 className="text-sm font-black text-white">{act.title}</h3>
                    </div>
                  </div>
                  {getStatusBadge(act.status)}
                </div>

                {/* Datos de Lugar y Horario */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock size={13} className="text-amber-400 shrink-0" />
                    <span>{dateStr} • {timeStr}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin size={13} className="text-red-400 shrink-0" />
                    <span className="truncate" title={act.sector}>{act.sector}</span>
                  </div>
                  {act.meetingPoint && (
                    <div className="col-span-2 text-slate-400 text-[11px] flex items-center gap-1.5 pt-1 border-t border-slate-900">
                      <span className="font-semibold text-slate-300">Punto de encuentro:</span> {act.meetingPoint}
                    </div>
                  )}
                </div>

                {/* Responsable e Insumos */}
                {(act.responsibleName || act.logisticsNotes) && (
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {act.responsibleName && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Responsable / Avanzada:</span>
                        <strong className="text-slate-200 flex items-center gap-1">
                          {act.responsibleName}
                          {act.responsiblePhone && (
                            <span className="text-slate-400 font-mono">({act.responsiblePhone})</span>
                          )}
                        </strong>
                      </div>
                    )}
                    {act.logisticsNotes && (
                      <div className="text-[11px] bg-slate-800/40 p-2 rounded-lg border border-slate-700/50 text-slate-300 flex items-start gap-1.5">
                        <Package size={13} className="text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>Logística:</strong> {act.logisticsNotes}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Enfoque de Discurso de Tarima (Vinculado a Reportes Ciudadanos) */}
                {act.speechFocus && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                    <div className="flex items-center gap-1 font-bold text-amber-400 text-[11px] uppercase tracking-wider">
                      <Sparkles size={12} />
                      Enfoque de Discurso y Propuesta en esta Zona
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-100/90">{act.speechFocus}</p>
                  </div>
                )}

                {/* Acciones y Cambio de Estado */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Cambiar:</span>
                    <button
                      onClick={() => handleStatusChange(act.id, ActivityStatus.CONFIRMADA)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleStatusChange(act.id, ActivityStatus.COMPLETADA)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    >
                      Completada
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(act.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    title="Eliminar actividad"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL NUEVA ACTIVIDAD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Plus size={18} className="text-amber-400" />
                Nueva Actividad Territorial de Campaña
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Título de la Actividad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Gran Caminata y Puerta a Puerta Barrio Central"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tipo de Actividad</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ActivityType })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    <option value={ActivityType.CAMINATA}>Caminata</option>
                    <option value={ActivityType.PUERTA_A_PUERTA}>Puerta a Puerta</option>
                    <option value={ActivityType.CARAVANA}>Caravana Vehicular</option>
                    <option value={ActivityType.MITIN}>Mitin / Concentración</option>
                    <option value={ActivityType.REUNION_VECINAL}>Reunión Vecinal</option>
                    <option value={ActivityType.BRIGADA_COMUNITARIA}>Brigada Comunitaria</option>
                    <option value={ActivityType.VOLANTEO_FERIA}>Volanteo en Feria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Parroquia *</label>
                  <select
                    value={formData.parish}
                    onChange={(e) => setFormData({ ...formData, parish: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  >
                    {parishes.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sector / Barrio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Baeza Colonial, Vía a Termas, etc."
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Fecha y Hora *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Punto de Encuentro</label>
                  <input
                    type="text"
                    placeholder="Ej: Parque Central, Cancha techada"
                    value={formData.meetingPoint || ''}
                    onChange={(e) => setFormData({ ...formData, meetingPoint: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Asistentes Estimados</label>
                  <input
                    type="number"
                    min="5"
                    value={formData.estimatedAttendees}
                    onChange={(e) => setFormData({ ...formData, estimatedAttendees: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Responsable / Jefe Avanzada</label>
                  <input
                    type="text"
                    placeholder="Nombre del brigadista"
                    value={formData.responsibleName || ''}
                    onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Teléfono WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="0991234567"
                    value={formData.responsiblePhone || ''}
                    onChange={(e) => setFormData({ ...formData, responsiblePhone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Insumos y Logística</label>
                <input
                  type="text"
                  placeholder="Ej: 100 banderas, trípticos con QR, megáfono, refrigerio"
                  value={formData.logisticsNotes || ''}
                  onChange={(e) => setFormData({ ...formData, logisticsNotes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Enfoque de Tarima (Propuestas para el Vecindario)</label>
                <textarea
                  rows={2}
                  placeholder="Temas que más preocupan a esta zona según reportes ciudadanos..."
                  value={formData.speechFocus || ''}
                  onChange={(e) => setFormData({ ...formData, speechFocus: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-slate-950 font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isPending ? 'Guardando...' : 'Crear Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
