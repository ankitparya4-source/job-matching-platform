import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createJob } from "@/lib/actions/job-actions";

export default async function NewJobPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "RECRUITER") {
    redirect("/dashboard");
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">Post a New Job</h1>

      <form action={createJob} className="create-job-form">
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="title">Job Title</label>
            <input id="title" name="title" type="text" placeholder="e.g. Senior Python Developer" required />
          </div>

          <div className="form-field">
            <label htmlFor="company">Company</label>
            <input id="company" name="company" type="text" placeholder="e.g. TechCorp" required />
          </div>

          <div className="form-field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" type="text" placeholder="e.g. Bangalore, India" />
          </div>

          <div className="form-field">
            <label htmlFor="locationType">Location Type</label>
            <select id="locationType" name="locationType" className="filter-select">
              <option value="ONSITE">On-site</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="salaryMin">Salary Range (Min)</label>
            <input id="salaryMin" name="salaryMin" type="number" placeholder="e.g. 50000" />
          </div>

          <div className="form-field">
            <label htmlFor="salaryMax">Salary Range (Max)</label>
            <input id="salaryMax" name="salaryMax" type="number" placeholder="e.g. 80000" />
          </div>

          <div className="form-field">
            <label htmlFor="experienceLevel">Experience Level</label>
            <select id="experienceLevel" name="experienceLevel" className="filter-select">
              <option value="INTERN">Intern</option>
              <option value="JUNIOR">Junior</option>
              <option value="MID">Mid-Level</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="skills">Required Skills</label>
            <input
              id="skills"
              name="skills"
              type="text"
              placeholder="e.g. python, fastapi, postgresql (comma separated)"
            />
          </div>
        </div>

        <div className="form-field" style={{ marginTop: "1.5rem" }}>
          <label htmlFor="description">Job Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe the role, responsibilities, and what you're looking for…"
            rows={8}
            className="form-textarea"
            required
          />
        </div>

        <button type="submit" className="btn-primary btn-lg" style={{ marginTop: "1.5rem" }}>
          Publish Job
        </button>
      </form>
    </div>
  );
}