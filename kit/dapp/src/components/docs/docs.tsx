"use client";
import { SidebarLogo } from "@/components/sidebar/sidebar-logo.tsx";
import { ThemeToggle } from "@/components/theme/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  Sidebar as SidebarUI,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/cn";
import { usePathname } from "fumadocs-core/framework";
import Link from "fumadocs-core/link";
import type * as PageTree from "fumadocs-core/page-tree";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { TreeContextProvider, useTreeContext } from "fumadocs-ui/contexts/tree";
import { HomeIcon, SearchIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, useMemo } from "react";

export interface DocsLayoutProps {
  tree: PageTree.Root;
  children: ReactNode;
}

export function DocsLayout({ tree, children }: DocsLayoutProps) {
  return (
    <TreeContextProvider tree={tree}>
      <SidebarProvider className="OnboardedSidebar">
        <Sidebar />
        <SidebarInset>
          <header className="sticky top-0 z-50 flex justify-between w-full h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-sidebar">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <SearchToggle />
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-2 px-4">
              <Button variant="ghost" size="lg" asChild>
                <Link href="/">
                  <HomeIcon className="size-4" /> Back to the application
                </Link>
              </Button>
            </div>
          </header>
          <div className="flex h-[calc(100vh-64px)] flex-row rounded-tl-xl bg-background">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TreeContextProvider>
  );
}

function SearchToggle(props: ComponentProps<"button">) {
  const { enabled, setOpenSearch } = useSearchContext();
  if (!enabled) return;

  return (
    <Button
      {...props}
      variant="outline"
      className={cn(
        "inline-flex items-center gap-2 border p-1.5 ps-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground w-56",
        props.className
      )}
      onClick={() => {
        setOpenSearch(true);
      }}
    >
      <SearchIcon className="size-4" />
      Search
      <div className="ms-auto inline-flex gap-0.5">
        <kbd className="rounded-md border bg-fd-background px-1.5 text-xs font-mono">
          ⌘K
        </kbd>
      </div>
    </Button>
  );
}

function Sidebar() {
  const { root } = useTreeContext();
  const children = useMemo(() => {
    function renderItems(items: PageTree.Node[]) {
      return items.map((item) => (
        <SidebarItem key={item.$id} item={item}>
          {item.type === "folder" ? renderItems(item.children) : null}
        </SidebarItem>
      ));
    }

    return renderItems(root.children);
  }, [root]);

  return (
    <SidebarUI collapsible="icon" className="group-data-[side=left]:border-0">
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="mt-6">
          <SidebarMenu>{children}</SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </SidebarUI>
  );
}

function SidebarItem({
  item,
  children,
}: {
  item: PageTree.Node;
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (item.type === "page") {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild isActive={pathname === item.url}>
          <Link href={item.url}>
            {item.icon}
            {item.name}
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  if (item.type === "separator") {
    return (
      <p className="text-fd-muted-foreground mt-6 mb-2 first:mt-0">
        {item.icon}
        {item.name}
      </p>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={item.index ? pathname === item.index.url : false}
      >
        {item.index ? (
          <Link href={item.index.url}>
            {item.index.icon}
            {item.index.name}
          </Link>
        ) : (
          <span>
            {item.icon}
            {item.name}
          </span>
        )}
      </SidebarMenuButton>
      {children ? <SidebarMenuSub>{children}</SidebarMenuSub> : null}
    </SidebarMenuItem>
  );
}
