"use server";

import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });
}

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { success: false, error: "Todos los campos son obligatorios." };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "Ya existe un usuario con este correo electrónico." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN"
      }
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return { success: false, error: "Ocurrió un error al crear el usuario." };
  }
}

export async function deleteUser(id: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user?.email === "admin@solinteec.com") {
      return { success: false, error: "No se puede eliminar la cuenta maestra de Solinteec." };
    }

    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return { success: false, error: "Ocurrió un error al eliminar el usuario." };
  }
}
