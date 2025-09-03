// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OnchainID imports
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

// Interface imports
import { IATKTrustedIssuersRegistry } from "../../trusted-issuers-registry/IATKTrustedIssuersRegistry.sol";
import { IATKToken } from "../IATKToken.sol";

/// @title IATKTokenTrustedIssuersRegistry - Token-Specific Trusted Issuers Registry Interface
/// @author SettleMint
/// @notice Interface for token-specific trusted issuer registry operations
/// @dev This interface defines token-specific functionality for managing trusted issuers.
///      Token registries validate that the subject parameter matches the token's onchainID
///      and provide token-specific access control via GOVERNANCE_ROLE.
interface IATKTokenTrustedIssuersRegistry is IATKTrustedIssuersRegistry {

    // --- Token-Specific Getters ---

    /// @notice Returns the token contract that this registry is associated with
    /// @return The IATKToken interface of the associated token
    function token() external view returns (IATKToken);
}