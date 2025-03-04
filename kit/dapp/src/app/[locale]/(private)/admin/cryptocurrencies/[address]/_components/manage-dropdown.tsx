"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import { GrantRoleForm } from "./grant-role-form/form";
import { MintForm } from "./mint-form/form";

interface ManageDropdownProps {
  address: Address;
}

export function ManageDropdown({ address }: ManageDropdownProps) {
  const t = useTranslations("admin.cryptocurrencies.manage");
  const menuItems = useMemo(
    () =>
      [
        {
          id: "mint",
          label: t("actions.mint"),
        },
        {
          id: "grant-role",
          label: t("actions.grant-role"),
        },
      ] as const,
    [t]
  );
  const [selectedItem, setSelectedItem] = useState<
    (typeof menuItems)[number]["id"] | null
  >(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="bg-accent text-accent-foreground hover:bg-accent-hover shadow-inset"
          >
            {t("manage")}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="relative right-4 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded p-0 shadow-dropdown">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => setSelectedItem(item.id)}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <MintForm
        address={address}
        open={selectedItem === "mint"}
        onOpenChange={() => setSelectedItem(null)}
      />
      <GrantRoleForm
        address={address}
        open={selectedItem === "grant-role"}
        onOpenChange={() => setSelectedItem(null)}
      />
    </>
  );
}
