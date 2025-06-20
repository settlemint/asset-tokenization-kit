// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";
import { IATKSystem } from "../IATKSystem.sol";
import { IATKTokenFactory } from "./IATKTokenFactory.sol";
import {
    IdentityFactoryImplementationNotSet,
    InvalidSystemAddress,
    ETHTransfersNotAllowed,
    TokenFactoryImplementationNotSet
} from "../ATKSystemErrors.sol";
import { ATKSystemProxy } from "../ATKSystemProxy.sol";

/// @title Proxy contract for ATK Token Factory.
/// @notice This contract serves as a proxy to the ATK Token Factory implementation,
/// allowing for upgradeability of the token factory logic.
/// It retrieves the implementation address from the IATKSystem contract.
contract ATKTokenFactoryProxy is ATKSystemProxy {
    // keccak256("org.atk.contracts.proxy.ATKTokenFactoryProxy.factoryTypeHash")
    bytes32 private constant _REGISTRY_TYPE_HASH_SLOT =
        0x17947bca0d2c81fdff72d848cf07e6794554f6987d19e262fbc8ebfe6c58aef4;

    function _setFactoryTypeHash(bytes32 factoryTypeHash_) internal {
        StorageSlot.getBytes32Slot(_REGISTRY_TYPE_HASH_SLOT).value = factoryTypeHash_;
    }

    function _getFactoryTypeHash() internal view returns (bytes32) {
        return StorageSlot.getBytes32Slot(_REGISTRY_TYPE_HASH_SLOT).value;
    }

    /// @notice Constructs the ATKTokenFactoryProxy.
    /// @dev Initializes the proxy by setting the system address and delegating a call
    /// to the `initialize` function of the token factory implementation.
    /// @param systemAddress The address of the IATKSystem contract that provides the implementation.
    /// @param initialAdmin The address of the initial admin for the token factory.
    /// @param factoryTypeHash The hash of the factory type.
    /// @param tokenImplementation The address of the token implementation contract.
    /// @param identityVerificationModule The address of the identity verification module.
    constructor(
        address systemAddress,
        address initialAdmin,
        bytes32 factoryTypeHash,
        address tokenImplementation,
        address identityVerificationModule
    )
        ATKSystemProxy(systemAddress)
    {
        _setFactoryTypeHash(factoryTypeHash);

        IATKSystem system_ = _getSystem();
        address implementation = system_.tokenFactoryImplementation(factoryTypeHash);
        if (implementation == address(0)) revert TokenFactoryImplementationNotSet(factoryTypeHash);

        bytes memory data = abi.encodeWithSelector(
            IATKTokenFactory.initialize.selector,
            systemAddress,
            tokenImplementation,
            initialAdmin,
            identityVerificationModule
        );

        _performInitializationDelegatecall(implementation, data);
    }

    /// @dev Retrieves the implementation address for the Token Factory module from the `IATKSystem` contract.
    /// @dev Reverts with `TokenFactoryImplementationNotSet` if the implementation address is zero.
    /// @param system The `IATKSystem` contract instance.
    /// @return The address of the `ATKTokenFactoryImplementation` contract.
    /// @inheritdoc ATKSystemProxy
    function _getSpecificImplementationAddress(IATKSystem system) internal view override returns (address) {
        bytes32 factoryTypeHash = _getFactoryTypeHash();
        address implementation = system.tokenFactoryImplementation(factoryTypeHash);
        if (implementation == address(0)) {
            revert TokenFactoryImplementationNotSet(factoryTypeHash);
        }
        return implementation;
    }
}
