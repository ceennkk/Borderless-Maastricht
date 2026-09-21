import { ImpactCard } from "./impact-card";
import type { Impact } from "@/lib/types";

export function ImpactGrid({ impacts }: { impacts: Impact[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {impacts.map((impact) => (
        <ImpactCard key={impact.id} impact={impact} />
      ))}
    </div>
  );
}
