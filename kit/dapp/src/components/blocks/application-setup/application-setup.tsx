import { ApplicationSetupDialog } from "@/components/blocks/application-setup/application-setup-dialog";
import { getApplicationSetupStatus } from "@/lib/queries/application-setup/application-setup-status";
import type { ReactNode } from "react";

interface ApplicationSetupProps {
  children: ReactNode;
}

export async function ApplicationSetup({ children }: ApplicationSetupProps) {
  const { isSetup } = await getApplicationSetupStatus();

  return isSetup ? (
    <>{children}</>
  ) : (
    <div className="min-h-screen w-full bg-[url('/backgrounds/background-lm.svg')] bg-center bg-cover dark:bg-[url('/backgrounds/background-dm.svg')]">
      <ApplicationSetupDialog open={!isSetup} />
    </div>
  );
}
