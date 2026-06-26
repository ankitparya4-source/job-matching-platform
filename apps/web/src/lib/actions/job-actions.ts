"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { LocationType, ExperienceLevel, JobStatus, Prisma } from "@prisma/client";

export async function createJob(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "RECRUITER") {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const company = formData.get("company") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const locationType = formData.get("locationType") as string;
  const salaryMin = Number(formData.get("salaryMin")) || null;
  const salaryMax = Number(formData.get("salaryMax")) || null;
  const experienceLevel = formData.get("experienceLevel") as string;
  const skillsRaw = formData.get("skills") as string;

  if (!title || !company || !description) {
    throw new Error("Title, company, and description are required");
  }

  const job = await prisma.job.create({
    data: {
      recruiterId: session.user.id,
      title,
      company,
      description,
      location: location || null,
      locationType: (locationType as LocationType) || "ONSITE",
      salaryMin,
      salaryMax,
      experienceLevel: (experienceLevel as ExperienceLevel) || "MID",
      status: "OPEN",
    },
  });

  if (skillsRaw) {
    const skillNames = skillsRaw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

    for (const name of skillNames) {
      const skill = await prisma.skill.upsert({
        where: { name },
        update: {},
        create: { name },
      });

      await prisma.jobSkill.create({
        data: { jobId: job.id, skillId: skill.id },
      });
    }
  }

  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  redirect("/jobs");
}

export async function updateJobStatus(jobId: string, status: string) {
  const validStatuses: JobStatus[] = ["DRAFT", "OPEN", "CLOSED", "FILLED"];
  if (!validStatuses.includes(status as JobStatus)) {
    throw new Error("Invalid status");
  }

  const session = await auth();
  if (!session?.user || session.user.role !== "RECRUITER") {
    throw new Error("Unauthorized");
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.recruiterId !== session.user.id) {
    throw new Error("Job not found or unauthorized");
  }

  await prisma.job.update({
    where: { id: jobId },
    data: { status: status as JobStatus },
  });

  revalidatePath("/jobs");
  revalidatePath("/dashboard");
}

export async function getJobs(filters?: {
  search?: string;
  locationType?: string;
  experienceLevel?: string;
  minSalary?: number;
}) {
  const where: Prisma.JobWhereInput = { status: "OPEN" };

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { company: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.locationType) {
    where.locationType = filters.locationType as LocationType;
  }

  if (filters?.experienceLevel) {
    where.experienceLevel = filters.experienceLevel as ExperienceLevel;
  }

  if (filters?.minSalary) {
    where.salaryMax = { gte: filters.minSalary };
  }

  return prisma.job.findMany({
    where,
    include: {
      recruiter: { select: { name: true } },
      skills: { include: { skill: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getJobById(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: {
      recruiter: { select: { name: true, email: true } },
      skills: { include: { skill: true } },
      _count: { select: { applications: true } },
    },
  });
}

export async function getRecruiterJobs() {
  const session = await auth();
  if (!session?.user || session.user.role !== "RECRUITER") {
    throw new Error("Unauthorized");
  }

  return prisma.job.findMany({
    where: { recruiterId: session.user.id },
    include: {
      skills: { include: { skill: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteJob(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "RECRUITER") {
    throw new Error("Unauthorized");
  }

  const job = await prisma.job.findUnique({
    where: { id },
    select: { recruiterId: true },
  });

  if (!job || job.recruiterId !== session.user.id) {
    throw new Error("Job not found or unauthorized");
  }

  await prisma.job.delete({
    where: { id },
  });

  revalidatePath("/jobs");
  revalidatePath("/dashboard");
}

export async function editJob(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "RECRUITER") {
    throw new Error("Unauthorized");
  }

  const job = await prisma.job.findUnique({
    where: { id },
    select: { recruiterId: true },
  });

  if (!job || job.recruiterId !== session.user.id) {
    throw new Error("Job not found or unauthorized");
  }

  const title = formData.get("title") as string;
  const company = formData.get("company") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const locationType = formData.get("locationType") as string;
  const salaryMin = Number(formData.get("salaryMin")) || null;
  const salaryMax = Number(formData.get("salaryMax")) || null;
  const experienceLevel = formData.get("experienceLevel") as string;
  const status = formData.get("status") as string;
  const skillsRaw = formData.get("skills") as string;

  if (!title || !company || !description) {
    throw new Error("Title, company, and description are required");
  }

  await prisma.job.update({
    where: { id },
    data: {
      title,
      company,
      description,
      location: location || null,
      locationType: (locationType as LocationType) || "ONSITE",
      salaryMin,
      salaryMax,
      experienceLevel: (experienceLevel as ExperienceLevel) || "MID",
      status: (status as JobStatus) || "OPEN",
    },
  });

  if (skillsRaw !== null && skillsRaw !== undefined) {
    const skillNames = skillsRaw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    
    // Delete old skills
    await prisma.jobSkill.deleteMany({ where: { jobId: id } });

    for (const name of skillNames) {
      const skill = await prisma.skill.upsert({
        where: { name },
        update: {},
        create: { name },
      });

      await prisma.jobSkill.create({
        data: { jobId: id, skillId: skill.id },
      });
    }
  }

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}