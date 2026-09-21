"use client";

/**
 * The single source of truth for "who is the user" on the client.
 *
 * Falls back to the demo persona so every page is presentable before
 * onboarding has been completed — the hackathon demo depends on that.
 */
import { useCallback, useEffect, useMemo, useState } from "react";

import { DEMO_PROFILE } from "@/lib/mock-data";
import { analyzeProfile } from "@/lib/rules";
import { clearAll, loadProfile, saveProfile } from "@/lib/storage";
import type { Impact, UserProfile } from "@/lib/types";

export interface UseProfileResult {
  profile: UserProfile;
  /** True when `profile` is the demo persona rather than the user's own. */
  isDemo: boolean;
  /** False during the first client render, before localStorage has been read. */
  ready: boolean;
  impacts: Impact[];
  setProfile: (profile: UserProfile) => void;
  reset: () => void;
}

export function useProfile(): UseProfileResult {
  const [stored, setStored] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStored(loadProfile());
    setReady(true);
  }, []);

  const setProfile = useCallback((next: UserProfile) => {
    setStored(saveProfile(next));
  }, []);

  const reset = useCallback(() => {
    clearAll();
    setStored(null);
  }, []);

  const profile = stored ?? DEMO_PROFILE;
  const impacts = useMemo(() => analyzeProfile(profile), [profile]);

  return { profile, isDemo: stored === null, ready, impacts, setProfile, reset };
}
