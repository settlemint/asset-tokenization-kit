// File: contracts/system/SMARTSystemProxy.sol
// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";
import { ETHTransfersNotAllowed, InitializationWithZeroAddress } from "./ATKSystemErrors.sol";
import { IATKTypedImplementationRegistry } from "./IATKTypedImplementationRegistry.sol";

/// @title Abstract Base Proxy for ATK System Components
/// @author SettleMint
/// @notice Provides common functionality for proxy contracts that interact with an IATKSystem contract
///         to determine their implementation address and handle initialization.
/// @dev Child contracts must:
///      1. Provide their unique storage slot for the IATKSystem address via the constructor.
///      2. Implement `_getSpecificImplementationAddress` to fetch their logic contract address from IATKSystem
///         and revert with a specific error if not found.
///      3. In their own constructor, fetch the implementation address, prepare initialization data,
///         and then call `_performInitializationDelegatecall`.
contract ATKTypedImplementationProxy is Proxy {
    /// @dev Fixed storage slot for the IATKTypedImplementationRegistry address.
    /// Value: keccak256("org.smart.contracts.proxy.ATKTypedImplementationProxy.registryAddress")
    bytes32 private constant _ATK_TYPED_IMPLEMENTATION_REGISTRY_ADDRESS_SLOT =
        0xa31119ed2f30cf540b9f48eb7e1890285b3a2287937a099a1e0f359fc5ce172b;

    /// @dev Fixed storage slot for the type hash.
    /// Value: keccak256("org.smart.contracts.proxy.ATKTypedImplementationProxy.typeHash")
    bytes32 private constant _ATK_TYPED_IMPLEMENTATION_REGISTRY_TYPE_HASH_SLOT =
        0x2a94c78684c8756e2c9669f50cc2acf3b762274c5f6f55e8495bba510078ce48;

    /// @notice Internal function to retrieve the `IATKTypedImplementationRegistry` contract instance from the stored
    /// address
    /// @dev Retrieves the registry contract address from the fixed storage slot and returns it as an
    /// IATKTypedImplementationRegistry instance
    /// @return An `IATKTypedImplementationRegistry` instance pointing to the stored registry contract address
    function _getRegistry() internal view returns (IATKTypedImplementationRegistry) {
        // Retrieve registry address from the fixed slot
        return IATKTypedImplementationRegistry(
            StorageSlot.getAddressSlot(_ATK_TYPED_IMPLEMENTATION_REGISTRY_ADDRESS_SLOT).value
        );
    }

    /// @notice Internal function to retrieve the type hash of this proxy
    /// @dev Retrieves the type hash from the fixed storage slot
    /// @return The bytes32 type hash identifying this proxy's implementation type
    function _getTypeHash() internal view returns (bytes32) {
        return StorageSlot.getBytes32Slot(_ATK_TYPED_IMPLEMENTATION_REGISTRY_TYPE_HASH_SLOT).value;
    }

    error InvalidRegistryAddress();

    /// @notice Constructs the ATKTypedImplementationProxy.
    /// @dev Validates and stores the `registryAddress_` and `typeHash_`.
    /// @param registryAddress_ The address of the IATKTypedImplementationRegistry contract.
    /// @param typeHash_ The type hash of the implementation.
    /// @param initializeData_ The data to pass to the implementation's `initialize` function.
    constructor(address registryAddress_, bytes32 typeHash_, bytes memory initializeData_) {
        if (
            registryAddress_ == address(0)
                || !IERC165(registryAddress_).supportsInterface(type(IATKTypedImplementationRegistry).interfaceId)
        ) {
            revert InvalidRegistryAddress();
        }
        // Store registryAddress_ at the fixed slot
        StorageSlot.getAddressSlot(_ATK_TYPED_IMPLEMENTATION_REGISTRY_ADDRESS_SLOT).value = registryAddress_;
        // Store typeHash_ at the fixed slot
        StorageSlot.getBytes32Slot(_ATK_TYPED_IMPLEMENTATION_REGISTRY_TYPE_HASH_SLOT).value = typeHash_;

        // Get the implementation address
        address implementationAddress = _implementation();

        // Call the implementation's `initialize` function
        _performInitializationDelegatecall(implementationAddress, initializeData_);
    }

    /// @dev Performs the delegatecall to initialize the implementation contract.
    /// @notice Child proxy constructors should call this helper function after they have:
    ///         1. Fetched their specific implementation address from `IATKSystem`.
    ///         2. Verified this address is not `address(0)` (and reverted with their specific error if it is).
    ///         3. Prepared the `bytes memory initializeData` specific to their implementation's `initialize` function.
    /// @param implementationAddress The non-zero address of the logic contract to `delegatecall` to.
    /// @param initializeData The ABI-encoded data for the `initialize` function call.
    function _performInitializationDelegatecall(address implementationAddress, bytes memory initializeData) internal {
        if (implementationAddress == address(0)) {
            revert InitializationWithZeroAddress();
        }
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returnData) = implementationAddress.delegatecall(initializeData);
        if (!success) {
            // solhint-disable-next-line no-inline-assembly
            assembly {
                revert(add(returnData, 0x20), mload(returnData))
            }
        }
    }

    /// @notice Returns the address of the current implementation contract
    /// @dev Overrides `Proxy._implementation()`. This is used by OpenZeppelin's proxy mechanisms (e.g., fallback,
    /// upgrades).
    /// It retrieves the `IATKSystem` instance and then calls the abstract `_getSpecificImplementationAddress`
    /// which the child contract must implement. The child's implementation is responsible for returning a valid
    /// address or reverting with its specific "ImplementationNotSet" error.
    /// @return The address of the current logic/implementation contract
    function _implementation() internal view override returns (address) {
        IATKTypedImplementationRegistry registry_ = _getRegistry();
        bytes32 typeHash = _getTypeHash();
        return registry_.implementation(typeHash);
    }

    /// @notice Fallback function to reject any direct Ether transfers to this proxy contract.
    receive() external payable virtual {
        revert ETHTransfersNotAllowed();
    }
}
