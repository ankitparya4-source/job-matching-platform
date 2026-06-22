"use client";

import { updateApplicationStatus } from "@/lib/actions/application-actions";
import { useState } from "react";

const STATUSES = [
  "APPLIED",
  "REVIEWED",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFERED",
  "HIRED",
  "REJECTED",
];

export function StatusUpdater({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setStatus(newStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className={`filter-select status-select status-${status.toLowerCase()}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}