// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IATKTokenFactory } from "../../system/tokens/factory/IATKTokenFactory.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";

/// @title Interface for the ATK Fund Factory
/// @author SettleMint
/// @notice Defines the functions for creating and predicting addresses of ATK Fund instances.
interface IATKFundFactory is IATKTokenFactory {
    /// @notice Emitted when a new fund is created.
    /// @param sender The address of the sender.
    /// @param tokenAddress The address of the newly created token.
    /// @param onchainId The address of the onchain identity contract for the token.
    /// @param name The name of the fund.
    /// @param symbol The symbol of the fund.
    /// @param decimals The number of decimals for the fund tokens.
    /// @param managementFeeBps The management fee in basis points.
    /// @param countryCode The ISO 3166-1 numeric country code for jurisdiction
    event FundCreated(
        address indexed sender,
        address indexed tokenAddress,
        address indexed onchainId,
        string name,
        string symbol,
        uint8 decimals,
        uint16 managementFeeBps,
        uint16 countryCode
    );

    /// @notice Creates a new ATK Fund.
    /// @param name_ The name of the fund.
    /// @param symbol_ The symbol of the fund.
    /// @param decimals_ The number of decimals for the fund tokens.
    /// @param managementFeeBps_ The management fee in basis points.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @param countryCode_ The ISO 3166-1 numeric country code for jurisdiction
    /// @return deployedFundAddress The address of the newly deployed fund contract.
    function createFund(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint16 managementFeeBps_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        uint16 countryCode_
    )
        external
        returns (address deployedFundAddress);

    /// @notice Predicts the deployment address of a new ATK Fund.
    /// @param name_ The name of the fund.
    /// @param symbol_ The symbol of the fund.
    /// @param decimals_ The number of decimals for the fund tokens.
    /// @param managementFeeBps_ The management fee in basis points.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @return predictedAddress The predicted address of the fund contract.
    function predictFundAddress(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint16 managementFeeBps_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        external
        view
        returns (address predictedAddress);
}
