"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function getRecommendedJobs() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    return [];
  }

  const resume = await prisma.resume.findUnique({
    where: { userId: session.user.id },
    include: {
      skills: { include: { skill: true } },
    },
  });

  if (!resume || resume.status !== "PARSED" || !resume.rawText) {
    return [];
  }

  const openJobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    include: {
      recruiter: { select: { name: true } },
      skills: { include: { skill: true } },
      _count: { select: { applications: true } },
    },
  });

  if (openJobs.length === 0) return [];

  const resumeSkills = resume.skills.map((rs) => rs.skill.name);

  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/matching/match/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_text: resume.rawText.slice(0, 3000),
        resume_skills: resumeSkills,
        jobs: openJobs.map((job) => ({
          title: job.title,
          company: job.company,
          description: job.description.slice(0, 2000),
          skills: job.skills.map((js) => js.skill.name),
        })),
      }),
    });

    if (!response.ok) return [];

    const result = await response.json();
    const matches = result.matches || [];

    return openJobs
      .map((job) => {
        const match = matches.find(
          (m: any) =>
            m.job_title === job.title && m.job_company === job.company
        );

        return {
          ...job,
          matchScore: match?.match?.total_score || 0,
          matchDetails: match?.match || null,
        };
      })
      .filter((j) => j.matchScore > 0.3)
      .sort((a, b) => b.matchScore - a.matchScore);
  } catch {
    return [];
  }
}

export async function getJobMatchScore(jobId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    return null;
  }

  const resume = await prisma.resume.findUnique({
    where: { userId: session.user.id },
    include: {
      skills: { include: { skill: true } },
    },
  });

  if (!resume || resume.status !== "PARSED" || !resume.rawText) {
    return null;
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      skills: { include: { skill: true } },
    },
  });

  if (!job) return null;

  const resumeSkills = resume.skills.map((rs) => rs.skill.name);
  const jobSkills = job.skills.map((js) => js.skill.name);

  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/matching/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_text: resume.rawText.slice(0, 3000),
        resume_skills: resumeSkills,
        job_title: job.title,
        job_company: job.company,
        job_description: job.description.slice(0, 2000),
        job_skills: jobSkills,
      }),
    });

    if (!response.ok) return null;

    const result = await response.json();
    return result.match || null;
  } catch {
    return null;
  }
}