# Documentación de Reportes e Informes — Plataforma Ciudadana SaaS

## 1. Directrices Generales (Conforme a AGENTS.md)

Este proyecto cumple estrictamente las políticas de generación de reportes institucionales:
- **Formatos Oficiales**: Excel (`.xlsx`) y PDF profesional horizontal.
- **Formato Prohibido**: No se utiliza CSV como formato de reporte principal.
- **Estructura Requerida**: Membrete del GAD Municipal, fecha de emisión, filtros aplicados, anchos de columna automáticos, totales formateados y foliación de páginas.

---

## 2. Bibliotecas Seleccionadas y Justificación

### A. Reportes en Excel (`.xlsx`): `exceljs` (v4.4.0)
- **Motivo de elección**: Soporte completo para múltiples hojas de cálculo, estilos tipográficos, paletas de colores RGB/ARGB, bordes personalizados, fórmulas y anchos de columna automáticos sin depender de binarios externos.
- **Hojas generadas**:
  1. `Resumen Ejecutivo`: Métricas clave, contadores por estado y tabla de volumen de reportes por Dirección Municipal.
  2. `Detalle de Reportes`: Listado exhaustivo con códigos de ticket, fechas, ubicación territorial, categoría, urgencia y estado.

### B. Reportes en PDF: `jspdf` (v4.2+) + `jspdf-autotable` (v5.0+)
- **Motivo de elección**: Generación ligera y de alto rendimiento en el servidor (Node.js) sin necesidad de levantar instancias pesadas de navegadores headless (Puppeteer).
- **Diseño**: Orientación horizontal (Landscape A4), encabezado verde institucional (Emerald), bloque resumen superior, tabla estructurada con auto-wrap y pie de página dinámico ("Página X de Y").

### C. Ficha Oficial de Tarima & Dossier Electoral: `jspdf` + `jspdf-autotable`
- **Motivo de elección**: Generación de un dossier ejecutivo de campaña en formato vertical A4 (2 páginas exactas), que sustituye la impresión precaria del navegador por un documento vectorial de alto calibre.
- **Página 1 (Dossier Estratégico & Guion de Tarima)**:
  - Cintillo oficial de campaña con foto del candidato, logo/número de lista y cantón.
  - Radiografía métrica del dolor ciudadano (% de vialidad, agua, obras y barrios críticos).
  - Guion de 4 bloques para discurso en tarima: Apertura de Impacto, Mención de Casos Reales con nombres de vecinos, Compromiso Técnico y Cierre Triunfal.
- **Página 2 (Auditoría Territorial & Testimonios)**:
  - Tabla ejecutiva con tickets parroquiales (`QUI-[PARROQUIA]-2026-XXXX`), datos de contacto WhatsApp de vecinos y estado del clamor para avanzada territorial.

---

## 3. Endpoints Disponibles

Los reportes se descargan mediante Route Handlers autenticados que validan el `tenantId` de la sesión:

- **Excel (`.xlsx`)**:
  ```http
  GET /api/reports/export/excel?parish=Baeza&status=RECEIVED&department=OBRAS_PUBLICAS
  ```
- **PDF de Gestión Municipal**:
  ```http
  GET /api/reports/export/pdf?parish=Baeza&status=RECEIVED&department=OBRAS_PUBLICAS
  ```
- **Ficha de Tarima y Dossier Electoral (PDF A4)**:
  ```http
  GET /api/reports/export/tarima-pdf?parish=San+Francisco+de+Borja
  ```

Ambos endpoints generan un nombre de archivo normalizado y fechado:
`Reporte-[tenantSlug]-[YYYY-MM-DD].xlsx`, `Reporte-[tenantSlug]-[YYYY-MM-DD].pdf` y `Ficha_Tarima_[tenantSlug]_[parroquia]_[YYYY-MM-DD].pdf`

---

## 4. Auditoría y Trazabilidad

Cada generación de informe se registra automáticamente en `/storage/logs/[mes-dia-año].log`:
```txt
[YYYY-MM-DD HH:mm:ss] [INFO] [tenant:quijos] [user:uuid] Reporte XLSX generado correctamente: Reporte-quijos-2026-09-07.xlsx (5 filas)
```
