import { getJobs, getRecruiterJobs } from "@/lib/actions/job-actions";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { JobFilters } from "./job-filters";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; locationType?: string; experienceLevel?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const isRecruiter = session?.user?.role === "RECRUITER";

  const jobs = isRecruiter
    ? await getRecruiterJobs()
    : await getJobs({
        search: params.search,
        locationType: params.locationType,
        experienceLevel: params.experienceLevel,
      });

  return (
    <div className="dashboard">
      <div className="section-header">
        <h1 className="page-title">
          {isRecruiter ? "Your Job Listings" : "Browse Jobs"}
        </h1>
        {isRecruiter && (
          <Link href="/jobs/new" className="btn-primary">
            Post New Job
          </Link>
        )}
      </div>

      {!isRecruiter && <JobFilters />}

      {jobs.length === 0 ? (
        <div className="empty-state">
          <p>
            {isRecruiter
              ? "You haven't posted any jobs yet."
              : "No jobs match your filters."}
          </p>
        </div>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={isRecruiter ? `/applicants/${job.id}` : `/jobs/${job.id}`}
              className="job-card job-card-link"
            >
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
                <span>{job.experienceLevel}</span>
                {job.salaryMin && job.salaryMax && (
                  <span>
                    ₹{job.salaryMin.toLocaleString("en-IN")} – ₹{job.salaryMax.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <div className="job-card-skills">
                {job.skills.map((js) => (
                  <span key={js.skill.id} className="skill-tag">
                    {js.skill.name}
                  </span>
                ))}
              </div>
              <div className="job-card-meta" style={{ marginTop: "0.5rem" }}>
                <span>{job._count.applications} applicant{job._count.applications !== 1 ? "s" : ""}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}