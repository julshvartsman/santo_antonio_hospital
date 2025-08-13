import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { supabase } from "@/lib/supabaseClient";

type NotificationType = "info" | "warning" | "error" | "success";

interface ApiNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string; // ISO string
  actionUrl?: string;
}

function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dueDateThisMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), 15, 23, 59, 59, 999);
  return d;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = (searchParams.get("scope") || "user").toLowerCase();
    const userId = searchParams.get("userId");
    const limitParam = parseInt(searchParams.get("limit") || "50", 10);
    const limit = Number.isFinite(limitParam)
      ? Math.max(1, Math.min(200, limitParam))
      : 50;

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthDue = dueDateThisMonth(now);

    const notifications: ApiNotification[] = [];

    if (scope === "user") {
      if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
      }

      // Fetch user profile to get hospital_id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, hospital_id, full_name")
        .eq("id", userId)
        .single();

      if (profileError) {
        return NextResponse.json(
          { error: profileError.message },
          { status: 500 }
        );
      }

      // Current month's entry for user's hospital
      let currentEntry: any = null;
      if (profile?.hospital_id) {
        const { data: entry, error: entryError } = await supabase
          .from("entries")
          .select("*")
          .eq("hospital_id", profile.hospital_id)
          .gte("month_year", monthStart.toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!entryError) currentEntry = entry;
      }

      if (currentEntry?.submitted) {
        notifications.push({
          id: `submitted:${currentEntry.id}`,
          type: "success",
          title: "Monthly submission received",
          message: "Your department's monthly data has been submitted.",
          isRead: false,
          createdAt:
            currentEntry.submitted_at ||
            currentEntry.created_at ||
            now.toISOString(),
        });
      } else {
        // Due soon / overdue signals
        if (now > monthDue) {
          notifications.push({
            id: `overdue:${
              profile?.hospital_id || "unknown"
            }:${monthStart.toISOString()}`,
            type: "warning",
            title: "Submission overdue",
            message: "This month's sustainability report is overdue.",
            isRead: false,
            createdAt: monthDue.toISOString(),
          });
        } else {
          const daysUntilDue = Math.ceil(
            (monthDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysUntilDue <= 3) {
            notifications.push({
              id: `due-soon:${
                profile?.hospital_id || "unknown"
              }:${monthStart.toISOString()}`,
              type: "warning",
              title: "Submission due soon",
              message: `Your report is due in ${daysUntilDue} day${
                daysUntilDue === 1 ? "" : "s"
              }.`,
              isRead: false,
              createdAt: now.toISOString(),
            });
          }
        }
      }

      // Surface support messages as info/warning
      const { data: msgs } = await supabase
        .from("support_messages")
        .select("id, status, message, created_at, admin_response")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      (msgs || []).forEach((m) => {
        const isReminder =
          (m.message || "").toLowerCase().includes("reminder") ||
          (m.admin_response || "").toLowerCase().includes("reminder");
        const type: NotificationType =
          m.status === "resolved"
            ? isReminder
              ? "info"
              : "success"
            : "warning";
        notifications.push({
          id: `support:${m.id}`,
          type,
          title:
            m.status === "resolved"
              ? isReminder
                ? "Reminder sent"
                : "Support message resolved"
              : "Support message pending",
          message: m.message || m.admin_response || "",
          isRead: false,
          createdAt: m.created_at,
        });
      });
    } else if (scope === "all") {
      // Admin view: aggregate overdue/missing submissions and recent reminders
      const [{ data: hospitals }, { data: currentEntries }] = await Promise.all(
        [
          supabase.from("hospitals").select("id, name"),
          supabase
            .from("entries")
            .select("hospital_id, submitted, submitted_at, id, created_at")
            .gte("month_year", monthStart.toISOString()),
        ]
      );

      const submissionByHospital = new Map<string, any>();
      (currentEntries || []).forEach((e) =>
        submissionByHospital.set(e.hospital_id, e)
      );

      const notSubmitted = (hospitals || []).filter(
        (h) => !submissionByHospital.get(h.id)?.submitted
      );
      if (notSubmitted.length > 0) {
        notifications.push({
          id: `admin:missing:${monthStart.toISOString()}`,
          type: now > monthDue ? "warning" : "info",
          title: now > monthDue ? "Overdue submissions" : "Pending submissions",
          message: `${notSubmitted.length} hospital${
            notSubmitted.length === 1 ? "" : "s"
          } have not submitted this month.`,
          isRead: false,
          createdAt: now.toISOString(),
        });
      }

      // Recent reminders from support_messages (last 14 days)
      const fourteenDaysAgo = new Date(
        now.getTime() - 14 * 24 * 60 * 60 * 1000
      ).toISOString();
      const { data: recentMsgs } = await supabase
        .from("support_messages")
        .select("id, message, status, created_at")
        .gte("created_at", fourteenDaysAgo)
        .order("created_at", { ascending: false })
        .limit(50);

      (recentMsgs || []).forEach((m) => {
        const isReminder = (m.message || "").toLowerCase().includes("reminder");
        if (isReminder) {
          notifications.push({
            id: `admin:reminder:${m.id}`,
            type: m.status === "resolved" ? "info" : "warning",
            title: "Reminder sent",
            message: m.message,
            isRead: false,
            createdAt: m.created_at,
          });
        }
      });
    } else {
      return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
    }

    // Sort and trim
    const sorted = notifications
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);

    return NextResponse.json({ notifications: sorted });
  } catch (error: any) {
    console.error("/api/notifications error", error);
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}

