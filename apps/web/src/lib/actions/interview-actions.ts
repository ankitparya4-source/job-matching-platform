"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification-actions";

export async function scheduleInterview(
  applicationId: string,
  scheduledAt: string,
  durationMinutes: number,
  meetingLink?: string,
  notes?: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "RECRUITER") {
    throw new Error("Unauthorized");
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true, candidate: true },
  });

  if (!application || application.job.recruiterId !== session.user.id) {
    throw new Error("Application not found or unauthorized");
  }

  const interview = await prisma.interview.create({
    data: {
      applicationId,
      scheduledAt: new Date(scheduledAt),
      durationMinutes,
      meetingLink: meetingLink || null,
      notes: notes || null,
    },
  });

  const dateStr = new Date(scheduledAt).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  await createNotification(
    application.candidateId,
    "INTERVIEW_SCHEDULED",
    "Interview Scheduled",
    `Interview for ${application.job.title} on ${dateStr}`,
    `/applications`
  );

  revalidatePath(`/applicants/${application.jobId}`);
  return interview;
}

export async function getInterviewsForApplication(applicationId: string) {
  return prisma.interview.findMany({
    where: { applicationId },
    orderBy: { scheduledAt: "desc" },
  });
}

export async function getUpcomingInterviews() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const now = new Date();

  if (session.user.role === "CANDIDATE") {
    return prisma.interview.findMany({
      where: {
        application: { candidateId: session.user.id },
        scheduledAt: { gte: now },
        status: "SCHEDULED",
      },
      include: {
        application: {
          include: { job: { select: { title: true, company: true } } },
        },
      },
      orderBy: { scheduledAt: "asc" },
      take: 10,
    });
  }

  return prisma.interview.findMany({
    where: {
      application: { job: { recruiterId: session.user.id } },
      scheduledAt: { gte: now },
      status: "SCHEDULED",
    },
    include: {
      application: {
        include: {
          job: { select: { title: true, company: true } },
          candidate: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
    take: 10,
  });
}
