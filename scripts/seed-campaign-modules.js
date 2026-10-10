const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findFirst({
    where: { slug: 'quijos' }
  });

  if (!tenant) {
    console.error('Tenant quijos not found');
    return;
  }

  console.log('Seeding campaign data for tenant:', tenant.name, tenant.id);

  // 1. Escenario Base Oficial de Victoria
  const existingScenario = await prisma.campaignScenario.findFirst({
    where: { tenantId: tenant.id }
  });

  if (!existingScenario) {
    const scenario = await prisma.campaignScenario.create({
      data: {
        tenantId: tenant.id,
        name: 'Escenario Estratégico Seccionales 2026 (Umbral Óptimo)',
        description: 'Modelo de umbral matemático calculado para victoria en 1 sola vuelta con 4 listas en disputa en Quijos.',
        expectedTurnoutRate: 85.5,
        nullBlankRate: 11.0,
        targetCandidateVotes: 1850,
        isDefault: true,
        parishGoals: {
          'Baeza': { electors: 1980, juntas: 7, targetVotes: 660, targetPct: 39.0 },
          'San Francisco de Borja': { electors: 1720, juntas: 6, targetVotes: 580, targetPct: 39.4 },
          'Papallacta': { electors: 680, juntas: 2, targetVotes: 220, targetPct: 37.8 },
          'Cuyuja': { electors: 520, juntas: 2, targetVotes: 165, targetPct: 37.2 },
          'Cosanga': { electors: 510, juntas: 2, targetVotes: 155, targetPct: 35.6 },
          'Sumaco': { electors: 328, juntas: 1, targetVotes: 110, targetPct: 39.1 }
        },
        rivalEstimates: [
          { candidate: 'Brandon Aliaga', party: 'PSC 6 - PK 18', estimatedVotes: 1890, estimatedPct: 43.3 },
          { candidate: 'Renán Balladares', party: 'ADN Lista 7', estimatedVotes: 1395, estimatedPct: 32.0 },
          { candidate: 'Kerlyn Ruiz', party: 'Alianza 3-8 / PSP', estimatedVotes: 690, estimatedPct: 15.8 },
          { candidate: 'William Guerrero', party: 'Unidos por Quijos', estimatedVotes: 388, estimatedPct: 8.9 }
        ]
      }
    });
    console.log('Created CampaignScenario:', scenario.name);
  }

  // 2. Actividades Territoriales
  const countActivities = await prisma.campaignActivity.count({
    where: { tenantId: tenant.id }
  });

  if (countActivities === 0) {
    const now = new Date();
    const act1 = await prisma.campaignActivity.create({
      data: {
        tenantId: tenant.id,
        title: 'Gran Caminata y Diálogo Vecinal: Barrio Central y Mercado',
        type: 'CAMINATA',
        parish: 'Baeza',
        sector: 'Baeza Colonial y Mercado Municipal',
        date: new Date(now.getTime() + 86400000 * 2), // en 2 días
        status: 'CONFIRMADA',
        responsibleName: 'Ing. Carlos Morales (Avanzada)',
        responsiblePhone: '0984123456',
        meetingPoint: 'Plaza Cívica de Baeza',
        estimatedAttendees: 150,
        logisticsNotes: '200 banderas listas, 500 trípticos con propuestas de agua potable y turismo, 1 megáfono recargable.',
        speechFocus: 'Compromiso directo con la mejora de la red de agua potable y la reactivación turística de Baeza Colonial.',
        relatedCategory: 'WATER'
      }
    });

    const act2 = await prisma.campaignActivity.create({
      data: {
        tenantId: tenant.id,
        title: 'Puerta a Puerta y Encuentro Comunitario con Productores de Leche',
        type: 'PUERTA_A_PUERTA',
        parish: 'San Francisco de Borja',
        sector: 'Sector El Recreo y Centro Parroquial',
        date: new Date(now.getTime() + 86400000 * 4), // en 4 días
        status: 'PLANIFICADA',
        responsibleName: 'Dra. Elena Silva (Coordinadora Borja)',
        responsiblePhone: '0995678901',
        meetingPoint: 'Frente al GAD Parroquial de Borja',
        estimatedAttendees: 80,
        logisticsNotes: 'Volantes con código QR, 100 sombreros con distintivo de campaña, refrigerio para brigadistas.',
        speechFocus: 'Vialidad rural para el transporte de leche, apoyo a ganaderos y luminarias en vías secundarias.',
        relatedCategory: 'INFRASTRUCTURE'
      }
    });

    const act3 = await prisma.campaignActivity.create({
      data: {
        tenantId: tenant.id,
        title: 'Mitin y Caravana de la Victoria Quijos 2026',
        type: 'CARAVANA',
        parish: 'Papallacta',
        sector: 'Av. Interoceánica y Zona de Termas',
        date: new Date(now.getTime() + 86400000 * 7),
        status: 'PLANIFICADA',
        responsibleName: 'Msc. Rodrigo Andrade',
        responsiblePhone: '0992345678',
        meetingPoint: 'Entrada a las Termas de Papallacta',
        estimatedAttendees: 200,
        logisticsNotes: 'Equipo de sonido móvil, 40 vehículos confirmados, distintivos reflectivos para seguridad vial.',
        speechFocus: 'Turismo sostenible, impulso a emprendedores locales y facilidades para transportistas.',
        relatedCategory: 'SERVICES'
      }
    });
    console.log('Created 3 CampaignActivities');
  }

  // 3. Padrón Electoral Muestra
  const countVoters = await prisma.voterRoll.count({
    where: { tenantId: tenant.id }
  });

  if (countVoters === 0) {
    const recintos = await prisma.electoralRecinto.findMany({
      where: { tenantId: tenant.id },
      include: { juntas: true }
    });

    const recintoMap = {};
    for (const r of recintos) {
      recintoMap[r.parish] = r;
    }

    const sampleVoters = [
      {
        cedula: '1500458921',
        fullName: 'Guamán Tanguila Marcelo Javier',
        parish: 'Baeza',
        neighborhood: 'Barrio Central',
        phone: '0987654321',
        commitmentLevel: 'SEGURO',
        needsTransport: false,
        hasVoted: true,
        votedAt: new Date(),
        juntaNumber: 1,
        gender: 'MASCULINO'
      },
      {
        cedula: '1500781290',
        fullName: 'Vargas Alomoto María Carmen',
        parish: 'Baeza',
        neighborhood: 'Baeza Antigua',
        phone: '0991234876',
        commitmentLevel: 'SEGURO',
        needsTransport: true,
        transportAddress: 'Sector Mirador, Calle 3ra casa azul',
        volunteerAssigned: 'Tito Veloz (Camioneta 14)',
        hasVoted: false,
        juntaNumber: 2,
        gender: 'FEMENINO'
      },
      {
        cedula: '1500334412',
        fullName: 'Chávez Proaño Edwin Gonzalo',
        parish: 'San Francisco de Borja',
        neighborhood: 'Barrio El Rosal',
        phone: '0994321890',
        commitmentLevel: 'SEGURO',
        needsTransport: false,
        hasVoted: false,
        juntaNumber: 1,
        gender: 'MASCULINO'
      },
      {
        cedula: '1500892301',
        fullName: 'Benalcázar Lara Silvia Patricia',
        parish: 'San Francisco de Borja',
        neighborhood: 'Centro de Borja',
        phone: '0983456712',
        commitmentLevel: 'SEGURO',
        needsTransport: false,
        hasVoted: true,
        votedAt: new Date(),
        juntaNumber: 3,
        gender: 'FEMENINO'
      },
      {
        cedula: '1500129087',
        fullName: 'Shiguango Andy José Vicente',
        parish: 'Sumaco',
        neighborhood: 'Salahonda',
        phone: '0998765432',
        commitmentLevel: 'SEGURO',
        needsTransport: true,
        transportAddress: 'Km 3 vía Sumaco, finca La Esperanza',
        volunteerAssigned: 'Javier Andy (Mototaxi)',
        hasVoted: false,
        juntaNumber: 1,
        gender: 'MIXTO'
      },
      {
        cedula: '1500654318',
        fullName: 'Paredes Cárdenas Nancy Elizabeth',
        parish: 'Papallacta',
        neighborhood: 'Barrio Las Termas',
        phone: '0978901234',
        commitmentLevel: 'SEGURO',
        needsTransport: false,
        hasVoted: false,
        juntaNumber: 1,
        gender: 'FEMENINO'
      },
      {
        cedula: '1500987654',
        fullName: 'Morocho Yánez Washington Bolívar',
        parish: 'Cosanga',
        neighborhood: 'Vía al Río Cosanga',
        phone: '0996781234',
        commitmentLevel: 'PROBABLE',
        needsTransport: false,
        hasVoted: false,
        juntaNumber: 2,
        gender: 'MASCULINO'
      },
      {
        cedula: '1500345678',
        fullName: 'Montenegro Ruíz Gladys Beatriz',
        parish: 'Cuyuja',
        neighborhood: 'Centro de Cuyuja',
        phone: '0981234908',
        commitmentLevel: 'SEGURO',
        needsTransport: false,
        hasVoted: true,
        votedAt: new Date(),
        juntaNumber: 1,
        gender: 'FEMENINO'
      }
    ];

    for (const v of sampleVoters) {
      const rec = recintoMap[v.parish];
      const junta = rec?.juntas?.find(j => j.juntaNumber === v.juntaNumber);
      await prisma.voterRoll.create({
        data: {
          tenantId: tenant.id,
          cedula: v.cedula,
          fullName: v.fullName,
          parish: v.parish,
          recintoId: rec?.id || null,
          juntaId: junta?.id || null,
          juntaNumber: v.juntaNumber,
          gender: v.gender,
          phone: v.phone,
          neighborhood: v.neighborhood,
          commitmentLevel: v.commitmentLevel,
          needsTransport: v.needsTransport,
          transportAddress: v.transportAddress,
          volunteerAssigned: v.volunteerAssigned,
          hasVoted: v.hasVoted,
          votedAt: v.votedAt || null
        }
      });
    }
    console.log('Created sample VoterRoll records');
  }

  console.log('Seed completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
