# Dictamen Técnico-Jurídico: Gestión de Competencias Viales y Blindaje ante Contraloría (CGE)

**Documento Oficial:** `SOLINTEEC_Gestion_Competencias_Viales_Blindaje_CGE.pdf`  
**Entidad:** SOLINTEEC DEVTECH S.A.S. — Área de Desarrollo Corporativo y de Gobierno  
**Marco Legal:** COOTAD (Arts. 42, 54, 55, 65, 130, 275), Constitución de la República del Ecuador (Art. 260), Ley Orgánica del Sistema Nacional de Infraestructura Vial.

---

## 1. El Dilema del Fiscalizador y el Riesgo de Glosas (CGE)

En el régimen municipal ecuatoriano, existe una marcada asimetría de información cívica: los ciudadanos desconocen la distribución competencial del Estado y reclaman al Alcalde y al GAD Municipal por cualquier daño vial, incluso si ocurre en la Red Vial Estatal (RVE) o en caminos de segundo orden rurales.

### Riesgos Críticos para Funcionarios y Fiscalizadores:
1. **Arrogación de Funciones y Malversación:** La Contraloría General del Estado (CGE) sanciona con **glosas solidarias y destitución** al Alcalde, Director de Obras Públicas y Fiscalizadores si se destinan recursos públicos (maquinaria, horas de operador, diésel o asfalto) en vías que no pertenecen al inventario cantonal, a menos que medie un Convenio de Concurrencia formal.
2. **Desgaste Político y Falsa Inacción:** Si el GAD simplemente descarta o no responde al ciudadano, la percepción pública asume abandono institucional.

---

## 2. Matriz Oficial de Competencias Viales en el Ecuador

| Nivel Vial | Entidad Competente | Marco Normativo | Régimen de Intervención Municipal |
| :--- | :--- | :--- | :--- |
| **Red Vial Estatal (RVE)** (Troncales y transversales, ej. E45) | **MTOP** (Ministerio de Transporte y Obras Públicas) | Ley del Sistema Nacional de Infraestructura Vial | **PROHIBIDO** el gasto directo. Requiere Convenio Específico de Delegación. |
| **Red Vial Provincial** (Vías rurales e interparroquiales) | **GAD Provincial** (Prefectura de Napo) | Art. 42 COOTAD (Competencia exclusiva provincial) | **NO intervenir** sin Convenio de Concurrencia (Art. 275 COOTAD). |
| **Red Vial Cantonal / Urbana** (Calles urbanas y cabeceras) | **GAD Municipal** (Municipio de Quijos) | Arts. 54 y 55 COOTAD | **COMPETENCIA DIRECTA.** Planificación, mantenimiento y fiscalización. |
| **Caminos Vecinales** (Sectores rurales comunitarios) | **GAD Parroquial Rural** | Art. 65 COOTAD | Coordinación concurrente mediante convenios o mingas parroquiales. |

---

## 3. Arquitectura Tecnológica: Geocercas (Geofencing GIS) y Alertas

La plataforma ciudadana implementa una estrategia de prevención en tres capas:

1. **Capa 1: Geocercas GIS con Buffer Vial:** Capa espacial que delimita la franja de derecho de vía de la Troncal Amazónica (E45) y los límites urbanos aprobados en el PUGS. Al fijar el pin en el mapa, el sistema detecta si la coordenada interseca con competencia externa.
2. **Capa 2: Alerta Preventiva en el Formulario:** Si la ubicación corresponde a vía estatal o provincial, el sistema muestra una advertencia transparente al ciudadano: *"Aviso Institucional: Este tramo corresponde a la Red Estatal del MTOP / Provincial. Tu reporte será formalmente derivado a la autoridad competente."*
3. **Capa 3: Etiquetado Automático en el Panel Administrativo:** El ticket no se mezcla con el bacheo municipal ordinario; se clasifica automáticamente como `[ALERTA DE COMPETENCIA EXTERNA]`.

---

## 4. Protocolo de Despacho y Derivación en 1 Clic

Desde la consola de Obras Públicas y Fiscalización:

* **Botón de Derivación Institucional:** En un clic, el técnico selecciona la entidad rectora (MTOP, Prefectura de Napo, Empresa Eléctrica, etc.).
* **Generación Automática de Oficio de Traslado:** El sistema genera un PDF institucional formal con folio único, coordenadas GPS y fotografías para remitir formalmente al Director Provincial del MTOP o al Prefecto Provincial.
* **Notificación Oficial Motivada al Ciudadano:** El ciudadano recibe un comprobante formal con fundamentación jurídica en los Arts. 54 y 55 del COOTAD y el número de oficio con el que el GAD Municipal exigió la reparación a la entidad rectora.
* **Excepción por Convenio de Concurrencia (Art. 275 COOTAD):** Si el Municipio tiene un convenio bipartito vigente, el técnico puede marcar la casilla `Atender bajo Convenio N.° XXXX`, habilitando el gasto de maquinaria con pleno respaldo legal auditable.

---

## 5. Entregables Generados

1. **Documento Ejecutivo PDF:** `docs/SOLINTEEC_Gestion_Competencias_Viales_Blindaje_CGE.pdf`
2. **Descarga Pública:** `public/downloads/SOLINTEEC_Gestion_Competencias_Viales_Blindaje_CGE.pdf`
