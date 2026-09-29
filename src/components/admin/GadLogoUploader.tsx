'use client';

import React, { useState } from 'react';
import ImageUploadDropzone from '@/components/ui/ImageUploadDropzone';

interface GadLogoUploaderProps {
  initialLogoUrl?: string | null;
}

export default function GadLogoUploader({ initialLogoUrl = '' }: GadLogoUploaderProps) {
  const [logoUrl, setLogoUrl] = useState<string>(initialLogoUrl || '');

  return (
    <ImageUploadDropzone
      name="logoUrl"
      label="Escudo o Logotipo Oficial del GAD Municipal"
      helperText="Se mostrará como emblema oficial en el portal ciudadano cuando el sistema opere en modo municipal formal."
      value={logoUrl}
      onChange={(url) => setLogoUrl(url)}
      category="institucional"
      aspectRatio="square"
    />
  );
}
