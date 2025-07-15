import type { SessionUser } from "@/lib/auth";
import { WalletSecurityMain } from "./security/wallet-security-main";

interface WalletSecurityStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  user?: SessionUser | null;
  onSuccess?: () => void;
  onRegisterAction?: (action: () => void) => void;
  forceShowSelection?: boolean;
}

export function WalletSecurityStep(props: WalletSecurityStepProps) {
  return <WalletSecurityMain {...props} />;
}
