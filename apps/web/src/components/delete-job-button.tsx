"use client";

import { useState } from "react";
import { deleteJob } from "@/lib/actions/job-actions";

export function DeleteJobButton({ jobId }: { jobId: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteJob(jobId);
    } catch (error) {
      console.error("Failed to delete job", error);
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  if (isConfirming) {
    return (
      <div className="flex gap-2 items-center">
        <span className="text-sm text-red-500 font-medium">Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="btn-primary btn-sm"
          style={{ backgroundColor: "#ef4444", color: "#ffffff", borderColor: "#ef4444" }}
        >
          {isDeleting ? "Deleting..." : "Yes, Delete"}
        </button>
        <button
          onClick={() => setIsConfirming(false)}
          disabled={isDeleting}
          className="btn-secondary btn-sm"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className="btn-secondary btn-sm"
      style={{ color: "var(--destructive)", borderColor: "var(--destructive)" }}
    >
      Delete
    </button>
  );
}
