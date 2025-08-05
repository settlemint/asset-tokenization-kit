import { AddressRestrictionModuleDetail } from "@/components/compliance/details/address/address-restriction-module-detail";
import type { ComplianceModuleDetailProps } from "@/components/compliance/details/types";

export function IdentityBlocklistModuleDetail(
  props: ComplianceModuleDetailProps<"IdentityBlockListComplianceModule">
) {
  return <AddressRestrictionModuleDetail {...props} />;
}
