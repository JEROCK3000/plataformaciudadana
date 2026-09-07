"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { toggleVoteReport } from '@/lib/actions/reports';

type Props = {
  reportId: string;
  initialVotes: number;
  compact?: boolean;
};

export default function SupportButton({ reportId, initialVotes, compact = false }: Props) {
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showCedulaModal, setShowCedulaModal] = useState(false);
  const [cedulaInput, setCedulaInput] = useState('');
  const [cedulaError, setCedulaError] = useState<string | null>(null);

  // Cargar estado de apoyo desde localStorage para respuesta instantánea
  useEffect(() => {
    try {
      const stored = localStorage.getItem('citizen_voted_reports');
      if (stored) {
        const list: string[] = JSON.parse(stored);
        if (Array.isArray(list) && list.includes(reportId)) {
          setHasVoted(true);
        }
      }
    } catch (e) {
      // Ignorar errores de localStorage
    }
  }, [reportId]);

  // Actualizar localStorage
  const updateLocalVoteState = (voted: boolean) => {
    try {
      const stored = localStorage.getItem('citizen_voted_reports');
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];

      if (voted) {
        if (!list.includes(reportId)) list.push(reportId);
      } else {
        list = list.filter(id => id !== reportId);
      }
      localStorage.setItem('citizen_voted_reports', JSON.stringify(list));
    } catch (e) {
      // Ignorar errores
    }
  };

  const handleToggle = async (cedulaValue?: string) => {
    if (isPending) return;

    // Actualización optimista inmediata en UI
    const nextVoted = !hasVoted;
    const nextCount = nextVoted ? votes + 1 : Math.max(0, votes - 1);

    setHasVoted(nextVoted);
    setVotes(nextCount);
    updateLocalVoteState(nextVoted);
    setIsPending(true);

    try {
      const res = await toggleVoteReport(reportId, cedulaValue);

      if (res.requireCedula) {
        // El municipio exige cédula: revertir optimismo y abrir modal
        setHasVoted(false);
        setVotes(votes);
        updateLocalVoteState(false);
        setShowCedulaModal(true);
        if (res.error) setCedulaError(res.error);
        return;
      }

      if (!res.success) {
        // Revertir ante error
        setHasVoted(!nextVoted);
        setVotes(votes);
        updateLocalVoteState(!nextVoted);
        if (res.error) {
          alert(res.error);
        }
        return;
      }

      // Sincronizar estado final confirmado por el servidor
      if (typeof res.votes === 'number' && typeof res.voted === 'boolean') {
        setVotes(res.votes);
        setHasVoted(res.voted);
        updateLocalVoteState(res.voted);
      }
      if (showCedulaModal) {
        setShowCedulaModal(false);
        setCedulaInput('');
        setCedulaError(null);
      }
    } catch (error) {
      console.error("Error al procesar apoyo:", error);
      setHasVoted(!nextVoted);
      setVotes(votes);
      updateLocalVoteState(!nextVoted);
    } finally {
      setIsPending(false);
    }
  };

  const handleCedulaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedulaInput.trim() || cedulaInput.trim().length !== 10) {
      setCedulaError('Ingresa los 10 dígitos de tu cédula.');
      return;
    }
    setCedulaError(null);
    handleToggle(cedulaInput.trim());
  };

  return (
    <>
      <button
        type="button"
        onClick={() => handleToggle()}
        disabled={isPending}
        title={hasVoted ? 'Haz clic para retirar tu apoyo' : 'Haz clic para apoyar esta necesidad vecinal'}
        className={`relative z-20 flex items-center gap-2 rounded-lg transition-all duration-200 font-semibold shadow-sm select-none ${
          compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
        } ${
          hasVoted
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 shadow-emerald-700/20'
            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <CheckCircle2
          size={compact ? 15 : 17}
          className={`${hasVoted ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} transition-transform active:scale-125`}
        />
        <span>
          {hasVoted ? `✓ Apoyado (${votes})` : `Apoyar iniciativa (${votes})`}
        </span>
      </button>

      {/* Modal de Validación de Cédula (Solo si el GAD tiene activada la regla) */}
      {showCedulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={22} />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">Validación Ciudadana</h3>
              </div>
              <button
                onClick={() => {
                  setShowCedulaModal(false);
                  setCedulaError(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Este GAD Municipal requiere validar el número de cédula ecuatoriana para garantizar que cada vecino registre un único apoyo formal (1 cédula = 1 voto).
            </p>

            <form onSubmit={handleCedulaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Número de Cédula (10 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  placeholder="Ej: 1712345678"
                  value={cedulaInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setCedulaInput(val);
                    if (cedulaError) setCedulaError(null);
                  }}
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none tracking-widest"
                />
                {cedulaError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{cedulaError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCedulaModal(false);
                    setCedulaError(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || cedulaInput.length !== 10}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Validando...' : 'Confirmar Apoyo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
