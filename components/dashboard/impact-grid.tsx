import { ImpactCard } from "./impact-card";
import type { Impact } from "@/lib/types";

export function ImpactGrid({ impacts }: { impacts: Impact[] }) {
  return (
    <div className="grid overflow-hidden border border-border bg-border sm:grid-cols-2">
      {impacts.map((impact) => (
        <ImpactCard key={impact.id} impact={impact} />
      ))}
    </div>
  );
}
