// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

// Base contract imports
import { SMARTExtensionUpgradeable } from "../common/SMARTExtensionUpgradeable.sol"; // Base for upgradeable
    // extensions

// Internal implementation imports
import { _SMARTPausableLogic } from "./internal/_SMARTPausableLogic.sol"; // Core pausable state and modifiers

// Interface imports
import { ISMARTPausable } from "./ISMARTPausable.sol";

/// @title Upgradeable SMART Pausable Extension
/// @author SettleMint
/// @notice This abstract contract provides the upgradeable (UUPS proxy pattern) implementation of
/// pausable
///         functionality for a SMART token.
/// @dev It integrates the pausable logic from `_SMARTPausableLogic` with an `ERC20Upgradeable` token.
///      Similar to its non-upgradeable counterpart (`SMARTPausable.sol`), this is achieved by overriding
///      the `ERC20Upgradeable._update` function and applying the `whenNotPaused` modifier from
///      `_SMARTPausableLogic`. This halts standard token movements (transfers, mints, burns) when paused.
///      This contract is 'abstract' and intended for inheritance by a final, deployable, upgradeable SMART token.
///      The final token contract would also inherit `ERC20Upgradeable`, `SMARTUpgradeable`, `UUPSUpgradeable`,
///      and an upgradeable authorization mechanism for pause/unpause controls.
///      It includes an `__SMARTPausable_init` initializer that calls the unchained initializer from the logic
///      contract to register the pausable interface for ERC165.
abstract contract SMARTPausableUpgradeable is Initializable, SMARTExtensionUpgradeable, _SMARTPausableLogic {
    // Developer Note: The final concrete contract inheriting `SMARTPausableUpgradeable` must also inherit:
    // 1. `ERC20Upgradeable` (e.g., via `SMARTUpgradeable.sol`).
    // 2. `UUPSUpgradeable` for the upgrade mechanism and implement `_authorizeUpgrade`.
    // 3. An upgradeable authorization contract (e.g., an upgradeable version of
    //    `SMARTPausableAccessControlAuthorization.sol`) to manage who can pause/unpause.
    // In the final contract's `initialize` function, ensure `__SMARTPausable_init()` is called after other
    // essential initializers like `__ERC20_init`, `__Ownable_init` (or `__AccessControl_init`), and `__SMART_init`.

    /// @notice Register the interface ID for ERC165.
    /// @dev This allows factories to check if the
    /// contract
    /// supports the `ISMARTPausable` interface based on the upgradeable implementation.
    constructor() {
        _registerInterface(type(ISMARTPausable).interfaceId);
    }

    // -- Initializer --

    /// @notice Initializer for the Upgradeable Pausable extension.
    /// @param initiallyPaused If true, the contract will be initialized in a paused state.
    /// @dev This function MUST be called once by the `initialize` function of the final concrete (and proxy-deployed)
    ///      contract. It uses the `onlyInitializing` modifier from `Initializable` to ensure it runs only during
    ///      the proxy setup or a reinitialization phase if allowed by the upgrade pattern.
    ///      It calls `__SMARTPausable_init_unchained` from `_SMARTPausableLogic` to perform essential setup,
    ///      primarily registering the `ISMARTPausable` interface ID for ERC165 introspection.
    ///      Note: OpenZeppelin's `PausableUpgradeable` itself doesn't have an explicit initializer; its state
    ///      (`_paused`) is managed directly by its `_pause()` and `_unpause()` internal functions. This custom
    ///      `__SMARTPausable_init` is mainly for our framework's ERC165 registration consistency.
    function __SMARTPausable_init(bool initiallyPaused) internal onlyInitializing {
        // Initialize the core pausable logic (mainly for ERC165 interface registration).
        __SMARTPausable_init_unchained(initiallyPaused);
    }

    // -- Internal Hooks & Overrides --

    /**
     * @notice Overrides the base `ERC20Upgradeable._update` function to integrate pausable functionality.
     * @dev Applies the `whenNotPaused` modifier (inherited from `_SMARTPausableLogic`) to ensure that
     *      token operations (mints, burns, standard transfers) via `_update` can only occur when the contract
     *      is not paused.
     *      Delegates the actual ledger update logic to `super._update`, which would call the next `_update`
     *      in the inheritance chain (e.g., `SMARTUpgradeable`'s `_update`).
     * @param from The address from which tokens are being sent (or `address(0)` for mints).
     * @param to The address to which tokens are being sent (or `address(0)` for burns).
     * @param value The amount of tokens being affected.
     */
    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        virtual
        override(ERC20Upgradeable) // Specifies that this overrides `_update` from `ERC20Upgradeable`.
        whenNotPaused // Applies the modifier from `_SMARTPausableLogic`.
    {
        // `super._update` calls the `_update` function of the parent contract in the inheritance hierarchy
        // that also overrides `_update`. For an upgradeable SMART token, this is likely `SMARTUpgradeable`,
        // which handles SMARTHooks before calling the base `ERC20Upgradeable._update`.
        super._update(from, to, value);
    }
}
