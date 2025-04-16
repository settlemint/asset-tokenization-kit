import { type Address, encodePacked, keccak256 } from "viem";

/**
 * Calculates the Schema UID based on the schema definition, resolver address, and revocability.
 * Replicates the logic from EASSchemaRegistry._getUID().
 *
 * @param schema - The schema string definition.
 * @param resolver - The address of the schema resolver (or zero address if none).
 * @param revocable - Whether attestations using this schema can be revoked.
 * @returns The calculated unique identifier (UID) for the schema configuration as a hex string.
 */
export function getSchemaUID(
  schema: string,
  resolver: Address,
  revocable: boolean
): `0x${string}` {
  return keccak256(
    encodePacked(["string", "address", "bool"], [schema, resolver, revocable])
  );
}
