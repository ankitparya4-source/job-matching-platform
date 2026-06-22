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

  return (
    <div className="dashboard">
      <h1 className="page-title">Applicants for {job.title}</h1>
      <p className="page-subtitle">{job.company}</p>

      {applicants.length === 0 ? (
        <div className="empty-state">
          <p>No applications yet for this position.</p>
        </div>
      ) : (
        <div className="applicants-list">
          {applicants.map((app) => (
            <div key={app.id} className="applicant-card">
              <div className="applicant-info">
                <h3 className="applicant-name">{app.candidate.name}</h3>
                <p className="applicant-email">{app.candidate.email}</p>
                <p className="applicant-date">
                  Applied {new Date(app.appliedAt).toLocaleDateString()}
                </p>
                {app.coverLetter && (
                  <p className="applicant-cover">{app.coverLetter}</p>
                )}
              </div>
              <StatusUpdater applicationId={app.id} currentStatus={app.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}