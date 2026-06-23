"use client";

import { useState } from "react";
import {
  markAsRead,
  markAllAsRead,
} from "@/lib/actions/notification-actions";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: Notification[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(unreadCount);

  const handleMarkAll = async () => {
    await markAllAsRead();
    setCount(0);
  };

  const handleClick = async (n: Notification) => {
    if (!n.read) {
      await markAsRead(n.id);
      setCount((c) => Math.max(0, c - 1));
    }
    if (n.link) {
      window.location.href = n.link;
    }
    setOpen(false);
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="notification-wrapper">
      <button
        className="notification-bell"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && <span className="notification-count">{count}</span>}
      </button>

      {open && (
        <>
          <div className="notification-backdrop" onClick={() => setOpen(false)} />
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              {count > 0 && (
                <button onClick={handleMarkAll} className="notification-mark-all">
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="notification-empty">No notifications yet</p>
            ) : (
              <div className="notification-list">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    className={`notification-item ${!n.read ? "notification-unread" : ""}`}
                    onClick={() => handleClick(n)}
                  >
                    <span className="notification-title">{n.title}</span>
                    <span className="notification-message">{n.message}</span>
                    <span className="notification-time">{timeAgo(n.createdAt)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
