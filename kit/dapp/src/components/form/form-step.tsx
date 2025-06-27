import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { PropsWithChildren } from "react";

interface FormStepProps extends PropsWithChildren {
  title: string;
  description: string;
  contentClassName?: string;
  className?: string;
}

export function FormStep({
  title,
  description,
  children,
  contentClassName,
  className,
}: FormStepProps) {
  return (
    <div className="pl-2">
      <Card className={className}>
        <CardHeader>
          <h2 className="font-semibold text-base">{title}</h2>
          <p className="text-muted-foreground text-sm -mt-1">{description}</p>
        </CardHeader>
        <CardContent className={contentClassName}>{children}</CardContent>
      </Card>
    </div>
  );
}
