# Hoja de Ruta Estratégica: Evolución hacia G-CRM y ERP Municipal Integral

## 1. Visión del Producto (Post-Martes)

Transformar la **Plataforma Ciudadana SaaS** en un **Ecosistema GovTech Unificado** para Gobiernos Autónomos Descentralizados (GADs) de Ecuador.

El reporte ciudadano deja de ser una simple queja en un buzón para convertirse en el **evento disparador ("trigger")** que orquesta el trabajo de todas las direcciones municipales, articulando la atención al ciudadano con la asignación técnica de cuadrillas, el despacho de bodega municipal, la contratación pública (SERCOP) y la rendición de cuentas (COOTAD).

---

## 2. Fases de Evolución del Ecosistema

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                    FASE 1: G-CRM CIUDADANO (ACTUAL + MEJORAS)         │
 │  - Portal georreferenciado por cantón y parroquias                     │
 │  - Asesor legal con IA (COOTAD + SERCOP 2026)                          │
 │  - Trazabilidad y seguimiento ciudadano                                │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │              FASE 2: ENRUTAMIENTO Y ÓRDENES DE TRABAJO (OT)            │
 │  - Derivación automática a Direcciones (Obras Públicas, Agua, etc.)    │
 │  - Asignación de cuadrillas operativas y supervisores                  │
 │  - Registro fotográfico del "Antes" y el "Después"                     │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                 FASE 3: G-ERP OPERATIVO (BODEGA Y LOGÍSTICA)           │
 │  - Solicitud y despacho de materiales de bodega municipal              │
 │  - Control de maquinaria pesada, horas/máquina y combustible           │
 │  - Solicitud automática de compra bajo umbrales LOSNCP calculados      │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │            FASE 4: GOBERNANZA, PRESUPUESTO Y RENDICIÓN DE CUENTAS      │
 │  - Imputación a partidas presupuestarias del GAD                       │
 │  - Tableros de control y eficiencia por Dirección Departamental        │
 │  - Informe automático de Rendición de Cuentas (CPCCS / COOTAD art. 266)│
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Arquitectura Modular por Dirección Municipal

### A. Módulo G-CRM (Participación Ciudadana y Comunicación)
- **Código de seguimiento único (Ticket ID)**: El ciudadano puede consultar el estado de su reporte sin necesidad de autenticación compleja.
- **Canal de Notificaciones**: Alertas por WhatsApp / SMS / Correo cuando el reporte pasa a revisión, cuadrilla asignada y obra terminada.
- **Encuesta de Satisfacción Vecinal**: Validación ciudadana al resolverse el problema (*¿Fue atendido adecuadamente?*).

### B. Módulo de Órdenes de Trabajo (Obras Públicas y Agua Potable)
- **Derivación por Competencia**:
  - `INFRASTRUCTURE` → Dirección de Obras Públicas.
  - `WATER` → Dirección de Agua Potable y Saneamiento / Empresa Pública Municipal.
  - `SERVICES` → Dirección de Servicios Públicos y Aseo.
  - `ENVIRONMENT` → Dirección de Gestión Ambiental.
  - `SECURITY` → Dirección de Seguridad Ciudadana y Control.
- **Asignación Técnica**:
  - Supervisor responsable.
  - Cuadrilla técnica asignada.
  - Fecha estimada de intervención y fecha real de cierre.
- **Bitácora con Evidencia Obligatoria**:
  - Fotografías de verificación inicial vs. fotografías del trabajo ejecutado.
  - Acta de entrega-recepción del trabajo en barrio.

### C. Módulo de Bodega e Inventario Municipal (G-ERP)
- **Catálogo de Materiales Típicos**:
  - Tuberías PVC, válvulas, abrazaderas, asfalto frío/caliente, adoquines, luminarias, cables, señalética.
- **Despacho contra Orden de Trabajo**:
  - Ningún material sale de bodega sin el código de reporte/OT asociado.
  - Rebaja automática de stock e historial de consumo por parroquia.
- **Alerta de Reabastecimiento**:
  - Cuando el stock de asfalto o tuberías llega al mínimo, el sistema alerta al Director de Compras.

### D. Módulo de Compras Públicas (SERCOP / LOSNCP)
- **Conexión con el Asistente Legal IA**:
  - Utiliza los cálculos automatizados del SERCOP y PGE vigentes (Ínfima Cuantía, Menor Cuantía, Cotización).
  - Generación preliminar de Términos de Referencia (TDR) o Especificaciones Técnicas con IA basándose en la descripción del problema territorial.
  - Historial de contrataciones vinculadas a soluciones barriales.

### E. Módulo de Planificación y Presupuesto
- **Georreferenciación de la Inversión Pública**:
  - Mapa de calor de gasto real vs. gasto proyectado por parroquia.
  - Identificación de sectores históricamente desatendidos para el Plan de Desarrollo y Ordenamiento Territorial (PDOT).
- **Rendición de Cuentas y Control**:
  - Exportación con un clic del informe consolidado de gestión para la Contraloría General del Estado y el Consejo de Participación Ciudadana (CPCCS).

---

## 4. Plan de Implementación Técnica Post-Martes

1. **Sprint 1 (Modelado de Datos Relacional)**:
   - Nuevas entidades en Prisma: `Department`, `WorkOrder`, `WorkLog`, `InventoryItem`, `MaterialRequisition`.
   - Roles adicionales: `DIRECTOR_DEPARTAMENTAL`, `SUPERVISOR_TECNICO`, `BODEGUERO`.
2. **Sprint 2 (Flujo de Órdenes de Trabajo)**:
   - Panel de asignación para directores departamentales.
   - Interfaz simplificada móvil para cuadrillas de campo.
3. **Sprint 3 (Inventario y Materiales)**:
   - Catálogo de insumos y vinculación de bodega con órdenes de trabajo.
4. **Sprint 4 (Alertas Ciudadanas y Notificaciones)**:
   - Integración de API de mensajería (WhatsApp Business Cloud API) para avisos automáticos al ciudadano.
