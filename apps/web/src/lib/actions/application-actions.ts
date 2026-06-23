"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ApplicationStatus } from "@prisma/client";
import { getJobMatchScore } from "./matching-actions";
import { createNotification } from "./notification-actions";

export async function applyToJob(jobId: string, coverLetter?: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    throw new Error("Only candidates can apply to jobs");
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "OPEN") {
    throw new Error("Job is no longer available");
  }

  const existing = await prisma.application.findUnique({
    where: {
      candidateId_jobId: {
        candidateId: session.user.id,
        jobId,
      },
    },
  });

  if (existing) {
    throw new Error("You have already applied to this job");
  }

  let matchScore: number | null = null;
  let matchDetails: any = null;

  try {
    const match = await getJobMatchScore(jobId);
    if (match) {
      matchScore = match.total_score;
      matchDetails = match;
    }
  } catch {
    // Non-blocking — apply even if AI service is down
  }

  await prisma.application.create({
    data: {
      candidateId: session.user.id,
      jobId,
      coverLetter: coverLetter || null,
      status: "APPLIED",
      matchScore,
      matchDetails,
    },
  });

  await createNotification(
    job.recruiterId,
    "NEW_APPLICATION",
    "New Application",
    `${session.user.name} applied to ${job.title}`,
    `/applicants/${jobId}`
  );

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/applications");
  revalidatePath("/dashboard");
}

export async function getCandidateApplications() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.application.findMany({
    where: { candidateId: session.user.id },
    include: {
      job: {
        include: {
          recruiter: { select: { name: true } },
          skills: { include: { skill: true } },
        },
      },
    },
    orderBy: { appliedAt: "desc" },
  });
}

export async function getJobApplicants(jobId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "RECRUITER") {
    throw new Error("Unauthorized");
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.recruiterId !== session.user.id) {
    throw new Error("Job not found or unauthorized");
  }

  return prisma.application.findMany({
    where: { jobId },
    include: {
      candidate: { select: { id: true, name: true, email: true } },
    },
    orderBy: { appliedAt: "desc" },
  });
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string
) {
  const validStatuses: ApplicationStatus[] = [
    "APPLIED", "REVIEWED", "SHORTLISTED", "INTERVIEW",
    "OFFERED", "HIRED", "REJECTED", "WITHDRAWN"
  ];
  if (!validStatuses.includes(status as ApplicationStatus)) {
    throw new Error("Invalid status");
  }

  const session = await auth();
  if (!session?.user || session.user.role !== "RECRUITER") {
    throw new Error("Unauthorized");
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });

  if (!application || application.job.recruiterId !== session.user.id) {
    throw new Error("Application not found or unauthorized");
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: status as ApplicationStatus },
  });

  const statusLabels: Record<string, string> = {
    REVIEWED: "is being reviewed",
    SHORTLISTED: "has been shortlisted",
    INTERVIEW: "moved to interview stage",
    OFFERED: "received an offer",
    HIRED: "— congratulations, you're hired",
    REJECTED: "was not selected",
  };

  const label = statusLabels[status] || "has been updated";
  await createNotification(
    application.candidateId,
    "STATUS_CHANGE",
    "Application Update",
    `Your application for ${application.job.title} ${label}`,
    `/applications`
  );

  revalidatePath(`/applicants/${application.jobId}`);
  revalidatePath("/dashboard");
}