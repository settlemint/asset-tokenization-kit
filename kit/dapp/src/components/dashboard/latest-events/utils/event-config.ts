import type { badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUpFromLine,
  CheckCircle2,
  Coins,
  DollarSign,
  FileCheck,
  FileText,
  Flame,
  Key,
  Link,
  Lock,
  LockOpen,
  MapPin,
  Pause,
  Play,
  Plus,
  RefreshCw,
  ScrollText,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Vault,
  XCircle,
  type LucideIcon,
} from "lucide-react";

// Types
export type EventStatusType = "success" | "warning" | "error" | "info";
export type EventCategoryKey =
  | "assets"
  | "bonds"
  | "accessControl"
  | "compliance"
  | "identity"
  | "transfers"
  | "yield"
  | "system"
  | "xvp"
  | "vesting"
  | "default";

export interface EventCategory {
  name: string;
  variant: NonNullable<VariantProps<typeof badgeVariants>["variant"]>;
  translationKey: string;
}

export interface EventStatus {
  type: EventStatusType;
  icon: LucideIcon;
  iconClassName: string;
}

export interface EventConfig {
  category: EventCategoryKey;
  statusType: EventStatusType;
  icon: LucideIcon;
}

// Category definitions
export const CATEGORY_MAP = {
  assets: {
    name: "Assets",
    variant: "default",
    translationKey: "categories.assets",
  },
  bonds: {
    name: "Bonds",
    variant: "default",
    translationKey: "categories.bonds",
  },
  accessControl: {
    name: "Access Control",
    variant: "destructive",
    translationKey: "categories.accessControl",
  },
  compliance: {
    name: "Compliance",
    variant: "default",
    translationKey: "categories.compliance",
  },
  identity: {
    name: "Identity",
    variant: "secondary",
    translationKey: "categories.identity",
  },
  transfers: {
    name: "Transfers",
    variant: "default",
    translationKey: "categories.transfers",
  },
  yield: {
    name: "Yield",
    variant: "default",
    translationKey: "categories.yield",
  },
  system: {
    name: "System",
    variant: "outline",
    translationKey: "categories.system",
  },
  xvp: {
    name: "XvP Settlement",
    variant: "default",
    translationKey: "categories.xvp",
  },
  vesting: {
    name: "Vesting",
    variant: "default",
    translationKey: "categories.vesting",
  },
  default: {
    name: "Activity",
    variant: "outline",
    translationKey: "categories.activity",
  },
} as const;

// Status color mapping
const STATUS_COLOR_MAP: Record<EventStatusType, string> = {
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
  info: "text-muted-foreground",
};

// Comprehensive event configuration registry
export const EVENT_CONFIG_REGISTRY = {
  // Transfer and token events
  TransferCompleted: {
    category: "transfers",
    statusType: "success",
    icon: ArrowRightLeft,
  },
  MintCompleted: { category: "transfers", statusType: "success", icon: Plus },
  BurnCompleted: { category: "transfers", statusType: "success", icon: Flame },
  Approval: {
    category: "transfers",
    statusType: "success",
    icon: CheckCircle2,
  },
  Paused: { category: "transfers", statusType: "warning", icon: Pause },
  Unpaused: { category: "transfers", statusType: "success", icon: Play },
  TokensFrozen: { category: "transfers", statusType: "warning", icon: Lock },
  TokensUnfrozen: {
    category: "transfers",
    statusType: "info",
    icon: LockOpen,
  },
  AddressFrozen: { category: "transfers", statusType: "warning", icon: Lock },
  RecoverySuccess: {
    category: "transfers",
    statusType: "success",
    icon: CheckCircle2,
  },
  ERC20TokenRecovered: {
    category: "transfers",
    statusType: "success",
    icon: CheckCircle2,
  },
  UpdatedTokenInformation: {
    category: "transfers",
    statusType: "info",
    icon: FileText,
  },
  TokensWithdrawn: {
    category: "transfers",
    statusType: "success",
    icon: ArrowUpFromLine,
  },
  Deposit: {
    category: "transfers",
    statusType: "success",
    icon: ArrowDownToLine,
  },
  CapSet: { category: "transfers", statusType: "info", icon: Settings },
  Redeemed: { category: "transfers", statusType: "success", icon: Coins },

  // Asset creation events
  BondCreated: { category: "bonds", statusType: "success", icon: ScrollText },
  BondMatured: { category: "bonds", statusType: "success", icon: FileCheck },
  BondRedeemed: { category: "bonds", statusType: "success", icon: Coins },
  FundCreated: { category: "assets", statusType: "success", icon: ScrollText },
  EquityCreated: {
    category: "assets",
    statusType: "success",
    icon: ScrollText,
  },
  DepositCreated: {
    category: "assets",
    statusType: "success",
    icon: ScrollText,
  },
  StableCoinCreated: { category: "assets", statusType: "success", icon: Coins },
  TokenAssetCreated: { category: "assets", statusType: "success", icon: Plus },
  ATKPushAirdropCreated: {
    category: "assets",
    statusType: "success",
    icon: Plus,
  },
  ATKVestingAirdropCreated: {
    category: "vesting",
    statusType: "success",
    icon: Plus,
  },
  ATKTimeBoundAirdropCreated: {
    category: "assets",
    statusType: "success",
    icon: Plus,
  },
  ATKFixedYieldScheduleCreated: {
    category: "assets",
    statusType: "success",
    icon: TrendingUp,
  },
  ATKVaultCreated: { category: "assets", statusType: "success", icon: Vault },
  ATKXvPSettlementCreated: {
    category: "xvp",
    statusType: "success",
    icon: FileCheck,
  },
  AirdropTokensTransferred: {
    category: "transfers",
    statusType: "success",
    icon: ArrowRightLeft,
  },
  AirdropBatchTokensTransferred: {
    category: "transfers",
    statusType: "success",
    icon: ArrowRightLeft,
  },

  // Identity events
  IdentityRegistered: {
    category: "identity",
    statusType: "success",
    icon: UserCheck,
  },
  IdentityCreated: { category: "identity", statusType: "success", icon: User },
  IdentityModified: { category: "identity", statusType: "info", icon: User },
  IdentityStored: { category: "identity", statusType: "info", icon: Shield },
  IdentityUnstored: { category: "identity", statusType: "info", icon: Shield },
  ContractIdentityCreated: {
    category: "identity",
    statusType: "success",
    icon: User,
  },
  IdentityRemoved: {
    category: "identity",
    statusType: "warning",
    icon: UserMinus,
  },
  IdentityRecovered: {
    category: "identity",
    statusType: "success",
    icon: CheckCircle2,
  },
  IdentityWalletMarkedAsLost: {
    category: "identity",
    statusType: "warning",
    icon: AlertCircle,
  },
  WalletRecoveryLinked: {
    category: "identity",
    statusType: "info",
    icon: Link,
  },
  CountryModified: { category: "identity", statusType: "info", icon: MapPin },
  IdentityRegistryBound: {
    category: "identity",
    statusType: "info",
    icon: Link,
  },
  IdentityRegistryUnbound: {
    category: "identity",
    statusType: "info",
    icon: Link,
  },
  Approved: {
    category: "identity",
    statusType: "success",
    icon: CheckCircle2,
  },
  Executed: {
    category: "identity",
    statusType: "success",
    icon: CheckCircle2,
  },
  ExecutionFailed: {
    category: "identity",
    statusType: "error",
    icon: XCircle,
  },
  ExecutionRequested: {
    category: "identity",
    statusType: "info",
    icon: FileText,
  },
  KeyAdded: { category: "identity", statusType: "success", icon: Key },
  KeyRemoved: { category: "identity", statusType: "warning", icon: Key },

  // Access control events
  RoleGranted: { category: "accessControl", statusType: "success", icon: Key },
  RoleRevoked: {
    category: "accessControl",
    statusType: "warning",
    icon: ShieldAlert,
  },
  RoleAdminChanged: {
    category: "accessControl",
    statusType: "info",
    icon: Key,
  },
  OwnershipTransferred: {
    category: "accessControl",
    statusType: "info",
    icon: ArrowRightLeft,
  },

  // Compliance events
  ComplianceAdded: {
    category: "compliance",
    statusType: "success",
    icon: ShieldCheck,
  },
  ComplianceModuleAdded: {
    category: "compliance",
    statusType: "success",
    icon: ShieldCheck,
  },
  ComplianceModuleRemoved: {
    category: "compliance",
    statusType: "warning",
    icon: ShieldAlert,
  },
  ComplianceModuleRegistered: {
    category: "compliance",
    statusType: "info",
    icon: FileCheck,
  },
  ModuleParametersUpdated: {
    category: "compliance",
    statusType: "info",
    icon: Settings,
  },
  GlobalComplianceModuleAdded: {
    category: "compliance",
    statusType: "success",
    icon: ShieldCheck,
  },
  GlobalComplianceModuleRemoved: {
    category: "compliance",
    statusType: "warning",
    icon: ShieldAlert,
  },
  GlobalComplianceModuleParametersUpdated: {
    category: "compliance",
    statusType: "info",
    icon: Settings,
  },
  AddressAddedToBypassList: {
    category: "compliance",
    statusType: "info",
    icon: UserPlus,
  },
  AddressRemovedFromBypassList: {
    category: "compliance",
    statusType: "info",
    icon: UserMinus,
  },

  // Claims
  ClaimAdded: { category: "identity", statusType: "info", icon: FileText },
  ClaimRemoved: { category: "identity", statusType: "info", icon: FileText },
  ClaimChanged: { category: "identity", statusType: "info", icon: FileText },
  ClaimRevoked: {
    category: "identity",
    statusType: "warning",
    icon: AlertCircle,
  },

  // Yield events
  YieldClaimed: { category: "yield", statusType: "success", icon: DollarSign },
  CheckpointUpdated: {
    category: "yield",
    statusType: "info",
    icon: TrendingUp,
  },
  YieldScheduleSet: { category: "yield", statusType: "info", icon: TrendingUp },
  FixedYieldScheduleSet: {
    category: "yield",
    statusType: "info",
    icon: TrendingUp,
  },
  ManagementFeeCollected: {
    category: "yield",
    statusType: "info",
    icon: DollarSign,
  },
  DenominationAssetTopUp: {
    category: "yield",
    statusType: "success",
    icon: ArrowDownToLine,
  },
  DenominationAssetWithdrawn: {
    category: "yield",
    statusType: "info",
    icon: ArrowUpFromLine,
  },

  // System and configuration events
  Bootstrapped: { category: "system", statusType: "info", icon: Settings },
  ATKSystemCreated: { category: "system", statusType: "info", icon: Settings },
  TokenFactoryRegistered: {
    category: "system",
    statusType: "info",
    icon: FileText,
  },
  SystemAddonRegistered: {
    category: "system",
    statusType: "info",
    icon: FileText,
  },
  TokenImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  ComplianceImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  IdentityFactoryImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  IdentityImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  IdentityRegistryImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  IdentityRegistryStorageImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  TokenAccessManagerImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  ContractIdentityImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  SystemTrustedIssuersRegistryImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  TrustedIssuersMetaRegistryImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  TopicSchemeRegistryImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  TokenFactoryRegistryImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  ComplianceModuleRegistryImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  SystemAddonRegistryImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  AddonImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  TokenFactoryImplementationUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  TokenTrustedIssuersRegistryCreated: {
    category: "system",
    statusType: "info",
    icon: FileText,
  },
  IdentityStorageSet: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  TopicSchemeRegistrySet: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  TrustedIssuersRegistrySet: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  TopicSchemeRegistered: {
    category: "system",
    statusType: "info",
    icon: FileCheck,
  },
  TopicSchemeRemoved: {
    category: "system",
    statusType: "info",
    icon: FileText,
  },
  TopicSchemeUpdated: {
    category: "system",
    statusType: "info",
    icon: RefreshCw,
  },
  TopicSchemesBatchRegistered: {
    category: "system",
    statusType: "info",
    icon: FileCheck,
  },
  ClaimTopicsUpdated: {
    category: "system",
    statusType: "info",
    icon: RefreshCw,
  },
  TrustedIssuerAdded: {
    category: "system",
    statusType: "success",
    icon: UserPlus,
  },
  TrustedIssuerRemoved: {
    category: "system",
    statusType: "warning",
    icon: UserMinus,
  },
  SystemRegistrySet: { category: "system", statusType: "info", icon: Settings },
  SubjectRegistrySet: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  SubmitTransactionWithSignatures: {
    category: "system",
    statusType: "info",
    icon: FileText,
  },
  ExecuteTransaction: {
    category: "system",
    statusType: "success",
    icon: CheckCircle2,
  },
  RequirementChanged: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  WeightedSignaturesToggled: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  SignerWeightUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
  SignaturesProvided: {
    category: "system",
    statusType: "info",
    icon: FileCheck,
  },
  OnchainIdSet: { category: "system", statusType: "info", icon: Settings },

  // XvP Settlement events
  XvPSettlementApproved: {
    category: "xvp",
    statusType: "success",
    icon: CheckCircle2,
  },
  XvPSettlementApprovalRevoked: {
    category: "xvp",
    statusType: "warning",
    icon: AlertCircle,
  },
  XvPSettlementExecuted: {
    category: "xvp",
    statusType: "success",
    icon: CheckCircle2,
  },
  XvPSettlementCancelled: {
    category: "xvp",
    statusType: "warning",
    icon: XCircle,
  },
  XvPSettlementCancelVoteCast: {
    category: "xvp",
    statusType: "info",
    icon: FileText,
  },
  XvPSettlementCancelVoteWithdrawn: {
    category: "xvp",
    statusType: "info",
    icon: FileText,
  },
  XvPSettlementSecretRevealed: {
    category: "xvp",
    statusType: "info",
    icon: FileCheck,
  },

  // Vesting events
  VestingInitialized: {
    category: "vesting",
    statusType: "info",
    icon: Settings,
  },
  BatchVestingInitialized: {
    category: "vesting",
    statusType: "info",
    icon: Settings,
  },
  VestingStrategyUpdated: {
    category: "vesting",
    statusType: "info",
    icon: RefreshCw,
  },
  DistributionCapUpdated: {
    category: "system",
    statusType: "info",
    icon: Settings,
  },
} as const;

// Default configurations
const DEFAULT_EVENT_CONFIG: EventConfig = {
  category: "default",
  statusType: "info",
  icon: FileText,
};

// Utility functions
export function getEventCategory(
  eventName: keyof typeof EVENT_CONFIG_REGISTRY
): EventCategory {
  const config = EVENT_CONFIG_REGISTRY[eventName] ?? DEFAULT_EVENT_CONFIG;
  const category = CATEGORY_MAP[config.category] ?? CATEGORY_MAP.default;

  if (!category) {
    throw new Error("Default category not found");
  }

  return category;
}

export function getEventStatus(eventName: keyof typeof EVENT_CONFIG_REGISTRY) {
  const config = EVENT_CONFIG_REGISTRY[eventName] ?? DEFAULT_EVENT_CONFIG;

  return {
    type: config.statusType,
    icon: config.icon as LucideIcon,
    iconClassName: STATUS_COLOR_MAP[config.statusType],
  };
}

export function getEventConfig(eventName: keyof typeof EVENT_CONFIG_REGISTRY) {
  return EVENT_CONFIG_REGISTRY[eventName] ?? DEFAULT_EVENT_CONFIG;
}
