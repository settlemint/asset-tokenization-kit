import { FormStep } from '@/components/blocks/form/form-step';
import { FormCheckbox } from '@/components/blocks/form/inputs/form-checkbox';
import { ROLES, type RoleKey } from '@/lib/config/roles';
import type { UpdateRolesInput } from '@/lib/mutations/asset/access-control/update-role/update-role-schema';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

interface RolesProps {
  adminsCount: number;
}

export function Roles({ adminsCount }: RolesProps) {
  const { control } = useFormContext<UpdateRolesInput>();
  const t = useTranslations(
    'private.assets.details.permissions.edit-form.roles'
  );

  return (
    <FormStep title={t('title')} description={t('description')}>
      <div className="space-y-3">
        {(Object.entries(ROLES) as [RoleKey, (typeof ROLES)[RoleKey]][]).map(
          ([key, role]) => (
            <FormCheckbox
              key={key}
              name={`roles.${role.contractRole}`}
              control={control}
              label={role.displayName}
              description={role.description}
              disabled={
                adminsCount === 1 &&
                role.contractRole === ROLES.DEFAULT_ADMIN_ROLE.contractRole
              }
            />
          )
        )}
      </div>
    </FormStep>
  );
}

Roles.validatedFields = ['roles'] as const;
