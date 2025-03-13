import { FormStep } from "@/components/blocks/form/form-step";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { ROLES, type RoleKey } from "@/lib/config/roles";
import type { UpdateRolesInput } from "@/lib/mutations/asset/access-control/update-role/update-role-schema";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

interface RolesProps {
  adminsCount: number;
}

export function Roles({ adminsCount }: RolesProps) {
  const { control } = useFormContext<UpdateRolesInput>();
  const t = useTranslations("admin.asset-permissions-tab.edit-form.roles");
  const roleItems = Object.keys(ROLES) as RoleKey[];

  return (
    <FormStep title={t("title")} description={t("description")}>
      <div className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={control}
            name="roles"
            render={() => (
              <FormItem>
                <div className="space-y-3">
                  {roleItems.map((role) => {
                    const info = ROLES[role];
                    return (
                      <FormField
                        key={role}
                        control={control}
                        name="roles"
                        disabled={
                          adminsCount === 1 && role === "DEFAULT_ADMIN_ROLE"
                        }
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                            <FormControl>
                              <Checkbox
                                name="roles"
                                checked={
                                  field.value?.[info.contractRole] ?? false
                                }
                                disabled={
                                  adminsCount === 1 &&
                                  role === "DEFAULT_ADMIN_ROLE"
                                }
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || {};
                                  const updatedValue = checked
                                    ? {
                                        ...currentValue,
                                        [info.contractRole]: true,
                                      }
                                    : {
                                        ...currentValue,
                                        [info.contractRole]: false,
                                      };

                                  field.onChange(updatedValue);
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>{info.displayName}</FormLabel>
                              <FormDescription>
                                {info.description}
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>
    </FormStep>
  );
}

Roles.validatedFields = ["roles"] as const;
