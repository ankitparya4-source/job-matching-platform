import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getResume } from "@/lib/actions/resume-actions";
import { ResumeUploader } from "./resume-uploader";

export default async function ResumePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    redirect("/dashboard");
  }

  const resume = await getResume();
  const parsedData = resume?.parsedData as any;

  return (
    <div className="dashboard">
      <h1 className="page-title">My Resume</h1>

      <ResumeUploader hasResume={!!resume} />

      {resume && resume.status === "PARSED" && parsedData && (
        <div className="resume-results">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">
                {parsedData.skills?.technical?.length || 0}
              </span>
              <span className="stat-label">Technical Skills</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {parsedData.skills?.soft?.length || 0}
              </span>
              <span className="stat-label">Soft Skills</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {parsedData.experience_years ?? "—"}
              </span>
              <span className="stat-label">Years Experience</span>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">Extracted Skills</h2>
            <div className="skills-section">
              <h3 className="skills-category">Technical</h3>
              <div className="job-detail-skills">
                {parsedData.skills?.technical?.map((skill: string) => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>

            {parsedData.skills?.soft?.length > 0 && (
              <div className="skills-section">
                <h3 className="skills-category">Soft Skills</h3>
                <div className="job-detail-skills">
                  {parsedData.skills?.soft?.map((skill: string) => (
                    <span key={skill} className="skill-tag skill-tag-soft">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {parsedData.education?.length > 0 && (
            <div className="section">
              <h2 className="section-title">Education</h2>
              <div className="education-list">
                {parsedData.education.map((edu: any, i: number) => (
                  <div key={i} className="education-item">
                    <p>{edu.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {parsedData.contact && (
            <div className="section">
              <h2 className="section-title">Contact Info Detected</h2>
              <div className="contact-info">
                {parsedData.contact.email && (
                  <p>Email: {parsedData.contact.email}</p>
                )}
                {parsedData.contact.phone && (
                  <p>Phone: {parsedData.contact.phone}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {resume && resume.status === "PROCESSING" && (
        <div className="empty-state">
          <p>Your resume is being processed…</p>
        </div>
      )}

      {resume && resume.status === "FAILED" && (
        <div className="auth-alert auth-alert--error">
          Failed to parse your resume. Please try uploading again.
        </div>
      )}
    </div>
  );
}