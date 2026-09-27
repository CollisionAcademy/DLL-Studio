"use client";
import { useCallback, useEffect, useState } from "react";
import { useReverification } from "@clerk/nextjs";
import type { PlanKey } from "@/lib/membership/plans";
export type Dashboard = {
  plan: PlanKey;
  isAdmin: boolean;
  credits: { remaining: number; video_limit: number; ends_at?: string };
  badges: { badge_id: string; points: number }[];
  boxes: { id: number; item_count: number; state: string }[];
  videos: {
    id: string;
    kind: string;
    state: string;
    duration_seconds: number;
    parent_publish: boolean;
  }[];
  parent?: {
    parent_confirmed_at: string | null;
    timezone: string;
    character_id: string;
    birthday_month: number;
    birthday_day: number;
  };
  cancelAtPeriodEnd: boolean;
};
export function useAccount(parent = false) {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(!parent);
  const verifiedFetch = useReverification((url: string, init?: RequestInit) =>
    fetch(url, init),
  );
  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const response = await verifiedFetch(
        `/api/member/${parent ? "parent" : "dashboard"}`,
      );
      if (!response) return;
      const result = await response.json();
      if (!response.ok)
        throw Error(result.error || "Please verify your parent sign-in.");
      setData(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }, [parent, verifiedFetch]);
  // Parent data is loaded only by an explicit click so reverification never opens unexpectedly.
  useEffect(() => {
    if (parent) return;
    const controller = new AbortController();
    fetch("/api/member/dashboard", { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw Error(result.error || "Please sign in.");
        setData(result);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [parent]);
  async function act(action: string, body: unknown, billing = false) {
    setBusy(true);
    setError("");
    try {
      const response = await verifiedFetch(
        `/api/${billing ? "billing" : "member"}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!response) return null;
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Please try again.");
      if (result.url) {
        window.location.assign(result.url);
        return result;
      }
      await load();
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
      return null;
    } finally {
      setBusy(false);
    }
  }
  return { data, error, busy, load, act };
}
