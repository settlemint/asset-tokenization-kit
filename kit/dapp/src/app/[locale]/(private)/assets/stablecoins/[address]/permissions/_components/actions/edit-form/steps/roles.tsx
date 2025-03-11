import { FormStep } from "@/components/blocks/form/form-step";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { ROLES, type Role, type RoleKey } from "@/lib/config/roles";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Roles() {
  const { control } = useFormContext();
  const t = useTranslations("admin.stablecoins.permissions.edit-form.roles");

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
                  {(
                    Object.entries(ROLES) as [
                      RoleKey,
                      (typeof ROLES)[RoleKey],
                    ][]
                  ).map(([key, role]) => (
                    <FormField
                      key={key}
                      control={control}
                      name="roles"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                          <FormControl>
                            <Checkbox
                              name={`roles`}
                              checked={field.value?.includes(role.contractRole)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [];
                                const updatedValue = checked
                                  ? [...currentValue, role.contractRole]
                                  : currentValue.filter(
                                      (r: Role) => r !== role.contractRole
                                    );
                                field.onChange(updatedValue);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{role.displayName}</FormLabel>
                            <FormDescription>
                              {role.description}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
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
