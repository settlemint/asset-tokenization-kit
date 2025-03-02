import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PauseCircle, PlayCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

export function ActivePill({ paused }: { paused: boolean }): ReactElement {
  const t = useTranslations("components.active-pill");

  return (
    <Badge
      variant={paused ? "destructive" : "default"}
      className={cn(
        "bg-destructive/20 text-destructive",
        paused && "bg-success/20 text-success"
      )}
    >
      {paused ? (
        <>
          <PauseCircle className="mr-1 h-3 w-3" />
          <span>{t("paused")}</span>
        </>
      ) : (
        <>
          <PlayCircle className="mr-1 h-3 w-3" />
          <span>{t("active")}</span>
        </>
      )}
    </Badge>
  );
}
