// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// Interface imports
import { SMARTComplianceModuleParamPair } from "../../interface/structs/SMARTComplianceModuleParamPair.sol";
import { ISMART } from "../../interface/ISMART.sol";

import { ISMARTTokenAccessManaged } from "../../extensions/access-managed/ISMARTTokenAccessManaged.sol";
import { ISMARTCustodian } from "../../extensions/custodian/ISMARTCustodian.sol";
import { ISMARTPausable } from "../../extensions/pausable/ISMARTPausable.sol";
import { ISMARTBurnable } from "../../extensions/burnable/ISMARTBurnable.sol";
import { ISMARTCollateral } from "../../extensions/collateral/ISMARTCollateral.sol";

/// @title Interface for a SMART Deposit token
/// @notice Defines the core functionality and extensions for a SMART Deposit token.
interface ISMARTDeposit is
    ISMART,
    ISMARTTokenAccessManaged,
    ISMARTCollateral,
    ISMARTCustodian,
    ISMARTPausable,
    ISMARTBurnable
{
    /// @notice Initializes the SMART Deposit token contract.
    /// @param name_ The name of the deposit token.
    /// @param symbol_ The symbol of the deposit token.
    /// @param decimals_ The number of decimals for the deposit token.
    /// @param onchainID_ Optional address of an existing onchain identity contract. Pass address(0) to create a new
    /// one.
    /// @param collateralTopicId_ The topic ID of the collateral claim.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @param identityRegistry_ The address of the identity registry contract.
    /// @param compliance_ The address of the compliance contract.
    /// @param accessManager_ The address of the access manager contract for this token.
    function initialize(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address onchainID_,
        uint256 collateralTopicId_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        address identityRegistry_,
        address compliance_,
        address accessManager_
    )
        external;
}
