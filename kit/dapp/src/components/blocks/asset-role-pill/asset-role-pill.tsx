import {
  type Role,
  type RolesInput,
  getActiveRoles,
  getRoleDisplayName,
} from '@/lib/config/roles';
import type { ReactElement } from 'react';

type AssetRolePillProps = {
  roles?: RolesInput | Role[];
};

export function AssetRolePill({ roles }: AssetRolePillProps): ReactElement {
  const activeRoles = Array.isArray(roles) ? roles : getActiveRoles(roles);
  if (activeRoles.length === 0) {
    return <></>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {activeRoles.map((role) => (
        <span key={role} className="rounded bg-muted px-2 py-1 text-xs">
          {getRoleDisplayName(role)}
        </span>
      ))}
    </div>
  );
}
