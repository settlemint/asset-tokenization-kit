import { memo } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
}

export const SectionHeader = memo(
  ({ title, description }: SectionHeaderProps) => {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground pt-2">{description}</p>
        )}
      </div>
    );
  }
);

SectionHeader.displayName = "SectionHeader";
