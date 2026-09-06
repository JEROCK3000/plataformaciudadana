# Modelo de Base de Datos — Plataforma Ciudadana SaaS

## 1. Motor y ORM

- **Motor**: MySQL / MariaDB (cumpliendo la regla estricta de `AGENTS.md`).
- **ORM**: Prisma Client v5.22+.
- **Charset / Collation**: UTF-8 General / utf8mb4.

---

## 2. Diagrama de Modelos Relacionales

```
 ┌─────────────────────────────────────────┐
 │                 Tenant                  │
 ├─────────────────────────────────────────┤
 │ id: String (UUID) [PK]                  │
 │ slug: String [Unique]                   │
 │ name: String                            │
 │ canton: String                          │
 │ province: String                        │
 │ logoUrl: String?                        │
 │ isActive: Boolean                       │
 │ parishes: Json                          │
 │ aiPromptMaster: Text?                   │
 │ plan: String                            │
 │ createdAt: DateTime                     │
 │ updatedAt: DateTime                     │
 └──────────────┬──────────────────┬───────┘
                │ 1                │ 1
                │                  │
                │ N                │ N
 ┌──────────────▼──────────┐ ┌─────▼──────────────────────────┐
 │          User           │ │             Report             │
 ├─────────────────────────┤ ├────────────────────────────────┤
 │ id: String (UUID) [PK]  │ │ id: String (UUID) [PK]         │
 │ email: String [Unique]  │ │ tenantId: String [FK]          │
 │ password: String (Hash) │ │ title: String                  │
 │ name: String            │ │ category: Category (Enum)      │
 │ role: Role (Enum)       │ │ urgency: Urgency (Enum)        │
 │ tenantId: String? [FK]  │ │ parish: String                 │
 │ createdAt: DateTime     │ │ neighborhood: String           │
 │ updatedAt: DateTime     │ │ description: Text              │
 └─────────────────────────┘ │ photos: Json?                  │
                             │ citizenName: String?           │
                             │ citizenContact: String?        │
                             │ privacyAccepted: Boolean       │
                             │ status: ReportStatus (Enum)    │
                             │ votes: Int                     │
                             │ aiAnalysis: LongText?          │
                             │ createdAt: DateTime            │
                             │ updatedAt: DateTime            │
                             └───────────────┬────────────────┘
                                             │ 1
                                             │
                                             │ N
                             ┌───────────────▼────────────────┐
                             │            Comment             │
                             ├────────────────────────────────┤
                             │ id: String (UUID) [PK]         │
                             │ reportId: String [FK, Cascade] │
                             │ text: Text                     │
                             │ citizenName: String?           │
                             │ status: CommentStatus (Enum)   │
                             │ createdAt: DateTime            │
                             └────────────────────────────────┘
```

---

## 3. Índices de Rendimiento Multitenant

Para garantizar alta concurrencia y consultas instantáneas filtradas por municipio:

- `Report`:
  - `@@index([tenantId, createdAt])` (optimiza listados ordenados por fecha de cada municipio).
  - `@@index([tenantId, status])` (optimiza KPIs y agrupaciones de estado por municipio).
- `User`:
  - `@@index([tenantId])` (optimiza listados de administradores por municipio).
- `Tenant`:
  - `@unique` sobre `slug` (resolución O(1) en enrutamiento dinámico `/[slug]`).

---

## 4. Usuarios Iniciales del Sistema (Seed)

| Rol | Correo Electrónico | Contraseña por Defecto | Municipio Asignado |
| :--- | :--- | :--- | :--- |
| **`SUPERADMIN`** | `superadmin@solinteec.com` | `SuperAdmin2026*` | Global (acceso a todos los GADs) |
| **`ADMIN`** | `admin@solinteec.com` | `AdminQuijos2026*` | GAD Municipal de Quijos (`quijos`) |
| **`ADMIN`** | `admin@archidona.gob.ec` | `AdminArchidona2026*` | GAD Municipal de Archidona (`archidona`) |

Comando para re-ejecutar el seed en caso de despliegue en nuevos entornos:
```bash
npm run prisma db seed
# o directamente:
npx prisma db seed
```
