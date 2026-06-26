import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getJobById, editJob } from "@/lib/actions/job-actions";
import { SubmitButton } from "@/components/submit-button";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "RECRUITER") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  if (job.recruiterId !== session.user.id) {
    redirect("/dashboard");
  }

  const updateJobWithId = editJob.bind(null, job.id);
  const skillsRaw = job.skills.map((s: any) => s.skill.name).join(", ");

  return (
    <div className="dashboard">
      <h1 className="page-title">Edit Job</h1>

      <form action={updateJobWithId} className="create-job-form">
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="title">Job Title</label>
            <input id="title" name="title" type="text" defaultValue={job.title} required />
          </div>

          <div className="form-field">
            <label htmlFor="company">Company</label>
            <input id="company" name="company" type="text" defaultValue={job.company} required />
          </div>

          <div className="form-field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" type="text" defaultValue={job.location || ""} />
          </div>

          <div className="form-field">
            <label htmlFor="locationType">Location Type</label>
            <select id="locationType" name="locationType" className="filter-select" defaultValue={job.locationType}>
              <option value="ONSITE">On-site</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="salaryMin">Salary Range (Min)</label>
            <input id="salaryMin" name="salaryMin" type="number" defaultValue={job.salaryMin || ""} />
          </div>

          <div className="form-field">
            <label htmlFor="salaryMax">Salary Range (Max)</label>
            <input id="salaryMax" name="salaryMax" type="number" defaultValue={job.salaryMax || ""} />
          </div>

          <div className="form-field">
            <label htmlFor="experienceLevel">Experience Level</label>
            <select id="experienceLevel" name="experienceLevel" className="filter-select" defaultValue={job.experienceLevel}>
              <option value="INTERN">Intern</option>
              <option value="JUNIOR">Junior</option>
              <option value="MID">Mid-Level</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="status">Job Status</label>
            <select id="status" name="status" className="filter-select" defaultValue={job.status}>
              <option value="DRAFT">Draft</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="FILLED">Filled</option>
            </select>
          </div>
        </div>

        <div className="form-field" style={{ marginTop: "1.5rem" }}>
          <label htmlFor="skills">Required Skills (comma separated)</label>
          <input
            id="skills"
            name="skills"
            type="text"
            defaultValue={skillsRaw}
          />
        </div>

        <div className="form-field" style={{ marginTop: "1.5rem" }}>
          <label htmlFor="description">Job Description</label>
          <textarea
            id="description"
            name="description"
            rows={8}
            className="form-textarea"
            defaultValue={job.description}
            required
          />
        </div>

        <SubmitButton pendingText="Saving Changes..." style={{ marginTop: "1.5rem" }}>
          Save Changes
        </SubmitButton>
      </form>
    </div>
  );
}
