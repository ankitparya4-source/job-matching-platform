"use client";

import { useState } from "react";
import { sendMessage } from "@/lib/actions/message-actions";
import { useRouter } from "next/navigation";

export function ChatInput({ conversationId }: { conversationId: string }) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(conversationId, content);
      setContent("");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="chat-input-bar">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message…"
        className="chat-input"
        disabled={sending}
      />
      <button
        type="submit"
        disabled={sending || !content.trim()}
        className="btn-primary"
      >
        {sending ? "…" : "Send"}
      </button>
    </form>
  );
}
