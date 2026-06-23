"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function uploadResume(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    throw new Error("Only candidates can upload resumes");
  }

  const file = formData.get("resume") as File;
  if (!file || !file.name.endsWith(".pdf")) {
    throw new Error("Please upload a PDF file");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File must be under 10MB");
  }

  // Save file locally
  const uploadDir = join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${session.user.id}-${Date.now()}.pdf`;
  const filePath = join(uploadDir, fileName);
  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  // Create or update resume record with PROCESSING status
  const resume = await prisma.resume.upsert({
    where: { userId: session.user.id },
    update: {
      fileName: file.name,
      filePath: filePath,
      fileSize: file.size,
      status: "PROCESSING",
      rawText: null,
      parsedData: Prisma.JsonNull,
    },
    create: {
      userId: session.user.id,
      fileName: file.name,
      filePath: filePath,
      fileSize: file.size,
      status: "PROCESSING",
    },
  });

  // Send to AI service for parsing
  try {
    const aiFormData = new FormData();
    aiFormData.append("file", file);

    const response = await fetch(`${AI_SERVICE_URL}/api/resume/parse`, {
      method: "POST",
      body: aiFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "AI service failed to parse resume");
    }

    const result = await response.json();
    const parsed = result.data;

    // Store parsed data
    await prisma.resume.update({
      where: { id: resume.id },
      data: {
        rawText: parsed.raw_text,
        parsedData: parsed,
        status: "PARSED",
      },
    });

    // Create skill records
    const allSkills = [
      ...parsed.skills.technical,
      ...parsed.skills.soft,
    ];

    // Clear existing resume skills
    await prisma.resumeSkill.deleteMany({
      where: { resumeId: resume.id },
    });

    for (const skillName of allSkills) {
      const skill = await prisma.skill.upsert({
        where: { name: skillName.toLowerCase() },
        update: {},
        create: {
          name: skillName.toLowerCase(),
          category: parsed.skills.technical.includes(skillName)
            ? "technical"
            : "soft",
        },
      });

      await prisma.resumeSkill.create({
        data: {
          resumeId: resume.id,
          skillId: skill.id,
          confidence: 1.0,
        },
      });
    }
  } catch (error: any) {
    await prisma.resume.update({
      where: { id: resume.id },
      data: { status: "FAILED" },
    });
    throw new Error(error.message || "Failed to parse resume");
  }

  revalidatePath("/dashboard");
  revalidatePath("/resume");
}

export async function getResume() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.resume.findUnique({
    where: { userId: session.user.id },
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });
}