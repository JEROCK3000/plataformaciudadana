import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getParishCode(parish: string): string {
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

  const words = clean.split(/\s+/).filter(w => !['DE', 'DEL', 'LA', 'EL', 'LOS', 'LAS', 'Y'].includes(w));
  if (words.length >= 3) {
    return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  }
  if (words.length === 2) {
    return (words[0].substring(0, 2) + words[1][0]).toUpperCase();
  }
  return clean.replace(/[^A-Z]/g, '').substring(0, 3).padEnd(3, 'X');
}

async function main() {
  const reports = await prisma.report.findMany({
    include: { tenant: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Encontrados ${reports.length} reportes para actualizar códigos.`);

  for (const r of reports) {
    const canton = (r.tenant?.slug || 'qui').substring(0, 3).toUpperCase();
    const parishCode = getParishCode(r.parish);
    const year = r.createdAt ? new Date(r.createdAt).getFullYear() : 2026;

    let seq = '0001';
    if (r.ticketCode) {
      const parts = r.ticketCode.split('-');
      const last = parts[parts.length - 1];
      if (/^\d+$/.test(last)) {
        seq = last.padStart(4, '0');
      }
    }

    const newCode = `${canton}-${parishCode}-${year}-${seq}`;
    console.log(`Reporte [${r.parish}]: ${r.ticketCode} -> ${newCode}`);

    await prisma.report.update({
      where: { id: r.id },
      data: { ticketCode: newCode },
    });
  }

  console.log('Migración de códigos parroquiales completada.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
