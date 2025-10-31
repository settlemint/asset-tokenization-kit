// File: contracts/system/SMARTSystemProxy.sol
// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";
import { IATKSystem } from "./IATKSystem.sol";
import { InvalidSystemAddress, ETHTransfersNotAllowed, InitializationWithZeroAddress } from "./ATKSystemErrors.sol";

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
abstract contract AbstractATKSystemProxy is Proxy {
    /// @dev Fixed storage slot for the IATKSystem address.
    /// Value: keccak256("org.smart.contracts.proxy.AbstractATKSystemProxy.systemAddress")
    bytes32 private constant _ATK_SYSTEM_ADDRESS_SLOT =
        0x6430307501c2cc3d2d4fb0a554183112a402a38cdc96135a87867e0457146f96;

    /// @notice Internal function to retrieve the `IATKSystem` contract instance from the stored address
    /// @dev Retrieves the system contract address from the fixed storage slot and returns it as an IATKSystem instance
    /// @return An `IATKSystem` instance pointing to the stored system contract address
    function _getSystem() internal view returns (IATKSystem) {
        // Retrieve registry address from the fixed slot
        return IATKSystem(StorageSlot.getAddressSlot(_ATK_SYSTEM_ADDRESS_SLOT).value);
    }

    /// @notice Child contracts MUST implement this function.
    /// @dev It should retrieve the specific implementation address for the child proxy from the provided `IATKSystem`
    /// instance.
    /// If the implementation address from the system is `address(0)`, this function MUST revert with the
    /// child proxy's specific "ImplementationNotSet" error (e.g., `TrustedIssuersRegistryImplementationNotSet`).
    /// @param system The `IATKSystem` instance to query.
    /// @return implementationAddress The address of the child's logic/implementation contract.
    function _getSpecificImplementationAddress(IATKSystem system)
        internal
        view
        virtual
        returns (address implementationAddress);

    /// @notice Constructs the AbstractATKSystemProxy.
    /// @dev Validates and stores the `systemAddress`.
    /// @param systemAddress The address of the IATKSystem contract.
    constructor(address systemAddress) {
        if (systemAddress == address(0) || !IERC165(systemAddress).supportsInterface(type(IATKSystem).interfaceId)) {
            revert InvalidSystemAddress();
        }
        // Store registryAddress_ at the fixed slot
        StorageSlot.getAddressSlot(_ATK_SYSTEM_ADDRESS_SLOT).value = systemAddress;
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
        (bool success, bytes memory returnData) = implementationAddress.delegatecall(initializeData);
        if (!success) {
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
        IATKSystem system_ = _getSystem();
        return _getSpecificImplementationAddress(system_);
    }

    /// @notice Fallback function to reject any direct Ether transfers to this proxy contract.
    receive() external payable virtual {
        revert ETHTransfersNotAllowed();
    }
}
