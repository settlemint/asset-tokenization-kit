import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { KycReadOutput } from "@/orpc/routes/user/kyc/routes/kyc.read.schema";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { ChevronDown, Edit } from "lucide-react";
import { useMemo, useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { EditKycSheet } from "./sheets/kyc/edit-kyc-sheet";

interface ManageProfileDropdownProps {
  user: User;
  kyc: KycReadOutput | null | undefined;
}

type Action = "editKyc";

function isCurrentAction({
  target,
  current,
}: {
  target: Action;
  current: Action | null;
}) {
  return target === current;
}

export function ManageProfileDropdown({
  user,
  kyc,
}: ManageProfileDropdownProps) {
  const { t } = useTranslation(["user", "common"]);
  const [openAction, setOpenAction] = useState<Action | null>(null);

  const actions = useMemo(() => {
    const arr: Array<{
      id: string;
      label: string;
      icon: ComponentType<{ className?: string }>;
      openAction: Action;
      disabled: boolean;
    }> = [];

    // Edit KYC - only show if KYC data exists
    if (kyc) {
      arr.push({
        id: "editKyc",
        label: t("user:profile.editKyc.title"),
        icon: Edit,
        openAction: "editKyc",
        disabled: false,
      });
    }

    return arr;
  }, [kyc, t]);

  const onActionOpenChange = (open: boolean) => {
    setOpenAction(open ? openAction : null);
  };

  // Don't render the dropdown if there are no actions
  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="gap-2 press-effect">
            {t("user:profile.manage")}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-lg"
          align="end"
          sideOffset={4}
        >
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onSelect={() => {
                setOpenAction(action.openAction);
              }}
              disabled={action.disabled}
              className="cursor-pointer"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {kyc && (
        <EditKycSheet
          open={isCurrentAction({
            target: "editKyc",
            current: openAction,
          })}
          onOpenChange={onActionOpenChange}
          user={user}
          currentKyc={kyc}
        />
      )}
    </>
  );
}
