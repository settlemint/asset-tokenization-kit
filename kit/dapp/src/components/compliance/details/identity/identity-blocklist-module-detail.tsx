import type { ComplianceModuleDetailProps } from "@/components/compliance/details/types";
import { IdentityRestrictionModuleDetail } from "./identity-restriction-module-detail";

export function IdentityBlocklistModuleDetail(
  props: ComplianceModuleDetailProps<"IdentityBlockListComplianceModule">
) {
  return <IdentityRestrictionModuleDetail {...props} />;
}
