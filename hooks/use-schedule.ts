"use client";

/**
 * Owns a planning run: starting it, polling it, and holding the result.
 *
 * Lifted out of the component so the action centre can decide its layout from
 * whether a plan exists, and so the polling logic is testable on its own.
 */
import { useCallback, useEffect, useRef, useState } from "react";

import { ScheduleError, fetchJob, startSchedule } from "@/lib/scheduling";
import type { Action, SchedulePlan, UserProfile } from "@/lib/types";

const POLL_MS = 1200;
const MAX_POLLS = 100;

export interface UseScheduleResult {
  plan: SchedulePlan | null;
  running: boolean;
  /** What the agent is doing right now. */
  step: string | null;
  /** Steps already finished, oldest first. */
  log: string[];
  error: string | null;
  run: () => Promise<void>;
  reset: () => void;
}

export function useSchedule(profile: UserProfile, actions: Action[]): UseScheduleResult {
  const [plan, setPlan] = useState<SchedulePlan | null>(null);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const poll = useCallback(
    (id: string, attempt = 0) => {
      timer.current = setTimeout(async () => {
        try {
          const job = await fetchJob(id);
          setStep(job.step);
          setLog(job.log);

          if (job.status === "error") {
            setError(job.error ?? "Planning failed.");
            setRunning(false);
            return;
          }
          if (job.status === "done") {
            setPlan(job.plan ?? null);
            setRunning(false);
            return;
          }
          if (attempt < MAX_POLLS) poll(id, attempt + 1);
          else {
            setError("Planning took too long.");
            setRunning(false);
          }
        } catch (e) {
          setError(e instanceof ScheduleError ? e.message : "Planning failed.");
          setRunning(false);
        }
      }, POLL_MS);
    },
    [],
  );

  const run = useCallback(async () => {
    stop();
    setError(null);
    setPlan(null);
    setLog([]);
    setStep("Getting started");
    setRunning(true);
    try {
      poll(await startSchedule(profile, actions));
    } catch (e) {
      setError(e instanceof ScheduleError ? e.message : "Could not start the planner.");
      setRunning(false);
    }
  }, [profile, actions, poll, stop]);

  const reset = useCallback(() => {
    stop();
    setPlan(null);
    setError(null);
    setStep(null);
    setLog([]);
    setRunning(false);
  }, [stop]);

  return { plan, running, step, log, error, run, reset };
}
