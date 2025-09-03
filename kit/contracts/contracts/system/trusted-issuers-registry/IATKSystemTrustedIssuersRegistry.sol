// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OnchainID imports
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";

// Interface imports
import { IATKTrustedIssuersRegistry } from "./IATKTrustedIssuersRegistry.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";

/// @title IATKSystemTrustedIssuersRegistry - System Trusted Issuers Registry Interface
/// @author SettleMint
/// @notice Interface for the system ATK trusted issuers registry, managing system-wide trusted claim issuers
/// @dev Extends the base IATKTrustedIssuersRegistry to provide system-specific functionality.
///      The system registry operates on system-wide issuers without subject parameters.
interface IATKSystemTrustedIssuersRegistry is IATKTrustedIssuersRegistry, IATKSystemAccessManaged {

    /// @notice Initializes the system registry with access manager
    /// @param accessManager The address of the access manager
    function initialize(address accessManager) external;
}