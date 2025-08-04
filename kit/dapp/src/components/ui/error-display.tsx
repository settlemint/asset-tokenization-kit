import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ErrorDisplayProps {
  title?: string;
  description?: string;
  errorCode?: string | number;
  onRetry?: () => void;
  showRetry?: boolean;
  showGoBack?: boolean;
  showHome?: boolean;
}

export function ErrorCodeDisplay({
  errorCode,
}: {
  errorCode?: string | number;
}) {
  if (!errorCode) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <span className="text-[20rem] sm:text-[25rem] font-bold text-foreground/[0.05] dark:text-foreground/[0.05] select-none">
        {errorCode}
      </span>
    </div>
  );
}

export function ErrorDisplay({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  onRetry,
  showRetry = true,
  showGoBack = true,
  showHome = true,
}: ErrorDisplayProps) {
  const { t } = useTranslation("errors");

  return (
    <div className="relative text-center z-[1] pt-32 sm:pt-52">
      <h1 className="text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
        {title}
      </h1>
      <p className="mt-6 text-pretty text-lg font-medium text-muted-foreground sm:text-xl/8">
        {description}
      </p>
      <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-y-3 gap-x-4">
        {showRetry && onRetry && (
          <Button onClick={onRetry} className="group press-effect">
            <RefreshCw
              className="me-2 transition-transform group-hover:rotate-180"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            {t("buttons.tryAgain")}
          </Button>
        )}
        {showGoBack && (
          <Button
            variant="secondary"
            className="group"
            onClick={() => {
              window.history.back();
            }}
          >
            <ArrowLeft
              className="me-2 ms-0 opacity-60 transition-transform group-hover:-translate-x-0.5"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            {t("buttons.goBack")}
          </Button>
        )}
        {showHome && (
          <Button variant="outline" asChild>
            <Link to="/">
              <Home
                className="me-2"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              {t("buttons.goHome")}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
