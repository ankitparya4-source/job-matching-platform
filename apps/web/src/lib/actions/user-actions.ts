"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfile(name: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!name || name.trim().length < 2) {
    throw new Error("Name must be at least 2 characters");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name.trim() },
  });

  revalidatePath("/");
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) throw new Error("User not found");

  const isValid = await compare(currentPassword, user.passwordHash);
  if (!isValid) throw new Error("Current password is incorrect");

  const hashedPassword = await hash(newPassword, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: hashedPassword },
  });
}
