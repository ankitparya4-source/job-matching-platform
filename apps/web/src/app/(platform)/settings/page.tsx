import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="dashboard">
      <h1 className="page-title">Settings</h1>

      <div className="settings-grid">
        <div className="settings-card">
          <h2 className="section-title">Profile</h2>
          <SettingsForm name={user.name} email={user.email} />
        </div>

        <div className="settings-card">
          <h2 className="section-title">Account Info</h2>
          <div className="settings-info">
            <div className="settings-info-row">
              <span className="settings-info-label">Role</span>
              <span className="settings-info-value">
                {user.role === "RECRUITER" ? "Recruiter" : "Candidate"}
              </span>
            </div>
            <div className="settings-info-row">
              <span className="settings-info-label">Member since</span>
              <span className="settings-info-value">
                {new Date(user.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h2 className="section-title">Change Password</h2>
          <SettingsForm name={user.name} email={user.email} showPasswordFields />
        </div>
      </div>
    </div>
  );
}
