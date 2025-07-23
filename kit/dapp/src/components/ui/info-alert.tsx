import { memo } from "react";

interface InfoAlertProps {
  title: string;
  description?: string;
}

export const InfoAlert = memo(({ title, description }: InfoAlertProps) => {
  return (
    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

InfoAlert.displayName = "InfoAlert";
