import { getJobById } from "@/lib/actions/job-actions";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { ApplyButton } from "./apply-button";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) notFound();

  const session = await auth();
  const isCandidate = session?.user?.role === "CANDIDATE";

  return (
    <div className="job-detail">
      <div className="job-detail-header">
        <div>
          <h1 className="page-title">{job.title}</h1>
          <p className="job-detail-company">{job.company}</p>
        </div>
        <span className={`status-badge status-${job.status.toLowerCase()}`}>
          {job.status}
        </span>
      </div>

      <div className="job-detail-meta">
        {job.location && <span className="meta-item">{job.location}</span>}
        <span className="meta-item">{job.locationType.replace("_", " ")}</span>
        <span className="meta-item">{job.experienceLevel} Level</span>
        {job.salaryMin && job.salaryMax && (
          <span className="meta-item">
            ₹{job.salaryMin.toLocaleString("en-IN")} – ₹{job.salaryMax.toLocaleString("en-IN")}
          </span>
        )}
        <span className="meta-item">
          {job._count.applications} applicant{job._count.applications !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="job-detail-skills">
        {job.skills.map((js) => (
          <span key={js.skill.id} className="skill-tag">
            {js.skill.name}
          </span>
        ))}
      </div>

      <div className="job-detail-description">
        <h2 className="section-title">About This Role</h2>
        <div className="prose">
          {job.description.split("\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      <div className="job-detail-footer">
        <p className="job-detail-posted">
          Posted by {job.recruiter.name} ·{" "}
          {new Date(job.createdAt).toLocaleDateString()}
        </p>
      </div>

      {isCandidate && job.status === "OPEN" && (
        <ApplyButton jobId={job.id} />
      )}
    </div>
  );
}