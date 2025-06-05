// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";
import { ISMARTFixedYieldScheduleFactory } from "./ISMARTFixedYieldScheduleFactory.sol"; // Assuming this interface
    // exists or will be created
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { SMARTFixedYieldScheduleUpgradeable } from
    "../../extensions/yield/schedules/fixed/SMARTFixedYieldScheduleUpgradeable.sol";

/// @notice Custom error when the provided factory address is invalid (e.g. zero address or does not support the
/// required interface).
error InvalidFactoryAddress();
/// @notice Custom error when the factory does not have an implementation address set for the fixed yield schedule.
error ImplementationNotSetInFactory();
/// @notice Custom error when attempting to initialize the proxy with a zero address for the implementation.
error InitializationWithZeroAddress();
/// @notice Custom error for when direct ETH transfers to the proxy are attempted.
error ETHTransfersNotAllowed();

/// @title Proxy for SMARTFixedYieldSchedule, managed by a factory.
/// @notice This contract is a proxy that delegates calls to an implementation
/// of SMARTFixedYieldSchedule. The implementation address is fetched from a specified
/// SMARTFixedYieldScheduleFactory contract.
/// @dev This proxy is intended to be deployed by SMARTFixedYieldScheduleFactory.
/// It stores the factory address and uses it to determine the logic contract.
contract SMARTFixedYieldProxy is Proxy {
    /// @dev Storage slot for the SMARTFixedYieldScheduleFactory address.
    /// Value: keccak256("org.smart.contracts.proxy.SMARTFixedYieldProxy.factoryAddress")
    bytes32 private constant _SMART_FIXED_YIELD_FACTORY_ADDRESS_SLOT =
        0x363806adfa5a524641c4e659f9bc32ddfd6a4a50b5f3ef0da585a2372fe70127;

    /// @notice Constructs the SMARTFixedYieldProxy.
    /// @param factoryAddress The address of the ISMARTFixedYieldScheduleFactory contract.
    /// @param tokenAddress The address of the ISMARTYield token.
    /// @param startDate The start date of the yield schedule.
    /// @param endDate The end date of the yield schedule.
    /// @param rate The rate of the yield schedule.
    /// @param interval The interval of the yield schedule.
    /// @param initialOwner The initial owner of the yield schedule.
    constructor(
        address factoryAddress,
        address tokenAddress,
        uint256 startDate,
        uint256 endDate,
        uint256 rate,
        uint256 interval,
        address initialOwner
    ) {
        if (factoryAddress == address(0)) {
            revert InvalidFactoryAddress();
        }

        if (!IERC165(factoryAddress).supportsInterface(type(ISMARTFixedYieldScheduleFactory).interfaceId)) {
            revert InvalidFactoryAddress();
        }

        StorageSlot.getAddressSlot(_SMART_FIXED_YIELD_FACTORY_ADDRESS_SLOT).value = factoryAddress;

        address implementationAddress = _getImplementationAddressFromFactory();

        bytes memory initData = abi.encodeWithSelector(
            SMARTFixedYieldScheduleUpgradeable.initialize.selector,
            tokenAddress,
            startDate,
            endDate,
            rate,
            interval,
            initialOwner
        );

        _performInitializationDelegatecall(implementationAddress, initData);
    }

    /// @dev Internal function to retrieve the ISMARTFixedYieldScheduleFactory contract instance from the stored
    /// address.
    /// @return An ISMARTFixedYieldScheduleFactory instance.
    function _getFactory() internal view returns (ISMARTFixedYieldScheduleFactory) {
        return
            ISMARTFixedYieldScheduleFactory(StorageSlot.getAddressSlot(_SMART_FIXED_YIELD_FACTORY_ADDRESS_SLOT).value);
    }

    /// @dev Fetches the implementation address from the factory.
    /// @return The address of the fixed yield schedule implementation.
    function _getImplementationAddressFromFactory() internal view returns (address) {
        ISMARTFixedYieldScheduleFactory factory = _getFactory();
        // Assumes the factory has a public state variable `smartFixedYieldScheduleImplementation`
        // or a getter named `smartFixedYieldScheduleImplementation()`.
        // If the getter has a different name like `getSmartFixedYieldScheduleImplementation()`,
        // this needs to be adjusted: address impl = factory.getSmartFixedYieldScheduleImplementation();
        address implementation = factory.smartFixedYieldScheduleImplementation();

        if (implementation == address(0)) {
            revert ImplementationNotSetInFactory();
        }
        return implementation;
    }

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

    /// @dev Overrides `Proxy._implementation()`. This is used by OpenZeppelin's proxy mechanisms.
    /// It retrieves the implementation address from the configured factory.
    /// @return The address of the current logic/implementation contract for fixed yield schedules.
    function _implementation() internal view override returns (address) {
        return _getImplementationAddressFromFactory();
    }

    /// @notice Fallback function to reject any direct Ether transfers to this proxy contract.
    receive() external payable virtual {
        revert ETHTransfersNotAllowed();
    }
}
