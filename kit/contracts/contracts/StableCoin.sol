// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC20Blocklist } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Blocklist.sol";
import { ERC20Collateral } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Collateral.sol";
import { ERC20Custodian } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Custodian.sol";

/// @title A collateralized stablecoin with advanced control features
/// @dev Implements a stablecoin with collateral backing, blocklist, pause, and custodian capabilities
/// @custom:security-contact support@settlemint.com
contract StableCoin is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    AccessControl,
    ERC20Permit,
    ERC20Blocklist,
    ERC20Collateral,
    ERC20Custodian
{
    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");
    bytes32 public constant USER_MANAGEMENT_ROLE = keccak256("USER_MANAGEMENT_ROLE");

    /// @dev Stores the collateral proof details
    struct CollateralProof {
        uint256 amount;
        uint48 timestamp;
    }

    /// @dev The current collateral proof
    CollateralProof private _collateralProof;

    /// @param name The token name
    /// @param symbol The token symbol
    /// @param initialOwner The address that will receive admin rights
    /// @param collateralLivenessSeconds Duration in seconds that collateral proofs remain valid
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        uint48 collateralLivenessSeconds
    )
        ERC20(name, symbol)
        ERC20Permit(name)
        ERC20Collateral(collateralLivenessSeconds)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(SUPPLY_MANAGEMENT_ROLE, initialOwner);
        _grantRole(USER_MANAGEMENT_ROLE, initialOwner);
    }

    /// @dev Pauses all token transfers
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @dev Unpauses token transfers
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /// @dev Creates new tokens and assigns them to an address
    /// @param to Recipient of the minted tokens
    /// @param amount Number of tokens to mint
    function mint(address to, uint256 amount) public onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        _mint(to, amount);
    }

    /// @dev Returns current collateral amount and timestamp
    /// @return amount Current proven collateral amount
    /// @return timestamp Timestamp when the collateral was last proven
    function collateral() public view virtual override returns (uint256 amount, uint48 timestamp) {
        return (_collateralProof.amount, _collateralProof.timestamp);
    }

    /// @dev Updates the proven collateral amount with a timestamp
    /// @param amount New collateral amount
    function updateCollateral(uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _collateralProof = CollateralProof({ amount: amount, timestamp: uint48(block.timestamp) });
    }

    /// @dev Checks if an address is a custodian
    /// @param user Address to check
    /// @return True if address has the admin role
    function _isCustodian(address user) internal view override returns (bool) {
        return hasRole(USER_MANAGEMENT_ROLE, user);
    }

    /// @dev Blocks a user from token operations
    /// @param user Address to block
    /// @return True if user was not previously blocked
    function blockUser(address user) public onlyRole(USER_MANAGEMENT_ROLE) returns (bool) {
        return super._blockUser(user);
    }

    /// @dev Unblocks a user from token operations
    /// @param user Address to unblock
    /// @return True if user was previously blocked
    function unblockUser(address user) public onlyRole(USER_MANAGEMENT_ROLE) returns (bool) {
        return super._unblockUser(user);
    }

    /// @dev Unfreezes all tokens for a user
    /// @param user Address to unfreeze tokens for
    /// @param amount Amount of tokens to unfreeze
    function unfreeze(address user, uint256 amount) public onlyRole(USER_MANAGEMENT_ROLE) {
        _frozen[user] = _frozen[user] - amount;
        emit TokensUnfrozen(user, amount);
    }

    /// @dev Updates token balances during transfers
    /// @param from Sender address
    /// @param to Recipient address
    /// @param value Amount being transferred
    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        override(ERC20, ERC20Pausable, ERC20Blocklist, ERC20Collateral, ERC20Custodian)
    {
        super._update(from, to, value);
    }

    /// @dev Approves spending of tokens
    /// @param owner Token owner
    /// @param spender Approved spender
    /// @param value Approved amount
    /// @param emitEvent Whether to emit approval event
    function _approve(
        address owner,
        address spender,
        uint256 value,
        bool emitEvent
    )
        internal
        override(ERC20, ERC20Blocklist)
    {
        super._approve(owner, spender, value, emitEvent);
    }
}
