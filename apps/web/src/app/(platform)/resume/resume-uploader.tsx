"use client";

import { useState, useRef } from "react";
import { uploadResume } from "@/lib/actions/resume-actions";
import { useRouter } from "next/navigation";

export function ResumeUploader({ hasResume }: { hasResume: boolean }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      setError("Please upload a PDF file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      await uploadResume(formData);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="upload-section">
      {error && <div className="auth-alert auth-alert--error">{error}</div>}

      <div
        className={`upload-zone ${dragOver ? "upload-zone-active" : ""} ${uploading ? "upload-zone-disabled" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        {uploading ? (
          <div className="upload-status">
            <span className="upload-spinner" />
            <p>Parsing your resume with AI…</p>
            <p className="upload-hint">This may take a few seconds</p>
          </div>
        ) : (
          <div className="upload-prompt">
            <p className="upload-title">
              {hasResume ? "Upload a new resume" : "Upload your resume"}
            </p>
            <p className="upload-hint">
              Drag and drop a PDF here, or click to browse
            </p>
            <p className="upload-hint">Max 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
}