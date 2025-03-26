"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

export type AdminRole = "admin" | "user-manager" | "issuer";

interface AdminRolesBadgesProps {
  roles: AdminRole[];
  onChangeRoles?: (newRoles: AdminRole[]) => void;
  className?: string;
}

export function AdminRolesBadges({ roles, onChangeRoles, className }: AdminRolesBadgesProps) {
  const t = useTranslations("private.assets.create.form.steps.token-admins");

  const getRoleTranslation = (role: AdminRole) => t(`roles.${role}`);

  return (
    <div className={`flex gap-1 ${className ?? ""}`}>
      {(["admin", "user-manager", "issuer"] as const).map((role) => (
        <Tooltip key={role}>
          <TooltipTrigger asChild>
            <Badge
              variant={roles.includes(role) ? "default" : "outline"}
              className={onChangeRoles ? "cursor-pointer" : undefined}
              onClick={
                onChangeRoles
                  ? () => {
                      const newRoles = roles.includes(role)
                        ? roles.filter((r) => r !== role)
                        : [...roles, role];
                      onChangeRoles(newRoles);
                    }
                  : undefined
              }
            >
              {getRoleTranslation(role)}
            </Badge>
          </TooltipTrigger>
          {onChangeRoles && (
            <TooltipContent>
              {roles.includes(role) ? t("remove-role") : t("add-role")}
            </TooltipContent>
          )}
        </Tooltip>
      ))}
    </div>
  );
} 