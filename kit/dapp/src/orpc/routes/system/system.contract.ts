import { SortableListSchema } from "@/orpc/routes/common/schemas/sortable-list.schema";
import { accessManagerContract } from "@/orpc/routes/system/access-manager/access-manager.contract";
import { addonContract } from "@/orpc/routes/system/addon/addon.contract";
import { claimTopicsContract } from "@/orpc/routes/system/claim-topics/claim-topics.contract";
import { complianceModuleContract } from "@/orpc/routes/system/compliance-module/compliance-module.contract";
import { identityContract } from "@/orpc/routes/system/identity/identity.contract";
import { SystemCreateSchema } from "@/orpc/routes/system/routes/system.create.schema";
import { SystemSchema } from "@/orpc/routes/system/routes/system.read.schema";
import { statsContract } from "@/orpc/routes/system/stats/stats.contract";
import { factoryContract } from "@/orpc/routes/system/token-factory/factory.contract";
import { trustedIssuersContract } from "@/orpc/routes/system/trusted-issuers/trusted-issuers.contract";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";
import { baseContract } from "../../procedures/base.contract";
import { SystemListItemSchema } from "./routes/system.list.schema";

/**
 * Contract definition for the system list endpoint.
 *
 * Defines the type-safe interface for retrieving SMART systems including:
 * - HTTP method and path configuration
 * - Input validation using the standard SortableListSchema
 * - Output validation ensuring an array of valid System objects
 * - OpenAPI documentation metadata
 *
 * This contract is consumed by both the server router and client for
 * end-to-end type safety.
 */
const list = baseContract
  .route({
    method: "GET",
    path: "/systems",
    description:
      "List all SMART systems deployed on the blockchain with their registry contracts and configuration",
    successDescription:
      "List of SMART systems with deployment details and registry addresses",
    tags: ["system"],
  })
  .input(SortableListSchema)
  .output(z.array(SystemListItemSchema)); // Return array of system objects

/**
 * Contract definition for the system creation endpoint.
 *
 * Defines the type-safe interface for deploying new SMART system contracts:
 * - HTTP POST method to /systems endpoint
 * - Input validation for contract address and verification credentials
 * - Server-sent events output for real-time transaction tracking
 * - OpenAPI documentation with proper tags and descriptions
 *
 * The endpoint streams events as the blockchain transaction progresses through
 * confirmation and indexing phases.
 */
const create = baseContract
  .route({
    method: "POST",
    path: "/systems",
    description:
      "Deploy a new SMART system with identity registry, compliance engine, and token factory registry contracts",
    successDescription:
      "SMART system deployed successfully with all registry contracts and configuration",
    tags: ["system"],
  })
  .input(SystemCreateSchema)
  .output(SystemSchema);

/**
 * Contract definition for the system read endpoint.
 *
 * Defines the type-safe interface for retrieving a specific system:
 * - HTTP GET method with system ID parameter
 * - Input validation for system address
 * - Output includes system details and associated token factories
 * - OpenAPI documentation with proper tags and descriptions
 */
const read = baseContract
  .route({
    method: "GET",
    path: "/systems/:id",
    description:
      "Get details of a specific SMART system (use default for id to get the system used by the dApp)",
    successDescription: "SMART system details with token factories",
    tags: ["system"],
  })
  .input(z.object({ id: z.literal("default").or(ethereumAddress) }))
  .output(SystemSchema);

/**
 * System API contract collection.
 *
 * Exports all system-related API contracts for use in the main contract registry.
 * Currently includes:
 * - list: Retrieve list of SMART systems
 * - create: Deploy a new SMART system
 * - read: Retrieve a specific system with its token factories
 * - addonCreate: Register system add-ons
 * - identityCreate: Create blockchain identity contracts
 * - identityRegister: Register identity claims
 * - complianceModuleCreate: Deploy compliance modules
 * - topicList: List all registered topic schemes
 * - topicCreate: Register new topic schemes
 * - topicUpdate: Update topic scheme signatures
 * - topicDelete: Remove topic schemes
 * - trustedIssuerList: List all trusted issuers
 * - trustedIssuerCreate: Create a new trusted issuer
 * - trustedIssuerUpdate: Update issuer's claim topics
 * - trustedIssuerDelete: Delete a trusted issuer
 * - statsAssets: System-wide asset statistics
 * - statsValue: System-wide value metrics
 * - statsTransactionCount: System-wide transaction count statistics
 * - statsTransactionHistory: System-wide transaction history
 *
 * Future endpoints may include:
 * - update: Update system configuration
 * - delete: Remove a system
 */
export const systemContract = {
  list,
  create,
  read,
  addon: addonContract,
  identity: identityContract,
  compliance: complianceModuleContract,
  claimTopics: claimTopicsContract,
  trustedIssuers: trustedIssuersContract,
  stats: statsContract,
  accessManager: accessManagerContract,
  factory: factoryContract,
};
