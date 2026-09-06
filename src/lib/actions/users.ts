"use server";

import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireTenantAdmin, requireAuth } from "@/lib/auth/session";
import { writeLog } from "@/lib/logs";
import { Role } from "@prisma/client";

export async function getUsers() {
  const { session, tenantId } = await requireTenantAdmin();

  if (session.role === 'SUPERADMIN' && !session.tenantId) {
    // Si el superadmin no tiene override específico, lista usuarios del tenant actual seleccionado
    return await prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });
  }

  return await prisma.user.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      tenantId: true,
      createdAt: true,
    },
  });
}

export async function getAllGlobalUsers() {
  await requireAuth(['SUPERADMIN']);
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      tenantId: true,
      tenant: {
        select: { name: true, slug: true },
      },
      createdAt: true,
    },
  });
}

export async function createUser(formData: FormData) {
  const { session, tenantId } = await requireTenantAdmin();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as Role) || "ADMIN";

  if (!name || !email || !password) {
    return { success: false, error: "Todos los campos son obligatorios." };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "Ya existe un usuario con este correo electrónico." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Solo SUPERADMIN puede crear otros SUPERADMIN o asignar tenant libremente
    const targetTenantId = (session.role === 'SUPERADMIN' && role === 'SUPERADMIN') ? null : tenantId;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: session.role === 'SUPERADMIN' ? role : 'ADMIN',
        tenantId: targetTenantId,
      },
    });

    writeLog('AUDIT', session.tenantSlug || 'GLOBAL', session.id, `Usuario creado: ${newUser.email} [${newUser.role}]`);
    revalidatePath("/admin/users");
    revalidatePath("/superadmin/users");
    return { success: true };
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return { success: false, error: "Ocurrió un error al crear el usuario." };
  }
}

export async function deleteUser(id: string) {
  const { session, tenantId } = await requireTenantAdmin();

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { success: false, error: "Usuario no encontrado." };

    if (user.email === "superadmin@solinteec.com" || user.email === "admin@solinteec.com") {
      return { success: false, error: "No se pueden eliminar las cuentas maestras de Solinteec." };
    }

    // Si no es superadmin, solo puede borrar usuarios de su propio tenant
    if (session.role !== 'SUPERADMIN' && user.tenantId !== tenantId) {
      return { success: false, error: "No tiene permisos para eliminar este usuario." };
    }

    await prisma.user.delete({ where: { id } });
    writeLog('AUDIT', session.tenantSlug || 'GLOBAL', session.id, `Usuario eliminado: ${user.email}`);
    revalidatePath("/admin/users");
    revalidatePath("/superadmin/users");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return { success: false, error: "Ocurrió un error al eliminar el usuario." };
  }
}
