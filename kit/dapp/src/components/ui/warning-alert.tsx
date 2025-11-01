import { TriangleAlert } from "lucide-react";
import { memo, type ReactNode } from "react";

interface WarningAlertProps {
  title?: string;
  description: string;
  cta?: ReactNode;
}

export const WarningAlert = memo(
  ({ title, description, cta }: WarningAlertProps) => {
    return (
      <div className="rounded-lg border border-sm-state-warning-background bg-sm-state-warning-background/50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="h-5 w-5 shrink-0 text-sm-state-warning" />
            <div className="flex-1">
              {title ? (
                <h3 className="mb-1 text-sm font-medium text-sm-state-warning whitespace-pre-wrap">
                  {title}
                </h3>
              ) : null}
              <p className="text-sm text-sm-state-warning whitespace-pre-wrap">
                {description}
              </p>
            </div>
          </div>
          {cta ? <div className="shrink-0">{cta}</div> : null}
        </div>
      </div>
    );
  }
);

WarningAlert.displayName = "WarningAlert";
