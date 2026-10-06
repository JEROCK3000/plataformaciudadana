# Terminología Ciudadana Configurable y Tratamiento de Género

## Propósito
Este módulo permite al equipo de campaña o a la administración institucional del GAD Municipal definir con exactitud el tratamiento, vocabulario y tono con el que la plataforma, el candidato y el sistema se refieren a los habitantes de las parroquias y comunidades.

Se eliminó la dependencia fija de la palabra "vecino/vecina", otorgando total libertad al usuario para adaptar el lenguaje a la identidad política de la candidatura o al tono republicano del municipio.

---

## 1. Presets y Personalización Disponible

Desde el panel de **Configuración** (`/admin/settings`), el administrador dispone de un selector visual interactivo con 4 perfiles predeterminados más una opción 100% personalizada:

1. **Ciudadano / Ciudadana / Ciudadanos** (*Recomendado por defecto*)
   - Tono: Institucional, republicano y formal.
   - Ideal para: Gestión pública del GAD Municipal y candidaturas serias de alto perfil.
2. **Amigo / Amiga / Amigos**
   - Tono: Cercano, empático y fraterno.
   - Ideal para: Campañas electorales de contacto directo y líderes carismáticos.
3. **Vecino / Vecina / Vecinos**
   - Tono: Comunitario y barrial tradicional.
   - Ideal para: Comités de barrio y asambleas comunitarias.
4. **Compañero / Compañera / Compañeros**
   - Tono: Militante y doctrinario.
   - Ideal para: Movimientos políticos y frentes sociales organizados.
5. **Personalizado**
   - Permite ingresar manualmente:
     - **Singular Masculino** (ej: *Hermano*, *Habitante*)
     - **Singular Femenino** (ej: *Hermana*, *Habitante*)
     - **Plural Colectivo** (ej: *Hermanos*, *Pueblo*, *Habitantes*)

---

## 2. Impacto Dinámico en Todos los Módulos del Sistema

Al actualizar la terminología en Configuración, los siguientes módulos se adaptan en tiempo real:

### A. Ficha Ejecutiva de Tarima (PDF Vectorial)
- **Apertura de Discurso:** `"¡[Plural] de [Parroquia]! Yo no vengo a esta tarima a adivinar..."`
- **Mención Testimonial:** `"Como nos reportó el/la [Singular] [Nombre] en el sector de [Barrio]..."`
- **Encabezado de Sección:** `B. MENCIÓN DE CASOS REALES Y [PLURAL EN MAYÚSCULAS]`
- **Tabla Ejecutiva:** Columna renombrada a `[Singular] / Contacto`.

### B. War Room (Cuartel de Inteligencia Territorial)
- **KPI Card:** `[Plural] con Contacto` (ej: *Ciudadanos con Contacto*, *Amigos con Contacto*).
- **Argumentario para la Tarima:** Discurso adaptado dinámicamente con la terminología elegida.
- **Directorio Territorial:** `Directorio de [Plural] & Contactos`.
- **Mensaje de WhatsApp 1-a-1:** `"Hola [Nombre], te saludamos de parte del equipo... Vimos tu reporte como [Singular] comprometido..."`

### C. Portal Público y Formulario de Levantamiento Ciudadano
- **Campo de Identificación:** `"Nombre del [Singular](a)"` (ej: *Nombre del Ciudadano(a)*, *Nombre del Amigo(a)*).

---

## 3. Modelo de Datos (Prisma / MariaDB)

Campos agregados en el modelo `Tenant`:

```prisma
model Tenant {
  // ...
  citizenTermSingularM  String   @default("Ciudadano")
  citizenTermSingularF  String   @default("Ciudadana")
  citizenTermPlural     String   @default("Ciudadanos")
  // ...
}
```

---

## 4. Auditoría y Logs
Cada actualización en la configuración de terminología queda registrada en `/storage/logs` con nivel `AUDIT`.
