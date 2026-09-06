"use server";

import { prisma } from "@/lib/db/prisma";
import { writeLog } from "@/lib/logs";
import { requireAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function getActiveTenants() {
  try {
    return await prisma.tenant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        canton: true,
        province: true,
        logoUrl: true,
        parishes: true,
        _count: {
          select: { reports: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error("Error al obtener tenants activos:", error);
    return [];
  }
}

export async function getAllTenants() {
  await requireAuth(['SUPERADMIN']);
  try {
    return await prisma.tenant.findMany({
      include: {
        _count: {
          select: { reports: true, users: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error("Error al obtener todos los tenants:", error);
    return [];
  }
}

export async function getTenantBySlug(slug: string) {
  try {
    return await prisma.tenant.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { reports: true },
        },
      },
    });
  } catch (error) {
    console.error(`Error al buscar tenant ${slug}:`, error);
    return null;
  }
}

export async function createTenant(formData: FormData) {
  const session = await requireAuth(['SUPERADMIN']);

  const slug = (formData.get("slug") as string)?.trim().toLowerCase();
  const name = (formData.get("name") as string)?.trim();
  const canton = (formData.get("canton") as string)?.trim();
  const province = (formData.get("province") as string)?.trim() || 'Napo';
  const plan = (formData.get("plan") as string)?.trim() || 'PRO';
  const parishesRaw = (formData.get("parishes") as string)?.trim();
  const aiPromptMaster = (formData.get("aiPromptMaster") as string)?.trim() || null;

  if (!slug || !name || !canton) {
    return { success: false, error: "Slug, nombre y cantón son requeridos." };
  }

  // Parse parishes (coma separadas)
  const parishes = parishesRaw
    ? parishesRaw.split(',').map((p) => p.trim()).filter(Boolean)
    : [canton];

  try {
    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: `Ya existe un municipio con el slug '${slug}'.` };
    }

    const tenant = await prisma.tenant.create({
      data: {
        slug,
        name,
        canton,
        province,
        plan,
        parishes,
        aiPromptMaster,
        isActive: true,
      },
    });

    writeLog('AUDIT', tenant.slug, session.id, `Nuevo tenant creado: ${tenant.name} [${tenant.slug}]`);
    revalidatePath('/superadmin');
    revalidatePath('/superadmin/tenants');
    return { success: true, tenant };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    writeLog('ERROR', 'GLOBAL', session.id, `Error al crear tenant: ${msg}`);
    return { success: false, error: 'No se pudo crear el municipio.' };
  }
}

export async function toggleTenantStatus(tenantId: string) {
  const session = await requireAuth(['SUPERADMIN']);

  try {
    const current = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!current) return { success: false, error: 'Municipio no encontrado.' };

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: { isActive: !current.isActive },
    });

    writeLog('AUDIT', updated.slug, session.id, `Estado de tenant cambiado a: ${updated.isActive ? 'ACTIVO' : 'SUSPENDIDO'}`);
    revalidatePath('/superadmin');
    revalidatePath('/superadmin/tenants');
    return { success: true, isActive: updated.isActive };
  } catch (error) {
    console.error("Error al cambiar estado de tenant:", error);
    return { success: false, error: 'Error al cambiar estado' };
  }
}
