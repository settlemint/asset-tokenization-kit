// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// Interface imports
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IATKToken } from "../../system/tokens/IATKToken.sol";
import { ISMARTCustodian } from "../../smart/extensions/custodian/ISMARTCustodian.sol";
import { ISMARTPausable } from "../../smart/extensions/pausable/ISMARTPausable.sol";
import { ISMARTBurnable } from "../../smart/extensions/burnable/ISMARTBurnable.sol";

/// @title Interface for ATK Deposit token
/// @author SettleMint
/// @notice Defines the core functionality and extensions for an ATK Deposit token
/// @dev This interface combines SMART token functionality with access management,
///      collateral tracking, custodian controls, pausability, and burning capabilities
interface IATKDeposit is IATKToken, ISMARTCustodian, ISMARTPausable, ISMARTBurnable {
    /// @notice Initializes the ATK Deposit token contract.
    /// @param name_ The name of the deposit token.
    /// @param symbol_ The symbol of the deposit token.
    /// @param decimals_ The number of decimals for the deposit token.
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
