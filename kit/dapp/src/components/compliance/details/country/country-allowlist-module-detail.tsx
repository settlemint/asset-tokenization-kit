import { CountryRestrictionModuleDetail } from "@/components/compliance/details/country/country-restriction-module-detail";
import type { ComplianceModuleDetailProps } from "@/components/compliance/details/types";

export function CountryAllowlistModuleDetail(
  props: ComplianceModuleDetailProps<"CountryAllowListComplianceModule">
) {
  return <CountryRestrictionModuleDetail {...props} />;
}
