"use client";

import { useState } from "react";
import { scheduleInterview } from "@/lib/actions/interview-actions";

export function InterviewScheduler({
  applicationId,
  candidateName,
}: {
  applicationId: string;
  candidateName: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);

    try {
      await scheduleInterview(
        applicationId,
        formData.get("scheduledAt") as string,
        parseInt(formData.get("duration") as string) || 60,
        formData.get("meetingLink") as string,
        formData.get("notes") as string
      );
      setMessage("Interview scheduled");
      setOpen(false);
    } catch (err: any) {
      setMessage(err.message || "Failed to schedule");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-secondary btn-sm">
        Schedule Interview
      </button>
    );
  }

  return (
    <div className="interview-form">
      <h4 className="interview-form-title">
        Schedule Interview with {candidateName}
      </h4>
      {message && <div className="auth-alert auth-alert--success">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor={`date-${applicationId}`}>Date & Time</label>
          <input
            type="datetime-local"
            id={`date-${applicationId}`}
            name="scheduledAt"
            required
            className="form-input"
          />
        </div>
        <div className="form-field">
          <label htmlFor={`duration-${applicationId}`}>Duration (minutes)</label>
          <select
            id={`duration-${applicationId}`}
            name="duration"
            defaultValue="60"
            className="filter-select"
          >
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor={`link-${applicationId}`}>Meeting Link (optional)</label>
          <input
            type="url"
            id={`link-${applicationId}`}
            name="meetingLink"
            placeholder="https://meet.google.com/..."
            className="form-input"
          />
        </div>
        <div className="form-field">
          <label htmlFor={`notes-${applicationId}`}>Notes (optional)</label>
          <textarea
            id={`notes-${applicationId}`}
            name="notes"
            rows={2}
            placeholder="Topics to discuss, dress code, etc."
            className="form-textarea"
          />
        </div>
        <div className="apply-form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Scheduling…" : "Confirm Schedule"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
