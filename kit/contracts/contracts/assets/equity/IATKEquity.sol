// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { IVotes } from "@openzeppelin/contracts/governance/utils/IVotes.sol";

// Interface imports
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ISMART } from "../../smart/interface/ISMART.sol";

import { ISMARTTokenAccessManaged } from "../../smart/extensions/access-managed/ISMARTTokenAccessManaged.sol";
import { ISMARTCustodian } from "../../smart/extensions/custodian/ISMARTCustodian.sol";
import { ISMARTPausable } from "../../smart/extensions/pausable/ISMARTPausable.sol";
import { ISMARTBurnable } from "../../smart/extensions/burnable/ISMARTBurnable.sol";

/// @title Interface for a ATK Equity token
/// @notice Defines the core functionality and extensions for a ATK Equity token, including voting capabilities.
interface IATKEquity is ISMART, ISMARTTokenAccessManaged, ISMARTCustodian, ISMARTPausable, ISMARTBurnable, IVotes {
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
