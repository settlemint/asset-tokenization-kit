// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IATKTokenFactory } from "../../system/tokens/factory/IATKTokenFactory.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";

/// @title Interface for the ATK Equity Factory
/// @author SettleMint
/// @notice Defines the functions for creating and predicting addresses of ATK Equity instances.
/// This factory interface provides standardized methods for deploying new equity token contracts
/// with deterministic addresses and comprehensive initialization parameters.
/// @dev Extends IATKTokenFactory to provide equity-specific deployment functionality with
/// support for compliance modules, claim topics, and jurisdictional requirements.
interface IATKEquityFactory is IATKTokenFactory {
    /// @notice Emitted when a new equity is created.
    /// @param sender The address of the sender.
    /// @param tokenAddress The address of the newly created token.
    /// @param onchainId The address of the onchain identity contract for the token.
    /// @param name The name of the equity.
    /// @param symbol The symbol of the equity.
    /// @param decimals The number of decimals for the equity tokens.
    /// @param countryCode The ISO 3166-1 numeric country code for jurisdiction
    event EquityCreated(
        address indexed sender,
        address indexed tokenAddress,
        address indexed onchainId,
        string name,
        string symbol,
        uint8 decimals,
        uint16 countryCode
    );

    /// @notice Creates a new ATK Equity token.
    /// @param name_ The name of the equity token.
    /// @param symbol_ The symbol of the equity token.
    /// @param decimals_ The number of decimals for the equity token.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @param countryCode_ The ISO 3166-1 numeric country code for jurisdiction
    /// @return deployedEquityAddress The address of the newly deployed equity token contract.
    function createEquity(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        uint16 countryCode_
    )
        external
        returns (address deployedEquityAddress);

    /// @notice Predicts the deployment address of a new ATK Equity token.
    /// @param name_ The name of the equity token.
    /// @param symbol_ The symbol of the equity token.
    /// @param decimals_ The number of decimals for the equity token.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @return predictedAddress The predicted address of the equity token contract.
    function predictEquityAddress(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        external
        view
        returns (address predictedAddress);
}
