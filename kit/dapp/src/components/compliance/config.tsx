import type { ComplianceTypeId } from "@atk/zod/compliance";
import {
  BanIcon,
  HandshakeIcon,
  LockIcon,
  MapPinCheck,
  MapPinMinus,
  PercentIcon,
  ShieldCheckIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

interface ComplianceModuleConfig {
  icon: React.ComponentType<{ className?: string }>;
  implemented: boolean;
}

export const complianceModuleConfig = {
  AddressBlockListComplianceModule: {
    icon: BanIcon,
    implemented: true,
  },
  CountryAllowListComplianceModule: {
    icon: MapPinCheck,
    implemented: true,
  },
  CountryBlockListComplianceModule: {
    icon: MapPinMinus,
    implemented: true,
  },
  IdentityAllowListComplianceModule: {
    icon: UserIcon,
    implemented: true,
  },
  IdentityBlockListComplianceModule: {
    icon: ShieldIcon,
    implemented: true,
  },
  SMARTIdentityVerificationComplianceModule: {
    icon: ShieldCheckIcon,
    implemented: true,
  },
  TokenSupplyLimitComplianceModule: {
    icon: PercentIcon,
    implemented: false,
  },
  InvestorCountComplianceModule: {
    icon: UsersIcon,
    implemented: false,
  },
  TimeLockComplianceModule: {
    icon: LockIcon,
    implemented: false,
  },
  TransferApprovalComplianceModule: {
    icon: HandshakeIcon,
    implemented: false,
  },
} as const satisfies Record<ComplianceTypeId, ComplianceModuleConfig>;
