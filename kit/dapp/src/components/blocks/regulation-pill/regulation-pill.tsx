import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";

interface RegulationPillProps {
  id: string;
  certificateUrl: string;
}

export function RegulationPill({
  id,
  certificateUrl,
}: RegulationPillProps): ReactElement {
  return (
    <Badge
      asChild
      variant="secondary"
      className="!bg-success/80 !text-success-foreground border-transparent"
    >
      <Link
        href={certificateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors cursor-pointer hover:!bg-success/60 hover:!text-success-foreground"
      >
        <CheckCircle className="mr-1 size-3" />
        <span>{id}</span>
      </Link>
    </Badge>
  );
}
