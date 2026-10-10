# Plan de Ejecución: Módulos de Nueva Generación para Campaña y Transición GAD

## Objetivo General
Elevar la plataforma tecnológica de la candidatura a la Alcaldía de Quijos (**Brandon Aliaga • Alianza PSC 6 - Pachakutik 18**) para convertirla en el centro neurálgico electoral más avanzado de la provincia de Napo, optimizando la captura del voto, la fiscalización de mesas y la transición ordenada hacia el GAD Municipal.

---

## 1. Módulo 1: Calculadora del Umbral de Victoria (Electoral Math Engine)

### Diagnóstico Técnico y Político:
* **Universo electoral de Quijos:** **5.738 electores empadronados** distribuidos en 20 Juntas Receptoras del Voto (6 recintos).
* **Escenario de 4 candidatos:**
  1. Brandon Aliaga (PSC 6 - Pachakutik 18)
  2. Renán Balladares (ADN 7)
  3. Aracely Ruiz (Alianza 3-8 / PSP)
  4. William Guerrero (Unidos por Quijos)
* **Matemática de victoria:** Con 4 listas en contienda y un ausentismo promedio del 15% (votan ~4.870 ciudadanos), la alcaldía se gana con el **38% al 42% de los votos válidos** (aproximadamente **1.850 a 2.050 votos**).

### Especificaciones de Software:
1. **Ruta:** `/admin/calculadora-victoria`
2. **Controles Interactivos:**
   * Slider dinámico de *Participación Estimada* (75% a 92%).
   * Slider de *Meta de Victoria* (35% a 48% de votos válidos).
   * Desglose automático por parroquia:
     * **Baeza (1.980 electores):** Meta sugerida ~760 votos.
     * **San Francisco de Borja (1.720 electores):** Meta sugerida ~680 votos.
     * **Papallacta (680 electores):** Meta sugerida ~270 votos.
     * **Cuyuja (520 electores):** Meta sugerida ~170 votos.
     * **Cosanga (510 electores):** Meta sugerida ~150 votos.
     * **Sumaco (328 electores):** Meta sugerida ~60 votos.
3. **Simulador de Fuga de Votos de Rivales:**
   * Ajustar proyecciones de Renán Balladares, Aracely Ruiz y William Guerrero para ver cómo se redistribuyen las ventajas en tiempo real.
4. **Exportación Ejecutiva:** Botón para generar ficha ejecutiva en PDF para reuniones del comando de campaña.

---

## 2. Módulo 2: Agenda Táctica de Territorio y Caminatas

### Diagnóstico:
El candidato y las brigadas visitan barrios y comunidades, pero muchas veces el discurso y los compromisos no coinciden con las quejas reales que los ciudadanos ya reportaron en la plataforma.

### Especificaciones de Software:
1. **Ruta:** `/admin/agenda-territorial`
2. **Funcionalidades:**
   * **Calendario de Hitos:** Registro de caminatas, reuniones con gremios (ganaderos, transportistas, turismo), mítines y visitas puerta a puerta.
   * **Alimentación Automática de Inteligencia:** Al agendar una visita en *San Francisco de Borja*, la ficha del evento extrae automáticamente:
     * Número de reportes ciudadanos recibidos en Borja.
     * Problema #1 del sector (ej. Vialidad rural o alcantarillado).
     * Lista de los 5 vecinos más activos que reportaron incidencias, con botón directo de WhatsApp para invitarlos a la asamblea.
   * **Ficha Imprimible de Tarima:** Hoja resumen en formato A4 con las 3 propuestas clave que el candidato debe pronunciar en esa visita.

---

## 3. Módulo 3: Importador y Chequeo del Padrón CNE (Día D Voto a Voto)

### Diagnóstico:
Por mandato del Código de la Democracia (Art. 21 y 90), la Delegación Provincial de Napo entrega a la alianza el archivo digital oficial del padrón cantonal en Excel.

### Especificaciones de Software:
1. **Ruta:** `/admin/padron-electoral`
2. **Funcionalidades:**
   * **Drag & Drop de Archivo Excel:** Carga del archivo oficial entregado por el CNE con mapeo de columnas (Cédula, Nombres, Recinto, Junta, Género).
   * **Buscador Instantáneo de Electores:**
     * En móvil o laptop, el brigadista escribe el apellido o cédula y el sistema le indica en 1 segundo: *Mesa #2 Femenino en U.E. Juan Bautista Montini*.
   * **Checklist de "Voto Emitido" en Vivo (Tick de Asistencia):**
     * Los delegados de mesa pueden marcar qué simpatizantes ya votaron a las 10:00, 13:00 y 15:00, alertando a la movilización de transporte sobre quiénes aún faltan de acudir a las urnas.

---

## 4. Cronograma de Implementación

| Fase | Módulo | Entregable Técnico | Estado |
|---|---|---|:---:|
| **Fase 1** | **Header Unificado & Rediseño UI** | Barra de navegación en 1 sola línea con cápsula táctica | **En Ejecución** |
| **Fase 2** | **Calculadora de Umbral de Victoria** | Simulador con sliders y metas por parroquia | Siguiente paso |
| **Fase 3** | **Agenda Territorial Inteligente** | Calendario de eventos conectado a reportes | Siguiente paso |
| **Fase 4** | **Importador Padrón CNE Día D** | Carga masiva de Excel y buscador de votantes | Siguiente paso |
