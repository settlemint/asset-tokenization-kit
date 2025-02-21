// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title ERC20MultiSigAccessControl
 * @notice An abstract contract implementing a flexible multi-signature mechanism for AccessControl roles
 * @dev Extends OpenZeppelin's AccessControl and EIP712 to provide role-based multi-signature functionality
 *      This contract allows for M-of-N signature requirements for specific operations, where M is the
 *      signature threshold and N is the number of addresses holding a particular role.
 *
 * Key features:
 * - Uses EIP-712 for secure off-chain message signing
 * - Prevents signature replay attacks through unique operation IDs
 * - Supports flexible signature thresholds
 * - Integrates with OpenZeppelin's AccessControl for role management
 *
 * Security considerations:
 * - Operation IDs must be unique to prevent replay attacks
 * - Signatures must come from unique addresses holding the required role
 * - The signature threshold can be adjusted by the admin but must remain > 0
 *
 * How to use:
 * 1. Off-chain, produce a unique `operationId` (e.g. a random hash)
 * 2. Build an `operationHash` describing the function's data (e.g., "MINT", to, amount)
 * 3. Have multiple addresses holding `role` sign the EIP-712 typed data
 * 4. Call the function on-chain with `withMultisig(role, signatures, operationId, operationHash)`
 * 5. If enough valid signatures are provided, the function executes once
 */
abstract contract ERC20MultiSigAccessControl is AccessControl, EIP712 {
    using ECDSA for bytes32;

    /**
     * @notice The minimum number of valid signatures required for multi-sig operations
     * @dev Must be greater than 0. Can be updated by admin.
     */
    uint256 public signatureThreshold;

    /**
     * @dev Tracks used operation IDs to prevent replay.
     *      Once an operationId is used, it can't be reused.
     */
    mapping(bytes32 => bool) private _usedOperationIds;

    /**
     * @notice Error for invalid signature threshold
     * @dev Thrown when the provided signature threshold is 0
     */
    error InvalidSignatureThreshold();

    /**
     * @notice Error for multi-signature required
     * @dev Thrown when the signature threshold is greater than 1
     */
    error MultiSigRequired();

    /**
     * @notice Initializes the contract with a signature threshold
     * @dev Sets up the initial signature requirement for multi-sig operations
     * @param signatureThreshold_ The initial number of required signatures (must be > 0)
     */
    constructor(uint256 signatureThreshold_) {
        if (signatureThreshold_ == 0) revert InvalidSignatureThreshold();
        signatureThreshold = signatureThreshold_;
    }

    /**
     * @notice The EIP-712 typehash for multi-signature operations
     * @dev Keccak256 hash of the EIP-712 encoded type for multi-sig operations
     *      Used in the EIP-712 signing and verification process
     */
    bytes32 public constant MULTISIG_TYPEHASH =
        keccak256("MultiSigOperation(bytes32 operationId,bytes32 operationHash)");

    /**
     * @notice Enforces M-of-N signature requirements for function execution
     * @dev Modifier that validates EIP-712 signatures from role holders
     *      - Prevents replay attacks by tracking used operation IDs
     *      - Validates signature count against threshold
     *      - Verifies each signer holds the required role
     *      - Counts only unique valid signers
     *      - Marks operation ID as used after validation
     * @param role The AccessControl role required for valid signatures
     * @param signatures Array of EIP-712 signatures from role holders
     * @param operationId Unique identifier for this operation (prevents replay)
     * @param operationHash Hash representing the operation details
     */
    modifier withMultisig(bytes32 role, bytes[] calldata signatures, bytes32 operationId, bytes32 operationHash) {
        require(!_usedOperationIds[operationId], "Operation ID already used");
        require(signatures.length >= signatureThreshold, "Not enough signatures");

        // 1. Build the typed data (struct) hash
        bytes32 structHash = keccak256(abi.encode(MULTISIG_TYPEHASH, operationId, operationHash));

        // 2. Final EIP-712 digest
        bytes32 digest = _hashTypedDataV4(structHash);

        // 3. Recover signers and ensure they have `role`, counting distinct addresses
        address[] memory signers = new address[](signatures.length);
        uint256 validSignersCount = 0;

        for (uint256 i = 0; i < signatures.length; i++) {
            address recovered = digest.recover(signatures[i]);
            if (hasRole(role, recovered)) {
                // Check for duplicates
                bool alreadyCounted = false;
                for (uint256 j = 0; j < i; j++) {
                    if (signers[j] == recovered) {
                        alreadyCounted = true;
                        break;
                    }
                }
                if (!alreadyCounted) {
                    signers[i] = recovered;
                    validSignersCount++;
                }
            }
        }

        require(validSignersCount >= signatureThreshold, "Insufficient valid signers with required role");

        // 4. Mark operationId as used
        _usedOperationIds[operationId] = true;

        // 5. Proceed to the function body
        _;
    }

    /**
     * @notice Updates the number of signatures required for multi-sig operations
     * @dev Can only be called by addresses with the DEFAULT_ADMIN_ROLE
     * @param newThreshold The new signature threshold (must be > 0)
     */
    function setSignatureThreshold(uint256 newThreshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newThreshold > 0, "Threshold must be > 0");
        signatureThreshold = newThreshold;
    }

    /**
     * @notice Checks if a specific operation ID has been used
     * @dev Used to verify if an operation can still be executed or has already been processed
     * @param operationId The unique identifier to check
     * @return bool True if the operation ID has been used, false otherwise
     */
    function isOperationUsed(bytes32 operationId) external view returns (bool) {
        return _usedOperationIds[operationId];
    }
}
