import { SavedPlanView } from "@/components/simulations/saved-plan-view";

export default function SavedPlanPage({ params }: { params: { id: string } }) {
  return <SavedPlanView id={params.id} />;
}
