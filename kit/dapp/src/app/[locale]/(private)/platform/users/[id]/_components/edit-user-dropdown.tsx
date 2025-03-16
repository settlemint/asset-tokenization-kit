'use client';

import { ChangeRoleAction } from '@/app/[locale]/(private)/platform/users/(table)/_components/actions/change-role-action';
import { UpdateKycStatusAction } from '@/app/[locale]/(private)/platform/users/(table)/_components/actions/update-kyc-status-action';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { getUserDetail } from '@/lib/queries/user/user-detail';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface EditUserDropdownProps {
  user: Awaited<ReturnType<typeof getUserDetail>>;
}

export function EditUserDropdown({ user }: EditUserDropdownProps) {
  const t = useTranslations('admin.users.detail');

  const menuItems = [
    {
      id: 'change-role',
      label: 'Change Role',
    },
    {
      id: 'update-kyc-status',
      label: 'Update KYC Status',
    },
  ] as const;

  const [openMenuItem, setOpenMenuItem] = useState<
    (typeof menuItems)[number]['id'] | null
  >(null);

  const onFormOpenChange = (open: boolean) => {
    if (!open) {
      setOpenMenuItem(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-accent text-accent-foreground shadow-inset hover:bg-accent-hover">
            {t('edit_user')}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="relative right-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded p-0 shadow-dropdown">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => setOpenMenuItem(item.id)}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangeRoleAction
        user={user}
        open={openMenuItem === 'change-role'}
        onOpenChange={onFormOpenChange}
      />
      <UpdateKycStatusAction
        user={user}
        open={openMenuItem === 'update-kyc-status'}
        onOpenChange={onFormOpenChange}
      />
    </>
  );
}
