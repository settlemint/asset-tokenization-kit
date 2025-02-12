import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { roles } from '@/lib/roles';
import type { RoleAdminChangedEvent } from '../fragments';

interface RoleAdminChangedDetailsProps {
  details: RoleAdminChangedEvent;
}

export function RoleAdminChangedDetails({ details }: RoleAdminChangedDetailsProps) {
  return (
    <Card>
      <CardHeader>Details</CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[1fr_2fr] gap-4">
          <dt className="text-muted-foreground text-sm">Role:</dt>
          <dd className="text-sm">{roles[details.role]}</dd>
          <dt className="text-muted-foreground text-sm">Previous Admin Role:</dt>
          <dd className="text-sm">{details.previousAdminRole}</dd>
          <dt className="text-muted-foreground text-sm">New Admin Role:</dt>
          <dd className="text-sm">{details.newAdminRole}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
