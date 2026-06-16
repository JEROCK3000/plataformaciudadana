"use server";

import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { writeLog } from "@/lib/logs";

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Credenciales incompletas." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    writeLog('SECURITY', 'AUTH', 'ANON', `Login fallido — usuario no encontrado: ${email}`);
    return { success: false, error: "Usuario o contraseña incorrectos." };
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    writeLog('SECURITY', 'AUTH', user.id, `Login fallido — contraseña incorrecta: ${email}`);
    return { success: false, error: "Usuario o contraseña incorrectos." };
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  writeLog('AUDIT', 'AUTH', user.id, `Login exitoso: ${email} [${user.role}]`);
  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  // Loguear quién hizo logout si podemos leer el token
  if (token) {
    const { verifyToken } = await import("@/lib/auth/jwt");
    const payload = verifyToken(token) as { email?: string; id?: string } | null;
    if (payload?.id) {
      writeLog('AUDIT', 'AUTH', payload.id, `Logout: ${payload.email}`);
    }
  }

  cookieStore.delete("admin_token");
  redirect("/login");
}
