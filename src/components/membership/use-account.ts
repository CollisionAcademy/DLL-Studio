"use client";
import { useCallback, useEffect, useState } from "react";
import { useReverification } from "@clerk/nextjs";
import { requestJson, AccountRequestError } from "@/lib/membership/request";
import { hasPendingVideos } from "@/lib/membership/video-status";
import type { PlanKey } from "@/lib/membership/plans";
type ActionResult = { url?: string; message: string };
export type Dashboard = {
  plan: PlanKey;
  isAdmin: boolean;
  characterPoints?: number;
  characterBadgeCount?: number;
  storeCreditCents?: number;
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
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [busy, setBusy] = useState(true);
  const verifiedFetch = useReverification(requestJson<ActionResult>);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const result = await requestJson<Dashboard>(
          `/api/member/${parent ? "parent" : "dashboard"}`,
          { signal },
        );
        if (!signal?.aborted) {
          setData(result);
          setError("");
          setNeedsSignIn(false);
        }
      } catch (error) {
        if (!signal?.aborted) {
          setError(
            error instanceof Error ? error.message : "Please try again.",
          );
          setNeedsSignIn(
            error instanceof AccountRequestError && error.status === 401,
          );
        }
      } finally {
        if (!signal?.aborted) setBusy(false);
      }
    },
    [parent],
  );
  useEffect(() => {
    const controller = new AbortController();
    requestJson<Dashboard>(`/api/member/${parent ? "parent" : "dashboard"}`, {
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error ? error.message : "Please try again.",
          );
          setNeedsSignIn(
            error instanceof AccountRequestError && error.status === 401,
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [parent]);
  const pending = Boolean(data && hasPendingVideos(data.videos));
  useEffect(() => {
    if (!pending) return;
    const controller = new AbortController();
    let inFlight = false;
    const timer = window.setInterval(async () => {
      if (document.hidden || inFlight) return;
      inFlight = true;
      try {
        const result = await requestJson<Dashboard>(
          `/api/member/${parent ? "parent" : "dashboard"}`,
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) setData(result);
      } catch {
        /* Keep the shelf visible; retry on the next interval. */
      } finally {
        inFlight = false;
      }
    }, 15000);
    return () => {
      window.clearInterval(timer);
      controller.abort();
    };
  }, [parent, pending]);
  async function act(action: string, body: unknown, billing = false) {
    setBusy(true);
    setError("");
    setNeedsSignIn(false);
    try {
      const result = await verifiedFetch(
        `/api/${billing ? "billing" : "member"}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!result) return null;
      if (result.url) {
        window.location.assign(result.url);
        return result;
      }
      await load();
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
      setNeedsSignIn(
        error instanceof AccountRequestError && error.status === 401,
      );
      return null;
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    setBusy(true);
    setError("");
    await load();
  }
  return { data, error, needsSignIn, busy, load: refresh, act };
}
