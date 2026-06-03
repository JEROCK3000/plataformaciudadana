"use server";

import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Credenciales incompletas." };
  }

  // --- Crear admin solinteec si no existe ---
  let user = await prisma.user.findUnique({ where: { email: "admin@solinteec.com" } });
  
  if (!user) {
    const hashedPassword = await bcrypt.hash("Admin26+", 10);
    user = await prisma.user.create({
      data: {
        email: "admin@solinteec.com",
        password: hashedPassword,
        name: "Administrador Solinteec",
        role: "ADMIN",
      }
    });
  }
  // -------------------------------------------------------------

  user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, error: "Usuario o contraseña incorrectos." };
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return { success: false, error: "Usuario o contraseña incorrectos." };
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  
  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 // 1 dia
  });

  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/login");
}
