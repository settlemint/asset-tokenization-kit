import { ethereumAddress } from "@/lib/utils/zod/validators/ethereum-address";
import { z } from "zod";

/**
 * Schema definition for a SMART System entity.
 *
 * Systems are the core infrastructure contracts in the SMART protocol that
 * orchestrate the deployment and management of tokenized assets. Each system
 * manages its own set of factories, registries, and compliance modules.
 *
 * @remarks
 * The system ID is the blockchain address where the system contract is deployed.
 * This address serves as the unique identifier for all operations within that
 * particular SMART protocol instance.
 */
export const SystemSchema = z.object({
  /**
   * Unique identifier of the system - the Ethereum address of the deployed system contract.
   * This address is used to interact with the system and all its associated components.
   */
  id: ethereumAddress,
});
