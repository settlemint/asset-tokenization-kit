// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";
import { IATKFixedYieldScheduleFactory } from "./IATKFixedYieldScheduleFactory.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ATKFixedYieldScheduleUpgradeable } from "./ATKFixedYieldScheduleUpgradeable.sol";

/// @notice Custom error when the provided factory address is invalid (e.g. zero address or does not support the
/// required interface).
error InvalidFactoryAddress();
/// @notice Custom error when the factory does not have an implementation address set for the fixed yield schedule.
error ImplementationNotSetInFactory();
/// @notice Custom error when attempting to initialize the proxy with a zero address for the implementation.
error InitializationWithZeroAddress();
/// @notice Custom error for when direct ETH transfers to the proxy are attempted.
error ETHTransfersNotAllowed();

/// @title ATKFixedYieldProxy
/// @author SettleMint
/// @notice Proxy for ATKFixedYieldSchedule, managed by a factory.
/// This contract is a proxy that delegates calls to an implementation
/// of ATKFixedYieldSchedule. The implementation address is fetched from a specified
/// ATKFixedYieldScheduleFactory contract.
/// @dev This proxy is intended to be deployed by ATKFixedYieldScheduleFactory.
/// It stores the factory address and uses it to determine the logic contract.
contract ATKFixedYieldProxy is Proxy {
    /// @dev Storage slot for the ATKFixedYieldScheduleFactory address.
    /// Value: keccak256("org.atk.contracts.proxy.ATKFixedYieldProxy.factoryAddress")
    bytes32 private constant _ATK_FIXED_YIELD_FACTORY_ADDRESS_SLOT =
        0x89ed739d9295d62aeed983d930b6f4ecdc2f2725b67843de6f01647c76d87d7a;

    /// @notice Constructs the ATKFixedYieldProxy.
    /// @param factoryAddress The address of the IATKFixedYieldScheduleFactory contract.
    /// @param tokenAddress The address of the ISMARTYield token.
    /// @param startDate The start date of the yield schedule.
    /// @param endDate The end date of the yield schedule.
    /// @param rate The rate of the yield schedule.
    /// @param interval The interval of the yield schedule.
    /// @param initialAdmins The initial admins of the yield schedule.
    constructor(
        address factoryAddress,
        address tokenAddress,
        uint256 startDate,
        uint256 endDate,
        uint256 rate,
        uint256 interval,
        address[] memory initialAdmins
    ) {
        if (factoryAddress == address(0)) {
            revert InvalidFactoryAddress();
        }

        if (!IERC165(factoryAddress).supportsInterface(type(IATKFixedYieldScheduleFactory).interfaceId)) {
            revert InvalidFactoryAddress();
        }

        StorageSlot.getAddressSlot(_ATK_FIXED_YIELD_FACTORY_ADDRESS_SLOT).value = factoryAddress;

        address implementationAddress = _getImplementationAddressFromFactory();

        bytes memory initData = abi.encodeWithSelector(
            ATKFixedYieldScheduleUpgradeable.initialize.selector,
            factoryAddress,
            tokenAddress,
            startDate,
            endDate,
            rate,
            interval,
            initialAdmins
        );

        _performInitializationDelegatecall(implementationAddress, initData);
    }

    /// @notice Internal function to retrieve the IATKFixedYieldScheduleFactory contract instance from the stored
    /// address.
    /// @dev Retrieves the factory address from the designated storage slot
    /// @return An IATKFixedYieldScheduleFactory instance.
    function _getFactory() internal view returns (IATKFixedYieldScheduleFactory) {
        return IATKFixedYieldScheduleFactory(StorageSlot.getAddressSlot(_ATK_FIXED_YIELD_FACTORY_ADDRESS_SLOT).value);
    }

    /// @notice Fetches the implementation address from the factory.
    /// @dev Retrieves the current implementation address from the factory contract and validates it
    /// @return The address of the fixed yield schedule implementation.
    function _getImplementationAddressFromFactory() internal view returns (address) {
        IATKFixedYieldScheduleFactory factory = _getFactory();
        // Assumes the factory has a public state variable `atkFixedYieldScheduleImplementation`
        // or a getter named `atkFixedYieldScheduleImplementation()`.
        // If the getter has a different name like `getAtkFixedYieldScheduleImplementation()`,
        // this needs to be adjusted: address impl = factory.getAtKFixedYieldScheduleImplementation();
        address implementation = factory.atkFixedYieldScheduleImplementation();

        if (implementation == address(0)) {
            revert ImplementationNotSetInFactory();
        }
        return implementation;
    }

    /// @notice Performs the delegatecall to initialize the implementation contract.
    /// @dev Executes a delegatecall to the implementation with the provided initialization data
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
    /// @dev Retrieves the implementation address from the configured factory for delegation
    /// @return The address of the current logic/implementation contract for fixed yield schedules.
    function _implementation() internal view override returns (address) {
        return _getImplementationAddressFromFactory();
    }

    /// @notice Fallback function to reject any direct Ether transfers to this proxy contract.
    /// @dev This prevents accidental ETH transfers to the proxy contract.
    receive() external payable virtual {
        revert ETHTransfersNotAllowed();
    }
}
