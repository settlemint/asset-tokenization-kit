// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IATKTokenFactory } from "../../system/tokens/factory/IATKTokenFactory.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";

/// @title Interface for the ATK Stable Coin Factory
/// @author SettleMint
/// @notice Defines the functions for creating and predicting addresses of ATK Stable Coin instances.
interface IATKStableCoinFactory is IATKTokenFactory {
    /// @notice Emitted when a new stable coin is created.
    /// @param sender The address of the sender.
    /// @param tokenAddress The address of the newly created token.
    /// @param onchainId The address of the onchain identity contract for the token.
    /// @param name The name of the stable coin.
    /// @param symbol The symbol of the stable coin.
    /// @param decimals The number of decimals for the stable coin tokens.
    /// @param countryCode The ISO 3166-1 numeric country code for jurisdiction
    event StableCoinCreated(
        address indexed sender,
        address indexed tokenAddress,
        address indexed onchainId,
        string name,
        string symbol,
        uint8 decimals,
        uint16 countryCode
    );

    /// @notice Creates a new ATK Stable Coin.
    /// @param name_ The name of the stable coin.
    /// @param symbol_ The symbol of the stable coin.
    /// @param decimals_ The number of decimals for the stable coin.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @param countryCode_ The ISO 3166-1 numeric country code for jurisdiction
    /// @return deployedStableCoinAddress The address of the newly deployed stable coin contract.
    function createStableCoin(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        uint16 countryCode_
    )
        external
        returns (address deployedStableCoinAddress);

    /// @notice Predicts the deployment address of a new ATK Stable Coin.
    /// @param name_ The name of the stable coin.
    /// @param symbol_ The symbol of the stable coin.
    /// @param decimals_ The number of decimals for the stable coin.
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @return predictedAddress The predicted address of the stable coin contract.
    function predictStableCoinAddress(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        external
        view
        returns (address predictedAddress);
}
