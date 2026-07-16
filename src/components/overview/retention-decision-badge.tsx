import { StatusBadge } from "@/components/status-badge";
import type { FormOverview } from "@/presentation/form-overview";

export function RetentionDecisionBadge({
  decision,
  prominent = false,
}: {
  decision: FormOverview["decision"];
  prominent?: boolean;
}) {
  return (
    <span className={prominent ? "inline-flex scale-105 origin-left" : "inline-flex"}>
      <StatusBadge decision={decision} />
    </span>
  );
}
