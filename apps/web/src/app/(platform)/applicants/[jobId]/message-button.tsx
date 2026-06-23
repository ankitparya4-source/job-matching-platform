"use client";

import { getOrCreateConversation } from "@/lib/actions/message-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MessageButton({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    try {
      const conversation = await getOrCreateConversation(applicationId);
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="btn-secondary btn-sm"
    >
      {loading ? "…" : "Message"}
    </button>
  );
}
