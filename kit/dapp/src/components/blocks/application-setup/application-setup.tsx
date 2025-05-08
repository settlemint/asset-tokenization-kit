import { ApplicationSetupDialog } from "@/components/blocks/application-setup/application-setup-dialog";
import { getContracts } from "@/lib/queries/contracts/deployed-contracts-list";
import type { ReactNode } from "react";

interface ApplicationSetupProps {
  children: ReactNode;
}

export async function ApplicationSetup({ children }: ApplicationSetupProps) {
  const deployedContracts = await getContracts({
    abiName: "Portal",
  });

  const isSetup = deployedContracts?.getContracts?.count ?? 0 > 0;

  return isSetup ? (
    <>{children}</>
  ) : (
    <div className="min-h-screen w-full bg-[url('/backgrounds/background-lm.svg')] bg-center bg-cover dark:bg-[url('/backgrounds/background-dm.svg')]">
      <ApplicationSetupDialog open={!isSetup} />
    </div>
  );
}
