import { TriangleAlert } from "lucide-react";
import { memo } from "react";

interface WarningAlertProps {
  title?: string;
  description: string;
}

export const WarningAlert = memo(
  ({ title, description }: WarningAlertProps) => {
    return (
      <div className="rounded-lg bg-sm-state-warning-background/50 border border-sm-state-warning-background p-4">
        <div className="flex items-start gap-3">
          <TriangleAlert className="h-5 w-5 text-sm-state-warning flex-shrink-0" />
          <div className="flex-1">
            {title ? (
              <h3 className="text-sm font-medium text-sm-state-warning mb-1 whitespace-pre-wrap">
                {title}
              </h3>
            ) : null}
            <p className="text-sm text-sm-state-warning whitespace-pre-wrap">
              {description}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

WarningAlert.displayName = "WarningAlert";
