// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";

import { ISMARTTokenFactory } from "../system/token-factory/ISMARTTokenFactory.sol";
import {
    InvalidTokenFactoryAddress,
    ETHTransfersNotAllowed,
    InitializationWithZeroAddress,
    TokenImplementationNotSet
} from "../system/SMARTSystemErrors.sol";

/// @title Abstract Base Proxy for SMART Assets
/// @author SettleMint Tokenization Services
/// @notice Provides common functionality for asset proxy contracts that interact with an ISMARTTokenFactory
///         to determine their implementation address and handle initialization.
/// @dev Child contracts must:
///      1. Call the constructor with the `ISMARTTokenFactory` address.
///      2. Implement `_getSpecificImplementationAddress` to fetch their logic contract address from the
///         `ISMARTTokenFactory` and revert with a specific error (e.g., `AssetImplementationNotSet`) if not found.
///      3. In their own constructor, fetch the implementation address, prepare initialization data,
///         and then call `_performInitializationDelegatecall`.
abstract contract SMARTAssetProxy is Proxy {
    /// @dev Storage slot for the ISMARTTokenFactory address.
    /// Value: keccak256("org.smart.contracts.proxy.SMARTAssetProxy.tokenFactory")
    bytes32 private constant _ASSET_PROXY_TOKEN_FACTORY_SLOT =
        0xd73de9ad206fa68c94a3a5ea994a70f278fc314e7570582e8fcddf9fa0c5e21d;

    /// @notice Constructs the SMARTAssetProxy.
    /// @dev Validates and stores the `tokenFactoryAddress_`.
    /// @param tokenFactoryAddress_ The address of the ISMARTTokenFactory contract.
    constructor(address tokenFactoryAddress_) {
        if (
            tokenFactoryAddress_ == address(0)
                || !IERC165(tokenFactoryAddress_).supportsInterface(type(ISMARTTokenFactory).interfaceId)
        ) {
            revert InvalidTokenFactoryAddress();
        }
        // Store tokenFactoryAddress_ at the fixed slot
        StorageSlot.getAddressSlot(_ASSET_PROXY_TOKEN_FACTORY_SLOT).value = tokenFactoryAddress_;
    }

    /// @dev Internal function to retrieve the `ISMARTTokenFactory` contract instance from the stored address.
    /// @return An `ISMARTTokenFactory` instance pointing to the stored token factory contract address.
    function _getTokenFactory() internal view returns (ISMARTTokenFactory) {
        // Retrieve token factory address from the fixed slot
        return ISMARTTokenFactory(StorageSlot.getAddressSlot(_ASSET_PROXY_TOKEN_FACTORY_SLOT).value);
    }

    /// @dev Performs the delegatecall to initialize the implementation contract.
    /// @notice Child proxy constructors should call this helper function after they have:
    ///         1. Fetched their specific implementation address via `_getSpecificImplementationAddress`.
    ///         2. Verified this address is not `address(0)` (which `_getSpecificImplementationAddress` should ensure by
    /// reverting).
    ///         3. Prepared the `bytes memory initializeData` specific to their implementation's `initialize` function.
    /// @param implementationAddress The non-zero address of the logic contract to `delegatecall` to.
    /// @param initializeData The ABI-encoded data for the `initialize` function call.
    function _performInitializationDelegatecall(address implementationAddress, bytes memory initializeData) internal {
        if (implementationAddress == address(0)) {
            revert InitializationWithZeroAddress(); // Should ideally be caught by _getSpecificImplementationAddress
        }
        // slither-disable-next-line low-level-calls: Delegatecall is inherent and fundamental to proxy functionality.
        (bool success, bytes memory returnData) = implementationAddress.delegatecall(initializeData);
        if (!success) {
            assembly {
                revert(add(returnData, 0x20), mload(returnData))
            }
        }
    }

    /// @dev Overrides `Proxy._implementation()`. This is used by OpenZeppelin's proxy mechanisms.
    /// It retrieves the `ISMARTTokenFactory` instance and then calls the abstract `_getSpecificImplementationAddress`
    /// which the child contract must implement. The child's implementation is responsible for returning a valid
    /// address or reverting with its specific "ImplementationNotSet" error.
    /// @return The address of the current logic/implementation contract.
    function _implementation() internal view override returns (address) {
        ISMARTTokenFactory tokenFactory_ = _getTokenFactory();
        address implementationAddress = tokenFactory_.tokenImplementation();
        if (implementationAddress == address(0)) {
            revert TokenImplementationNotSet();
        }
        return implementationAddress;
    }

    /// @notice Fallback function to reject any direct Ether transfers to this proxy contract.
    receive() external payable virtual {
        revert ETHTransfersNotAllowed();
    }
}
