"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function generateCoverLetter(jobId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    throw new Error("Unauthorized");
  }

  const resume = await prisma.resume.findUnique({
    where: { userId: session.user.id },
  });

  if (!resume?.rawText) {
    throw new Error("Please upload your resume first");
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("Job not found");

  const response = await fetch(`${AI_SERVICE_URL}/api/generate/cover-letter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      resume_text: resume.rawText.slice(0, 2000),
      job_title: job.title,
      job_company: job.company,
      job_description: job.description.slice(0, 1500),
      candidate_name: session.user.name,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate cover letter");
  }

  const data = await response.json();
  return data.cover_letter;
}
