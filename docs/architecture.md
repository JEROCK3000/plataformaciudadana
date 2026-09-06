# Arquitectura SaaS Multi-Tenant — Plataforma Ciudadana

## 1. Visión General

La Plataforma Ciudadana opera bajo un modelo de arquitectura **SaaS Multi-Tenant con separación lógica compartida** (Shared Database, Shared Schema). Cada Gobierno Autónomo Descentralizado (GAD) Municipal o entidad territorial opera como un `Tenant` independiente dentro de una única instancia de infraestructura.

```
                  ┌─────────────────────────────────────┐
                  │          Plataforma SaaS            │
                  └──────────────────┬──────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
   ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
   │ Portal Público│         │  Admin Tenant │         │  Superadmin   │
   │   /[slug]     │         │    /admin     │         │  /superadmin  │
   └───────┬───────┘         └───────┬───────┘         └───────┬───────┘
           │                         │                         │
           └─────────────────────────┼─────────────────────────┘
                                     ▼
                            ┌────────────────┐
                            │  MySQL/Prisma  │
                            │ (con tenantId) │
                            └────────────────┘
```

---

## 2. Aislamiento y Seguridad de Datos

### Separación Lógica Estricta
- Toda entidad dependiente (`Report`, `User`) cuenta con una clave foránea `tenantId` indexada.
- Ningún usuario o administrador de un municipio puede consultar, editar o visualizar información de otro municipio.
- Las consultas en Server Actions aplican el filtro obligatorio:
  ```typescript
  where: { tenantId }
  ```
- En el caso de operaciones sensibles o consultas individuales (ej. `/admin/report/[id]`), se valida que el recurso pertenezca al `tenantId` de la sesión del administrador; si no coincide, el sistema retorna `notFound()`.

---

## 3. Matriz de Roles y Permisos

| Rol | Alcance | Rutas Principales | Capacidades |
| :--- | :--- | :--- | :--- |
| **`SUPERADMIN`** | Global (SaaS completo) | `/superadmin/*`, `/admin/*` | Orquestación global, creación de tenants, activación/suspensión de municipios, visor de logs en `/storage/logs`, conmutación en caliente de tenants para auditoría. |
| **`ADMIN`** | Tenant específico | `/admin/*` | Gestión de reportes del cantón, cambio de estados, estadísticas territoriales, análisis con IA, gestión de moderadores locales y configuración institucional. |
| **`MODERATOR`** | Tenant específico | `/admin/*` | Gestión y moderación operativa de reportes ciudadanos y comentarios. |
| **`CIUDADANO`** | Público / Anónimo | `/[slug]`, `/` | Registro de reportes, carga de fotografías comprimidas, apoyo vecinal (votos) y comentarios. |

---

## 4. Resolución y Enrutamiento de Tenants

1. **Portal Público Territorial (`/[slug]`)**:
   - Ejemplo: `/quijos` o `/archidona`.
   - Carga la configuración del municipio (`name`, `canton`, `province`, `parishes`).
   - El formulario de reporte (`ReportForm`) se inicializa automáticamente con las parroquias y el identificador del cantón.
   - Solo se listan los reportes de ese cantón.
2. **Directorio Raíz (`/`)**:
   - Presenta un directorio ejecutivo de cantones suscritos y métricas consolidadas.
3. **Panel Administrativo del Municipio (`/admin`)**:
   - Resuelve el tenant mediante la sesión JWT (`tenantId`).
   - Para el rol `SUPERADMIN`, incluye un selector dinámico en la cabecera (`SuperadminTenantSwitcher`) que permite alternar la vista entre cualquier municipio registrado sin cerrar sesión.
4. **Centro de Control Global (`/superadmin`)**:
   - Exclusivo para usuarios con rol `SUPERADMIN`.
   - Monitorea métricas consolidadas a nivel nacional, aprovisiona nuevos municipios y audita los archivos de log.

---

## 5. Trazabilidad y Logs

Los eventos significativos se escriben en `/storage/logs/` con formato de fecha diario (`mmm-dd-yyyy.log`) y estructura estandarizada:

```txt
[YYYY-MM-DD HH:mm:ss] [NIVEL] [tenant:slug] [user:id] Mensaje del evento
```

Niveles utilizados:
- `AUDIT`: Cambios de estado de reportes, logins, creaciones de tenants o usuarios.
- `SECURITY`: Intentos de acceso a tenants inactivos, credenciales inválidas.
- `INFO`: Creación de reportes ciudadanos, generación de planes de IA.
- `WARN`: Conmutación de modelos de IA por alta demanda o latencia.
- `ERROR`: Excepciones en base de datos o llamadas a proveedores externos.
