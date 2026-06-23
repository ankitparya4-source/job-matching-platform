"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification-actions";

export async function getOrCreateConversation(applicationId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });

  if (!application) throw new Error("Application not found");

  const isRecruiter =
    session.user.role === "RECRUITER" &&
    application.job.recruiterId === session.user.id;
  const isCandidate = application.candidateId === session.user.id;

  if (!isRecruiter && !isCandidate) throw new Error("Unauthorized");

  let conversation = await prisma.conversation.findUnique({
    where: { applicationId },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { applicationId },
    });
  }

  return conversation;
}

export async function sendMessage(conversationId: string, content: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!content.trim()) throw new Error("Message cannot be empty");

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      application: {
        include: { job: true, candidate: true },
      },
    },
  });

  if (!conversation) throw new Error("Conversation not found");

  const app = conversation.application;
  const isRecruiter =
    session.user.role === "RECRUITER" &&
    app.job.recruiterId === session.user.id;
  const isCandidate = app.candidateId === session.user.id;

  if (!isRecruiter && !isCandidate) throw new Error("Unauthorized");

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: session.user.id,
      content: content.trim(),
    },
  });

  const recipientId = isRecruiter ? app.candidateId : app.job.recruiterId;
  await createNotification(
    recipientId,
    "NEW_MESSAGE",
    "New Message",
    `${session.user.name}: ${content.slice(0, 80)}${content.length > 80 ? "…" : ""}`,
    `/messages/${conversationId}`
  );

  revalidatePath(`/messages/${conversationId}`);
  return message;
}

export async function getMessages(conversationId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { application: { include: { job: true } } },
  });

  if (!conversation) throw new Error("Conversation not found");

  const app = conversation.application;
  const isRecruiter =
    session.user.role === "RECRUITER" &&
    app.job.recruiterId === session.user.id;
  const isCandidate = app.candidateId === session.user.id;

  if (!isRecruiter && !isCandidate) throw new Error("Unauthorized");

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: session.user.id },
      read: false,
    },
    data: { read: true },
  });

  return prisma.message.findMany({
    where: { conversationId },
    include: { sender: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getConversations() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where =
    session.user.role === "RECRUITER"
      ? { application: { job: { recruiterId: session.user.id } } }
      : { application: { candidateId: session.user.id } };

  return prisma.conversation.findMany({
    where,
    include: {
      application: {
        include: {
          job: { select: { title: true, company: true } },
          candidate: { select: { name: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { name: true } } },
      },
      _count: {
        select: {
          messages: { where: { read: false, senderId: { not: session.user.id } } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}
