import { PageHeader } from "@/components/layout/page-header";
import {
  ChangeEmailCard,
  ChangePasswordCard,
  DeleteAccountCard,
  ProvidersCard,
  UpdateNameCard,
} from "@daveyplate/better-auth-ui";

export default function SecuritySettingsPage() {
  return (
    <>
      <PageHeader title="Profile" section="Settings" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <UpdateNameCard
          classNames={{
            footer:
              "p-6 py-4 md:py-3 grid grid-cols-2 gap-4 bg-transparent border-none [&>*:first-child]:justify-self-start [&>*:last-child]:justify-self-end",
          }}
        />
        <ChangeEmailCard
          classNames={{
            footer:
              "p-6 py-4 md:py-3 grid grid-cols-2 gap-4 bg-transparent border-none [&>*:first-child]:justify-self-start [&>*:last-child]:justify-self-end",
          }}
        />
      </div>
      <ChangePasswordCard
        classNames={{
          footer:
            "p-6 py-4 md:py-3 grid grid-cols-2 gap-4 bg-transparent border-none [&>*:first-child]:justify-self-start [&>*:last-child]:justify-self-end",
        }}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <ProvidersCard
          classNames={{
            footer:
              "p-6 py-4 md:py-3 grid grid-cols-2 gap-4 bg-transparent border-none [&>*:first-child]:justify-self-start [&>*:last-child]:justify-self-end",
          }}
        />
        <div className="p-6 py-4 md:py-3 grid grid-cols-2 gap-4 bg-transparent border-none [&>*:first-child]:justify-self-start [&>*:last-child]:justify-self-end">
          Passkeys go here
        </div>
      </div>
      <DeleteAccountCard
        classNames={{
          footer:
            "p-6 py-4 md:py-3 bg-transparent border-none justify-self-end",
        }}
      />
    </>
  );
}
