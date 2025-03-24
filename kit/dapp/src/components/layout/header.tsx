import { UserDropdown } from "@/components/layout/user-dropdown";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getUser } from "@/lib/auth/utils";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import { Search } from "../blocks/search/search";

export default async function Header() {
  const user = await getUser();
  const userDetails = await getUserDetail({ id: user.id });
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 bg-sidebar transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Search />
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <UserDropdown user={userDetails} />
      </div>
    </header>
  );
}
