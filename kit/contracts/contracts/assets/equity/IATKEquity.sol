// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { IVotes } from "@openzeppelin/contracts/governance/utils/IVotes.sol";

// Interface imports
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IATKToken } from "../../system/tokens/IATKToken.sol";

import { ISMARTCustodian } from "../../smart/extensions/custodian/ISMARTCustodian.sol";
import { ISMARTPausable } from "../../smart/extensions/pausable/ISMARTPausable.sol";
import { ISMARTBurnable } from "../../smart/extensions/burnable/ISMARTBurnable.sol";

/// @title Interface for ATK Equity token
/// @author SettleMint
/// @notice Defines the core functionality and extensions for ATK Equity token, including voting capabilities.
/// This interface extends multiple SMART protocol interfaces to provide comprehensive security token
/// functionality with governance features through the IVotes extension.
/// @dev This interface combines ERC-3643 compliant security token standards with OpenZeppelin governance
/// capabilities, allowing equity tokens to participate in on-chain voting and governance processes.
interface IATKEquity is IATKToken, ISMARTCustodian, ISMARTPausable, ISMARTBurnable, IVotes {
    /// @notice Initializes the ATK Equity token contract.
    /// @param name_ The name of the equity token.
    /// @param symbol_ The symbol of the equity token.
    /// @param decimals_ The number of decimals for the equity token.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @param identityRegistry_ The address of the identity registry contract.
    /// @param compliance_ The address of the compliance contract.
    /// @param accessManager_ The address of the access manager contract for this token.
    function initialize(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        address identityRegistry_,
        address compliance_,
        address accessManager_
    )
        external;
}
