import { Card, CardContent } from '@/components/ui/card';
import type { User } from 'better-auth/types';

export function UserDetailsGrid({
  data,
}: {
  data: User;
}) {
  return (
    <Card className="py-4">
      <CardContent className="grid grid-cols-6 gap-x-4 gap-y-8">
        <div className="space-y-1">
          <span className="font-medium text-muted-foreground text-sm">Name</span>
          <div className="text-md">{data.name}</div>
        </div>
      </CardContent>
    </Card>
  );
}
