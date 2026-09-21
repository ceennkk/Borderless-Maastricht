import { FormFillerView } from "@/components/forms/form-filler-view";

export const metadata = {
  title: "Form Assistant | Borderless",
};

export default function FormsPage() {
  return (
    <div className="mx-auto max-w-2xl pt-6">
      <FormFillerView />
    </div>
  );
}
