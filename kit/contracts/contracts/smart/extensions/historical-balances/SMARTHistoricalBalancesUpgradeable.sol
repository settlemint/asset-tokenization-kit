// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

// Base contract imports
import { SMARTExtensionUpgradeable } from "../common/SMARTExtensionUpgradeable.sol"; // Base for upgradeable
    // extensions
import { SMARTHooks } from "../common/SMARTHooks.sol"; // Common hook definitions

// Internal implementation imports
import { _SMARTHistoricalBalancesLogic } from "./internal/_SMARTHistoricalBalancesLogic.sol"; // Core logic

// Interface imports
import { ISMARTHistoricalBalances } from "./ISMARTHistoricalBalances.sol";

/// @title Upgradeable SMART Historical Balances Extension
/// @author SettleMint
/// @notice This abstract contract provides the upgradeable (UUPS proxy pattern) implementation
/// for tracking
///         historical token balances and total supply for a SMART token.
/// @dev It integrates the core checkpointing logic from `_SMARTHistoricalBalancesLogic` into the upgradeable
///      SMART token lifecycle. This is done by overriding `SMARTHooks` (`_afterMint`, `_afterBurn`,
///      `_afterTransfer`) to call the corresponding internal logic functions from `_SMARTHistoricalBalancesLogic`.
///      This contract is 'abstract' and designed to be inherited by a final, deployable, upgradeable SMART token.
///      The final token contract would also inherit `ERC20Upgradeable`, the main `SMARTUpgradeable` contract,
///      and `UUPSUpgradeable` for managing upgrades.
///      It includes an `__SMARTHistoricalBalances_init` initializer function, which calls the unchained
///      initializer from the logic contract to register the interface for ERC165.
abstract contract SMARTHistoricalBalancesUpgradeable is
    Initializable,
    // Required for upgradeable contracts
    SMARTExtensionUpgradeable,
    // Base for upgradeable SMART extensions
    _SMARTHistoricalBalancesLogic
{
    // Core historical balances logic
    /// @notice Register the interface ID for ERC165.
    /// @dev This allows factories to check if the
    /// contract
    /// supports the `ISMARTHistoricalBalances` interface based on the upgradeable implementation.
    constructor() {
        _registerInterface(type(ISMARTHistoricalBalances).interfaceId);
    }

    /// @notice Initializer for the Upgradeable SMART Historical Balances extension.
    /// @dev This function MUST be called once by the `initialize` function of the final concrete (and proxy-deployed)
    ///      contract. It uses the `onlyInitializing` modifier from `Initializable` to ensure it runs only during
    ///      the proxy setup or a reinitialization phase if allowed by the upgrade pattern.
    ///      It calls `__SMARTHistoricalBalances_init_unchained` from `_SMARTHistoricalBalancesLogic`
    ///      to perform essential setup, primarily registering the `ISMARTHistoricalBalances` interface ID
    ///      for ERC165 introspection.
    function __SMARTHistoricalBalances_init() internal onlyInitializing {
        // Initialize the core historical balances logic (mainly for ERC165 interface registration).
        __SMARTHistoricalBalances_init_unchained();
    }

    /// @notice Hook that is called *after* any token minting operation in an upgradeable context.
    /// @dev Overrides `SMARTHooks._afterMint`. Calls `super._afterMint` to maintain the hook chain, then
    ///      invokes `__historical_balances_afterMintLogic` to update historical checkpoints.
    /// @param to The address that received the minted tokens.
    /// @param amount The amount of tokens minted.
    function _afterMint(address to, uint256 amount) internal virtual override(SMARTHooks) {
        super._afterMint(to, amount); // Preserve hook chain.
            // Update historical checkpoints for the mint operation.
        __historical_balances_afterMintLogic(to, amount);
    }

    /// @notice Hook that is called *after* any token burning operation in an upgradeable context.
    /// @dev Overrides `SMARTHooks._afterBurn`. Calls `super._afterBurn`, then
    ///      `__historical_balances_afterBurnLogic` to update checkpoints.
    /// @param from The address whose tokens were burned.
    /// @param amount The amount of tokens burned.
    function _afterBurn(address from, uint256 amount) internal virtual override(SMARTHooks) {
        super._afterBurn(from, amount); // Preserve hook chain.
            // Update historical checkpoints for the burn operation.
        __historical_balances_afterBurnLogic(from, amount);
    }

    /// @notice Hook that is called *after* any token transfer operation in an upgradeable context.
    /// @dev Overrides `SMARTHooks._afterTransfer`. Calls `super._afterTransfer`, then
    ///      `__historical_balances_afterTransferLogic` to update sender and recipient checkpoints.
    /// @param from The address that sent the tokens.
    /// @param to The address that received the tokens.
    /// @param amount The amount of tokens transferred.
    function _afterTransfer(address from, address to, uint256 amount) internal virtual override(SMARTHooks) {
        super._afterTransfer(from, to, amount); // Preserve hook chain.
            // Update historical checkpoints for the transfer operation.
        __historical_balances_afterTransferLogic(from, to, amount);
    }

    // Developer Note: The final contract inheriting this must also inherit UUPSUpgradeable
    // and implement `_authorizeUpgrade` to control who can upgrade the contract.
    // Example for an Ownable setup:
    // contract MyFinalToken is SMARTHistoricalBalancesUpgradeable, UUPSUpgradeable, OwnableUpgradeable, ... {
    //     function initialize(...) public initializer {
    //         ... __SMARTUpgradeable_init(...); __Ownable_init(...); __UUPSUpgradeable_init(); ...
    //         __SMARTHistoricalBalances_init(); ...
    //     }
    //     function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    // }
}
