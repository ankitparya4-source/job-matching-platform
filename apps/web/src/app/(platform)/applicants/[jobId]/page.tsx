import { getJobApplicants } from "@/lib/actions/application-actions";
import { getJobById } from "@/lib/actions/job-actions";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { StatusUpdater } from "./status-updater";

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "RECRUITER") {
    redirect("/dashboard");
  }

  const { jobId } = await params;
  const job = await getJobById(jobId);
  if (!job) notFound();

  const applicants = await getJobApplicants(jobId);

  const sorted = [...applicants].sort((a, b) => {
    const scoreA = a.matchScore ?? 0;
    const scoreB = b.matchScore ?? 0;
    return scoreB - scoreA;
  });

  const stages = {
    applied: sorted.filter((a) => a.status === "APPLIED").length,
    reviewed: sorted.filter((a) => a.status === "REVIEWED").length,
    shortlisted: sorted.filter((a) => a.status === "SHORTLISTED").length,
    interview: sorted.filter((a) => a.status === "INTERVIEW").length,
    offered: sorted.filter((a) => a.status === "OFFERED").length,
    hired: sorted.filter((a) => a.status === "HIRED").length,
    rejected: sorted.filter((a) => a.status === "REJECTED").length,
  };

  return (
    <div className="dashboard">
      <h1 className="page-title">Applicants for {job.title}</h1>
      <p className="page-subtitle">{job.company}</p>

      <div className="pipeline-bar">
        {Object.entries(stages).map(([stage, count]) =>
          count > 0 ? (
            <div key={stage} className={`pipeline-segment pipeline-${stage}`}>
              <span className="pipeline-count">{count}</span>
              <span className="pipeline-label">{stage}</span>
            </div>
          ) : null
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <p>No applications yet for this position.</p>
        </div>
      ) : (
        <div className="applicants-list">
          {sorted.map((app) => {
            const details = app.matchDetails as any;
            return (
              <div key={app.id} className="applicant-card">
                <div className="applicant-info">
                  <div className="applicant-header">
                    <div>
                      <h3 className="applicant-name">{app.candidate.name}</h3>
                      <p className="applicant-email">{app.candidate.email}</p>
                    </div>
                    {app.matchScore != null && (
                      <span className="match-badge match-badge-large">
                        {Math.round(app.matchScore * 100)}% match
                      </span>
                    )}
                  </div>

                  {details?.skill_overlap && (
                    <div className="applicant-match-details">
                      <div className="match-bar-item">
                        <span className="match-bar-label">Semantic</span>
                        <div className="match-bar">
                          <div
                            className="match-bar-fill"
                            style={{
                              width: `${Math.round((details.semantic_score || 0) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="match-bar-value">
                          {Math.round((details.semantic_score || 0) * 100)}%
                        </span>
                      </div>
                      <div className="match-bar-item">
                        <span className="match-bar-label">Skills</span>
                        <div className="match-bar">
                          <div
                            className="match-bar-fill match-bar-fill-skills"
                            style={{
                              width: `${Math.round((details.skill_overlap?.overlap_score || 0) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="match-bar-value">
                          {details.skill_overlap?.matched_count || 0}/
                          {details.skill_overlap?.total_required || 0}
                        </span>
                      </div>
                      {details.skill_overlap?.matched_skills?.length > 0 && (
                        <div className="applicant-skills">
                          {details.skill_overlap.matched_skills.map((s: string) => (
                            <span key={s} className="skill-tag skill-tag-matched">{s}</span>
                          ))}
                          {details.skill_overlap.missing_skills?.map((s: string) => (
                            <span key={s} className="skill-tag skill-tag-missing">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="applicant-meta">
                    <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                    {app.coverLetter && (
                      <span className="applicant-has-cover">Cover letter attached</span>
                    )}
                  </div>

                  {app.coverLetter && (
                    <p className="applicant-cover">{app.coverLetter}</p>
                  )}
                </div>
                <StatusUpdater applicationId={app.id} currentStatus={app.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}