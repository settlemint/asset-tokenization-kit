// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ISMART } from "../../interface/ISMART.sol";
import { SMARTHooks } from "../common/SMARTHooks.sol";
import { SMARTContext } from "../common/SMARTContext.sol";

/// @title Base Contract for All SMART Token Extensions
/// @author SettleMint
/// @notice This abstract contract serves as the ultimate base for all SMART token extensions,
///         both standard and upgradeable. It provides fundamental shared functionalities like
///         interface registration for ERC165 support and inherits core SMART interfaces and hook definitions.
/// @dev It inherits `ISMART` (the core interface for SMART tokens, defining functions like `onchainID`,
///      `identityRegistry`, etc.), `SMARTContext` (for a consistent way to get the transaction sender),
///      and `SMARTHooks` (which defines the standard set of lifecycle hooks like `_beforeMint`).
///      The `_registerInterface` function is used to implement
///      ERC165 introspection, allowing other contracts to query if a SMART token supports a specific extension
///      interface.
///      An 'abstract contract' is a template and cannot be deployed directly.

abstract contract _SMARTExtension is ISMART, SMARTContext, SMARTHooks {
    /// @notice Error thrown when the maximum number of interfaces is reached.
    /// @dev This is used to avoid hitting storage limits.
    error InterfaceRegistrationLimitReached();

    /// @notice Internal flag, potentially for managing forced updates or states (usage may vary or be vestigial).
    /// @dev The exact purpose of `__isForcedUpdate` might depend on specific extension implementations or
    ///      higher-level contract logic that uses it. It's a general-purpose internal flag.
    bool internal __isForcedUpdate; // TODO: Review if this is actively used or can be deprecated/clarified.

    /// @notice Fixed-size array to store all registered interface IDs for enumeration.
    /// @dev Stores all registered interface IDs for enumeration and ERC165 support.
    ///      Each interface ID is added here via `_registerInterface()`.
    ///      This is a fixed-size array (`bytes4[32]`), 32 items / 8 items/slot = 4 storage slots
    ///      ⚠️ Hard limit: Only 32 interfaces can be registered. Increasing this size changes storage layout.
    bytes4[32] internal _registeredInterfaces;

    /// @notice Count of registered interfaces.
    /// @dev This is used to avoid hitting storage limits.
    uint8 internal _registeredInterfacesCount;

    // --- Implementation Functions ---

    /// @notice Checks if a specific interface ID is registered.
    /// @dev This function is used to check if a specific interface ID is registered.
    /// @param interfaceId The `bytes4` interface identifier to check.
    /// @return bool `true` if the interface is registered, `false` otherwise.
    function _isInterfaceRegistered(bytes4 interfaceId) internal view returns (bool) {
        for (uint8 i = 0; i < _registeredInterfacesCount; ++i) {
            if (_registeredInterfaces[i] == interfaceId) {
                return true;
            }
        }
        return false;
    }

    /// @notice Registers a specific interface ID as being supported by this contract.
    /// @dev This internal function is intended to be called by derived extension contracts, usually during
    ///      their initialization phase (constructor for standard, or an initializer function for upgradeable).
    ///      By calling this, an extension signals that it implements all functions defined in the given interface.
    ///      For example, a burnable extension would call `_registerInterface(type(ISMARTBurnable).interfaceId);`.
    ///      This populates the `_registeredInterfaces` array.
    /// @param interfaceId The `bytes4` identifier of the interface to register (e.g.,
    /// `type(IMyExtensionInterface).interfaceId`).
    ///                    The `type(IMyInterface).interfaceId` expression automatically calculates the correct ERC165
    /// ID.
    function _registerInterface(bytes4 interfaceId) internal {
        // Only register if not already registered to avoid duplicates
        if (!_isInterfaceRegistered(interfaceId)) {
            if (_registeredInterfacesCount == _registeredInterfaces.length) {
                revert InterfaceRegistrationLimitReached();
            }
            _registeredInterfaces[_registeredInterfacesCount] = interfaceId;
            ++_registeredInterfacesCount;
        }
    }

    /// @notice Returns an array of all registered interface IDs.
    /// @dev This function allows external contracts and users to discover all interfaces
    ///      that this contract claims to support. This is useful for introspection and
    ///      automated interface detection.
    /// @return An array of `bytes4` interface identifiers that have been registered.
    function registeredInterfaces() external view returns (bytes4[] memory) {
        bytes4[] memory interfaces = new bytes4[](_registeredInterfacesCount);
        for (uint256 i = 0; i < _registeredInterfacesCount; ++i) {
            interfaces[i] = _registeredInterfaces[i];
        }
        return interfaces;
    }
}
