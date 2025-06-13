import { PendingTransactionsDropdown } from "@/components/blocks/pending-transactions-dropdown/pending-transactions-dropdown";
import { UserDropdown } from "@/components/layout/user-dropdown";
import { SignedIn } from "@daveyplate/better-auth-ui";
import { Search } from "../blocks/search/search";

export default async function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 bg-sidebar transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <Search />
      </div>
      <div className="ml-auto rtl:ml-0 rtl:mr-auto flex items-center gap-2 px-4">
        <PendingTransactionsDropdown />
        <SignedIn>
          <UserDropdown />
        </SignedIn>
      </div>
    </header>
  );
}
