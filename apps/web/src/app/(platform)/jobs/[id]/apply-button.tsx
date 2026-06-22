"use client";

import { useState } from "react";
import { applyToJob } from "@/lib/actions/application-actions";

export function ApplyButton({ jobId }: { jobId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    setLoading(true);
    setError("");

    try {
      await applyToJob(jobId, coverLetter || undefined);
      setApplied(true);
    } catch (err: any) {
      setError(err.message || "Failed to apply");
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <div className="apply-section">
        <div className="auth-alert auth-alert--success">
          Application submitted successfully!
        </div>
      </div>
    );
  }

  return (
    <div className="apply-section">
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-primary btn-lg">
          Apply to This Job
        </button>
      ) : (
        <div className="apply-form">
          <h3 className="section-title">Apply</h3>
          {error && <div className="auth-alert auth-alert--error">{error}</div>}
          <div className="form-field">
            <label htmlFor="coverLetter">Cover Letter (optional)</label>
            <textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the recruiter why you're a great fit…"
              rows={5}
              className="form-textarea"
            />
          </div>
          <div className="apply-form-actions">
            <button
              onClick={handleApply}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Submitting…" : "Submit Application"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}