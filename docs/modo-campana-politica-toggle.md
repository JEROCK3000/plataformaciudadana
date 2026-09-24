# Arquitectura del Switch "Modo Campaña Política" vs. "Modo Institucional GAD"

## 1. Propósito y Filosofía
Esta funcionalidad permite transformar la plataforma completa con un solo clic desde la pantalla de Configuración (`/admin/settings`), resolviendo de forma elegante y automatizada los dos momentos de vida del producto:

1. **Momento 1 (Hoy - Campaña Política):** Herramienta de escucha ciudadana, inteligencia territorial, generación de fichas ejecutivas para discursos de tarima del candidato y captura de contactos (WhatsApp) de simpatizantes en las 6 parroquias de Quijos.
2. **Momento 2 (Mañana - Alcaldía Ganada):** Al ganar las elecciones, el switch se desactiva y el sistema opera al 100% como la plataforma oficial de atención y servicios del GAD Municipal de Quijos (`plataforma.quijos.gob.ec`), sin dejar rastros políticos y lista para la contratación institucional bajo el SERCOP.

---

## 2. Parámetros de Configuración del Tenant (`prisma/schema.prisma`)
Se añadieron los siguientes campos a la entidad `Tenant`:
- `campaignMode` (`Boolean`, default `false`): Determina si los módulos de campaña están activos.
- `candidateName` (`String?`): Nombre oficial del candidato (ej: *"Ing. Juan Pérez"*).
- `campaignSlogan` (`String?`): Eslogan de campaña (ej: *"El Quijos que Soñamos"*).
- `campaignListNumber` (`String?`): Lista o movimiento político (ej: *"Lista 100 - Renovación"*).

---

## 3. Comportamiento según el Estado del Switch

### A. Cuando `campaignMode === false` (Modo Institucional GAD)
* **Página pública (`/[slug]`):**
  - Encabezado oficial: *"GAD Municipal del Cantón Quijos • Portal de Participación Ciudadana"*.
  - Formulario ciudadano estándar enfocado en reclamos y solicitudes de servicios públicos.
  - No existen referencias a candidaturas, eslóganes ni partidos políticos.
* **Panel Administrativo (`/admin`):**
  - Muestra únicamente los menús tradicionales: Portal, Estadísticas, Descargas / Dossier, Configuración, Usuarios.
  - Los endpoints `/admin/war-room` y `/admin/qr-codes` están protegidos y redirigen a `/admin` para evitar accesos no autorizados.

### B. Cuando `campaignMode === true` (Modo Campaña Política)
* **Panel Administrativo (`/admin`):**
  - Se despliega un banner destacado con el badge *"Modo Campaña Activo"*, el nombre del candidato, lista y eslogan.
  - Se habilitan dos botones y accesos directos en el menú principal:
    1. **War Room / Tarima (`/admin/war-room`)**:
       - Selector interactivo por parroquia (Baeza, San Francisco de Borja, Papallacta, Cuyuja, Cosanga, Sumaco o Cantón Completo).
       - Radiografía en tiempo real: categoría más demandada (%), barrios con más reportes, número de urgencias altas.
       - **Ficha de Tarima Imprimible en 1 Clic**: Diagnóstico para discurso, apertura de impacto, mención textual de vecinos reportantes y compromiso de campaña con solución técnica.
       - Directorio de Votantes: listado de ciudadanos con botón directo para enviar WhatsApp.
    2. **Generador de Códigos QR (`/admin/qr-codes`)**:
       - Generación dinámica de QR en alta resolución (PNG descargable) para:
         - General de Campaña (vallas, afiches, redes).
         - Específico por Parroquia (preselecciona la parroquia al escanearse).
         - Por Brigada de territorio.
       - Plantilla de Afiche A4 lista para imprimir (`window.print()`).
* **Página pública (`/[slug]`):**
  - Encabezado estilizado con badge de lista y eslogan de campaña.
  - Formulario adaptado para invitar a construir el *"Plan Cantonal de Obras Prioritarias"*.
  - Soporte para preseleccionar la parroquia a través del parámetro URL `?parish=...`.
  - Campo de contacto optimizado para capturar el WhatsApp del vecino para el seguimiento de la candidatura.

---

## 4. Trazabilidad y Logs
El cambio de estado del switch queda registrado en el sistema de logs centralizado (`/storage/logs/`):
```txt
[2026-09-24 03:20:25] [AUDIT] [tenant:quijos] [user:42] Configuración del tenant actualizada (Campaña: ACTIVADA, Exigir cédula: false)
```
