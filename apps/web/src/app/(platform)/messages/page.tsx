import { getConversations } from "@/lib/actions/message-actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const conversations = await getConversations();

  return (
    <div className="dashboard">
      <h1 className="page-title">Messages</h1>

      {conversations.length === 0 ? (
        <div className="empty-state">
          <p>No conversations yet.</p>
        </div>
      ) : (
        <div className="conversation-list">
          {conversations.map((conv: any) => {
            const lastMessage = conv.messages[0];
            const unread = conv._count.messages;
            const otherParty =
              session.user.role === "RECRUITER"
                ? conv.application.candidate.name
                : conv.application.job.company;

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className={`conversation-card ${unread > 0 ? "conversation-unread" : ""}`}
              >
                <div className="conversation-header">
                  <span className="conversation-name">{otherParty}</span>
                  {unread > 0 && (
                    <span className="conversation-badge">{unread}</span>
                  )}
                </div>
                <span className="conversation-job">
                  {conv.application.job.title}
                </span>
                {lastMessage && (
                  <p className="conversation-preview">
                    {lastMessage.sender.name}: {lastMessage.content.slice(0, 60)}
                    {lastMessage.content.length > 60 ? "…" : ""}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
