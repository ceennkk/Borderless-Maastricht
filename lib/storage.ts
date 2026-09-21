/**
 * Local persistence layer.
 *
 * Everything the app remembers between visits goes through this module. When a
 * real backend arrives, only the bodies of these functions change — callers keep
 * the same signatures.
 *
 * All reads are SSR-safe: they return `null`/defaults when `window` is absent.
 */
import type { PersonalDetails } from "./personal-details";
import type { Action, SavedSimulation, UserProfile } from "./types";

const KEYS = {
  profile: "borderless.profile",
  completedActions: "borderless.completedActions",
  actions: "borderless.actions",
  simulations: "borderless.simulations",
  dismissedOpportunities: "borderless.dismissedOpportunities",
  personalDetails: "borderless.personalDetails",
} as const;

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode — the app still works, it just forgets */
  }
}

function remove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/* -------------------------------- profile -------------------------------- */

export function loadProfile(): UserProfile | null {
  return read<UserProfile>(KEYS.profile);
}

export function saveProfile(profile: UserProfile): UserProfile {
  const now = new Date().toISOString();
  const stored: UserProfile = {
    ...profile,
    createdAt: profile.createdAt ?? now,
    updatedAt: now,
  };
  write(KEYS.profile, stored);
  return stored;
}

export function clearProfile(): void {
  remove(KEYS.profile);
}

/* ---------------------------- action completion --------------------------- */

/** Completion is stored separately so an action can be refreshed without
 *  losing the user's checkbox state. */
export function loadCompletedActionIds(): string[] {
  return read<string[]>(KEYS.completedActions) ?? [];
}

export function saveCompletedActionIds(ids: string[]): void {
  write(KEYS.completedActions, Array.from(new Set(ids)));
}

/** Full action records are persisted as well as their completion state. */
export function loadActions(): Action[] {
  return read<Action[]>(KEYS.actions) ?? [];
}

export function saveActions(actions: Action[]): void {
  const unique = new Map(actions.map((action) => [action.id, action]));
  write(KEYS.actions, Array.from(unique.values()));
}

export function addActions(actions: Action[]): Action[] {
  const unique = new Map(loadActions().map((action) => [action.id, action]));
  for (const action of actions) {
    const previous = unique.get(action.id);
    unique.set(action.id, { ...previous, ...action, completed: false });
  }
  const next = Array.from(unique.values());
  saveActions(next);
  return next;
}

/* ----------------------------- simulations ------------------------------ */

export function loadSimulations(): SavedSimulation[] {
  return read<SavedSimulation[]>(KEYS.simulations) ?? [];
}

export function saveSimulation(simulation: SavedSimulation): SavedSimulation[] {
  const simulations = loadSimulations();
  const index = simulations.findIndex((item) => item.id === simulation.id);
  const next = index === -1
    ? [simulation, ...simulations]
    : simulations.map((item) => (item.id === simulation.id ? simulation : item));
  write(KEYS.simulations, next);
  return next;
}

/* ---------------------------- personal details ---------------------------- */

/** Identifying data used to fill message drafts. Never leaves the device. */
export function loadPersonalDetails(): PersonalDetails {
  return read<PersonalDetails>(KEYS.personalDetails) ?? {};
}

export function savePersonalDetails(details: PersonalDetails): void {
  write(KEYS.personalDetails, details);
}

export function clearPersonalDetails(): void {
  remove(KEYS.personalDetails);
}

/* ------------------------------ opportunities ----------------------------- */

export function loadDismissedOpportunityIds(): string[] {
  return read<string[]>(KEYS.dismissedOpportunities) ?? [];
}

export function saveDismissedOpportunityIds(ids: string[]): void {
  write(KEYS.dismissedOpportunities, Array.from(new Set(ids)));
}

/* --------------------------------- reset ---------------------------------- */

export function clearAll(): void {
  Object.values(KEYS).forEach(remove);

  // Also remove obsolete Borderless keys left behind by older app versions.
  // Never clear the whole origin: localhost may be shared with other projects.
  if (typeof window === "undefined") return;
  try {
    const borderlessKeys = Array.from({ length: window.localStorage.length }, (_, index) =>
      window.localStorage.key(index),
    ).filter((key): key is string => key?.startsWith("borderless.") === true);
    borderlessKeys.forEach(remove);
  } catch {
    /* private mode — the known keys above were still attempted */
  }
}

export const STORAGE_KEYS = KEYS;
