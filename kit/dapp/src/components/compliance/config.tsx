import type { ComplianceTypeId } from "@/lib/zod/validators/compliance";
import {
  BanIcon,
  MapPinCheck,
  MapPinMinus,
  ShieldCheckIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react";

interface ComplianceModuleConfig {
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  descriptionKey: string;
}

export const complianceModuleConfig = {
  AddressBlockListComplianceModule: {
    icon: BanIcon,
    titleKey: "modules.addressBlockList.title",
    descriptionKey: "modules.addressBlockList.shortDescription",
  },
  CountryAllowListComplianceModule: {
    icon: MapPinCheck,
    titleKey: "modules.countryAllowList.title",
    descriptionKey: "modules.countryAllowList.shortDescription",
  },
  CountryBlockListComplianceModule: {
    icon: MapPinMinus,
    titleKey: "modules.countryBlockList.title",
    descriptionKey: "modules.countryBlockList.shortDescription",
  },
  IdentityAllowListComplianceModule: {
    icon: UserIcon,
    titleKey: "modules.identityAllowList.title",
    descriptionKey: "modules.identityAllowList.shortDescription",
  },
  IdentityBlockListComplianceModule: {
    icon: ShieldIcon,
    titleKey: "modules.identityBlockList.title",
    descriptionKey: "modules.identityBlockList.shortDescription",
  },
  SMARTIdentityVerificationComplianceModule: {
    icon: ShieldCheckIcon,
    titleKey: "modules.smartIdentityVerification.title",
    descriptionKey: "modules.smartIdentityVerification.shortDescription",
  },
} as const satisfies Record<ComplianceTypeId, ComplianceModuleConfig>;
