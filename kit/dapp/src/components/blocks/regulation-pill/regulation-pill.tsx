"use client";

import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import type { RegulationType } from "@/lib/db/regulations/schema-base-regulation-configs";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

interface RegulationPillProps {
  type: RegulationType;
  documentationUrl: string;
}

export function RegulationPill({
  type,
  documentationUrl,
}: RegulationPillProps): ReactElement {
  const t = useTranslations("regulations");

  return (
    <Badge
      asChild
      variant="secondary"
      className="!bg-success/80 !text-success-foreground border-transparent"
    >
      <Link
        href={documentationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors cursor-pointer hover:!bg-success/60 hover:!text-success-foreground"
      >
        <CheckCircle className="mr-1 size-3" />
        <span>{t(`${type}.name`)}</span>
      </Link>
    </Badge>
  );
}
