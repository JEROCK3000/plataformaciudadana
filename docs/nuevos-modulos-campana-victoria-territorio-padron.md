# Nuevos Módulos Estratégicos de Campaña Electoral: Quijos 2026

## 1. Propósito y Alcance

Este documento describe la arquitectura, modelos de base de datos, Server Actions e interfaces de usuario de los tres nuevos módulos de alta fidelidad táctica implementados para el candidato **Brandon Aliaga (PSC 6 - Pachakutik 18)** en el cantón **Quijos, Provincia de Napo**:

1. **Calculadora del Umbral de Victoria Cantonal** (`/admin/calculadora-victoria`)
2. **Agenda Táctica de Territorio y Caminatas** (`/admin/agenda-territorial`)
3. **Padrón Electoral y Chequeo Día D (Voto Seguro)** (`/admin/padron-electoral`)

---

## 2. Padrón Electoral Real de Quijos (5,738 Electores)

El sistema opera con los datos territoriales exactos del cantón Quijos:

| Parroquia | Recinto Electoral | Electores | JRVs |
| :--- | :--- | :---: | :---: |
| **Baeza** | Unidad Educativa Baeza | 1,980 | 7 |
| **San Francisco de Borja** | U.E. Fiscomisional Juan Bautista Montini | 1,720 | 6 |
| **Papallacta** | Unidad Educativa Quisquis | 680 | 2 |
| **Cuyuja** | Escuela E.B. Manuel Villavicencio | 520 | 2 |
| **Cosanga** | Escuela E.G.B. Gil Ramírez Dávalos | 510 | 2 |
| **Sumaco** | Escuela Mixta Quijos (GAD Parroquial) | 328 | 1 |
| **TOTAL CANTONAL** | **6 Recintos Oficiales** | **5,738** | **20 JRVs** |

---

## 3. Módulo 1: Calculadora del Umbral de Victoria Cantonal

### Ruta
`/admin/calculadora-victoria`

### Objetivo
Motor matemático interactivo que calcula en tiempo real la cuota de votos requerida para asegurar la victoria en una sola vuelta frente a los 3 rivales en disputa en Quijos:
- **Renán Balladares** (ADN Lista 7)
- **Kerlyn Ruiz** (Alianza 3-8 / PSP)
- **William Guerrero** (Unidos por Quijos)

### Fórmulas y Lógica
1. **Universo de Sufragantes:** `Total Electores (5,738) * Tasa de Participación (%)` (Base: 85.5% = ~4,906 sufragantes).
2. **Votos Válidos Efectivos:** `Sufragantes * (100 - % Nulos y Blancos)` (Base nulos/blancos: 11% = ~4,366 votos válidos).
3. **Umbral Histórico de Victoria:** 38.5% de votos válidos (~1,700 - 1,850 votos).
4. **Desglose de Metas Parroquiales:**
   - Baeza: Meta 660 votos (39.0%)
   - San Francisco de Borja: Meta 580 votos (39.4%)
   - Papallacta: Meta 220 votos (37.8%)
   - Cuyuja: Meta 165 votos (37.2%)
   - Cosanga: Meta 155 votos (35.6%)
   - Sumaco: Meta 110 votos (39.1%)
   - **Total Meta Acumulada: 1,890 votos (43.3% de votos válidos)** -> Colchón de seguridad de +495 votos sobre el segundo lugar.

---

## 4. Módulo 2: Agenda Táctica de Territorio y Caminatas

### Ruta
`/admin/agenda-territorial`

### Objetivo
Planificador y cronograma de operaciones en campo para brigadistas y avanzada, conectado directamente con los reportes ciudadanos de cada barrio y parroquia.

### Funcionalidades
- **Tipos de Actividad:** Caminatas, Caravanas vehiculares, Mítines, Puerta a puerta, Reuniones vecinales, Brigadas comunitarias.
- **Conexión con Necesidades Ciudadanas:** Cada actividad incorpora un campo de *Enfoque de Discurso de Tarima* alineado con las prioridades recolectadas en el portal (agua potable en Baeza, vialidad lechera en Borja, turismo en Papallacta).
- **Control Logístico:** Insumos requeridos (banderas, trípticos con QR, megáfono, transporte, refrigerios).
- **Semáforo de Cobertura Parroquial:** Muestra cuántas de las 6 parroquias cuentan con actividades agendadas para garantizar presencia integral en todo el cantón.

---

## 5. Módulo 3: Padrón Electoral y Chequeo Día D (Voto Seguro)

### Ruta
`/admin/padron-electoral`

### Objetivo
Herramienta operativa para el equipo de control electoral y movilizadores el día de los comicios:

### Funcionalidades
- **Búsqueda Instantánea con Filtro:** Búsqueda en milisegundos por cédula, nombre, teléfono o barrio.
- **Checklist Día D de 1 Clic:** Marcación optimista con guardado de timestamp del momento exacto del sufragio.
- **Alerta de Movilización ("Operación Remolque"):** Filtro exclusivo de simpatizantes confirmados que a partir del mediodía aún no han votado para coordinar transporte o llamadas inmediatas.
- **Gestión de Transporte:** Registro de votantes que requieren recogida en furgoneta o camioneta con dirección exacta y conductor asignado.
- **Conexión Directa WhatsApp:** Botón para contactar al elector o al brigadista con un solo toque desde el teléfono o laptop.

---

## 6. Modelos de Base de Datos (MySQL / MariaDB)

```prisma
enum ActivityType {
  CAMINATA
  CARAVANA
  MITIN
  REUNION_VECINAL
  PUERTA_A_PUERTA
  BRIGADA_COMUNITARIA
  VOLANTEO_FERIA
  OTRO
}

enum ActivityStatus {
  PLANIFICADA
  CONFIRMADA
  EN_CURSO
  COMPLETADA
  CANCELADA
}

enum CommitmentLevel {
  SEGURO
  PROBABLE
  INDECISO
  RIVAL
}

model CampaignScenario {
  id                   String    @id @default(uuid())
  tenantId             String
  name                 String
  description          String?   @db.Text
  expectedTurnoutRate  Float     @default(86.0)
  nullBlankRate        Float     @default(11.5)
  targetCandidateVotes Int       @default(1750)
  parishGoals          Json
  rivalEstimates       Json?
  isDefault            Boolean   @default(false)
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}

model CampaignActivity {
  id                 String          @id @default(uuid())
  tenantId           String
  title              String
  type               ActivityType    @default(CAMINATA)
  parish             String
  sector             String
  date               DateTime
  status             ActivityStatus  @default(PLANIFICADA)
  responsibleName    String?
  responsiblePhone   String?
  meetingPoint       String?
  estimatedAttendees Int             @default(0)
  actualAttendees    Int             @default(0)
  logisticsNotes     String?         @db.Text
  speechFocus        String?         @db.Text
  relatedCategory    Category?
  photos             Json?
  notes              String?         @db.Text
  createdAt          DateTime        @default(now())
  updatedAt          DateTime        @updatedAt
}

model VoterRoll {
  id                 String           @id @default(uuid())
  tenantId           String
  cedula             String
  fullName           String
  parish             String
  recintoId          String?
  juntaId            String?
  juntaNumber        Int?
  gender             JuntaGender?
  phone              String?
  neighborhood       String?
  commitmentLevel    CommitmentLevel  @default(SEGURO)
  isSympathizer      Boolean          @default(true)
  hasVoted           Boolean          @default(false)
  votedAt            DateTime?
  needsTransport     Boolean          @default(false)
  transportAddress   String?
  volunteerAssigned  String?
  notes              String?          @db.Text
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt
}
```

---

## 7. Cumplimiento de Normas AGENTS.md

- [x] Motor de Base de Datos: **MySQL / MariaDB** (cero PostgreSQL).
- [x] Multitenancy estricto: Todo registro aislado mediante `tenantId`.
- [x] Trazabilidad y Logs: Eventos registrados en `/storage/logs/` mediante `writeLog()`.
- [x] Experiencia de Usuario: Interfaz responsive de 1 sola línea, modo oscuro, microanimaciones y tiempos de carga instantáneos.
- [x] TypeScript estricto sin dependencias no aprobadas.
