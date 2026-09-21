"use client";

/** Stored identifying details, for filling drafts. Local to this device. */
import { useCallback, useEffect, useState } from "react";

import type { PersonalDetails } from "@/lib/personal-details";
import { clearPersonalDetails, loadPersonalDetails, savePersonalDetails } from "@/lib/storage";

export function usePersonalDetails() {
  const [details, setDetails] = useState<PersonalDetails>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDetails(loadPersonalDetails());
    setReady(true);
  }, []);

  const update = useCallback((patch: Partial<PersonalDetails>) => {
    setDetails((prev) => {
      const next = { ...prev, ...patch };
      savePersonalDetails(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    clearPersonalDetails();
    setDetails({});
  }, []);

  return { details, ready, update, clear };
}
