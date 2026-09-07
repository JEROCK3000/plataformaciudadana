# Estrategia GovTech: Modelo de Despliegue Cantonal y Licenciamiento Modular de GADs Parroquiales Rurales

**Documento Técnico y Comercial Enterprise**  
**Empresa:** SOLINTEEC DEVTECH S.A.S.  
**Área:** Dirección GovTech & Modernización Institucional  
**Contacto:** `projects@solinteec.com` | `pquishpe@solinteec.com`  
**Caso de Estudio Territorial:** Provincia de Napo, Ecuador  

---

## 1. Resumen Ejecutivo y Diagnóstico Institucional

En la gestión pública ecuatoriana regulada por el **COOTAD (Código Orgánico de Organización Territorial, Autonomía y Descentralización)** y la **Ley Orgánica del Sistema Nacional de Contratación Pública (SERCOP)**, los Gobiernos Autónomos Descentralizados (GADs) operan bajo personería jurídica, presupuestos y competencias estrictamente delimitadas por nivel de gobierno:

1. **GAD Provincial:** Competencia en cuencas hidrográficas, fomento productivo provincial y vialidad rural intercantonal.
2. **GAD Municipal/Cantonal:** Competencia exclusiva en planificación cantonal, uso de suelo, agua potable, alcantarillado, desechos sólidos y vialidad urbana.
3. **GAD Parroquial Rural (Juntas Parroquiales):** Competencia en planificación parroquial, infraestructura comunal, fomento de actividades productivas comunitarias y vialidad rural secundaria/vecinal.

### El Error Común en el Software Genérico
Muchos proveedores intentan vender soluciones *SaaS Multi-tenant globales* donde múltiples cantones o decenas de parroquias conviven bajo un mismo dominio comercial o una maraña de subdominios (ej. `papallacta.quijos.gob.ec` o `tena.plataforma.com`). 

Este enfoque fracasa en el sector público por tres razones críticas:
- **Autonomía y Auditoría de Contraloría:** Cada GAD tiene su propio RUC. Un Alcalde no puede autorizar fondos públicos para un sistema que aloje o exponga datos de otros cantones.
- **Identidad Oficial (`.gob.ec`):** Los municipios exigen que el portal ciudadano opere bajo su propio dominio institucional acreditado por el Ministerio de Telecomunicaciones (MINTEL), por ejemplo: `plataforma.quijos.gob.ec`.
- **Fricción Técnica y de Red:** Delegar subdominios de tercer nivel a parroquias genera problemas severos de certificados SSL, dependencia de la infraestructura municipal y desconfianza en el ciudadano rural.

---

## 2. La Arquitectura Correcta: Instancia Cantonal + Licenciamiento Modular Parroquial

La propuesta de **SOLINTEEC DEVTECH S.A.S.** plantea un modelo soberano, escalable y comercialmente rentable:

```
                           INSTANCIA MUNICIPAL OFICIAL
                           [ plataforma.quijos.gob.ec ]
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
[ MÓDULO BASE CANTONAL (INCLUIDO) ]             [ MÓDULO DE GESTIÓN PARROQUIAL (ADD-ON) ]
- Dominio propio del Municipio                  - Activación bajo licencia por GAD Parroquial
- Georreferenciación de todo el Cantón          - Panel propio para Presidente y Vocales
- Atención en Direcciones Municipales           - Soberanía en competencias exclusivas (COOTAD 65)
- Sin acceso directo para Juntas Parroquiales   - Botón de Articulación Cantonal en 1 Clic
                                                - Co-Branding institucional oficial
```

### Principios del Modelo
1. **Un solo dominio cantonal por Municipio:** La plataforma se despliega como instancia institucional del Cantón (ej. `plataforma.quijos.gob.ec`).
2. **Mapeo Territorial Integral:** Todas las parroquias del cantón están catalogadas en el mapa georreferenciado para que cualquier habitante pueda reportar incidencias.
3. **Licencia Modular Independiente por Parroquia:** El acceso institucional para la Junta Parroquial **no es automático ni gratuito**. Se contrata como una licencia complementaria (*Add-On*), lo que abre un modelo de ingresos recurrentes para SOLINTEEC.

---

## 3. Dinámica Operativa: Parroquia Sin Licencia vs. Parroquia Con Licencia

### Caso A: Parroquia sin Licencia Parroquial (Ejemplo: Parroquia X)
- El ciudadano ingresa a `plataforma.quijos.gob.ec` y reporta un bache o una luminaria en dicha parroquia.
- La incidencia viaja directamente a la Dirección Municipal correspondiente (Obras Públicas, Servicios Públicos).
- La Junta Parroquial no tiene usuario ni panel de control en el sistema.

### Caso B: Parroquia con Licencia Activada (Ejemplo: GAD Parroquial de Papallacta)
- **Panel Exclusivo:** El Presidente y el Secretario de la Junta Parroquial de Papallacta reciben credenciales con rol `GAD_PARROQUIAL_ADMIN`.
- **Bandeja Territorial Propia:** Tienen acceso a la lista de reportes generados dentro del polígono territorial de Papallacta.
- **Resolución de Competencias Parroquiales (COOTAD Art. 65):**
  - Si el reporte es mantenimiento de canchas de la parroquia, parques comunales o canal de riego vecinal, la Junta Parroquial lo gestiona, despacha cuadrilla local y lo cierra con evidencia fotográfica.
- **Botón de Articulación Cantonal (1 Clic):**
  - Si el reporte es una rotura de tubería de agua potable o falla en la recolección de basura (competencia exclusiva cantonal del Municipio de Quijos), el operador parroquial presiona:  
    `[Derivar a Dirección Municipal - GAD Quijos]`
  - El ticket viaja inmediatamente a la bandeja del Director Municipal de Agua Potable, registrando una cadena de custodia transparente sin necesidad de oficios físicos en papel.
- **Co-Branding Institucional:** Al ciudadano se le muestra:  
  *“Gobierno Autónomo Descentralizado Parroquial Rural de Papallacta en coordinación con el GAD Municipal de Quijos”* con el escudo oficial de la parroquia.

---

## 4. Relevamiento Territorial Oficial: Provincia de Napo

La provincia de **Napo** cuenta con **5 cantones** y un total de **20 Parroquias Rurales** legalmente constituidas con sus respectivos GADs Parroquiales:

```
PROVINCIA DE NAPO (5 CANTONES / 20 GADS PARROQUIALES RURALES)
├── 1. CANTÓN QUIJOS (5 Parroquias Rurales)
│   ├── Cabecera Cantonal: Baeza (Urbana)
│   ├── GAD Parroquial Rural de Cosanga
│   ├── GAD Parroquial Rural de Cuyuja
│   ├── GAD Parroquial Rural de Papallacta
│   ├── GAD Parroquial Rural de San Francisco de Borja
│   └── GAD Parroquial Rural de Sumaco
│
├── 2. CANTÓN TENA - Capital Provincial (7 Parroquias Rurales)
│   ├── Cabecera Cantonal: Tena (Urbana)
│   ├── GAD Parroquial Rural de Ahuano
│   ├── GAD Parroquial Rural de Chontapunta
│   ├── GAD Parroquial Rural de Muyuna
│   ├── GAD Parroquial Rural de Pano
│   ├── GAD Parroquial Rural de Puerto Misahuallí
│   ├── GAD Parroquial Rural de Puerto Napo
│   └── GAD Parroquial Rural de Tálag
│
├── 3. CANTÓN ARCHIDONA (3 Parroquias Rurales)
│   ├── Cabecera Cantonal: Archidona (Urbana)
│   ├── GAD Parroquial Rural de Cotundo
│   ├── GAD Parroquial Rural de Hatun Sumaku
│   └── GAD Parroquial Rural de San Pablo de Ushpayaku
│
├── 4. CANTÓN EL CHACO (5 Parroquias Rurales)
│   ├── Cabecera Cantonal: El Chaco (Urbana)
│   ├── GAD Parroquial Rural de Gonzalo Díaz de Pineda (El Bombón)
│   ├── GAD Parroquial Rural de Linares
│   ├── GAD Parroquial Rural de Oyacachi
│   ├── GAD Parroquial Rural de Santa Rosa
│   └── GAD Parroquial Rural de Sardinas
│
└── 5. CANTÓN CARLOS JULIO AROSEMENA TOLA (0 Parroquias Rurales)
    └── Cabecera Cantonal: Carlos Julio Arosemena Tola (Urbana)
        *Nota Especial:* No posee parroquias rurales. Se organiza por comunidades 
        y recintos rurales (Flor del Bosque, Santa Mónica, Pumayacu, etc.) dependientes 
        directamente del Municipio.
```

### Tabla Resumen de Gobiernos Locales en Napo

| Cantón | Cabecera Cantonal | Parroquias Rurales (GADs con RUC y Presupuesto) | Potencial Licencias Parroquiales |
| :--- | :--- | :--- | :---: |
| **Quijos** | Baeza | Cosanga, Cuyuja, Papallacta, San Francisco de Borja, Sumaco | 5 |
| **Tena** | Tena | Ahuano, Chontapunta, Muyuna, Pano, Puerto Misahuallí, Puerto Napo, Tálag | 7 |
| **Archidona** | Archidona | Cotundo, Hatun Sumaku, San Pablo de Ushpayaku | 3 |
| **El Chaco** | El Chaco | Gonzalo Díaz de Pineda, Linares, Oyacachi, Santa Rosa, Sardinas | 5 |
| **C.J. Arosemena Tola** | Arosemena Tola | *Sin parroquias rurales (organización por recintos comunitarios)* | 0 |
| **TOTAL NAPO** | **5 Cantones** | **20 Gobiernos Parroquiales Rurales** | **20 Licencias** |

---

## 5. Estrategia Comercial y Rutas de Contratación Pública (SERCOP)

Para **SOLINTEEC DEVTECH S.A.S.**, este modelo optimiza los tiempos de cierre comercial mediante tres mecanismos legales:

### Ruta 1: Venta Principal al GAD Municipal (El Contrato Matriz)
- **Objeto:** Plataforma Ciudadana Cantonal + CRM de Direcciones Municipales + Mapeo Territorial.
- **Mecanismo:** Catálogo Electrónico, Menor Cuantía o Consultoría según el presupuesto municipal.
- **Argumento de Venta:** Control de gestión del Alcalde sobre todo su cantón, trazabilidad de directores departamentales y cumplimiento de ordenanzas de participación ciudadana.

### Ruta 2: Venta Directa a Juntas Parroquiales (Contratos Ágiles)
- **Objeto:** Licencia Anual del Módulo de Gestión Institucional Parroquial + Co-Branding + Articulación Cantonal.
- **Mecanismo:** **Ínfima Cuantía** (montos menores al coeficiente legal, contratación directa en 48 a 72 horas sin concurso público pesado).
- **Argumento de Venta:** El Presidente de la Junta Parroquial adquiere una herramienta moderna para visibilizar su gestión, atender a sus comunidades rurales y presionar al Municipio con estadísticas reales y georreferenciadas.

### Ruta 3: Alianza Estratégica con CONAGOPARE Napo
- **Objeto:** Convenio Marco Interinstitucional para la estandarización tecnológica de las 20 parroquias rurales de Napo.
- **Impacto:** Posiciona a SOLINTEEC como el referente tecnológico gubernamental en la región amazónica.

---

## 6. Modelo de Datos Técnico (MariaDB / Prisma)

En lugar de crear múltiples bases de datos o subdominios frágiles, el esquema de base de datos se estructura limpiamente por catálogo y control de licencias:

```prisma
// Control de Parroquias y Licencias del Cantón
model Parish {
  id             String   @id @default(uuid())
  cantonId       String
  canton         Canton   @relation(fields: [cantonId], references: [id])
  name           String   // Ej: Papallacta
  isRural        Boolean  @default(true)
  
  // Estado de Licenciamiento Parroquial
  isLicensed     Boolean  @default(false)
  licenseKey     String?  // Hash o clave de activación
  licenseExpires DateTime?
  
  // Perfil Institucional de la Junta Parroquial
  ruc            String?  // RUC propio del GAD Parroquial
  presidentName  String?  // Nombre del Presidente/a
  officialEmail  String?  // Correo de contacto oficial
  logoUrl        String?  // Escudo oficial de la parroquia
  phone          String?
  
  // Relaciones
  users          User[]   // Operadores y autoridades parroquiales
  reports        Report[] // Reportes en su jurisdicción

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([cantonId])
}

// Estados y Trazabilidad de Derivación Cantonal en Reportes
enum TicketJurisdiction {
  MUNICIPAL_DIRECT       // Ingreso directo a Municipio
  PARISH_LOCAL           // Resuelto internamente por la Junta Parroquial
  DERIVED_TO_MUNICIPAL   // Derivado de la Junta al Municipio
}
```

---

## 7. Ficha Corporativa

- **Razón Social:** SOLINTEEC DEVTECH S.A.S.  
- **Área Técnica:** Dirección GovTech & Modernización Institucional  
- **Correos Oficiales:** `projects@solinteec.com` • `pquishpe@solinteec.com`  
- **Sitio Web Corporativo:** [https://solinteec.com](https://solinteec.com)  
- **Portal Demostrativo:** [https://plataforma.solinteec.com](https://plataforma.solinteec.com)  
- **Propiedad Intelectual:** © 2026 SOLINTEEC DEVTECH S.A.S. Todos los derechos reservados.
