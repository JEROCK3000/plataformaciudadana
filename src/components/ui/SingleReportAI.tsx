"use client";

import React, { useState } from 'react';
import { analyzeSingleReport } from '@/lib/actions/ai';
import { BrainCircuit, Loader2, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SingleReportAI({ reportId }: { reportId: string }) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await analyzeSingleReport(reportId);
      if (response.success && response.content) {
        setAnalysis(response.content);
      } else {
        setError(response.error || "Error al analizar el reporte.");
      }
    } catch (e) {
      setError("Error de comunicación.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-purple-900 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <BrainCircuit size={20} className="text-purple-500" /> 
            Análisis de Viabilidad (IA)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Analiza este reporte con la Ley de Contratación Pública y COOTAD.
          </p>
        </div>
        <button 
          onClick={handleAnalyze}
          disabled={isGenerating}
          className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all flex items-center gap-2
            ${isGenerating ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'}`}
        >
          {isGenerating ? (
            <><Loader2 className="animate-spin" size={16} /> Analizando...</>
          ) : (
            <><BookOpen size={16} /> Ejecutar Análisis</>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {analysis && !isGenerating && (
        <div className="p-6 prose prose-sm prose-emerald dark:prose-invert max-w-none bg-white dark:bg-gray-900">
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
