import type { ComplianceModuleDetailProps } from "@/components/compliance/details/types";
import { IdentityRestrictionModuleDetail } from "./identity-restriction-module-detail";

export function IdentityAllowlistModuleDetail(
  props: ComplianceModuleDetailProps<"IdentityAllowListComplianceModule">
) {
  return <IdentityRestrictionModuleDetail {...props} />;
}
