"use client";

import React, { useState } from 'react';
import { createComment } from '@/lib/actions/comments';
import { MessageSquare, Send, User, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Comment = {
  id: string;
  text: string;
  citizenName: string | null;
  createdAt: Date;
};

export default function CommentsSection({ reportId, initialComments }: { reportId: string, initialComments: Comment[] }) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await createComment(reportId, name, text);
    
    if (result.success) {
      setText('');
      // router.refresh() will re-fetch Server Components and update initialComments
      router.refresh(); 
    } else {
      setError(result.error || "Error al enviar el comentario.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <MessageSquare size={20} className="text-emerald-500" /> 
          Comentarios Ciudadanos ({initialComments.length})
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Lista de comentarios */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {initialComments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Aún no hay comentarios. ¡Sé el primero en opinar!</p>
          ) : (
            initialComments.map(comment => (
              <div key={comment.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{comment.citizenName || 'Anónimo'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(comment.createdAt).toLocaleDateString('es-EC')}</div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Deja tu comentario</h4>
          
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Tu nombre (opcional)" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
            />
            
            <textarea 
              required
              rows={3}
              placeholder="Escribe tu opinión respetuosa aquí..." 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none resize-none"
            ></textarea>
            
            {error && (
              <div className="flex items-start gap-2 text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded">
                <AlertCircle size={14} className="mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting || !text.trim()}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Publicar Comentario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
