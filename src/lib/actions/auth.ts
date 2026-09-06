"use server";

import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { writeLog } from "@/lib/logs";
import { TokenPayload } from "@/lib/auth/session";

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Credenciales incompletas." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true },
  });

  if (!user) {
    writeLog('SECURITY', 'AUTH', 'ANON', `Login fallido — usuario no encontrado: ${email}`);
    return { success: false, error: "Usuario o contraseña incorrectos." };
  }

  // Verificar si el tenant del usuario está activo
  if (user.tenantId && user.tenant && !user.tenant.isActive) {
    writeLog('SECURITY', user.tenant.slug, user.id, `Intento de acceso a tenant inactivo: ${email}`);
    return { success: false, error: "La cuenta de este municipio se encuentra inactiva o suspendida." };
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    writeLog('SECURITY', user.tenant?.slug || 'GLOBAL', user.id, `Login fallido — contraseña incorrecta: ${email}`);
    return { success: false, error: "Usuario o contraseña incorrectos." };
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  });

  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  writeLog('AUDIT', user.tenant?.slug || 'GLOBAL', user.id, `Login exitoso: ${email} [${user.role}]`);

  if (user.role === 'SUPERADMIN') {
    redirect("/superadmin");
  } else {
    redirect("/admin");
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (token) {
    const payload = verifyToken(token) as TokenPayload | null;
    if (payload?.id) {
      writeLog('AUDIT', payload.tenantId ? 'TENANT' : 'GLOBAL', payload.id, `Logout: ${payload.email}`);
    }
  }

  cookieStore.delete("admin_token");
  cookieStore.delete("superadmin_tenant_override");
  redirect("/login");
}

export async function switchTenantOverrideAction(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return { success: false, error: 'No autorizado' };

  const payload = verifyToken(token) as TokenPayload | null;
  if (!payload || payload.role !== 'SUPERADMIN') {
    return { success: false, error: 'Acción permitida solo para Superadmin' };
  }

  cookieStore.set("superadmin_tenant_override", slug, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  writeLog('AUDIT', slug, payload.id, `Superadmin conmutó contexto al tenant: ${slug}`);
  return { success: true };
}
