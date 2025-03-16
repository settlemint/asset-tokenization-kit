import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { PropsWithChildren } from 'react';

interface FormStepProps extends PropsWithChildren {
  title: string;
  description: string;
}

export function FormStep({ title, description, children }: FormStepProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-base">{title}</h2>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
