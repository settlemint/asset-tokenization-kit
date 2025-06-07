// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { SMARTAssetProxy } from "../SMARTAssetProxy.sol";
import { ISMARTFund } from "./ISMARTFund.sol";

import { SMARTComplianceModuleParamPair } from "../../interface/structs/SMARTComplianceModuleParamPair.sol";
import { ISMARTTokenFactory } from "../../system/token-factory/ISMARTTokenFactory.sol";

import { TokenImplementationNotSet } from "../../system/SMARTSystemErrors.sol";

/// @title Proxy contract for SMART Funds, using SMARTAssetProxy.
/// @notice This contract serves as a proxy, allowing for upgradeability of the underlying fund logic.
/// It retrieves the implementation address from the ISMARTTokenFactory contract via SMARTAssetProxy.
contract SMARTFundProxy is SMARTAssetProxy {
    /// @notice Constructs the SMARTFundProxy.
    /// @dev Initializes the proxy by delegating a call to the `initialize` function
    /// of the implementation provided by the token factory.
    /// @param tokenFactoryAddress The address of the token factory contract.
    /// @param name_ The name of the fund.
    /// @param symbol_ The symbol of the fund.
    /// @param decimals_ The number of decimals of the fund.
    /// @param onchainID_ Optional address of an existing onchain identity contract. Pass address(0) to create a new
    /// one.
    /// @param managementFeeBps_ The management fee of the fund.
    /// @param initialModulePairs_ The initial module pairs of the fund.
    /// @param identityRegistry_ The identity registry of the fund.
    /// @param compliance_ The compliance of the fund.
    /// @param accessManager_ The access manager of the fund.
    constructor(
        address tokenFactoryAddress,
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address onchainID_,
        uint16 managementFeeBps_,
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
            ISMARTFund.initialize.selector,
            name_,
            symbol_,
            decimals_,
            onchainID_,
            managementFeeBps_,
            initialModulePairs_,
            identityRegistry_,
            compliance_,
            accessManager_
        );

        _performInitializationDelegatecall(implementation, data);
    }
}
