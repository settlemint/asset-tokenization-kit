// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

// Base contract imports
import { SMARTExtensionUpgradeable } from "../common/SMARTExtensionUpgradeable.sol";

// Internal implementation imports
import { _SMARTRedeemableLogic } from "./internal/_SMARTRedeemableLogic.sol";

// Interface imports
import { ISMARTRedeemable } from "./ISMARTRedeemable.sol";

/// @title Upgradeable SMART Redeemable Extension
/// @author SettleMint
/// @notice This contract provides an upgradeable implementation for the redeemable token
/// functionality.
/// It allows token holders to redeem (burn) their own tokens. Being "upgradeable" means its logic
/// can be updated after deployment through a proxy pattern (e.g., UUPS or Transparent Upgradeable Proxy).
/// @dev This is an `abstract` contract, intended to be inherited by a final, concrete upgradeable token contract.
/// It inherits from:
/// - `Initializable`: Manages initialization for upgradeable contracts, ensuring `initialize` functions are called only
/// once.
/// - `ContextUpgradeable`: Provides access to `_msgSender()` in an upgradeable context.
/// - `SMARTExtensionUpgradeable`: Provides common functionalities for SMART extensions in an upgradeable context.
/// - `_SMARTRedeemableLogic`: Contains the core logic for redeeming tokens (e.g., `redeem`, `redeemAll` functions,
/// hooks, event emission).
/// This contract implements the abstract functions `__redeemable_getBalance` and `__redeemable_redeem` from
/// `_SMARTRedeemableLogic`,
/// adapting them for an upgradeable ERC20 context (e.g., `ERC20Upgradeable`).
/// It assumes the final concrete contract will also inherit an upgradeable ERC20 implementation (like
/// `ERC20Upgradeable` along with `ERC20BurnableUpgradeable`).
abstract contract SMARTRedeemableUpgradeable is
    Initializable,
    ContextUpgradeable,
    SMARTExtensionUpgradeable,
    _SMARTRedeemableLogic
{
    // Developer Note: The final concrete contract that inherits `SMARTRedeemableUpgradeable` must also inherit
    // an upgradeable ERC20 implementation (e.g., `ERC20Upgradeable` and `ERC20BurnableUpgradeable` for the `_burn`
    // function)
    // and the core `SMARTUpgradeable.sol` logic contract. Its main `initialize` function should call
    // `__SMARTRedeemable_init()`.

    /// @notice Register the interface ID for ERC165.
    /// @dev This allows factories to check if the
    /// contract
    /// supports the `ISMARTRedeemable` interface based on the upgradeable implementation.
    constructor() {
        _registerInterface(type(ISMARTRedeemable).interfaceId);
    }

    // -- Initializer --

    /// @notice Initializes the upgradeable redeemable extension.
    /// @dev This function should be called once, typically within the main `initialize` function of the concrete
    /// token contract that inherits `SMARTRedeemableUpgradeable`.
    /// The `onlyInitializing` modifier (from OpenZeppelin's `Initializable`) ensures this function can only be called
    /// during the contract's initialization phase, preventing re-initialization.
    /// It calls `__SMARTRedeemable_init_unchained()` from `_SMARTRedeemableLogic` to register the `ISMARTRedeemable`
    /// interface.
    function __SMARTRedeemable_init() internal onlyInitializing {
        // Calls the unchained initializer from the logic contract. This primarily handles ERC165 interface
        // registration.
        __SMARTRedeemable_init_unchained();
    }

    // -- Internal Hook Implementations --

    /// @notice Gets the token balance of a given account in an upgradeable context.
    /// @dev This function implements the abstract `__redeemable_getBalance` from `_SMARTRedeemableLogic`.
    /// It relies on the `balanceOf` function being available from an inherited `ERC20Upgradeable` contract.
    /// `internal view virtual override` signifies its properties as explained in the non-upgradeable version.
    /// @inheritdoc _SMARTRedeemableLogic
    /// @param account The address for which to retrieve the token balance.
    /// @return The token balance of the `account`.
    function __redeemable_getBalance(address account) internal view virtual override returns (uint256) {
        // Assumes `balanceOf` is available from an inherited ERC20Upgradeable contract.
        return balanceOf(account);
    }

    /// @notice Executes the token burn operation for a redemption in an upgradeable context.
    /// @dev This function implements the abstract `__redeemable_redeem` from `_SMARTRedeemableLogic`.
    /// It performs the actual burning of tokens by calling the internal `_burn` function.
    /// This `_burn` function is expected to be available from an inherited `ERC20Upgradeable` contract that also
    /// includes
    /// burnable functionality (e.g., by inheriting `ERC20BurnableUpgradeable`).
    /// As with the non-upgradeable version, allowance checks are typically not needed for self-redemption.
    /// `internal virtual override` signifies its properties as explained in the non-upgradeable version.
    /// @inheritdoc _SMARTRedeemableLogic
    /// @param from The address of the token holder whose tokens are being burned.
    /// @param amount The quantity of tokens to burn.
    function __redeemable_redeem(address from, uint256 amount) internal virtual override {
        // Allowance check is typically NOT needed for self-burn/redeem.
        // The `_burn` function (from ERC20BurnableUpgradeable or similar) will handle balance checks.
        _burn(from, amount); // Assumes `_burn` is available from an inherited ERC20BurnableUpgradeable contract.
    }
}
