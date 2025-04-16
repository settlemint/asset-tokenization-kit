// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ISchemaResolver } from "@eas/contracts/resolver/ISchemaResolver.sol";
import { EMPTY_UID } from "@eas/contracts/Common.sol";
import { Semver } from "@eas/contracts/Semver.sol";
import { ISchemaRegistry, SchemaRecord } from "@eas/contracts/ISchemaRegistry.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/**
 * @title EAS Schema Registry
 * @notice The global schema registry for Ethereum Attestation Service (EAS).
 * Allows registration of schemas which define the structure of attestations.
 * Supports schema resolvers for custom validation logic and revocability options.
 * Inherits ERC2771Context for meta-transaction support.
 */
contract EASSchemaRegistry is ISchemaRegistry, Semver, ERC2771Context {
    error AlreadyExists();

    // The global mapping between schema records and their IDs.
    mapping(bytes32 uid => SchemaRecord schemaRecord) private _registry;

    /**
     * @dev Creates a new SchemaRegistry instance.
     * @param trustedForwarder The address of the trusted forwarder for meta-transactions (EIP-2771).
     */
    constructor(address trustedForwarder) Semver(1, 4, 0) ERC2771Context(trustedForwarder) { }

    /**
     * @inheritdoc ISchemaRegistry
     * @dev Registers a new schema.
     * @param schema The schema string definition.
     * @param resolver The address of an optional ISchemaResolver for custom validation.
     * @param revocable Whether attestations using this schema can be revoked.
     * @return uid The unique identifier (UID) of the registered schema.
     * @custom:error AlreadyExists If a schema with the same definition, resolver, and revocability already exists.
     */
    function register(string calldata schema, ISchemaResolver resolver, bool revocable) external returns (bytes32) {
        SchemaRecord memory schemaRecord =
            SchemaRecord({ uid: EMPTY_UID, schema: schema, resolver: resolver, revocable: revocable });

        bytes32 uid = _getUID(schemaRecord);
        if (_registry[uid].uid != EMPTY_UID) {
            revert AlreadyExists();
        }

        schemaRecord.uid = uid;
        _registry[uid] = schemaRecord;

        emit Registered(uid, _msgSender(), schemaRecord);

        return uid;
    }

    /**
     * @inheritdoc ISchemaRegistry
     * @dev Retrieves the SchemaRecord for a given schema UID.
     * @param uid The unique identifier (UID) of the schema.
     * @return schemaRecord The SchemaRecord struct containing schema details.
     * @notice Returns an empty SchemaRecord (uid == EMPTY_UID) if the schema doesn't exist.
     */
    function getSchema(bytes32 uid) external view returns (SchemaRecord memory) {
        return _registry[uid];
    }

    /**
     * @dev Calculates a UID for a given schema configuration.
     * The UID is the keccak256 hash of the schema string, resolver address, and revocable flag.
     * @param schemaRecord The input schema record containing schema string, resolver, and revocability.
     * @return uid The calculated unique identifier for the schema configuration.
     */
    function _getUID(SchemaRecord memory schemaRecord) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(schemaRecord.schema, schemaRecord.resolver, schemaRecord.revocable));
    }

    /**
     * @notice Checks if a schema with the specified configuration is already registered.
     * @param schema The schema string definition.
     * @param resolver The address of the schema resolver.
     * @param revocable The revocability status of the schema.
     * @return bool True if a schema with the exact same configuration exists, false otherwise.
     */
    function isSchemaRegistered(
        string calldata schema,
        ISchemaResolver resolver,
        bool revocable
    )
        external
        view
        returns (bool)
    {
        SchemaRecord memory schemaRecord =
            SchemaRecord({ uid: EMPTY_UID, schema: schema, resolver: resolver, revocable: revocable });
        bytes32 uid = _getUID(schemaRecord);
        return _registry[uid].uid != EMPTY_UID;
    }
}
