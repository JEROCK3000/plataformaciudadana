/**
 * Obtiene el código estándar de 3 letras para una parroquia.
 * Ejemplos:
 * - San Francisco de Borja -> SFB
 * - Cuyuja -> CUY
 * - Baeza -> BAE
 * - Papallacta -> PAP
 * - Cosanga -> COS
 * - Sumaco -> SUM
 */
export function getParishCode(parish: string): string {
  if (!parish) return 'CAN';
  const clean = parish.trim().toUpperCase();

  const parishMap: Record<string, string> = {
    'SAN FRANCISCO DE BORJA': 'SFB',
    'BORJA': 'SFB',
    'BAEZA': 'BAE',
    'CUYUJA': 'CUY',
    'PAPALLACTA': 'PAP',
    'COSANGA': 'COS',
    'SUMACO': 'SUM',
  };

  if (parishMap[clean]) return parishMap[clean];

  // Algoritmo dinámico para cualquier otra parroquia de Ecuador
  const words = clean.split(/\s+/).filter(w => !['DE', 'DEL', 'LA', 'EL', 'LOS', 'LAS', 'Y'].includes(w));
  if (words.length >= 3) {
    return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  }
  if (words.length === 2) {
    return (words[0].substring(0, 2) + words[1][0]).toUpperCase();
  }
  return clean.replace(/[^A-Z]/g, '').substring(0, 3).padEnd(3, 'X');
}
