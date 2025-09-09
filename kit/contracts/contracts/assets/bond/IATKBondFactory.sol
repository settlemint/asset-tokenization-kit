// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IATKTokenFactory } from "../../system/tokens/factory/IATKTokenFactory.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IATKBond } from "./IATKBond.sol";

/// @title Interface for the ATK Bond Factory
/// @author SettleMint
/// @notice Defines the functions for creating and predicting addresses of ATK Bond instances.
interface IATKBondFactory is IATKTokenFactory {
    /// @notice Emitted when a new bond is created.
    /// @param sender The address of the sender.
    /// @param tokenAddress The address of the newly created token.
    /// @param onchainId The address of the onchain identity contract for the token.
    /// @param name The name of the bond.
    /// @param symbol The symbol of the bond.
    /// @param decimals The number of decimals for the bond tokens.
    /// @param cap The maximum total supply of the bond tokens.
    /// @param maturityDate The Unix timestamp representing the bond's maturity date.
    /// @param faceValue The face value of each bond token in the denomination asset's base units.
    /// @param denominationAsset The address of the ERC20 token used as the denomination asset for the bond.
    /// @param countryCode The ISO 3166-1 numeric country code for jurisdiction
    event BondCreated(
        address indexed sender,
        address indexed tokenAddress,
        address indexed onchainId,
        string name,
        string symbol,
        uint8 decimals,
        uint256 cap,
        uint256 maturityDate,
        uint256 faceValue,
        address denominationAsset,
        uint16 countryCode
    );

    /// @notice Creates a new ATK Bond.
    /// @param name_ The name of the bond.
    /// @param symbol_ The symbol of the bond.
    /// @param decimals_ The number of decimals for the bond tokens.
    /// @param cap_ The maximum total supply of the bond tokens.
    /// @param bondParams Bond-specific parameters (maturityDate, faceValue, denominationAsset).
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @param countryCode_ The ISO 3166-1 numeric country code for jurisdiction
    /// @return deployedBondAddress The address of the newly deployed bond contract.
    function createBond(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 cap_,
        IATKBond.BondInitParams memory bondParams,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        uint16 countryCode_
    )
        external
        returns (address deployedBondAddress);

    /// @notice Predicts the deployment address of a new ATK Bond.
    /// @param name_ The name of the bond.
    /// @param symbol_ The symbol of the bond.
    /// @param decimals_ The number of decimals for the bond tokens.
    /// @param cap_ The maximum total supply of the bond tokens.
    /// @param bondParams Bond-specific parameters (maturityDate, faceValue, denominationAsset).
    /// @param initialModulePairs_ An array of initial compliance module and parameter pairs.
    /// @return predictedAddress The predicted address of the bond contract.
    function predictBondAddress(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 cap_,
        IATKBond.BondInitParams memory bondParams,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        external
        view
        returns (address predictedAddress);
}
