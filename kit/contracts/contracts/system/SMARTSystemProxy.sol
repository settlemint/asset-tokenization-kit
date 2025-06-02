// File: contracts/system/SMARTSystemProxy.sol
// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";
import { ISMARTSystem } from "./ISMARTSystem.sol";
import { InvalidSystemAddress, ETHTransfersNotAllowed, InitializationWithZeroAddress } from "./SMARTSystemErrors.sol";

/// @title Abstract Base Proxy for SMART System Components
/// @author SettleMint Tokenization Services
/// @notice Provides common functionality for proxy contracts that interact with an ISMARTSystem contract
///         to determine their implementation address and handle initialization.
/// @dev Child contracts must:
///      1. Provide their unique storage slot for the ISMARTSystem address via the constructor.
///      2. Implement `_getSpecificImplementationAddress` to fetch their logic contract address from ISMARTSystem
///         and revert with a specific error if not found.
///      3. In their own constructor, fetch the implementation address, prepare initialization data,
///         and then call `_performInitializationDelegatecall`.
abstract contract SMARTSystemProxy is Proxy {
    /// @dev Fixed storage slot for the ISMARTSystem address.
    /// Value: keccak256("org.smart.contracts.proxy.SMARTSystemProxy.systemAddress")
    bytes32 private constant _SMART_SYSTEM_ADDRESS_SLOT =
        0xecc2606d54010e72663612d3e0281683cab9410bcc5c77523bad408088abd293;

    /// @notice Child contracts MUST implement this function.
    /// @dev It should retrieve the specific implementation address for the child proxy from the provided `ISMARTSystem`
    /// instance.
    /// If the implementation address from the system is `address(0)`, this function MUST revert with the
    /// child proxy's specific "ImplementationNotSet" error (e.g., `TrustedIssuersRegistryImplementationNotSet`).
    /// @param system The `ISMARTSystem` instance to query.
    /// @return implementationAddress The address of the child's logic/implementation contract.
    function _getSpecificImplementationAddress(ISMARTSystem system)
        internal
        view
        virtual
        returns (address implementationAddress);

    /// @notice Constructs the SMARTSystemProxy.
    /// @dev Validates and stores the `systemAddress_`.
    /// @param systemAddress_ The address of the ISMARTSystem contract.
    constructor(address systemAddress_) {
        if (systemAddress_ == address(0) || !IERC165(systemAddress_).supportsInterface(type(ISMARTSystem).interfaceId))
        {
            revert InvalidSystemAddress();
        }
        // Store systemAddress_ at the fixed slot
        StorageSlot.getAddressSlot(_SMART_SYSTEM_ADDRESS_SLOT).value = systemAddress_;
    }

    /// @dev Internal function to retrieve the `ISMARTSystem` contract instance from the stored address.
    /// @return An `ISMARTSystem` instance pointing to the stored system contract address.
    function _getSystem() internal view returns (ISMARTSystem) {
        // Retrieve system address from the fixed slot
        return ISMARTSystem(StorageSlot.getAddressSlot(_SMART_SYSTEM_ADDRESS_SLOT).value);
    }

    /// @dev Performs the delegatecall to initialize the implementation contract.
    /// @notice Child proxy constructors should call this helper function after they have:
    ///         1. Fetched their specific implementation address from `ISMARTSystem`.
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

    /// @dev Overrides `Proxy._implementation()`. This is used by OpenZeppelin's proxy mechanisms (e.g., fallback,
    /// upgrades).
    /// It retrieves the `ISMARTSystem` instance and then calls the abstract `_getSpecificImplementationAddress`
    /// which the child contract must implement. The child's implementation is responsible for returning a valid
    /// address or reverting with its specific "ImplementationNotSet" error.
    /// @return The address of the current logic/implementation contract.
    function _implementation() internal view override returns (address) {
        ISMARTSystem system_ = _getSystem();
        return _getSpecificImplementationAddress(system_);
    }

    /// @notice Fallback function to reject any direct Ether transfers to this proxy contract.
    receive() external payable virtual {
        revert ETHTransfersNotAllowed();
    }
}
