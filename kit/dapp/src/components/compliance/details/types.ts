import type {
  ComplianceModulePairInput,
  ComplianceParams,
  ComplianceTypeId,
} from "@atk/zod/validators/compliance";
import type { EthereumAddress } from "@atk/zod/validators/ethereum-address";

/**
 * Props interface for compliance module detail components
 */
export interface ComplianceModuleDetailProps<T extends ComplianceTypeId> {
  /** Type identifier of the compliance module */
  typeId: T;
  /** Address of the deployed compliance module contract */
  module: EthereumAddress;

  /** Whether this module is currently enabled */
  isEnabled: boolean;

  /** Initial parameter values for form initialization */
  initialValues?: Extract<ComplianceParams, { typeId: T }>;

  /** Callback when module is enabled with encoded parameters */
  onEnable: (module: ComplianceModulePairInput) => void;

  /** Callback when module is disabled with encoded parameters */
  onDisable: (module: ComplianceModulePairInput) => void;

  /** Callback to close the detail view */
  onClose: () => void;
}
