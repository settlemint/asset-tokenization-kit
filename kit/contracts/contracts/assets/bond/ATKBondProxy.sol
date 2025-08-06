// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ATKAssetProxy } from "../ATKAssetProxy.sol";
import { IATKBond } from "./IATKBond.sol";

import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";

/// @title Proxy contract for ATK Bonds, using ATKAssetProxy.
/// @author SettleMint
/// @notice This contract serves as a proxy, allowing for upgradeability of the underlying bond logic.
/// It retrieves the implementation address from the ISMARTTokenFactory contract via ATKAssetProxy.
contract ATKBondProxy is ATKAssetProxy {
    /// @notice Constructs the ATKBondProxy.
    /// @dev Initializes the proxy by delegating a call to the `initialize` function
    /// of the implementation provided by the token factory.
    /// @param tokenFactoryAddress The address of the token factory contract.
    /// @param name_ The name of the bond.
    /// @param symbol_ The symbol of the bond.
    /// @param decimals_ The number of decimals of the bond.
    /// @param cap_ The cap of the bond.
    /// @param bondParams Bond-specific parameters (maturityDate, faceValue, denominationAsset).
    /// @param initialModulePairs_ The initial module pairs of the bond.
    /// @param identityRegistry_ The identity registry of the bond.
    /// @param compliance_ The compliance of the bond.
    /// @param accessManager_ The access manager of the bond.
    constructor(
        address tokenFactoryAddress,
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 cap_,
        IATKBond.BondInitParams memory bondParams,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        address identityRegistry_,
        address compliance_,
        address accessManager_
    )
        payable
        ATKAssetProxy(tokenFactoryAddress)
    {
        address implementation = _implementation();

        bytes memory data = abi.encodeWithSelector(
            IATKBond.initialize.selector,
            name_,
            symbol_,
            decimals_,
            cap_,
            bondParams,
            initialModulePairs_,
            identityRegistry_,
            compliance_,
            accessManager_
        );

        _performInitializationDelegatecall(implementation, data);
    }
}
