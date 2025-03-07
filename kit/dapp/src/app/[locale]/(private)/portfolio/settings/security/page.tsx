import { PageHeader } from "@/components/layout/page-header";
import { SettingsCards } from "@daveyplate/better-auth-ui";

export default function SecuritySettingsPage() {
  return (
    <>
      <PageHeader title="Security" />
      <SettingsCards
        className="w-full"
        classNames={{
          card: {
            footer: "bg-transparent border-none",
          },
        }}
      />
    </>
  );
}
