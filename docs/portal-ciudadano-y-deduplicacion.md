# Rediseño del Portal Ciudadano & Motor de Deduplicación y Moderación

## 1. Visión y Justificación del Rediseño

El portal de cara al ciudadano representa el punto de contacto más sensible del sistema. Un diseño rígido o saturado disminuye la confianza vecinal e incrementa la tasa de abandono.

Por otro lado, a nivel operativo municipal y territorial, **la falta de filtros y de agrupación de duplicados produce una distorsión grave**: si 20 vecinos de un mismo barrio reportan la misma fuga de agua o bache, publicar 20 reportes aislados satura el mapa cartográfico, divide las órdenes de trabajo y distorsiona las estadísticas cantonales.

La plataforma implementa dos soluciones complementarias de nivel SaaS:
1. **Rediseño Integral de la Experiencia Ciudadana ([`CitizenPortalView`](file:///Users/admin/Documents/proyectos/plataforma/src/components/portal/CitizenPortalView.tsx)):** Una interfaz moderna, cálida, responsiva y segmentada por pestañas interactivas.
2. **Motor Administrativo de Deduplicación y Moderación ([`ReportModerationModal`](file:///Users/admin/Documents/proyectos/plataforma/src/components/admin/ReportModerationModal.tsx) & [`moderation.ts`](file:///Users/admin/Documents/proyectos/plataforma/src/lib/actions/moderation.ts)):** Capacidad de filtrar la visibilidad pública y fusionar reportes repetidos en un solo caso principal con contador de respaldo comunitario.

---

## 2. Nueva Experiencia del Portal Ciudadano

### A. Hero Dinámico con Indicadores de Transparencia
* Mensaje institucional y territorial adaptado automáticamente según el estado del cantón (Modo GAD Municipal vs. Modo Campaña Electoral).
* 4 tarjetas métricas en tiempo real:
  - **Total de Reportes Registrados**
  - **Casos y Obras Solucionadas**
  - **Requerimientos en Proceso de Atención**
  - **Vecinos Apoyando Iniciativas Comunitarias**

### B. Segmentación por Pestañas Intuitivas
1. **Muro Comunitario (Feed Interactivo):**
   - Buscador universal por palabras clave, barrio o código de ticket.
   - Selector dinámico de las 6 Parroquias de Quijos (`Baeza`, `Cosanga`, `Cuyuja`, `Papallacta`, `San Francisco de Borja`, `Sumaco`).
   - Filtros de estado (`Todos`, `Solucionados`, `En Proceso`).
   - Chips rápidos de categorías visuales (`Vialidad`, `Agua`, `Servicios`, `Seguridad`, `Ambiente`).
   - Visualización de evidencia **"Antes vs Después"** en reportes resueltos.
   - Botón interactivo de apoyo ciudadano: **"+1 Me afecta a mí también"** (registro anónimo local).
2. **Reportar una Necesidad:**
   - Formulario espacioso con categorías asistidas, selector de sectores oficiales y compresión de fotos.
   - **Blindaje Offline-First:** Si el vecino está en zona sin cobertura celular, el reporte se guarda en su teléfono y se sincroniza al recuperar señal.
3. **Consultar mi Ticket:**
   - Trazabilidad paso a paso del trámite con barra de progreso (Recibido -> En Revisión -> En Proceso -> Solución Entregada).
4. **Mapa Territorial de Parroquias:**
   - Tarjetas interactivas por cada parroquia con balance de soluciones vs pendientes, y enlace al visor geoespacial vectorial.

---

## 3. Motor de Deduplicación y Moderación Administrativa

### A. Estados de Moderación (`ModerationStatus`)
* `PENDING`: Recibido de la ciudadanía, en cola de revisión previa.
* `APPROVED`: Aprobado técnicamente y visible en el portal público y en el mapa.
* `MERGED`: Fusionado como duplicado de un Caso Principal (no se dibuja en el mapa para no saturar, pero aporta su peso y votos al caso madre).
* `DISCARDED`: Descartado formalmente (spam, improcedente o fuera de competencia municipal, ej. Troncal Nacional E45 competencia del MTOP).

### B. Reglas de Fusión y Agrupación (Merge & Clustering)
1. **Detección Automática de Similares:**
   - Cuando un administrador abre el modal de moderación de un reporte, la función `findSimilarReports()` busca automáticamente otros reportes en el mismo cantón con la **misma Parroquia, mismo Barrio o misma Categoría**.
2. **Acción de Fusión (`mergeReport`):**
   - El administrador vincula el reporte secundario al *Caso Principal*.
   - El reporte secundario se marca como `MERGED`.
   - El reporte principal incrementa su contador `duplicateCount` (+1) y su contador `supportCount` (+vecinos que reportaron).
3. **Visualización Pública Consolidada:**
   - En el mapa público y en el muro ciudadano solo se dibuja **1 solo punto**, evitando la saturación de 20 pines superpuestos.
   - La tarjeta destaca:  
     > 🔥 **Alta Prioridad: Respaldado por 20 vecinos de este barrio** (1 reporte principal + 19 reportes agrupados).
4. **Reversibilidad (`unmergeReport`):**
   - En cualquier momento el administrador puede desvincular un reporte si se determina que era un problema diferente, restaurándolo a su estado independiente.

---

## 4. Trazabilidad y Cumplimiento Técnico

* **Base de Datos:** MySQL / MariaDB mediante Prisma ORM (sin PostgreSQL, en estricto cumplimiento de `AGENTS.md`).
* **Relación Jerárquica:** Auto-relación relacional `parentReportId` con índice dedicado en `schema.prisma`.
* **Auditoría:** Todo cambio de moderación y fusión queda registrado con marca de tiempo y usuario en `/storage/logs/`.
* **Pruebas de Compilación:** `npm run build` ejecutado y aprobado con generación exitosa del bundle de producción y del Service Worker Serwist 9.5.
