import { Card, CardContent } from '@/components/ui/card';
import type { PropsWithChildren } from 'react';

export function DetailGrid({ children }: PropsWithChildren) {
  return (
    <Card className="py-4">
      <CardContent className="grid grid-cols-4 gap-x-4 gap-y-8">{children}</CardContent>
    </Card>
  );
}
