# Arquitectura de Federación Territorial: GAD Cantonal & GADs Parroquiales Rurales
**Documento Técnico y Estratégico de Conectividad Institucional**  
**Elaborado por:** SOLINTEEC DEVTECH S.A.S. — Dirección GovTech & Modernización Institucional  
**Contacto:** projects@solinteec.com • pquishpe@solinteec.com  

---

## 1. Contexto y Diagnóstico Territorial en Ecuador

Bajo el marco del **COOTAD** (Código Orgánico de Organización Territorial, Autonomía y Descentralización), el territorio ecuatoriano se organiza en niveles de gobierno descentralizados:
- **Nivel Cantonal (Municipios / Alcaldías)**: Competencias exclusivas sobre agua potable, alcantarillado, saneamiento, vialidad urbana, recolección y disposición final de residuos, catastro y planificación cantonal.
- **Nivel Parroquial Rural (Juntas Parroquiales)**: Competencias sobre vialidad rural secundaria y comunitaria, fomento productivo, gestión y conservación de espacios públicos comunales, y canalización de requerimientos ante los niveles superiores (Cantón y Provincia).

### El Problema Operativo y Político Real:
1. **La Falsa Puerta de Entrada**: El vecino rural que sufre una rotura de tubería de agua o un colapso de alcantarillado acude en primer lugar a su **Junta Parroquial**. Sin embargo, la Junta Parroquial no tiene la competencia ni el presupuesto ni los materiales para repararlo.
2. **El Laberinto del Oficio en Papel**: El Presidente de la Junta Parroquial debe redactar un oficio en papel, trasladarse al centro cantonal, ingresarlo por ventanilla física del Municipio y esperar semanas a que llegue a la Dirección de Agua Potable u Obras Públicas.
3. **El Desgaste y la Frustración**:
   - El ciudadano culpa al Presidente de la Junta Parroquial por "inacción".
   - La Junta Parroquial acusa al Municipio de "olvidar a las parroquias rurales".
   - El Municipio desconoce la urgencia real en territorio y atiende tarde.

---

## 2. La Propuesta SOLINTEEC: Federación Territorial y Cadena de Confianza

Proponemos una arquitectura en donde **el GAD Cantonal y los GADs Parroquiales operan en un ecosistema federado**, con instancias interconectadas que respetan la autonomía de cada nivel de gobierno pero unifican el flujo de datos.

```
                               ┌─────────────────────────────────────────┐
                               │       GAD MUNICIPAL / CANTONAL          │
                               │  (Tenant Principal - Alcalde / Directores)│
                               └────────────────────┬────────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 │                   CADENA DE CONFIANZA Y DATOS                       │
                 ▼                                     ▼                               ▼
  ┌──────────────────────────────┐     ┌──────────────────────────────┐     ┌──────────────────────────────┐
  │     GAD PARROQUIAL 1         │     │     GAD PARROQUIAL 2         │     │     GAD PARROQUIAL 3         │
  │  (Sub-Tenant / Junta Rural)  │     │  (Sub-Tenant / Junta Rural)  │     │  (Sub-Tenant / Junta Rural)  │
  │  • Portal Parroquial Propio  │     │  • Portal Parroquial Propio  │     │  • Portal Parroquial Propio  │
  │  • Competencias Propias      │     │  • Competencias Propias      │     │  • Competencias Propias      │
  │  • Botón: "Derivar a Cantón" │     │  • Botón: "Derivar a Cantón" │     │  • Botón: "Derivar a Cantón" │
  └──────────────┬───────────────┘     └──────────────┬───────────────┘     └──────────────┬───────────────┘
                 │                                    │                                    │
                 ▼                                    ▼                                    ▼
       [Vecinos Parroquia 1]                [Vecinos Parroquia 2]                [Vecinos Parroquia 3]
```

---

## 3. Modelo Operativo de la Solución

### A. Instancias Vinculadas (Sub-tenants o Nodos Parroquiales)
- Cada GAD Parroquial cuenta con su propio portal de cara al vecino (ej. `plataforma.solinteec.com/quijos/papallacta` o dominio personalizado).
- El Presidente de la Junta Parroquial y sus vocales disponen de usuarios administradores de su nodo territorial.
- Los vecinos de esa parroquia registran sus necesidades locales en ese portal.

### B. Matriz de Competencias y Derivación en 1 Clic
Cuando entra un reporte ciudadano:
1. **Si es competencia de la Junta Parroquial** (ej. limpieza de la cancha comunal, arreglo de sede comunitaria):
   - La Junta Parroquial lo atiende con sus brigadas comunitarias y lo resuelve directamente en el sistema.
2. **Si es competencia del GAD Cantonal** (ej. matriz de agua, bacheo de vía principal, recolección de basura):
   - El funcionario de la Junta Parroquial presiona **"Derivar a Competencia Cantonal"**.
   - El sistema clasifica el caso y lo deposita **instantáneamente** en la bandeja de la Dirección Técnica Municipal correspondiente (Obras Públicas o Agua Potable).
   - El ticket viaja con una etiqueta oficial:  
     `Derivado por: GAD Parroquial de Papallacta | Oficio Digital: GP-2026-0034 | Responsable: Presidente Junta Parroquial`.

### C. Trazabilidad Compartida (La Cadena de Confianza)
- **El Ciudadano**: Recibe en su móvil la confirmación: *"Tu requerimiento fue validado por la Junta Parroquial y remitido a Obras Públicas del Cantón con el ticket QUI-2026-0042"*.
- **La Junta Parroquial**: Monitorea en su panel cuándo el Municipio asigna la cuadrilla, cuándo retiran materiales de bodega y cuándo se finaliza la obra.
- **El Municipio / Alcaldía**: Recibe el requerimiento ya filtrado y validado por la autoridad local en territorio, eliminando inspecciones preliminares innecesarias.

### D. Rendición de Cuentas y Paz Política
Al final de cada mes:
- El Presidente Parroquial puede mostrar a su asamblea comunitaria:  
  *"Este mes gestionamos 15 obras con el Municipio: 12 ya están resueltas con evidencia fotográfica y 3 están en proceso"*.
- El Alcalde y el Concejo Municipal disponen de un reporte financiero oficial:  
  *"En la Parroquia X se ejecutaron $14,200 en asfalto y tuberías este trimestre"*, disolviendo cualquier reclamo infundado de abandono territorial.

---

## 4. Implementación Técnica en la Base de Datos

En el modelo de datos relacional (MariaDB/MySQL vía Prisma), la relación se implementa de manera simple y escalable:

```prisma
// Modelo de Tenant preparado para Federación Cantón-Parroquia
model Tenant {
  id           String      @id @default(uuid())
  slug         String      @unique
  name         String
  canton       String
  province     String
  type         TenantType  @default(CANTONAL) // CANTONAL o PARROQUIAL
  
  // Jerarquía Federada: Si es parroquia, apunta a su GAD Cantonal
  parentTenantId String?
  parentTenant   Tenant?   @relation("CantonalParroquial", fields: [parentTenantId], references: [id])
  childTenants   Tenant[]  @relation("CantonalParroquial")

  reports      Report[]
  users        User[]
  // ...
}

enum TenantType {
  CANTONAL
  PARROQUIAL
}
```

---

## 5. Beneficios Estratégicos para la Propuesta al Municipio

1. **Venta Política de Alto Impacto para el Alcalde**:
   - El Alcalde puede convocar a todos los Presidentes de Juntas Parroquiales y decirles:  
     *"Les entrego una plataforma digital moderna a cada parroquia para que trabajemos conectados, sin oficios de papel y con transparencia total"*.
2. **Adopción Inmediata en Territorio**:
   - Los líderes parroquiales se convierten en los principales promotores de la plataforma, pues les da visibilidad y agilidad ante sus vecinos.
3. **Escalabilidad Comercial para SOLINTEEC**:
   - Un solo contrato cantonal integra a todo el ecosistema de parroquias rurales, multiplicando el volumen de usuarios y la consolidación de la empresa como referente tecnológico en el sector público del Ecuador.
