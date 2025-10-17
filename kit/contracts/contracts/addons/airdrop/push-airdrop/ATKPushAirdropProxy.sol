// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";
import { IATKPushAirdropFactory } from "./IATKPushAirdropFactory.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ATKPushAirdropImplementation } from "./ATKPushAirdropImplementation.sol";

/// @notice Custom error when the provided factory address is invalid (e.g. zero address or does not support the
/// required interface).
error InvalidFactoryAddress();
/// @notice Custom error when the factory does not have an implementation address set for the push airdrop.
error ImplementationNotSetInFactory();
/// @notice Custom error when attempting to initialize the proxy with a zero address for the implementation.
error InitializationWithZeroAddress();
/// @notice Custom error for when direct ETH transfers to the proxy are attempted.
error ETHTransfersNotAllowed();

/// @title Proxy for ATKPushAirdrop, managed by a factory.
/// @author SettleMint
/// @notice This contract is a proxy that delegates calls to an implementation
/// of ATKPushAirdrop. The implementation address is fetched from a specified
/// ATKPushAirdropFactory contract.
/// @dev This proxy is intended to be deployed by ATKPushAirdropFactory.
/// It stores the factory address and uses it to determine the logic contract.
contract ATKPushAirdropProxy is Proxy {
    /// @dev Storage slot for the ATKPushAirdropFactory address.
    /// Value: keccak256("org.atk.contracts.proxy.ATKPushAirdropProxy.factoryAddress")
    bytes32 private constant _ATK_PUSH_AIRDROP_FACTORY_ADDRESS_SLOT =
        0x13d1d4a8f07d9c8a456b07fb81827712a7d862be074b1dc4f3c9fbbdab826869;

    /// @notice Constructs the ATKPushAirdropProxy.
    /// @param factoryAddress The address of the IATKPushAirdropFactory contract.
    /// @param name The human-readable name for the airdrop.
    /// @param token The address of the ERC20 token to be distributed.
    /// @param root The Merkle root for verifying distributions.
    /// @param owner The initial owner of the contract (admin who can distribute tokens).
    /// @param distributionCap The maximum tokens that can be distributed (0 for no cap).
    constructor(
        address factoryAddress,
        string memory name,
        address token,
        bytes32 root,
        address owner,
        uint256 distributionCap
    ) {
        if (factoryAddress == address(0)) {
            revert InvalidFactoryAddress();
        }

        if (!IERC165(factoryAddress).supportsInterface(type(IATKPushAirdropFactory).interfaceId)) {
            revert InvalidFactoryAddress();
        }

        StorageSlot.getAddressSlot(_ATK_PUSH_AIRDROP_FACTORY_ADDRESS_SLOT).value = factoryAddress;

        address implementationAddress = _getImplementationAddressFromFactory();

        bytes memory initData = abi.encodeWithSelector(
            ATKPushAirdropImplementation.initialize.selector, name, token, root, owner, distributionCap
        );

        _performInitializationDelegatecall(implementationAddress, initData);
    }

    /// @notice Internal function to retrieve the IATKPushAirdropFactory contract instance from the stored address.
    /// @dev Reads the factory address from the storage slot.
    /// @return An IATKPushAirdropFactory instance.
    function _getFactory() internal view returns (IATKPushAirdropFactory) {
        return IATKPushAirdropFactory(StorageSlot.getAddressSlot(_ATK_PUSH_AIRDROP_FACTORY_ADDRESS_SLOT).value);
    }

    /// @notice Fetches the implementation address from the factory.
    /// @dev Retrieves the current push airdrop implementation from the factory contract.
    /// @return The address of the push airdrop implementation.
    function _getImplementationAddressFromFactory() internal view returns (address) {
        IATKPushAirdropFactory factory = _getFactory();
        // Assumes the factory has a public state variable `atkPushAirdropImplementation`
        // or a getter named `atkPushAirdropImplementation()`.
        // If the getter has a different name like `getAtkPushAirdropImplementation()`,
        // this needs to be adjusted: address impl = factory.getAtKPushAirdropImplementation();
        address implementation = factory.atkPushAirdropImplementation();

        if (implementation == address(0)) {
            revert ImplementationNotSetInFactory();
        }
        return implementation;
    }

    /// @notice Performs the delegatecall to initialize the implementation contract.
    /// @dev Executes initialization delegatecall and reverts with the actual error if it fails.
    /// @param implementationAddress_ The non-zero address of the logic contract to `delegatecall` to.
    /// @param initializeData_ The ABI-encoded data for the `initialize` function call.
    function _performInitializationDelegatecall(address implementationAddress_, bytes memory initializeData_) internal {
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

    /// @notice Overrides `Proxy._implementation()`. This is used by OpenZeppelin's proxy mechanisms.
    /// @dev Retrieves the implementation address from the configured factory.
    /// @return The address of the current logic/implementation contract for push airdrops.
    function _implementation() internal view override returns (address) {
        return _getImplementationAddressFromFactory();
    }

    /// @notice Fallback function to reject any direct Ether transfers to this proxy contract.
    /// @dev Reverts with ETHTransfersNotAllowed error when ETH is sent to this contract.
    receive() external payable virtual {
        revert ETHTransfersNotAllowed();
    }
}
