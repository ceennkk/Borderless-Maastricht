"use client";

/**
 * Action list with persisted records and completion state.
 */
import { useCallback, useEffect, useMemo, useState } from "react";

import { deriveActions } from "@/lib/rules";
import {
  loadActions,
  loadCompletedActionIds,
  saveActions,
  saveCompletedActionIds,
} from "@/lib/storage";
import type { Action, Impact } from "@/lib/types";

export interface UseActionsResult {
  actions: Action[];
  open: Action[];
  done: Action[];
  toggle: (id: string) => void;
  ready: boolean;
}

export function useActions(impacts: Impact[]): UseActionsResult {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [persisted, setPersisted] = useState<Action[]>([]);
  const [ready, setReady] = useState(false);

  const generated = useMemo(() => deriveActions(impacts), [impacts]);

  useEffect(() => {
    setCompletedIds(loadCompletedActionIds());
    const merged = mergeActions(loadActions(), generated);
    saveActions(merged);
    setPersisted(merged);
    setReady(true);
    // The initial localStorage read must only happen once. Later rule-engine
    // updates are merged by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    setPersisted((previous) => {
      const merged = mergeActions(previous, generated);
      saveActions(merged);
      return merged;
    });
  }, [generated, ready]);

  const toggle = useCallback((id: string) => {
    setCompletedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveCompletedActionIds(next);
      return next;
    });
  }, []);

  const actions = useMemo(() => {
    const base = ready ? persisted : generated;
    return base.map((action) => ({
      ...action,
      completed: completedIds.includes(action.id),
    }));
  }, [generated, persisted, completedIds, ready]);

  return {
    actions,
    open: actions.filter((a) => !a.completed),
    done: actions.filter((a) => a.completed),
    toggle,
    ready,
  };
}

function mergeActions(previous: Action[], incoming: Action[]): Action[] {
  const byId = new Map(previous.map((action) => [action.id, action]));
  for (const action of incoming) {
    const stored = byId.get(action.id);
    byId.set(action.id, { ...stored, ...action, completed: false });
  }
  return Array.from(byId.values());
}
