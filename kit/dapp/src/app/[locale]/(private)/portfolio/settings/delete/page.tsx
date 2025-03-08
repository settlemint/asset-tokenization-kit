import { PageHeader } from "@/components/layout/page-header";
import { DeleteAccountCard } from "@daveyplate/better-auth-ui";

export default function SecuritySettingsPage() {
  return (
    <>
      <PageHeader title="Delete Account" section="Settings" />
      <DeleteAccountCard
        classNames={{
          footer:
            "p-6 py-4 md:py-3 bg-transparent border-none justify-self-end",
        }}
      />
    </>
  );
}
