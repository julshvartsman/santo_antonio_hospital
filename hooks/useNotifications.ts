"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Notification } from "@/types";
import { useAuth } from "./useAuth";

type ScopeOption = "user" | "all";

interface UseNotificationsOptions {
  scope?: ScopeOption; // "user" = current user's notifications, "all" = admin view
  limit?: number;
  unreadOnly?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

function mapDbRowToNotification(row: any): Notification {
  return {
    id: row.id,
    type: (row.type || "info") as Notification["type"],
    title: row.title || "",
    message: row.message || "",
    isRead: Boolean(row.is_read),
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    actionUrl: row.action_url || undefined,
  };
}

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { user } = useAuth();
  const { scope = "user", limit = 50, unreadOnly = false } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // If user scope but no user, nothing to fetch
      if (scope === "user" && !user?.id) {
        setNotifications([]);
        return;
      }

      const params = new URLSearchParams();
      params.set("scope", scope);
      params.set("limit", String(limit));
      if (scope === "user") params.set("userId", user!.id);

      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body.error || `Failed to fetch notifications (${res.status})`
        );
      }
      const body = await res.json();
      const data = body.notifications || [];
      const mapped = data.map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: Boolean(n.isRead),
        createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
        actionUrl: n.actionUrl,
      }));
      setNotifications(mapped);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      setError(err.message || "Failed to fetch notifications");
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [scope, unreadOnly, limit, user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      // No server-side persistence when using computed API
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      // Revert on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      // No server-side persistence when using computed API
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      // Re-fetch to reconcile actual state
      fetchNotifications();
    }
  }, [fetchNotifications, scope, user?.id]);

  const deleteNotification = useCallback(
    async (id: string) => {
      // Optimistic update
      const previous = notifications;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      try {
        // No server-side persistence when using computed API
      } catch (err) {
        console.error("Failed to delete notification:", err);
        setNotifications(previous);
      }
    },
    [notifications]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
