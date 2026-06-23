import { getRecommendedJobs } from "@/lib/actions/matching-actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRecruiterJobs } from "@/lib/actions/job-actions";
import { getCandidateApplications } from "@/lib/actions/application-actions";
import { getUpcomingInterviews } from "@/lib/actions/interview-actions";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "RECRUITER") {
    return <RecruiterDashboard />;
  }

  return <CandidateDashboard />;
}

async function RecruiterDashboard() {
  const session = await auth();
  if (!session?.user) return null;

  const jobs = await getRecruiterJobs();
  const interviews = await getUpcomingInterviews();

  const totalJobs = jobs.length;
  const openJobs = jobs.filter((j) => j.status === "OPEN").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + j._count.applications, 0);

  const allApplications = await prisma.application.findMany({
    where: { job: { recruiterId: session.user.id } },
    select: { status: true },
  });

  const pipeline = {
    applied: allApplications.filter((a) => a.status === "APPLIED").length,
    inReview: allApplications.filter((a) =>
      ["REVIEWED", "SHORTLISTED", "INTERVIEW"].includes(a.status)
    ).length,
    offered: allApplications.filter((a) => a.status === "OFFERED").length,
    hired: allApplications.filter((a) => a.status === "HIRED").length,
  };

  return (
    <div className="dashboard">
      <h1 className="page-title">Recruiter Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{totalJobs}</span>
          <span className="stat-label">Total Jobs</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{openJobs}</span>
          <span className="stat-label">Open Positions</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalApplicants}</span>
          <span className="stat-label">Total Applicants</span>
        </div>
      </div>

      {totalApplicants > 0 && (
        <div className="pipeline-bar">
          <div className="pipeline-segment pipeline-applied">
            <span className="pipeline-count">{pipeline.applied}</span>
            <span className="pipeline-label">Applied</span>
          </div>
          <div className="pipeline-segment pipeline-review">
            <span className="pipeline-count">{pipeline.inReview}</span>
            <span className="pipeline-label">In Review</span>
          </div>
          <div className="pipeline-segment pipeline-offered">
            <span className="pipeline-count">{pipeline.offered}</span>
            <span className="pipeline-label">Offered</span>
          </div>
          <div className="pipeline-segment pipeline-hired">
            <span className="pipeline-count">{pipeline.hired}</span>
            <span className="pipeline-label">Hired</span>
          </div>
        </div>
      )}

      {interviews.length > 0 && (
        <div className="section">
          <h2 className="section-title">Upcoming Interviews</h2>
          <div className="interview-list">
            {interviews.map((interview: any) => (
              <div key={interview.id} className="interview-card">
                <div className="interview-card-header">
                  <h3 className="interview-card-title">
                    {interview.application.job.title}
                  </h3>
                  <span className="interview-card-company">
                    {interview.application.candidate.name}
                  </span>
                </div>
                <div className="interview-card-meta">
                  <span className="interview-card-date">
                    {new Date(interview.scheduledAt).toLocaleDateString("en-IN", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>{interview.durationMinutes} min</span>
                </div>
                {interview.meetingLink && (
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary btn-sm"
                    style={{ display: "inline-block", marginTop: "0.5rem" }}
                  >
                    Join Meeting
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Your Jobs</h2>
          <Link href="/jobs/new" className="btn-primary">
            Post New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="empty-state">
            <p>No jobs posted yet.</p>
            <Link href="/jobs/new" className="btn-primary">
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="job-list">
            {jobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-card-header">
                  <h3 className="job-card-title">{job.title}</h3>
                  <span className={`status-badge status-${job.status.toLowerCase()}`}>
                    {job.status}
                  </span>
                </div>
                <p className="job-card-company">{job.company}</p>
                <div className="job-card-meta">
                  {job.location && <span>{job.location}</span>}
                  <span>{job.locationType.replace("_", " ")}</span>
                  <span>{job._count.applications} applicant{job._count.applications !== 1 ? "s" : ""}</span>
                </div>
                <div className="job-card-skills">
                  {job.skills.map((js) => (
                    <span key={js.skill.id} className="skill-tag">
                      {js.skill.name}
                    </span>
                  ))}
                </div>
                <div className="job-card-actions">
                  <Link href={`/applicants/${job.id}`} className="btn-secondary">
                    View Applicants
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function CandidateDashboard() {
  const applications = await getCandidateApplications();
  const recommendedJobs = await getRecommendedJobs();
  const interviews = await getUpcomingInterviews();

  const total = applications.length;
  const inReview = applications.filter((a) =>
    ["REVIEWED", "SHORTLISTED", "INTERVIEW"].includes(a.status)
  ).length;
  const offers = applications.filter((a) => a.status === "OFFERED").length;

  return (
    <div className="dashboard">
      <h1 className="page-title">Candidate Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Applications</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{inReview}</span>
          <span className="stat-label">In Review</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{offers}</span>
          <span className="stat-label">Offers</span>
        </div>
      </div>

      {interviews.length > 0 && (
        <div className="section">
          <h2 className="section-title">Upcoming Interviews</h2>
          <div className="interview-list">
            {interviews.map((interview: any) => (
              <div key={interview.id} className="interview-card">
                <div className="interview-card-header">
                  <h3 className="interview-card-title">
                    {interview.application.job.title}
                  </h3>
                  <span className="interview-card-company">
                    {interview.application.job.company}
                  </span>
                </div>
                <div className="interview-card-meta">
                  <span className="interview-card-date">
                    {new Date(interview.scheduledAt).toLocaleDateString("en-IN", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>{interview.durationMinutes} min</span>
                </div>
                {interview.meetingLink && (
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary btn-sm"
                    style={{ display: "inline-block", marginTop: "0.5rem" }}
                  >
                    Join Meeting
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendedJobs.length > 0 && (
        <div className="section">
          <h2 className="section-title">Recommended for You</h2>
          <p className="section-subtitle">
            Jobs matched to your resume using AI
          </p>
          <div className="job-list">
            {recommendedJobs.slice(0, 5).map((job: any) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="job-card job-card-link"
              >
                <div className="job-card-header">
                  <h3 className="job-card-title">{job.title}</h3>
                  <span className="match-badge">
                    {Math.round(job.matchScore * 100)}% match
                  </span>
                </div>
                <p className="job-card-company">{job.company}</p>
                <div className="job-card-meta">
                  {job.location && <span>{job.location}</span>}
                  <span>{job.locationType.replace("_", " ")}</span>
                </div>
                {job.matchDetails?.skill_overlap && (
                  <div className="match-details">
                    <span className="match-detail-item">
                      {job.matchDetails.skill_overlap.matched_count}/
                      {job.matchDetails.skill_overlap.total_required} skills matched
                    </span>
                    {job.matchDetails.skill_overlap.missing_skills.length > 0 && (
                      <span className="match-detail-missing">
                        Missing: {job.matchDetails.skill_overlap.missing_skills.slice(0, 3).join(", ")}
                      </span>
                    )}
                  </div>
                )}
                <div className="job-card-skills">
                  {job.skills.map((js: any) => {
                    const isMatched = job.matchDetails?.skill_overlap?.matched_skills?.includes(
                      js.skill.name.toLowerCase()
                    );
                    return (
                      <span
                        key={js.skill.id}
                        className={`skill-tag ${isMatched ? "skill-tag-matched" : ""}`}
                      >
                        {js.skill.name}
                      </span>
                    );
                  })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Recent Applications</h2>
          <Link href="/jobs" className="btn-primary">
            Browse Jobs
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state">
            <p>You haven&apos;t applied to any jobs yet.</p>
            <Link href="/jobs" className="btn-primary">
              Find Your First Job
            </Link>
          </div>
        ) : (
          <div className="job-list">
            {applications.slice(0, 5).map((app) => (
              <div key={app.id} className="job-card">
                <div className="job-card-header">
                  <h3 className="job-card-title">{app.job.title}</h3>
                  <span className={`status-badge status-${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </div>
                <p className="job-card-company">{app.job.company}</p>
                <div className="job-card-meta">
                  {app.job.location && <span>{app.job.location}</span>}
                  <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}