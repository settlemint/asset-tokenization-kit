import { cn } from "@/lib/utils";
import type { ThemeTranslateFn } from "../lib/types";

type StatusBannerProps = {
  hasUnsavedChanges: boolean;
  validationSummary: string | null;
  t: ThemeTranslateFn;
};

export function StatusBanner({
  hasUnsavedChanges,
  validationSummary,
  t,
}: StatusBannerProps) {
  if (validationSummary) {
    const lines = validationSummary
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return (
      <div className="rounded-md border border-destructive/60 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {lines.length > 1 ? (
          <ul className="list-disc space-y-1 pl-4">
            {lines.map((line, index) => {
              const cleanLine = line.replace(/^•\s*/, "");
              return <li key={index}>{cleanLine}</li>;
            })}
          </ul>
        ) : (
          <p>{lines[0]}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-md border px-4 py-3 text-sm",
        hasUnsavedChanges
          ? "border-warning text-warning-foreground"
          : "border-muted text-muted-foreground"
      )}
    >
      {hasUnsavedChanges ? t("dirtyMessage") : t("pristineMessage")}
    </div>
  );
}
