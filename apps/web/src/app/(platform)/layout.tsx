import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getNotifications, getUnreadCount } from "@/lib/actions/notification-actions";
import { NotificationBell } from "./notification-bell";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isRecruiter = session.user.role === "RECRUITER";

  return (
    <div className="platform-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-logo">
            JobMatch
          </Link>
          <NotificationBell
            notifications={await getNotifications().catch(() => [])}
            unreadCount={await getUnreadCount().catch(() => 0)}
          />
        </div>

        <nav className="sidebar-nav">
          <Link href="/dashboard" className="sidebar-link">
            Dashboard
          </Link>
          <Link href="/jobs" className="sidebar-link">
            {isRecruiter ? "My Jobs" : "Browse Jobs"}
          </Link>
          {isRecruiter ? (
            <Link href="/jobs/new" className="sidebar-link">
              Post a Job
            </Link>
          ) : (
            <>
            <Link href="/applications" className="sidebar-link">
              My Applications
            </Link>
            <Link href="/resume" className="sidebar-link">
              My Resume
            </Link>
            </>
          )}
          <Link href="/analytics" className="sidebar-link">
            Analytics
          </Link>
          <Link href="/messages" className="sidebar-link">
            Messages
          </Link>
          <Link href="/settings" className="sidebar-link">
            Settings
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-name">{session.user.name}</span>
            <span className="sidebar-user-role">
              {isRecruiter ? "Recruiter" : "Candidate"}
            </span>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className="sidebar-signout">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="platform-content">{children}</main>
    </div>
  );
}