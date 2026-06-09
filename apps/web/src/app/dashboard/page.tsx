import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "0.75rem",
      backgroundColor: "#FAF7F2",
      fontFamily: "var(--font-sans)",
    }}>
      <h1 style={{
        fontFamily: "var(--font-serif)",
        fontSize: "2rem",
        color: "#2C2418",
      }}>
        Welcome, {session.user.name}
      </h1>
      <p style={{ color: "#8B7E74", fontSize: "1rem" }}>
        {session.user.role === "RECRUITER" ? "Recruiter" : "Candidate"} Dashboard
      </p>
      <p style={{ color: "#B8AFA5", fontSize: "0.875rem", marginTop: "1rem" }}>
        Full dashboard coming in Phase 2
      </p>
    </div>
  );
}