# PWA & Arquitectura Offline-First (Modo Sin Conexión)

## 1. Visión y Propósito Territorial

En zonas geográficas con orografía compleja y conectividad celular intermitente (como el cantón Quijos y la provincia de Napo: vías interparroquiales, páramo de Papallacta, sectores agrícolas de Cuyuja y Cosanga), **la dependencia de una conexión a internet permanente para el levantamiento de datos causa tasas de fracaso superiores al 70%**.

La plataforma implementa una arquitectura **PWA Offline-First de Grado Misión Crítica**:
1. El brigadista o ciudadano puede registrar reportes barriales en cualquier rincón del territorio, incluso con el teléfono en modo avión o sin saldo ni datos.
2. El delegado de mesa el **Día D** puede registrar los votos y adjuntar la fotografía del acta dentro del recinto electoral sin temor a que el envío se pierda si la señal celular colapsa.
3. El sistema almacena los datos de forma estructurada en la memoria local del dispositivo y los **sincroniza de manera automática y transparente** apenas se detecta reconexión a una red WiFi o 4G/LTE.

---

## 2. Componentes de la Arquitectura

### A. Gestor de Cola Local (`src/lib/offline/offlineStorage.ts`)
* **Almacenamiento Local Resiliente:** Administra dos colas independientes de almacenamiento:
  - `solinteec_offline_reports_v1`: Reportes ciudadanos con parroquia, barrio, categoría, urgencia y fotografías comprimidas.
  - `solinteec_offline_actas_v1`: Actas electorales con desglose numérico mesa por mesa de los 4 candidatos oficiales, nulos, blancos y foto del acta.
* **Manejo inteligente de cuota:** Si el tamaño de almacenamiento local se aproxima al límite del navegador por fotos de alta resolución, preserva los datos numéricos y metadatos garantizando que ningún registro se descarte.
* **Bus de Eventos Reactivo (`offline-queue-changed`):** Emite eventos del DOM para sincronizar de inmediato badges, contadores y banners sin necesidad de polling continuo.

### B. Banner y Monitor de Conectividad (`src/components/pwa/OfflineBanner.tsx`)
* **Detección Reactiva:** Escucha los eventos `online` y `offline` del objeto `window`, junto con la propiedad `navigator.onLine`.
* **Estados Visuales:**
  - **Sin Conexión:** Barra flotante ámbar con ícono `WifiOff` indicando que el *Modo Sin Conexión Protegido* está activo y cuántos registros hay en cola.
  - **Reconexión Detectada:** Barra esmeralda que notifica la recuperación de la señal y activa el proceso de auto-sincronización tras 1.5 segundos de gracia.
  - **Cajón de Inspección de Cola:** Permite al operador territorial ver el listado de registros locales en espera con hora de captura, parroquia y opción de descarte si fue un ensayo.
* **Auto-Sincronización:** Procesa la cola mediante Server Actions (`createReport` y `saveElectoralActa`), vaciando los registros exitosos y notificando con un toast confirmatorio.

### C. Integración en el Formulario Territorial (`src/components/forms/ReportForm.tsx`)
* Antes de intentar cualquier llamada de red, verifica el estado de conectividad.
* Si el dispositivo está desconectado o si la petición falla por corte de transmisión en carretera, captura el payload completo en la cola local.
* Presenta una pantalla de confirmación dedicada con mensaje claro:  
  *¡Reporte Protegido en tu Teléfono! Detectamos señal baja o nula en este sector. Tu información quedó guardada y se subirá automáticamente cuando recuperes cobertura.*

### D. Integración en Control Electoral del Día D (`src/components/admin/ControlElectoralClient.tsx`)
* Si el delegado se encuentra en una Junta Receptora del Voto aislada o con inhibidores/saturación de red:
  - Guarda el acta con los votos de los 4 candidatos en memoria local.
  - Emite feedback inmediato al veedor de mesa para que pueda continuar con la siguiente junta sin demoras.
  - El War Room central recibe el acta en cuanto el delegado sale del recinto a una zona con cobertura.

### E. Página de Contingencia (`src/app/offline/page.tsx`)
* Vista de fallback elegante cuando el usuario intenta navegar a una ruta que no ha sido precacheada por el Service Worker.
* Cuenta con botón reactivo de *Reintentar Conexión* y acceso directo a la pantalla principal.

### F. Service Worker con Serwist (`src/app/sw.ts` & `next.config.ts`)
* Pre-caching de assets estáticos (CSS, scripts de Next.js, iconos PWA, tipografías).
* Política de caché `StaleWhileRevalidate` y `NetworkFirst` provista por Serwist para funcionamiento instantáneo en móviles (iOS Safari y Android Chrome).

---

## 3. Matriz de Comportamiento en Escenarios de Red

| Escenario de Territorio | Conectividad | Comportamiento del Software | Garantía de Datos |
| :--- | :--- | :--- | :--- |
| **Páramo Papallacta / Cosanga rural** | 0% (Sin Red) | Formulario guarda en cola local, banner ámbar activo | Cero pérdida. Datos seguros en dispositivo |
| **Ruta Baeza - Borja con señal intermitente** | 20% - 40% (Caídas) | Si falla la llamada por timeout, respalda automáticamente en cola local | Respaldo automático sin error fatal |
| **Llegada al Centro Poblado de Baeza** | 100% (4G / WiFi) | Listener detecta evento `online`, auto-sincroniza en 1.5s y vacía la cola | Subida masiva al War Room central |
| **Recinto Electoral Día D saturado** | Intermitente | Delegado registra acta, queda guardada con sello de tiempo | Acta garantizada para escrutinio oficial |

---

## 4. Verificación y Validación

* **Compilación de Producción:** `npm run build` ejecutado y aprobado con generación limpia del bundle `sw.js` (Serwist 9.5).
* **Compatibilidad de Diseño:** Soporte completo en modo claro y oscuro (`AGENTS.md`), tipografía institucional e interfaces responsive para smartphones de gama media/baja comunes en brigadistas comunitarios.
