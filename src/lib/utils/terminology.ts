export interface CitizenTerminology {
  singularM: string; // ej: "Ciudadano"
  singularF: string; // ej: "Ciudadana"
  plural: string;    // ej: "Ciudadanos"
}

export const TERMINOLOGY_PRESETS = [
  {
    id: 'ciudadano',
    label: 'Ciudadano / Ciudadana / Ciudadanos',
    description: 'Institucional, republicano y formal. Ideal para GADs municipales y candidaturas serias.',
    singularM: 'Ciudadano',
    singularF: 'Ciudadana',
    plural: 'Ciudadanos',
  },
  {
    id: 'amigo',
    label: 'Amigo / Amiga / Amigos',
    description: 'Cercano, fraterno y empático. Ideal para campañas políticas de contacto directo.',
    singularM: 'Amigo',
    singularF: 'Amiga',
    plural: 'Amigos',
  },
  {
    id: 'vecino',
    label: 'Vecino / Vecina / Vecinos',
    description: 'Comunitario y barrial. Tradicional para gestión urbana o comités barriales.',
    singularM: 'Vecino',
    singularF: 'Vecina',
    plural: 'Vecinos',
  },
  {
    id: 'companero',
    label: 'Compañero / Compañera / Compañeros',
    description: 'Militante y doctrinario. Usado por movimientos políticos o frentes sociales.',
    singularM: 'Compañero',
    singularF: 'Compañera',
    plural: 'Compañeros',
  },
  {
    id: 'custom',
    label: 'Personalizado',
    description: 'Define manualmente cómo quieres que la plataforma y el candidato llamen a las personas.',
    singularM: '',
    singularF: '',
    plural: '',
  },
];

export function getTenantTerminology(tenant?: {
  citizenTermSingularM?: string | null;
  citizenTermSingularF?: string | null;
  citizenTermPlural?: string | null;
} | null): CitizenTerminology {
  return {
    singularM: tenant?.citizenTermSingularM?.trim() || 'Ciudadano',
    singularF: tenant?.citizenTermSingularF?.trim() || 'Ciudadana',
    plural: tenant?.citizenTermPlural?.trim() || 'Ciudadanos',
  };
}
