"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CANDIDATE");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="auth-heading">Create your account</h2>
      <p className="auth-subheading">
        Start your journey to the right opportunity
      </p>

      {error && (
        <div className="auth-alert auth-alert--error">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-field">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ankit Parya"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ankit@xyzmail.com"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            minLength={8}
            required
          />
        </div>

        <div className="form-field">
          <label>I am a</label>
          <div className="role-selector">
            <button
              type="button"
              className={`role-option ${role === "CANDIDATE" ? "selected" : ""}`}
              onClick={() => setRole("CANDIDATE")}
            >
              <span className="role-option-icon">◎</span>
              Job Seeker
            </button>
            <button
              type="button"
              className={`role-option ${role === "RECRUITER" ? "selected" : ""}`}
              onClick={() => setRole("RECRUITER")}
            >
              <span className="role-option-icon">◈</span>
              Recruiter
            </button>
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Creating account…" : "Get Started"}
        </button>
      </form>

      <p className="auth-footer-text">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}