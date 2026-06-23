import { getMessages } from "@/lib/actions/message-actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChatInput } from "./chat-input";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      application: {
        include: {
          job: { select: { title: true, company: true } },
          candidate: { select: { name: true } },
        },
      },
    },
  });

  if (!conversation) redirect("/messages");

  const messages = await getMessages(id);

  const otherParty =
    session.user.role === "RECRUITER"
      ? conversation.application.candidate.name
      : conversation.application.job.company;

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div>
          <h2 className="chat-header-name">{otherParty}</h2>
          <span className="chat-header-job">
            {conversation.application.job.title} ·{" "}
            {conversation.application.job.company}
          </span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg: any) => (
          <div
            key={msg.id}
            className={`chat-bubble ${
              msg.senderId === session.user.id
                ? "chat-bubble-own"
                : "chat-bubble-other"
            }`}
          >
            <span className="chat-sender">{msg.sender.name}</span>
            <p className="chat-text">{msg.content}</p>
            <span className="chat-time">
              {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>

      <ChatInput conversationId={id} />
    </div>
  );
}
