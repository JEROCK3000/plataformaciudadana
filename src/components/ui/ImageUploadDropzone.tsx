'use client';

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  RefreshCw, 
  Check, 
  AlertCircle,
  FileCheck,
  Link as LinkIcon
} from 'lucide-react';

interface ImageUploadDropzoneProps {
  name: string;
  label: string;
  helperText?: string;
  value: string;
  onChange: (url: string) => void;
  category?: 'candidato' | 'partido' | 'institucional';
  aspectRatio?: 'square' | 'circle';
}

export default function ImageUploadDropzone({
  name,
  label,
  helperText,
  value,
  onChange,
  category = 'candidato',
  aspectRatio = 'square',
}: ImageUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setImgError(false);
  }, [value]);

  // Procesar archivo seleccionado o arrastrado
  const processFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('La imagen supera el límite máximo permitido de 5 MB.');
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al subir la imagen');
      }

      onChange(data.url);
    } catch (err: unknown) {
      console.error('Error al subir imagen:', err);
      // Fallback a Base64 local si falla la red
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Hidden input para el Server Action del formulario */}
      <input type="hidden" name={name} value={value} />

      {/* Input de archivo real oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          {label}
        </label>
        
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 underline underline-offset-2"
        >
          <LinkIcon size={12} />
          {showUrlInput ? 'Ocultar URL' : 'O pegar URL directa'}
        </button>
      </div>

      {/* Input de URL opcional/manual si el usuario lo desea */}
      {showUrlInput && (
        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400">Pegar URL directa de imagen:</span>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://servidor.com/mi-foto.png"
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      )}

      {/* Dropzone interactiva con Drag and Drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative group rounded-2xl border-2 border-dashed p-4 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center ${
          isDragging
            ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/20 scale-[1.01]'
            : value
              ? 'border-slate-700 bg-slate-950/80 hover:border-slate-600'
              : 'border-slate-700/80 bg-slate-900/60 hover:bg-slate-900 hover:border-amber-500/50'
        }`}
      >
        {isUploading ? (
          <div className="py-6 flex flex-col items-center gap-2">
            <RefreshCw size={28} className="text-amber-400 animate-spin" />
            <span className="text-xs font-semibold text-slate-200">Subiendo imagen al servidor...</span>
            <span className="text-[10px] text-slate-400">Guardando archivo en el sistema</span>
          </div>
        ) : value ? (
          /* Vista con imagen cargada */
          <div className="w-full flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-3.5">
              <div 
                className={`overflow-hidden shrink-0 border-2 border-amber-400/80 shadow-md flex items-center justify-center ${
                  aspectRatio === 'circle' ? 'w-14 h-14 rounded-full bg-slate-800' : 'w-14 h-14 rounded-xl bg-slate-900 p-1'
                }`}
              >
                {!imgError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={value} 
                    alt="" 
                    className={`w-full h-full ${aspectRatio === 'circle' ? 'object-cover' : 'object-contain'}`} 
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-amber-400">
                    <ImageIcon size={22} />
                  </div>
                )}
              </div>

              <div className="text-left space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <FileCheck size={14} /> Archivo cargado correctamente
                </div>
                <p className="text-[11px] text-slate-300 font-mono truncate max-w-[200px] sm:max-w-xs">
                  {value.startsWith('data:') ? 'Imagen local (Base64)' : value}
                </p>
                <p className="text-[10px] text-slate-400">
                  Haz clic aquí o arrastra otro archivo para reemplazar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
                title="Eliminar imagen"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ) : (
          /* Vista vacía esperando archivo */
          <div className="py-4 flex flex-col items-center gap-2">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <UploadCloud size={26} />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-200">
                <span className="text-amber-400">Arrastra y suelta tu archivo aquí</span> o haz clic para examinar
              </p>
              <p className="text-[11px] text-slate-400">
                Admite PNG, JPG, WEBP o SVG (máx. 5 MB)
              </p>
            </div>

            <button
              type="button"
              className="mt-1 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ImageIcon size={14} className="text-amber-400" /> Examinar archivos...
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {helperText && (
        <p className="text-[10px] text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
