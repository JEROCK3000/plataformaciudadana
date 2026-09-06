# Manual de Operación: Superadministrador Global SaaS

## 1. Propósito y Alcance

El módulo de **Superadministrador (`/superadmin`)** provee gobernanza completa sobre la infraestructura SaaS multitenant. Permite a los directores de tecnología y administradores de la plataforma aprovisionar nuevos municipios, monitorear la salud global del servicio y auditar eventos operativos y de seguridad.

---

## 2. Aprovisionamiento de Nuevos Municipios

Para incorporar un nuevo GAD Municipal o entidad territorial:

1. Iniciar sesión con la cuenta de Superadmin (`superadmin@solinteec.com`).
2. Dirigirse al menú superior **Municipios** (`/superadmin/tenants`).
3. Hacer clic en el botón visible **`+ Nuevo Municipio`**.
4. Completar el formulario:
   - **Nombre Oficial**: ej. `GAD Municipal del Cantón Tena`.
   - **Slug URL**: identificador en minúsculas sin espacios (ej. `tena`). El portal público quedará disponible en `/tena`.
   - **Cantón** y **Provincia**: Contextualizan automáticamente las búsquedas del asistente de IA.
   - **Parroquias**: Lista separada por coma (ej. `Tena, Ahuano, Chonta Punta, Pano, Puerto Misahuallí, Puerto Napo, Tálag`).
   - **Plan SaaS**: `STARTER`, `PRO` o `ENTERPRISE`.
   - **Prompt Maestro de IA (Opcional)**: Instrucciones o prioridades particulares del cantón.
5. Hacer clic en **Crear Municipio**. La base de datos registra el tenant y queda activo de forma inmediata.

---

## 3. Ciclo de Vida del Municipio (Suspensión / Activación)

- Desde `/superadmin/tenants`, cada municipio cuenta con un botón de acción rápida **Suspender** / **Activar**.
- Cuando un municipio es suspendido:
  - El portal público muestra error 404 o mensaje de inactividad.
  - Los administradores de ese cantón no pueden iniciar sesión (el sistema rechaza con *"La cuenta de este municipio se encuentra inactiva o suspendida"*).
  - Ningún ciudadano puede enviar nuevos reportes.

---

## 4. Conmutación en Caliente para Auditoría (Tenant Switcher)

El Superadmin puede ingresar al panel administrativo de cualquier GAD haciendo clic en **Ver Admin GAD** (`/admin`).
En la parte superior de la pantalla aparecerá una barra morada persistente:
- Permite seleccionar cualquier cantón registrado desde el dropdown **"Cambiar GAD"**.
- Al cambiar de cantón, todas las tablas, KPIs de estado, reportes y gráficas se actualizan en tiempo real con los datos de ese municipio específico.
- Permite regresar al centro de control global con el botón **"Panel Superadmin"**.

---

## 5. Auditoría y Visor de Logs

- Ubicación: `/superadmin/logs`
- Lee los archivos generados en `/storage/logs/` con formato `mmm-dd-yyyy.log`.
- Permite inspeccionar en tiempo real eventos con clasificación:
  - `AUDIT`: Cambios de estado y acciones ejecutivas.
  - `SECURITY`: Intentos de ingreso no autorizado o con contraseñas erróneas.
  - `INFO`: Actividad cotidiana (reportes enviados, votos, IA).
  - `WARN`: Conmutación de modelos de respaldo.
  - `ERROR`: Fallos no controlados para depuración inmediata.
