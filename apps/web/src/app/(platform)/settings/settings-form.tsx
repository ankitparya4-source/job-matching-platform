"use client";

import { useState } from "react";
import { updateProfile, changePassword } from "@/lib/actions/user-actions";

export function SettingsForm({
  name,
  email,
  showPasswordFields,
}: {
  name: string;
  email: string;
  showPasswordFields?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      await updateProfile(formData.get("name") as string);
      setMessage("Profile updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setMessage("Password changed successfully");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (showPasswordFields) {
    return (
      <form onSubmit={handlePasswordSubmit} className="settings-form">
        {message && <div className="auth-alert auth-alert--success">{message}</div>}
        {error && <div className="auth-alert auth-alert--error">{error}</div>}
        <div className="form-field">
          <label htmlFor="currentPassword">Current Password</label>
          <input type="password" id="currentPassword" name="currentPassword" required className="form-input" />
        </div>
        <div className="form-field">
          <label htmlFor="newPassword">New Password</label>
          <input type="password" id="newPassword" name="newPassword" required minLength={8} className="form-input" />
        </div>
        <div className="form-field">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" required minLength={8} className="form-input" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : "Change Password"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleProfileSubmit} className="settings-form">
      {message && <div className="auth-alert auth-alert--success">{message}</div>}
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      <div className="form-field">
        <label htmlFor="name">Full Name</label>
        <input type="text" id="name" name="name" defaultValue={name} required className="form-input" />
      </div>
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input type="email" id="email" value={email} disabled className="form-input" style={{ opacity: 0.6 }} />
        <small style={{ color: "var(--warm-gray)" }}>Email cannot be changed</small>
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Saving…" : "Update Profile"}
      </button>
    </form>
  );
}
