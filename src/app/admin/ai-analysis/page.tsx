"use client";

import React, { useState } from 'react';
import { generateActionPlan } from '@/lib/actions/ai';
import { BrainCircuit, Loader2, ArrowLeft, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

export default function AIAnalysisPage() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await generateActionPlan();
      if (response.success && response.content) {
        setAnalysis(response.content);
      } else {
        setError(response.error || "Ocurrió un error desconocido.");
      }
    } catch (e) {
      setError("Error de red al intentar comunicarse con el servidor.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans">
      <header className="bg-gray-900 dark:bg-black text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <BrainCircuit size={24} className="text-purple-400" />
              <h1 className="text-xl font-bold">Inteligencia Artificial Gubernamental</h1>
            </div>
            <Link href="/admin" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
              <ArrowLeft size={16} /> Volver al Panel
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lluvia de Ideas Estratégica</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-6">
            Usa el poder de la Inteligencia Artificial para leer todos los reportes ciudadanos no resueltos y proponer un plan de acción ejecutivo priorizado.
          </p>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`px-6 py-3 rounded-xl text-white font-bold shadow-md transition-all flex items-center justify-center mx-auto gap-2
              ${isGenerating ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'}`}
          >
            {isGenerating ? (
              <><Loader2 className="animate-spin" size={20} /> Analizando Datos Ciudadanos...</>
            ) : (
              <><BrainCircuit size={20} /> Generar Plan de Gobierno</>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
            <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
            {error.includes('GEMINI_API_KEY') && (
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">Asegúrate de agregar `GEMINI_API_KEY=tu_clave_aqui` en el archivo `.env` del proyecto.</p>
            )}
          </div>
        )}

        {analysis && !isGenerating && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-purple-100 dark:border-purple-900 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BrainCircuit size={20} /> Resultado del Análisis Estratégico
              </h3>
            </div>
            <div className="p-8 prose prose-emerald dark:prose-invert max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
