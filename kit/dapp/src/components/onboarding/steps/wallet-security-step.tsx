import { WalletSecurityMain } from "./security/wallet-security-main";

interface WalletSecurityStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
  onSuccess?: () => void;
  onRegisterAction?: (action: () => void) => void;
  forceShowSelection?: boolean;
}

export function WalletSecurityStep(props: WalletSecurityStepProps) {
  return <WalletSecurityMain {...props} />;
}
