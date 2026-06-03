"use client";

import React, { useState } from 'react';
import { MapPin, CheckCircle, Camera, X, User } from 'lucide-react';
import { createReport } from '@/lib/actions/reports';

const CATEGORIAS = [
  { id: 'INFRASTRUCTURE', label: 'Infraestructura y Vialidad' },
  { id: 'SECURITY', label: 'Seguridad Ciudadana' },
  { id: 'WATER', label: 'Agua y Saneamiento' },
  { id: 'SERVICES', label: 'Servicios Públicos' },
  { id: 'ENVIRONMENT', label: 'Medio Ambiente y Parques' },
  { id: 'EDUCATION', label: 'Educación y Cultura' },
  { id: 'OTHER', label: 'Otros' },
];

// Comprimir imagen en el cliente
const comprimirImagen = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    };
  });
};

export default function ReportForm({ parroquias }: { parroquias: string[] }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'INFRASTRUCTURE',
    parish: parroquias[0] || '',
    neighborhood: '',
    description: '',
    urgency: 'MEDIUM',
    citizenName: '',
    citizenContact: '',
    privacyAccepted: false,
    photos: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setIsCompressing(true);
    try {
      const compressedImages = await Promise.all(files.map(file => comprimirImagen(file)));
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...compressedImages] }));
    } catch (error) {
      console.error("Error al comprimir las imágenes", error);
    } finally {
      setIsCompressing(false);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await createReport({
        ...formData,
        category: formData.category as any,
        urgency: formData.urgency as any
      });

      if (response.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setFormData(prev => ({ ...prev, title: '', neighborhood: '', description: '', citizenName: '', citizenContact: '', photos: [], privacyAccepted: false }));
        }, 3000);
      }
    } catch (error) {
      console.error("Error al enviar el reporte", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">¡Reporte Enviado con Éxito!</h3>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Gracias por contribuir al desarrollo. Tu reporte ha sido registrado de forma segura.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="bg-emerald-600 dark:bg-emerald-800 p-6 text-white">
        <h2 className="text-2xl font-bold">Reportar una Necesidad</h2>
        <p className="mt-2 text-emerald-100">Ayúdanos a identificar las prioridades de tu sector.</p>
      </div>

      <div className="p-6 space-y-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
            <MapPin className="text-emerald-600 dark:text-emerald-400" size={20} />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">1. Detalles del Problema</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título corto de la necesidad <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría <span className="text-red-500">*</span></label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
              >
                {CATEGORIAS.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nivel de Urgencia <span className="text-red-500">*</span></label>
              <select 
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
              >
                <option value="LOW">Baja (Para planificación futura)</option>
                <option value="MEDIUM">Media (Necesidad importante)</option>
                <option value="HIGH">Alta (Problema urgente/Riesgo)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parroquia <span className="text-red-500">*</span></label>
              <select 
                name="parish"
                value={formData.parish}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
              >
                {parroquias.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Barrio / Sector <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="neighborhood"
                required
                value={formData.neighborhood}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción detallada <span className="text-red-500">*</span></label>
            <textarea 
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Evidencia Fotográfica (Opcional)</label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors ${isCompressing ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'}`}>
              <div className="space-y-4 text-center w-full">
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.photos.map((photoBase64, idx) => (
                      <div key={idx} className="relative inline-block w-full pt-[100%]">
                        <img src={photoBase64} alt={`Evidencia ${idx + 1}`} className="absolute top-0 left-0 w-full h-full object-cover rounded-lg shadow-sm border border-gray-200 dark:border-gray-600" />
                        <button 
                          type="button" 
                          onClick={() => removePhoto(idx)} 
                          className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-full p-1 shadow-md transition-colors z-10"
                        >
                          <X size={14}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {formData.photos.length < 5 ? (
                  <>
                    <Camera className={`mx-auto h-12 w-12 ${isCompressing ? 'text-emerald-500 animate-pulse' : 'text-gray-400'}`} />
                    <div className="flex text-sm text-gray-600 dark:text-gray-300 justify-center mt-4">
                      <label className={`relative cursor-pointer rounded-md font-medium focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-500 ${isCompressing ? 'text-emerald-500' : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-500'}`}>
                        <span>{isCompressing ? 'Procesando...' : (formData.photos.length > 0 ? 'Adjuntar otra foto' : 'Adjuntar fotos (Max 5)')}</span>
                        <input name="file-upload" type="file" multiple className="sr-only" accept="image/*" onChange={handleImageUpload} disabled={isCompressing} />
                      </label>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Has alcanzado el límite de 5 fotos.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 space-y-4">
          <div className="flex items-start gap-3">
            <User className="text-gray-500 dark:text-gray-400 mt-1" size={20} />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">2. Datos de Contacto (Opcionales)</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Puedes enviar este reporte de forma anónima.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
              <input 
                type="text" 
                name="citizenName"
                value={formData.citizenName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contacto (Tel/Email)</label>
              <input 
                type="text" 
                name="citizenContact"
                value={formData.citizenContact}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {(formData.citizenName || formData.citizenContact) && (
            <div className="flex items-start gap-2 mt-4 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
              <input 
                type="checkbox" 
                name="privacyAccepted"
                required
                checked={formData.privacyAccepted}
                onChange={handleInputChange}
                className="mt-1 text-emerald-600 focus:ring-emerald-500 rounded"
              />
              <label className="text-xs text-blue-800 dark:text-blue-300">
                Autorizo el uso de mis datos de contacto exclusivamente para actualizaciones sobre este reporte.
              </label>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full py-4 px-4 rounded-xl text-white font-bold text-lg flex justify-center items-center shadow-md transition-all ${isSubmitting ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5'}`}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Reporte Ciudadano'}
        </button>
      </div>
    </form>
  );
}
