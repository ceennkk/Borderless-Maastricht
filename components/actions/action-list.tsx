import { ActionItem } from "./action-item";
import type { Action } from "@/lib/types";

export function ActionList({
  actions,
  onToggle,
}: {
  actions: Action[];
  onToggle: (id: string) => void;
}) {
  return (
    <ul className="divide-y divide-border border border-border bg-card">
      {actions.map((action) => (
        <li key={action.id}>
          <ActionItem action={action} onToggle={() => onToggle(action.id)} />
        </li>
      ))}
    </ul>
  );
}
