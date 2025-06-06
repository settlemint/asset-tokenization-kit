// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTAssetProxy } from "../SMARTAssetProxy.sol";
import { ISMARTDeposit } from "./ISMARTDeposit.sol";

import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ISMARTTokenFactory } from "../../system/token-factory/ISMARTTokenFactory.sol";

import { TokenImplementationNotSet } from "../../system/SMARTSystemErrors.sol";

/// @title Proxy contract for SMART Deposits, using SMARTAssetProxy.
/// @notice This contract serves as a proxy, allowing for upgradeability of the underlying deposit logic.
/// It retrieves the implementation address from the ISMARTTokenFactory contract via SMARTAssetProxy.
contract SMARTDepositProxy is SMARTAssetProxy {
    /// @notice Constructs the SMARTDepositProxy.
    /// @dev Initializes the proxy by delegating a call to the `initialize` function
    /// of the implementation provided by the token factory.
    /// @param tokenFactoryAddress The address of the token factory contract.
    /// @param name_ The name of the deposit.
    /// @param symbol_ The symbol of the deposit.
    /// @param decimals_ The number of decimals of the deposit.
    /// @param onchainID_ Optional address of an existing onchain identity contract. Pass address(0) to create a new
    /// one.
    /// @param collateralTopicId_ The topic ID of the collateral claim.
    /// @param initialModulePairs_ The initial module pairs of the deposit.
    /// @param identityRegistry_ The identity registry of the deposit.
    /// @param compliance_ The compliance of the deposit.
    /// @param accessManager_ The access manager of the deposit.
    constructor(
        address tokenFactoryAddress,
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
        payable
        SMARTAssetProxy(tokenFactoryAddress)
    {
        address implementation = _implementation();

        bytes memory data = abi.encodeWithSelector(
            ISMARTDeposit.initialize.selector,
            name_,
            symbol_,
            decimals_,
            onchainID_,
            collateralTopicId_,
            initialModulePairs_,
            identityRegistry_,
            compliance_,
            accessManager_
        );

        _performInitializationDelegatecall(implementation, data);
    }
}
