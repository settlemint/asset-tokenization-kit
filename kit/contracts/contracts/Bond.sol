// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC20Blocklist } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Blocklist.sol";
import { ERC20Custodian } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Custodian.sol";

/// @title Bond - A standard bond token implementation
/// @notice This contract implements an ERC20 token representing a standard bond with fixed-income characteristics
/// @dev Inherits from multiple OpenZeppelin contracts and implements bond-specific features
/// @custom:security-contact support@settlemint.com
contract Bond is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ERC20Permit, ERC20Blocklist, ERC20Custodian {
    /// @notice Custom errors for the Bond contract
    error BondAlreadyMatured();
    error BondNotYetMatured();
    error BondInvalidMaturityDate();
    error BondMaturityReached();
    error InvalidDecimals(uint8 decimals);

    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");
    bytes32 public constant USER_MANAGEMENT_ROLE = keccak256("USER_MANAGEMENT_ROLE");

    /// @notice Timestamp when the bond matures
    uint256 public immutable maturityDate;

    /// @notice Event emitted when the bond reaches maturity and is closed
    event BondMatured(uint256 timestamp);

    /// @notice Tracks whether the bond has matured
    bool public isMatured;

    /// @notice The number of decimals used for token amounts
    uint8 private immutable _decimals;

    /// @notice Modifier to prevent transfers after maturity
    modifier notMatured() {
        if (isMatured) revert BondMaturityReached();
        _;
    }

    /// @notice Deploys a new Bond token contract
    /// @param name The token name
    /// @param symbol The token symbol
    /// @param decimals_ The number of decimals for the token
    /// @param initialOwner The address that will receive admin rights
    /// @param _maturityDate Timestamp when the bond matures
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        address initialOwner,
        uint256 _maturityDate
    )
        ERC20(name, symbol)
        ERC20Permit(name)
    {
        if (_maturityDate <= block.timestamp) revert BondInvalidMaturityDate();
        if (decimals_ > 18) revert InvalidDecimals(decimals_);

        _decimals = decimals_;
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(SUPPLY_MANAGEMENT_ROLE, initialOwner);
        _grantRole(USER_MANAGEMENT_ROLE, initialOwner);
        maturityDate = _maturityDate;
    }

    /// @notice Returns the number of decimals used to get its user representation
    /// @dev Override the default ERC20 decimals function to use the configurable value
    /// @return The number of decimals
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /// @notice Pauses all token transfers
    /// @dev Only callable by the admin. Emits a Paused event
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpauses token transfers
    /// @dev Only callable by the admin. Emits an Unpaused event
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /// @notice Creates new tokens and assigns them to an address
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE role. Emits a Transfer event
    /// @param to The address that will receive the minted tokens
    /// @param amount The quantity of tokens to create in base units
    function mint(address to, uint256 amount) public onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        _mint(to, amount);
    }

    /// @notice Checks if an address is a custodian
    /// @dev Internal function that considers only addresses with admin role as custodians
    /// @param user The address to check
    /// @return True if the address has the admin role, false otherwise
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

    /// @notice Approves spending of tokens
    /// @dev Internal function that handles allowance updates across inherited features
    /// @param owner The token owner
    /// @param spender The approved spender
    /// @param value The approved amount in base units
    /// @param emitEvent Whether to emit an Approval event
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

    /// @notice Updates token balances during transfers
    /// @dev Internal function that handles balance updates and voting power adjustments
    /// @param from The sender address
    /// @param to The recipient address
    /// @param value The amount being transferred in base units
    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        override(ERC20, ERC20Pausable, ERC20Blocklist, ERC20Custodian)
        notMatured
    {
        super._update(from, to, value);
    }

    /// @notice Closes off the bond at maturity
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE role after maturity date
    function mature() external onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        if (block.timestamp < maturityDate) revert BondNotYetMatured();
        if (isMatured) revert BondAlreadyMatured();

        isMatured = true;
        emit BondMatured(block.timestamp);
    }
}
