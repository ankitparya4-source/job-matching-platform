import { getCandidateApplications } from "@/lib/actions/application-actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    redirect("/dashboard");
  }

  const applications = await getCandidateApplications();

  return (
    <div className="dashboard">
      <div className="section-header">
        <h1 className="page-title">My Applications</h1>
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
          {applications.map((app) => (
            <div key={app.id} className="job-card">
              <div className="job-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Link href={`/jobs/${app.job.id}`}>
                    <h3 className="job-card-title">{app.job.title}</h3>
                  </Link>
                  {app.matchScore != null && (
                    <span className="match-badge">
                      {Math.round(app.matchScore * 100)}% match
                    </span>
                  )}
                </div>
                <span className={`status-badge status-${app.status.toLowerCase()}`}>
                  {app.status.replace("_", " ")}
                </span>
              </div>
              <p className="job-card-company">
                {app.job.company} · {app.job.recruiter.name}
              </p>
              <div className="job-card-meta">
                {app.job.location && <span>{app.job.location}</span>}
                <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
              </div>
              {app.coverLetter && (
                <p className="job-card-excerpt">{app.coverLetter.slice(0, 120)}…</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}