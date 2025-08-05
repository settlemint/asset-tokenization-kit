import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

// Main container component
export type ComplianceDetailCardProps = React.HTMLAttributes<HTMLDivElement>;

export function ComplianceDetailCard({
  className,
  ...props
}: ComplianceDetailCardProps) {
  return (
    <div
      data-slot="compliance-detail-card"
      className={cn("flex flex-col h-full", className)}
      {...props}
    />
  );
}

// Header section component
export type ComplianceDetailHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function ComplianceDetailHeader({
  className,
  ...props
}: ComplianceDetailHeaderProps) {
  return (
    <div
      data-slot="compliance-detail-header"
      className={cn("flex items-center mb-4", className)}
      {...props}
    />
  );
}

// Breadcrumb/back button component
export type ComplianceDetailBreadcrumbProps = Omit<
  React.ComponentProps<typeof Button>,
  "variant" | "size"
> & {
  onClose: () => void;
};

export function ComplianceDetailBreadcrumb({
  onClose,
  children,
  className,
  ...props
}: ComplianceDetailBreadcrumbProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClose}
      className={cn(
        "flex items-center gap-2 text-muted-foreground hover:text-foreground press-effect",
        className
      )}
      {...props}
    >
      <ArrowLeftIcon className="w-4 h-4" />
      {children}
    </Button>
  );
}

// Content area component
export type ComplianceDetailContentProps = React.HTMLAttributes<HTMLDivElement>;

export function ComplianceDetailContent({
  className,
  ...props
}: ComplianceDetailContentProps) {
  return (
    <div
      data-slot="compliance-detail-content"
      className={cn("flex-1", className)}
      {...props}
    />
  );
}

// Content section wrapper
export type ComplianceDetailSectionProps = React.HTMLAttributes<HTMLDivElement>;

export function ComplianceDetailSection({
  className,
  ...props
}: ComplianceDetailSectionProps) {
  return (
    <div
      data-slot="compliance-detail-section"
      className={cn("flex flex-col items-start mb-6 space-y-6", className)}
      {...props}
    />
  );
}

// Title component with icon and action slots
export type ComplianceDetailTitleProps =
  React.HTMLAttributes<HTMLDivElement> & {
    icon?: ReactNode;
    action?: ReactNode;
  };

export function ComplianceDetailTitle({
  icon,
  action,
  className,
  children,
  ...props
}: ComplianceDetailTitleProps) {
  return (
    <div
      data-slot="compliance-detail-title"
      className={cn("flex items-center justify-between w-full", className)}
      {...props}
    >
      <div className="flex items-center justify-center space-x-4 mb-4">
        {icon && <div>{icon}</div>}
        <h2 className="text-2xl font-semibold leading-none tracking-tight">
          {children}
        </h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Description component
export type ComplianceDetailDescriptionProps =
  React.HTMLAttributes<HTMLDivElement>;

export function ComplianceDetailDescription({
  className,
  children,
  ...props
}: ComplianceDetailDescriptionProps) {
  return (
    <div data-slot="compliance-detail-description" {...props}>
      <p
        className={cn(
          "text-muted-foreground text-sm leading-relaxed",
          className
        )}
      >
        {children}
      </p>
    </div>
  );
}

// Form content area component
export type ComplianceDetailFormProps = React.HTMLAttributes<HTMLDivElement>;

export function ComplianceDetailForm({
  className,
  ...props
}: ComplianceDetailFormProps) {
  return (
    <div
      data-slot="compliance-detail-form"
      className={cn("w-full", className)}
      {...props}
    />
  );
}

// Footer component
export type ComplianceDetailFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function ComplianceDetailFooter({
  className,
  ...props
}: ComplianceDetailFooterProps) {
  return (
    <div
      data-slot="compliance-detail-footer"
      className={cn("flex items-center justify-between gap-3 pt-6", className)}
      {...props}
    />
  );
}

// Actions component for enable/disable buttons
export type ComplianceDetailActionsProps = {
  isEnabled: boolean;
  onEnable: () => void;
  onDisable: () => void;
  onClose: () => void;
};

export function ComplianceDetailActions({
  isEnabled,
  onEnable,
  onDisable,
  onClose,
}: ComplianceDetailActionsProps) {
  const { t } = useTranslation("form");

  return (
    <>
      {isEnabled && (
        <Button
          variant="outline"
          onClick={() => {
            onDisable();
            onClose();
          }}
          className="press-effect"
        >
          {t("buttons.disable")}
        </Button>
      )}
      {!isEnabled && (
        <Button onClick={onEnable} className="press-effect">
          {t("buttons.enable")}
        </Button>
      )}
    </>
  );
}
