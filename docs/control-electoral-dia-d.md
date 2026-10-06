# Módulo de Control Electoral del Día D (E-Day War Machine)

## Propósito
Este módulo convierte la plataforma en un **cuartel de operaciones en tiempo real para el Día de las Elecciones (Día D)**. 

Resuelve los dos grandes problemas que hacen perder elecciones reñidas:
1. **Falta de actas de escrutinio:** Los delegados no transmiten a tiempo o se quedan sin evidencia física.
2. **Descoordinación de veedores:** No se sabe qué mesas electorales están cubiertas y cuáles están desiertas.

---

## 1. Arquitectura y Componentes del Módulo

El módulo opera bajo la ruta protegida:
```txt
/admin/control-electoral
```

Está estructurado en 3 secciones operativas:

### A. Tablero en Vivo (Conteo Rápido de Actas)
- **Barra de Avance Global:** Porcentaje de actas escrutadas vs total de mesas electorales del cantón.
- **Gran Marcador de Tendencia:** Curva en tiempo real de votos:
  - Votos del Candidato y Lista oficial.
  - Votos del Principal Rival / Contendor.
  - Votos de otros movimientos.
  - Votos blancos y nulos.
- **Margen de Ventaja:** Cálculo matemático inmediato de la brecha de votos requerida para asegurar la victoria.
- **Semáforo Territorial por Parroquias:** Indicador visual (Verde: Ganando, Rojo: En desventaja, Gris: Sin actas) para Baeza, San Francisco de Borja, Cuyuja, Cosanga y Papallacta.
- **Galería de Actas Oficiales:** Registro fotográfico de cada acta transmitida con visualizador en alta resolución para sustento legal ante el CNE.

### B. Transmisión Móvil de Actas (Para Delegados y Brigadistas)
- Optimizado para smartphones en territorio:
  - Selección de Recinto y Junta Receptora del Voto (JRV).
  - Ingreso ágil de votos con teclado numérico.
  - **Cuadre Matemático Automático:** Compara la suma de votos contra el padrón asignado de la mesa. Si los votos exceden el padrón, genera una alerta roja de **Inconsistencia Numérica** automática.
  - Captura y subida directa de la fotografía del acta oficial firmada por los miembros de la JRV.

### C. Despliegue de Recintos & Veedores de Mesa (Padrón Oficial CNE)
- Catálogo oficial del Consejo Nacional Electoral (CNE) para el Cantón Quijos: **20 Juntas Receptoras del Voto y 5,738 electores empadronados**:
  1. **Baeza:** *Unidad Educativa Baeza* — 7 Juntas (3 Masculinas, 4 Femeninas) — 1,980 electores.
  2. **San Francisco de Borja:** *Unidad Educativa Fiscomisional Juan Bautista Montini* — 6 Juntas (3 Masculinas, 3 Femeninas) — 1,720 electores.
  3. **Papallacta:** *Unidad Educativa Quisquis* — 2 Juntas (1 Masculina, 1 Femenina) — 680 electores.
  4. **Cuyuja:** *Escuela de Educación Básica Manuel Villavicencio* — 2 Juntas (1 Masculina, 1 Femenina) — 520 electores.
  5. **Cosanga:** *Escuela de Educación General Básica Gil Ramírez Dávalos* — 2 Juntas (1 Masculina, 1 Femenina) — 510 electores.
  6. **Sumaco:** *Escuela Fiscal Mixta Quijos (GAD Parroquial)* — 1 Junta (1 Mixta) — 328 electores.
- Asignación de Delegado con nombre, celular y estado de presencia (`PENDIENTE`, `CONFIRMADO`, `EN_MESA`, `AUSENTE`).
- **Botón de Enlace Directo a WhatsApp:** Abre una conversación con el veedor con mensaje precargado de monitoreo.

---

## 2. Modelo de Base de Datos (MariaDB / MySQL)

Modelos implementados en Prisma:

```prisma
model ElectoralRecinto {
  id              String   @id @default(uuid())
  tenantId        String
  name            String
  parish          String
  address         String?
  electors        Int      @default(0)
  coordinatorName String?
  coordinatorPhone String?
  juntas          ElectoralJunta[]
  // ...
}

model ElectoralJunta {
  id              String         @id @default(uuid())
  tenantId        String
  recintoId       String
  juntaNumber     Int
  gender          JuntaGender    @default(MASCULINO)
  electors        Int            @default(350)
  delegateName    String?
  delegatePhone   String?
  delegateStatus  DelegateStatus @default(PENDIENTE)
  acta            ElectoralActa?
  // ...
}

model ElectoralActa {
  id               String      @id @default(uuid())
  tenantId         String
  juntaId          String      @unique
  candidateVotes   Int         @default(0)
  rivalVotes       Int         @default(0)
  otherVotes       Int         @default(0)
  blankVotes       Int         @default(0)
  nullVotes        Int         @default(0)
  totalVoters      Int         @default(0)
  photoUrl         String?     @db.LongText
  status           ActaStatus  @default(DIGITADA)
  hasInconsistency Boolean     @default(false)
  inconsistencyNote String?    @db.Text
  // ...
}
```

---

## 3. Coexistencia con el Modo GAD Municipal
- Mientras `campaignMode === true`, los accesos al Control Electoral se muestran destacados en el header del panel (`Día D`), en el banner principal y en el War Room.
- Si se desactiva el modo de campaña hacia **Modo GAD Municipal**, los enlaces electorales se ocultan limpiamente para mantener la interfaz 100% institucional.
