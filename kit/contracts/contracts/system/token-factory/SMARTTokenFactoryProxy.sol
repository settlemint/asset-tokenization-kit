// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";
import { ISMARTSystem } from "../ISMARTSystem.sol";
import { ISMARTTokenFactory } from "./ISMARTTokenFactory.sol";
import {
    IdentityFactoryImplementationNotSet,
    InvalidSystemAddress,
    ETHTransfersNotAllowed,
    TokenFactoryImplementationNotSet
} from "../SMARTSystemErrors.sol";

/// @title Proxy contract for SMART Token Factory.
/// @notice This contract serves as a proxy to the SMART Token Factory implementation,
/// allowing for upgradeability of the token factory logic.
/// It retrieves the implementation address from the ISMARTSystem contract.
contract SMARTTokenFactoryProxy is Proxy {
    // keccak256("org.smart.contracts.proxy.SMARTTokenFactoryProxy.system")
    bytes32 private constant _SYSTEM_SLOT = 0xa5aaa66e45ebfb92441f10cdfbe44690484d23d6c57589e213a361b4fcd4f023;

    // keccak256("org.smart.contracts.proxy.SMARTTokenFactoryProxy.factoryTypeHash")
    bytes32 private constant _REGISTRY_TYPE_HASH_SLOT =
        0xcb945fac79d144cd8fa9976e759cdf46e992b574c2542427c4f443e92c4905a5;

    function _setSystem(ISMARTSystem system_) internal {
        StorageSlot.getAddressSlot(_SYSTEM_SLOT).value = address(system_);
    }

    function _getSystem() internal view returns (ISMARTSystem) {
        return ISMARTSystem(StorageSlot.getAddressSlot(_SYSTEM_SLOT).value);
    }

    function _setFactoryTypeHash(bytes32 factoryTypeHash_) internal {
        StorageSlot.getBytes32Slot(_REGISTRY_TYPE_HASH_SLOT).value = factoryTypeHash_;
    }

    function _getFactoryTypeHash() internal view returns (bytes32) {
        return StorageSlot.getBytes32Slot(_REGISTRY_TYPE_HASH_SLOT).value;
    }

    /// @notice Constructs the SMARTTokenFactoryProxy.
    /// @dev Initializes the proxy by setting the system address and delegating a call
    /// to the `initialize` function of the token factory implementation.
    /// @param systemAddress The address of the ISMARTSystem contract that provides the implementation.
    /// @param initialAdmin The address of the initial admin for the token factory.
    /// @param factoryTypeHash The hash of the factory type.
    /// @param tokenImplementation The address of the token implementation contract.
    constructor(
        address systemAddress,
        address initialAdmin,
        bytes32 factoryTypeHash,
        address tokenImplementation
    )
        payable
    {
        if (systemAddress == address(0) || !IERC165(systemAddress).supportsInterface(type(ISMARTSystem).interfaceId)) {
            revert InvalidSystemAddress();
        }
        _setSystem(ISMARTSystem(systemAddress));
        _setFactoryTypeHash(factoryTypeHash);

        ISMARTSystem system_ = _getSystem();
        address implementation = system_.tokenFactoryImplementation(factoryTypeHash);
        if (implementation == address(0)) revert TokenFactoryImplementationNotSet(factoryTypeHash);

        bytes memory data = abi.encodeWithSelector(
            ISMARTTokenFactory.initialize.selector, systemAddress, tokenImplementation, initialAdmin
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
        ISMARTSystem system_ = _getSystem();
        bytes32 factoryTypeHash = _getFactoryTypeHash();
        return system_.tokenFactoryImplementation(factoryTypeHash);
    }

    /// @notice Rejects Ether transfers.
    receive() external payable {
        revert ETHTransfersNotAllowed();
    }
}
