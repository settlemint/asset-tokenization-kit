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

/// @title Interface for a ATK Fund
/// @notice Defines the core functionality and extensions for a ATK Fund, including voting capabilities.
interface IATKFund is ISMART, ISMARTTokenAccessManaged, ISMARTCustodian, ISMARTPausable, ISMARTBurnable, IVotes {
    /// @notice Emitted when management fees are collected
    /// @param sender The address that collected the management fees
    /// @param amount The amount of tokens minted as management fees
    /// @param timestamp The timestamp when the fees were collected
    event ManagementFeeCollected(address indexed sender, uint256 amount, uint256 timestamp);

    /// @notice Initializes the ATK Fund contract.
    /// @param name_ The name of the fund.
    /// @param symbol_ The symbol of the fund.
    /// @param decimals_ The number of decimals for the fund tokens.
    /// @param managementFeeBps_ The management fee in basis points.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @param identityRegistry_ The address of the identity registry contract.
    /// @param compliance_ The address of the compliance contract.
    /// @param accessManager_ The address of the access manager contract for this token.
    function initialize(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint16 managementFeeBps_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        address identityRegistry_,
        address compliance_,
        address accessManager_
    )
        external;

    /// @notice Returns the management fee in basis points.
    /// @return The management fee in BPS.
    function managementFeeBps() external view returns (uint16);

    /// @notice Allows the fund manager to collect accrued management fees.
    /// @return The amount of fees collected.
    function collectManagementFee() external returns (uint256);
}
