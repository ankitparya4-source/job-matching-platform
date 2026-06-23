"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getRecruiterAnalytics() {
  const session = await auth();
  if (!session?.user || session.user.role !== "RECRUITER") {
    throw new Error("Unauthorized");
  }

  const jobs = await prisma.job.findMany({
    where: { recruiterId: session.user.id },
    include: {
      applications: true,
      skills: { include: { skill: true } },
    },
  });

  const allApplications = jobs.flatMap((j) => j.applications);

  // 1. Hiring Funnel
  const funnelData = [
    { name: "Applied", count: allApplications.filter(a => a.status === "APPLIED").length },
    { name: "Reviewed", count: allApplications.filter(a => a.status === "REVIEWED").length },
    { name: "Shortlisted", count: allApplications.filter(a => a.status === "SHORTLISTED").length },
    { name: "Interview", count: allApplications.filter(a => a.status === "INTERVIEW").length },
    { name: "Offered", count: allApplications.filter(a => a.status === "OFFERED").length },
    { name: "Hired", count: allApplications.filter(a => a.status === "HIRED").length },
  ];

  // 2. Application Trends (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentApps = allApplications.filter(a => new Date(a.createdAt) >= thirtyDaysAgo);
  
  const trendsMap = new Map();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    trendsMap.set(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), 0);
  }

  recentApps.forEach((a) => {
    const dateStr = new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (trendsMap.has(dateStr)) {
      trendsMap.set(dateStr, trendsMap.get(dateStr) + 1);
    }
  });

  const trendsData = Array.from(trendsMap.entries()).map(([date, count]) => ({
    date,
    applications: count,
  }));

  // 3. Top Skills
  const skillCount: Record<string, number> = {};
  jobs.forEach(job => {
    job.skills.forEach(js => {
      skillCount[js.skill.name] = (skillCount[js.skill.name] || 0) + 1;
    });
  });

  const topSkillsData = Object.entries(skillCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 4. Summary Stats
  const avgMatchScore = allApplications.length > 0 
    ? allApplications.reduce((sum, a) => sum + (a.matchScore || 0), 0) / allApplications.length 
    : 0;

  const totalHires = allApplications.filter(a => a.status === "HIRED").length;

  return {
    funnelData,
    trendsData,
    topSkillsData,
    stats: {
      totalJobs: jobs.length,
      totalApplications: allApplications.length,
      avgMatchScore: Math.round(avgMatchScore * 100),
      totalHires,
    }
  };
}

export async function getCandidateAnalytics() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    throw new Error("Unauthorized");
  }

  const applications = await prisma.application.findMany({
    where: { candidateId: session.user.id },
  });

  // 1. Status Distribution
  const statusCount: Record<string, number> = {};
  applications.forEach(a => {
    statusCount[a.status] = (statusCount[a.status] || 0) + 1;
  });

  const statusData = Object.entries(statusCount).map(([name, value]) => ({
    name,
    value
  }));

  // 2. Activity Trends (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentApps = applications.filter(a => new Date(a.createdAt) >= thirtyDaysAgo);
  
  const trendsMap = new Map();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    trendsMap.set(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), 0);
  }

  recentApps.forEach((a) => {
    const dateStr = new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (trendsMap.has(dateStr)) {
      trendsMap.set(dateStr, trendsMap.get(dateStr) + 1);
    }
  });

  const trendsData = Array.from(trendsMap.entries()).map(([date, count]) => ({
    date,
    applications: count,
  }));

  const avgMatchScore = applications.length > 0 
    ? applications.reduce((sum, a) => sum + (a.matchScore || 0), 0) / applications.length 
    : 0;

  return {
    statusData,
    trendsData,
    stats: {
      totalApplications: applications.length,
      interviews: applications.filter(a => a.status === "INTERVIEW").length,
      offers: applications.filter(a => a.status === "OFFERED" || a.status === "HIRED").length,
      avgMatchScore: Math.round(avgMatchScore * 100),
    }
  };
}
