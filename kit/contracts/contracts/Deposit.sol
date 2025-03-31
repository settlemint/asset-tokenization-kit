// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { ERC3643 } from "./shared/ERC3643.sol";
import { ERC3643Collateral } from "./shared/extensions/ERC3643Collateral.sol";

/**
 * @title Deposit
 * @dev A token contract that combines ERC3643 functionality with collateral capabilities.
 * This contract enables the tokenization of deposits with collateral backing,
 * providing both compliance features from ERC3643 and collateral management features.
 */
contract Deposit is ERC3643, ERC3643Collateral {
    /**
     * @dev Initializes the Deposit contract with token and collateral parameters.
     * @param name_ Name of the token
     * @param symbol_ Symbol of the token
     * @param decimals_ Number of decimals for token amounts
     * @param onchainID_ Address of the onchain identity contract
     * @param paused_ Initial pause state of the token
     * @param initialOwner Address of the initial owner of the contract
     * @param forwarder Address of the trusted forwarder for meta-transactions
     * @param liveness_ Duration in seconds for collateral liveness period
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address onchainID_,
        bool paused_,
        address initialOwner,
        address forwarder,
        uint48 liveness_
    )
        ERC3643(name_, symbol_, decimals_, onchainID_, paused_, forwarder, initialOwner)
        ERC3643Collateral(liveness_)
    { } // Initialize both parent contracts with respective parameters

    /**
     * @dev Overrides the _update function to ensure both parent implementations are called.
     * This is necessary because both parent contracts implement this function with their
     * own behavior, and we need to ensure both behaviors are applied.
     * @param from Address tokens are transferred from
     * @param to Address tokens are transferred to
     * @param value Amount of tokens to transfer
     */
    function _update(address from, address to, uint256 value) internal override(ERC3643, ERC3643Collateral) {
        // Call the implementation from both parent contracts
        super._update(from, to, value);
    }
}
