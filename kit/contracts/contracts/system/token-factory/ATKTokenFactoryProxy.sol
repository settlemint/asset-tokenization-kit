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

/// @title Proxy contract for ATK Token Factory.
/// @notice This contract serves as a proxy to the ATK Token Factory implementation,
/// allowing for upgradeability of the token factory logic.
/// It retrieves the implementation address from the IATKSystem contract.
contract ATKTokenFactoryProxy is Proxy {
    // keccak256("org.atk.contracts.proxy.ATKTokenFactoryProxy.system")
    bytes32 private constant _SYSTEM_SLOT = 0xe8884080cc51c5c292bf466c34183fc7b6d97a0de789d28a4fa18c91a467e8f3;

    // keccak256("org.atk.contracts.proxy.ATKTokenFactoryProxy.factoryTypeHash")
    bytes32 private constant _REGISTRY_TYPE_HASH_SLOT =
        0x17947bca0d2c81fdff72d848cf07e6794554f6987d19e262fbc8ebfe6c58aef4;

    function _setSystem(IATKSystem system_) internal {
        StorageSlot.getAddressSlot(_SYSTEM_SLOT).value = address(system_);
    }

    function _getSystem() internal view returns (IATKSystem) {
        return IATKSystem(StorageSlot.getAddressSlot(_SYSTEM_SLOT).value);
    }

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
        payable
    {
        if (systemAddress == address(0) || !IERC165(systemAddress).supportsInterface(type(IATKSystem).interfaceId)) {
            revert InvalidSystemAddress();
        }
        _setSystem(IATKSystem(systemAddress));
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

        // Perform the delegatecall to initialize the identity logic in the context of this proxy's storage.
        // slither-disable-next-line low-level-calls: Delegatecall is inherent and fundamental to proxy functionality.
        (bool success, bytes memory returnData) = implementation.delegatecall(data);
        if (!success) {
            // Revert with the original error message from the implementation
            assembly {
                revert(add(returnData, 0x20), mload(returnData))
            }
        }
    }

    /// @notice Returns the address of the current token factory implementation.
    /// @dev This function is called by the EIP1967Proxy logic to determine where to delegate calls.
    /// @return implementationAddress The address of the token factory implementation contract.
    function _implementation() internal view override returns (address) {
        IATKSystem system_ = _getSystem();
        bytes32 factoryTypeHash = _getFactoryTypeHash();
        return system_.tokenFactoryImplementation(factoryTypeHash);
    }

    /// @notice Rejects Ether transfers.
    receive() external payable {
        revert ETHTransfersNotAllowed();
    }
}
