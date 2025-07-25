// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";
import { IATKVestingAirdropFactory } from "./IATKVestingAirdropFactory.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ATKVestingAirdropImplementation } from "./ATKVestingAirdropImplementation.sol";

/// @notice Custom error when the provided factory address is invalid (e.g. zero address or does not support the
/// required interface).
error InvalidFactoryAddress();
/// @notice Custom error when the factory does not have an implementation address set for the vesting airdrop.
error ImplementationNotSetInFactory();
/// @notice Custom error when attempting to initialize the proxy with a zero address for the implementation.
error InitializationWithZeroAddress();
/// @notice Custom error for when direct ETH transfers to the proxy are attempted.
error ETHTransfersNotAllowed();

/// @title Proxy for ATKVestingAirdrop, managed by a factory.
/// @author SettleMint
/// @notice This contract is a proxy that delegates calls to an implementation
/// of ATKVestingAirdrop. The implementation address is fetched from a specified
/// ATKVestingAirdropFactory contract.
/// @dev This proxy is intended to be deployed by ATKVestingAirdropFactory.
/// It stores the factory address and uses it to determine the logic contract.
contract ATKVestingAirdropProxy is Proxy {
    /// @dev Storage slot for the ATKVestingAirdropFactory address.
    /// Value: keccak256("org.atk.contracts.proxy.ATKVestingAirdropProxy.factoryAddress")
    bytes32 private constant _ATK_VESTING_AIRDROP_FACTORY_ADDRESS_SLOT =
        0x9182acb7d36456962952de6a17a922790a6f2f803b6ff6a425ef31721c0444d5;

    /// @notice Constructs the ATKVestingAirdropProxy.
    /// @param factoryAddress The address of the IATKVestingAirdropFactory contract.
    /// @param name The human-readable name for this airdrop.
    /// @param token The address of the ERC20 token to be distributed.
    /// @param root The Merkle root for verifying claims.
    /// @param owner The initial owner of the contract.
    /// @param vestingStrategy The address of the vesting strategy contract for vesting calculations.
    /// @param initializationDeadline The timestamp after which no new vesting can be initialized.
    constructor(
        address factoryAddress,
        string memory name,
        address token,
        bytes32 root,
        address owner,
        address vestingStrategy,
        uint256 initializationDeadline
    ) {
        if (factoryAddress == address(0)) {
            revert InvalidFactoryAddress();
        }

        if (!IERC165(factoryAddress).supportsInterface(type(IATKVestingAirdropFactory).interfaceId)) {
            revert InvalidFactoryAddress();
        }

        StorageSlot.getAddressSlot(_ATK_VESTING_AIRDROP_FACTORY_ADDRESS_SLOT).value = factoryAddress;

        address implementationAddress = _getImplementationAddressFromFactory();

        bytes memory initData = abi.encodeWithSelector(
            ATKVestingAirdropImplementation.initialize.selector,
            name,
            token,
            root,
            owner,
            vestingStrategy,
            initializationDeadline
        );

        _performInitializationDelegatecall(implementationAddress, initData);
    }

    /// @notice Internal function to retrieve the IATKVestingAirdropFactory contract instance from the stored address.
    /// @dev Internal function to retrieve the IATKVestingAirdropFactory contract instance from the stored
    /// address.
    /// @return An IATKVestingAirdropFactory instance.
    function _getFactory() internal view returns (IATKVestingAirdropFactory) {
        return IATKVestingAirdropFactory(StorageSlot.getAddressSlot(_ATK_VESTING_AIRDROP_FACTORY_ADDRESS_SLOT).value);
    }

    /// @notice Fetches the implementation address from the factory.
    /// @dev Fetches the implementation address from the factory.
    /// @return The address of the vesting airdrop implementation.
    function _getImplementationAddressFromFactory() internal view returns (address) {
        IATKVestingAirdropFactory factory = _getFactory();
        // Assumes the factory has a public state variable `atkVestingAirdropImplementation`
        // or a getter named `atkVestingAirdropImplementation()`.
        // If the getter has a different name like `getAtkVestingAirdropImplementation()`,
        // this needs to be adjusted: address impl = factory.getAtKVestingAirdropImplementation();
        address implementation = factory.atkVestingAirdropImplementation();

        if (implementation == address(0)) {
            revert ImplementationNotSetInFactory();
        }
        return implementation;
    }

    /// @notice Performs the delegatecall to initialize the implementation contract.
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

    /// @notice Returns the address of the current implementation contract.
    /// @dev Overrides `Proxy._implementation()`. This is used by OpenZeppelin's proxy mechanisms.
    /// It retrieves the implementation address from the configured factory.
    /// @return The address of the current logic/implementation contract for vesting airdrops.
    function _implementation() internal view override returns (address) {
        return _getImplementationAddressFromFactory();
    }

    /// @notice Fallback function to reject any direct Ether transfers to this proxy contract.
    /// @dev Reverts with ETHTransfersNotAllowed error when ETH is sent to this contract.
    receive() external payable virtual {
        revert ETHTransfersNotAllowed();
    }
}
