// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";
import { IATKXvPSettlementFactory } from "./IATKXvPSettlementFactory.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ATKXvPSettlementImplementation } from "./ATKXvPSettlementImplementation.sol";
import { IATKXvPSettlement } from "./IATKXvPSettlement.sol";

/// @notice Custom error when the provided factory address is invalid (e.g. zero address or does not support the
/// required interface).
error InvalidFactoryAddress();
/// @notice Custom error when the factory does not have an implementation address set for the XvP settlement.
error ImplementationNotSetInFactory();
/// @notice Custom error when attempting to initialize the proxy with a zero address for the implementation.
error InitializationWithZeroAddress();
/// @notice Custom error for when direct ETH transfers to the proxy are attempted.
error ETHTransfersNotAllowed();

/// @title ATKXvPSettlementProxy - Proxy for ATKXvPSettlement, managed by a factory
/// @author SettleMint
/// @notice This contract is a proxy that delegates calls to an implementation
/// of ATKXvPSettlement. The implementation address is fetched from a specified
/// ATKXvPSettlementFactory contract.
/// @dev This proxy is intended to be deployed by ATKXvPSettlementFactory.
/// It stores the factory address and uses it to determine the logic contract.
contract ATKXvPSettlementProxy is Proxy {
    /// @dev Storage slot for the ATKXvPSettlementFactory address.
    /// Value: keccak256("org.atk.contracts.proxy.ATKXvPSettlementProxy.factoryAddress")
    bytes32 private constant _ATK_XVP_SETTLEMENT_FACTORY_ADDRESS_SLOT =
        0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b;

    /// @notice Constructs the ATKXvPSettlementProxy.
    /// @param factoryAddress The address of the IATKXvPSettlementFactory contract.
    /// @param name The name of the settlement
    /// @param cutoffDate Timestamp after which the settlement expires
    /// @param autoExecute Whether to auto-execute after all approvals
    /// @param flows Array of token flows for this settlement
    /// @param hashlock The optional HTLC hashlock (required if external flows are present)
    constructor(
        address factoryAddress,
        string memory name,
        uint256 cutoffDate,
        bool autoExecute,
        IATKXvPSettlement.Flow[] memory flows,
        bytes32 hashlock
    ) {
        if (factoryAddress == address(0)) {
            revert InvalidFactoryAddress();
        }

        if (!IERC165(factoryAddress).supportsInterface(type(IATKXvPSettlementFactory).interfaceId)) {
            revert InvalidFactoryAddress();
        }

        StorageSlot.getAddressSlot(_ATK_XVP_SETTLEMENT_FACTORY_ADDRESS_SLOT).value = factoryAddress;

        address implementationAddress = _getImplementationAddressFromFactory();

        bytes memory initData = abi.encodeWithSelector(
            ATKXvPSettlementImplementation.initialize.selector, name, cutoffDate, autoExecute, flows, hashlock
        );

        _performInitializationDelegatecall(implementationAddress, initData);
    }

    /// @notice Internal function to retrieve the IATKXvPSettlementFactory contract instance from the stored address
    /// @dev Internal function to retrieve the IATKXvPSettlementFactory contract instance from the stored
    /// address.
    /// @return An IATKXvPSettlementFactory instance.
    function _getFactory() internal view returns (IATKXvPSettlementFactory) {
        return IATKXvPSettlementFactory(StorageSlot.getAddressSlot(_ATK_XVP_SETTLEMENT_FACTORY_ADDRESS_SLOT).value);
    }

    /// @notice Fetches the implementation address from the factory
    /// @dev Fetches the implementation address from the factory.
    /// @return The address of the XvP settlement implementation.
    function _getImplementationAddressFromFactory() internal view returns (address) {
        IATKXvPSettlementFactory factory = _getFactory();
        address implementation = factory.xvpSettlementImplementation();

        if (implementation == address(0)) {
            revert ImplementationNotSetInFactory();
        }
        return implementation;
    }

    /// @notice Performs the delegatecall to initialize the implementation contract
    /// @dev Performs the delegatecall to initialize the implementation contract.
    /// @param implementationAddress_ The non-zero address of the logic contract to `delegatecall` to.
    /// @param initializeData_ The ABI-encoded data for the `initialize` function call.
    function _performInitializationDelegatecall(
        address implementationAddress_,
        bytes memory initializeData_
    )
        internal
    {
        if (implementationAddress_ == address(0)) {
            revert InitializationWithZeroAddress();
        }
        (bool success, bytes memory returnData) = implementationAddress_.delegatecall(initializeData_);
        if (!success) {
            assembly {
                revert(add(returnData, 0x20), mload(returnData))
            }
        }
    }

    /// @notice Overrides `Proxy._implementation()` to retrieve the implementation address from the factory
    /// @dev Overrides `Proxy._implementation()`. This is used by OpenZeppelin's proxy mechanisms.
    /// It retrieves the implementation address from the configured factory.
    /// @return The address of the current logic/implementation contract for XvP settlements.
    function _implementation() internal view override returns (address) {
        return _getImplementationAddressFromFactory();
    }

    /// @notice Fallback function to reject any direct Ether transfers to this proxy contract
    /// @dev This prevents accidental ETH transfers to the proxy
    receive() external payable virtual {
        revert ETHTransfersNotAllowed();
    }
}
