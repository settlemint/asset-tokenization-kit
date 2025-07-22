// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";
import { IATKTimeBoundAirdropFactory } from "./IATKTimeBoundAirdropFactory.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ATKTimeBoundAirdropImplementation } from "./ATKTimeBoundAirdropImplementation.sol";

/// @notice Custom error when the provided factory address is invalid (e.g. zero address or does not support the
/// required interface).
error InvalidFactoryAddress();
/// @notice Custom error when the factory does not have an implementation address set for the time-bound airdrop.
error ImplementationNotSetInFactory();
/// @notice Custom error when attempting to initialize the proxy with a zero address for the implementation.
error InitializationWithZeroAddress();
/// @notice Custom error for when direct ETH transfers to the proxy are attempted.
error ETHTransfersNotAllowed();

/// @title Proxy for ATKTimeBoundAirdrop, managed by a factory.
/// @author SettleMint
/// @notice This contract is a proxy that delegates calls to an implementation
/// of ATKTimeBoundAirdrop. The implementation address is fetched from a specified
/// ATKTimeBoundAirdropFactory contract.
/// @dev This proxy is intended to be deployed by ATKTimeBoundAirdropFactory.
/// It stores the factory address and uses it to determine the logic contract.
contract ATKTimeBoundAirdropProxy is Proxy {
    /// @dev Storage slot for the ATKTimeBoundAirdropFactory address.
    /// Value: keccak256("org.atk.contracts.proxy.ATKTimeBoundAirdropProxy.factoryAddress")
    bytes32 private constant _ATK_TIME_BOUND_AIRDROP_FACTORY_ADDRESS_SLOT =
        0xf3007e328bd3cc76df0f7bea610f8e0c2c29ecb2ea2bbaae96055be00b7b89ca;

    /// @notice Constructs the ATKTimeBoundAirdropProxy.
    /// @param factoryAddress The address of the IATKTimeBoundAirdropFactory contract.
    /// @param name The human-readable name for the airdrop.
    /// @param token The address of the ERC20 token to be distributed.
    /// @param root The Merkle root for verifying claims.
    /// @param owner The initial owner of the contract.
    /// @param startTime The timestamp when claims can begin.
    /// @param endTime The timestamp when claims end.
    constructor(
        address factoryAddress,
        string memory name,
        address token,
        bytes32 root,
        address owner,
        uint256 startTime,
        uint256 endTime
    ) {
        if (factoryAddress == address(0)) {
            revert InvalidFactoryAddress();
        }

        if (!IERC165(factoryAddress).supportsInterface(type(IATKTimeBoundAirdropFactory).interfaceId)) {
            revert InvalidFactoryAddress();
        }

        StorageSlot.getAddressSlot(_ATK_TIME_BOUND_AIRDROP_FACTORY_ADDRESS_SLOT).value = factoryAddress;

        address implementationAddress = _getImplementationAddressFromFactory();

        bytes memory initData = abi.encodeWithSelector(
            ATKTimeBoundAirdropImplementation.initialize.selector, name, token, root, owner, startTime, endTime
        );

        _performInitializationDelegatecall(implementationAddress, initData);
    }

    /// @notice Internal function to retrieve the IATKTimeBoundAirdropFactory contract instance from the stored
    /// address.
    /// @dev Reads the factory address from the designated storage slot.
    /// @return An IATKTimeBoundAirdropFactory instance.
    function _getFactory() internal view returns (IATKTimeBoundAirdropFactory) {
        return
            IATKTimeBoundAirdropFactory(StorageSlot.getAddressSlot(_ATK_TIME_BOUND_AIRDROP_FACTORY_ADDRESS_SLOT).value);
    }

    /// @notice Fetches the implementation address from the factory.
    /// @dev Queries the factory contract for the current implementation address and validates it.
    /// @return The address of the time-bound airdrop implementation.
    function _getImplementationAddressFromFactory() internal view returns (address) {
        IATKTimeBoundAirdropFactory factory = _getFactory();
        address implementation = factory.atkTimeBoundAirdropImplementation();

        if (implementation == address(0)) {
            revert ImplementationNotSetInFactory();
        }
        return implementation;
    }

    /// @notice Performs the delegatecall to initialize the implementation contract.
    /// @dev Executes the initialization logic on the implementation contract via delegatecall.
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

    /// @notice Overrides `Proxy._implementation()`. This is used by OpenZeppelin's proxy mechanisms.
    /// @dev It retrieves the implementation address from the configured factory.
    /// @return The address of the current logic/implementation contract for time-bound airdrops.
    function _implementation() internal view override returns (address) {
        return _getImplementationAddressFromFactory();
    }

    /// @notice Fallback function to reject any direct Ether transfers to this proxy contract.
    receive() external payable virtual {
        revert ETHTransfersNotAllowed();
    }
}
