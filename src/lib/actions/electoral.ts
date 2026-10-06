"use server";

import { prisma } from "@/lib/db/prisma";
import { requireTenantAdmin } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { writeLog } from "@/lib/logs";
import { JuntaGender, DelegateStatus, ActaStatus } from "@prisma/client";

// Estructura por defecto para inicializar si está vacío
const QUIJOS_DEFAULT_RECINTOS = [
  {
    name: "Unidad Educativa Baeza",
    parish: "Baeza",
    address: "Av. de los Quijos y Calle 12 de Febrero",
    electors: 2100,
    coordinatorName: "Ing. Marco Andrade",
    coordinatorPhone: "0991234567",
    juntas: [
      { juntaNumber: 1, gender: "MASCULINO" as JuntaGender, electors: 350 },
      { juntaNumber: 2, gender: "MASCULINO" as JuntaGender, electors: 350 },
      { juntaNumber: 3, gender: "MASCULINO" as JuntaGender, electors: 350 },
      { juntaNumber: 1, gender: "FEMENINO" as JuntaGender, electors: 350 },
      { juntaNumber: 2, gender: "FEMENINO" as JuntaGender, electors: 350 },
      { juntaNumber: 3, gender: "FEMENINO" as JuntaGender, electors: 350 },
    ],
  },
  {
    name: "Colegio Nacional San Francisco de Borja",
    parish: "San Francisco de Borja",
    address: "Calle Principal y Pasaje San Francisco",
    electors: 1750,
    coordinatorName: "Lcda. Carmen Morales",
    coordinatorPhone: "0987654321",
    juntas: [
      { juntaNumber: 1, gender: "MASCULINO" as JuntaGender, electors: 350 },
      { juntaNumber: 2, gender: "MASCULINO" as JuntaGender, electors: 350 },
      { juntaNumber: 3, gender: "MASCULINO" as JuntaGender, electors: 350 },
      { juntaNumber: 1, gender: "FEMENINO" as JuntaGender, electors: 350 },
      { juntaNumber: 2, gender: "FEMENINO" as JuntaGender, electors: 350 },
    ],
  },
  {
    name: "Escuela de Educación Básica Ciudad de Baeza",
    parish: "Cuyuja",
    address: "Sector Central frente al Parque",
    electors: 700,
    coordinatorName: "Sr. Oswaldo Toapanta",
    coordinatorPhone: "0998877665",
    juntas: [
      { juntaNumber: 1, gender: "MASCULINO" as JuntaGender, electors: 350 },
      { juntaNumber: 1, gender: "FEMENINO" as JuntaGender, electors: 350 },
    ],
  },
  {
    name: "Unidad Educativa Cosanga",
    parish: "Cosanga",
    address: "Vía Interoceánica km 42",
    electors: 700,
    coordinatorName: "MSc. Gladys Velasteguí",
    coordinatorPhone: "0993344556",
    juntas: [
      { juntaNumber: 1, gender: "MASCULINO" as JuntaGender, electors: 350 },
      { juntaNumber: 1, gender: "FEMENINO" as JuntaGender, electors: 350 },
    ],
  },
  {
    name: "Escuela Básica Papallacta",
    parish: "Papallacta",
    address: "Calle de las Termas y Central",
    electors: 700,
    coordinatorName: "Sr. Fausto Guaña",
    coordinatorPhone: "0981122334",
    juntas: [
      { juntaNumber: 1, gender: "MASCULINO" as JuntaGender, electors: 350 },
      { juntaNumber: 1, gender: "FEMENINO" as JuntaGender, electors: 350 },
    ],
  },
];

export async function getElectoralDashboardData() {
  const { session, tenantId } = await requireTenantAdmin();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) throw new Error("Tenant no encontrado");

  // Verificar si hay recintos creados. Si no, inicializar la estructura base de Quijos
  let recintosCount = await prisma.electoralRecinto.count({
    where: { tenantId },
  });

  if (recintosCount === 0) {
    for (const r of QUIJOS_DEFAULT_RECINTOS) {
      const createdRecinto = await prisma.electoralRecinto.create({
        data: {
          tenantId,
          name: r.name,
          parish: r.parish,
          address: r.address,
          electors: r.electors,
          coordinatorName: r.coordinatorName,
          coordinatorPhone: r.coordinatorPhone,
        },
      });

      for (const j of r.juntas) {
        await prisma.electoralJunta.create({
          data: {
            tenantId,
            recintoId: createdRecinto.id,
            juntaNumber: j.juntaNumber,
            gender: j.gender,
            electors: j.electors,
            delegateStatus: "PENDIENTE",
          },
        });
      }
    }
    writeLog("INFO", tenant.slug, session.id, "Estructura electoral inicial de recintos creada automáticamente");
  }

  // Cargar todos los recintos con juntas y actas
  const recintos = await prisma.electoralRecinto.findMany({
    where: { tenantId },
    include: {
      juntas: {
        include: {
          acta: true,
        },
        orderBy: [{ juntaNumber: "asc" }, { gender: "asc" }],
      },
    },
    orderBy: { parish: "asc" },
  });

  // Estadísticas globales del Conteo Rápido
  let totalJuntas = 0;
  let digitizedJuntas = 0;
  let totalElectors = 0;
  let totalVotersProcessed = 0;
  let candidateVotes = 0;
  let rivalVotes = 0;
  let otherVotes = 0;
  let blankVotes = 0;
  let nullVotes = 0;
  let actasConInconsistencia = 0;

  interface ParishStat {
    parish: string;
    totalJuntas: number;
    digitizedJuntas: number;
    candidateVotes: number;
    rivalVotes: number;
    totalVotes: number;
    progressPct: number;
    winner: 'CANDIDATE' | 'RIVAL' | 'TIE' | 'NO_DATA';
  }

  const parishMap: Record<string, ParishStat> = {};

  const allActas: any[] = [];

  for (const r of recintos) {
    if (!parishMap[r.parish]) {
      parishMap[r.parish] = {
        parish: r.parish,
        totalJuntas: 0,
        digitizedJuntas: 0,
        candidateVotes: 0,
        rivalVotes: 0,
        totalVotes: 0,
        progressPct: 0,
        winner: 'NO_DATA',
      };
    }

    for (const j of r.juntas) {
      totalJuntas++;
      totalElectors += j.electors;
      parishMap[r.parish].totalJuntas++;

      if (j.acta) {
        digitizedJuntas++;
        parishMap[r.parish].digitizedJuntas++;

        const a = j.acta;
        candidateVotes += a.candidateVotes;
        rivalVotes += a.rivalVotes;
        otherVotes += a.otherVotes;
        blankVotes += a.blankVotes;
        nullVotes += a.nullVotes;
        totalVotersProcessed += a.totalVoters;

        parishMap[r.parish].candidateVotes += a.candidateVotes;
        parishMap[r.parish].rivalVotes += a.rivalVotes;
        parishMap[r.parish].totalVotes += a.candidateVotes + a.rivalVotes + a.otherVotes + a.blankVotes + a.nullVotes;

        if (a.hasInconsistency) {
          actasConInconsistencia++;
        }

        allActas.push({
          ...a,
          recintoName: r.name,
          parish: r.parish,
          juntaNumber: j.juntaNumber,
          gender: j.gender,
        });
      }
    }
  }

  // Calcular porcentajes y ganadores por parroquia
  const parishBreakdown = Object.values(parishMap).map((p) => {
    p.progressPct = p.totalJuntas > 0 ? Math.round((p.digitizedJuntas / p.totalJuntas) * 100) : 0;
    if (p.digitizedJuntas === 0) {
      p.winner = 'NO_DATA';
    } else if (p.candidateVotes > p.rivalVotes) {
      p.winner = 'CANDIDATE';
    } else if (p.rivalVotes > p.candidateVotes) {
      p.winner = 'RIVAL';
    } else {
      p.winner = 'TIE';
    }
    return p;
  });

  const validVotes = candidateVotes + rivalVotes + otherVotes;
  const grandTotal = validVotes + blankVotes + nullVotes;

  const candidatePct = grandTotal > 0 ? Number(((candidateVotes / grandTotal) * 100).toFixed(1)) : 0;
  const rivalPct = grandTotal > 0 ? Number(((rivalVotes / grandTotal) * 100).toFixed(1)) : 0;
  const otherPct = grandTotal > 0 ? Number(((otherVotes / grandTotal) * 100).toFixed(1)) : 0;
  const blankPct = grandTotal > 0 ? Number(((blankVotes / grandTotal) * 100).toFixed(1)) : 0;
  const nullPct = grandTotal > 0 ? Number(((nullVotes / grandTotal) * 100).toFixed(1)) : 0;

  const progressPct = totalJuntas > 0 ? Number(((digitizedJuntas / totalJuntas) * 100).toFixed(1)) : 0;
  const leadVotes = candidateVotes - rivalVotes;

  return {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      canton: tenant.canton,
      candidateName: tenant.candidateName || "Nuestro Candidato",
      campaignListNumber: tenant.campaignListNumber || "Lista Oficial",
      campaignSlogan: tenant.campaignSlogan || "Por el Cambio",
      candidatePhotoUrl: tenant.candidatePhotoUrl,
      partyLogoUrl: tenant.partyLogoUrl,
      citizenTermSingularM: tenant.citizenTermSingularM,
      citizenTermSingularF: tenant.citizenTermSingularF,
      citizenTermPlural: tenant.citizenTermPlural,
    },
    summary: {
      totalJuntas,
      digitizedJuntas,
      pendingJuntas: totalJuntas - digitizedJuntas,
      progressPct,
      totalElectors,
      totalVotersProcessed,
      participationPct: totalElectors > 0 ? Number(((totalVotersProcessed / totalElectors) * 100).toFixed(1)) : 0,
      candidateVotes,
      candidatePct,
      rivalVotes,
      rivalPct,
      otherVotes,
      otherPct,
      blankVotes,
      blankPct,
      nullVotes,
      nullPct,
      leadVotes,
      actasConInconsistencia,
    },
    parishBreakdown,
    recintos,
    allActas: allActas.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  };
}

export async function saveElectoralActa(formData: FormData) {
  const { session, tenantId } = await requireTenantAdmin();

  const juntaId = formData.get("juntaId") as string;
  const candidateVotes = parseInt((formData.get("candidateVotes") as string) || "0", 10);
  const rivalVotes = parseInt((formData.get("rivalVotes") as string) || "0", 10);
  const otherVotes = parseInt((formData.get("otherVotes") as string) || "0", 10);
  const blankVotes = parseInt((formData.get("blankVotes") as string) || "0", 10);
  const nullVotes = parseInt((formData.get("nullVotes") as string) || "0", 10);
  const photoUrl = (formData.get("photoUrl") as string)?.trim() || null;
  const digitizedBy = (formData.get("digitizedBy") as string)?.trim() || session.email;

  if (!juntaId) {
    return { success: false, error: "Junta Receptora del Voto requerida." };
  }

  const junta = await prisma.electoralJunta.findUnique({
    where: { id: juntaId },
    include: { recinto: true },
  });

  if (!junta || junta.tenantId !== tenantId) {
    return { success: false, error: "Junta no encontrada o no autorizada." };
  }

  const totalVoters = candidateVotes + rivalVotes + otherVotes + blankVotes + nullVotes;
  let hasInconsistency = false;
  let inconsistencyNote: string | null = null;

  // Validación: si los votos totales superan los electores empadronados en esa mesa
  if (totalVoters > junta.electors) {
    hasInconsistency = true;
    inconsistencyNote = `Alerta matemática: Total sufragantes (${totalVoters}) excede el padrón asignado de la mesa (${junta.electors}).`;
  }

  const acta = await prisma.electoralActa.upsert({
    where: { juntaId },
    create: {
      tenantId,
      juntaId,
      candidateVotes,
      rivalVotes,
      otherVotes,
      blankVotes,
      nullVotes,
      totalVoters,
      photoUrl,
      status: hasInconsistency ? "IMPUGNADA" : "DIGITADA",
      hasInconsistency,
      inconsistencyNote,
      digitizedBy,
    },
    update: {
      candidateVotes,
      rivalVotes,
      otherVotes,
      blankVotes,
      nullVotes,
      totalVoters,
      photoUrl: photoUrl || undefined,
      status: hasInconsistency ? "IMPUGNADA" : "VERIFICADA",
      hasInconsistency,
      inconsistencyNote,
      digitizedBy,
    },
  });

  writeLog(
    "AUDIT",
    session.id,
    tenantId,
    `Acta guardada para ${junta.recinto.name} - Mesa ${junta.juntaNumber} (${junta.gender}): Candidato=${candidateVotes}, Rival=${rivalVotes}, Total=${totalVoters} (Inconsistencia: ${hasInconsistency})`
  );

  revalidatePath("/admin/control-electoral");
  revalidatePath("/admin/war-room");

  return { success: true, actaId: acta.id, hasInconsistency };
}

export async function updateDelegate(formData: FormData) {
  const { session, tenantId } = await requireTenantAdmin();

  const juntaId = formData.get("juntaId") as string;
  const delegateName = (formData.get("delegateName") as string)?.trim() || null;
  const delegatePhone = (formData.get("delegatePhone") as string)?.trim() || null;
  const delegateStatus = (formData.get("delegateStatus") as DelegateStatus) || "PENDIENTE";

  if (!juntaId) return { success: false, error: "ID de mesa no especificado." };

  await prisma.electoralJunta.update({
    where: { id: juntaId },
    data: {
      delegateName,
      delegatePhone,
      delegateStatus,
    },
  });

  writeLog("INFO", session.id, tenantId, `Veedor de mesa actualizado: Junta ${juntaId} -> ${delegateName || 'Sin asignar'} (${delegateStatus})`);

  revalidatePath("/admin/control-electoral");
  return { success: true };
}
