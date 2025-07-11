import type { SessionUser } from "@/lib/auth";
import { SystemBootstrapMain } from "./system/system-bootstrap-main";

interface SystemBootstrapStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  user?: SessionUser;
}

export function SystemBootstrapStep(props: SystemBootstrapStepProps) {
  return <SystemBootstrapMain {...props} />;
}
