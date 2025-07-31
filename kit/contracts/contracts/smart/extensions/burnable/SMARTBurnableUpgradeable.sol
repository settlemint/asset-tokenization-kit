// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// Base contract imports
import { SMARTExtensionUpgradeable } from "../common/SMARTExtensionUpgradeable.sol";

// Internal implementation imports
import { _SMARTBurnableLogic } from "./internal/_SMARTBurnableLogic.sol";

// Interface imports
import { ISMARTBurnable } from "./ISMARTBurnable.sol";

/// @title Upgradeable SMART Burnable Extension
/// @author SettleMint
/// @notice This contract provides the functionality to burn (destroy) tokens for a SMART token
/// contract
///         that is designed to be upgradeable (e.g., using a proxy pattern).
///         'Upgradeable' contracts allow their logic to be updated after deployment without changing
///         the contract's address. This is useful for fixing bugs or adding new features.
/// @dev This abstract contract inherits from `Initializable` (to manage initialization in an upgradeable context),
///      `SMARTExtensionUpgradeable` (for common SMART upgradeable functionalities), and `_SMARTBurnableLogic`
///      (for the core burn operations).
///      Its main role is to implement the `__burnable_executeBurn` internal hook, specific to an upgradeable
///      ERC20 token standard (e.g., OpenZeppelin's `ERC20Upgradeable.sol`).
///      The final contract inheriting `SMARTBurnableUpgradeable` must also inherit an upgradeable ERC20 contract
///      that provides the internal `_burn(address from, uint256 amount)` function.
///      An 'abstract contract' can define some functions but might leave others for inheriting contracts to implement.
///      It cannot be deployed directly.

abstract contract SMARTBurnableUpgradeable is Initializable, SMARTExtensionUpgradeable, _SMARTBurnableLogic {
    /// @notice Register the `ISMARTBurnable` interface ID for ERC165.
    /// @dev This allows factories to check if the contract supports the `ISMARTBurnable` interface based on the
    /// upgradeable implementation.
    constructor() {
        _registerInterface(type(ISMARTBurnable).interfaceId);
    }

    // -- Initializer --

    /// @notice Initializes the burnable extension for an upgradeable contract.
    /// @dev This function should be called only once, typically during the deployment or
    ///      initialization phase of the proxy contract that uses this logic contract (the implementation).
    ///      The `onlyInitializing` modifier (from OpenZeppelin's `Initializable` contract) ensures that
    ///      this function cannot be called again after the contract has been initialized.
    ///      This is a critical security measure in upgradeable contracts to prevent malicious re-initialization.
    ///      This specific initializer calls `__SMARTBurnable_init_unchained()` from `_SMARTBurnableLogic`
    ///      to perform tasks like interface registration.
    function __SMARTBurnable_init() internal onlyInitializing {
        // Calls the unchained initializer from the logic contract.
        // For this particular extension, the unchained initializer might just register an interface
        // and might not have other complex state to set up, hence appearing "empty" from a direct logic perspective
        // here.
        __SMARTBurnable_init_unchained();
    }

    // -- Internal Hook Implementations (Dependencies) --

    /// @notice Internal function that executes the actual token burning by calling the base ERC20Upgradeable `_burn`
    /// function.
    /// @dev This function implements the `__burnable_executeBurn` abstract hook from `_SMARTBurnableLogic`.
    ///      It connects the generic burn logic of the extension to the specific `_burn` mechanism of the
    ///      underlying upgradeable ERC20 token (e.g., `ERC20Upgradeable`).
    ///      The `internal` visibility restricts its callability to this contract and its derivatives.
    ///      `virtual` allows it to be overridden by inheriting contracts if needed.
    ///      `override` signifies it's replacing an abstract function from a parent.
    /// @param from The address from which tokens are to be burned. This account's balance will decrease.
    /// @param amount The quantity of tokens to destroy.
    /// @inheritdoc _SMARTBurnableLogic
    function __burnable_executeBurn(address from, uint256 amount) internal virtual override {
        // Note: This line assumes that the contract ultimately deploying this extension
        // (e.g., YourUpgradeableToken.sol) will also inherit an upgradeable ERC20 contract
        // (e.g., ERC20Upgradeable from OpenZeppelin).
        // That parent ERC20Upgradeable contract is expected to provide the internal `_burn(address, uint256)` function.
        _burn(from, amount);
    }
}
