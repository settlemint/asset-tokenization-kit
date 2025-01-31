// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC20Blocklist } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Blocklist.sol";
import { ERC20Collateral } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Collateral.sol";
import { ERC20Custodian } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Custodian.sol";

/// @title A collateralized stablecoin with advanced control features
/// @notice This contract implements a stablecoin with collateral backing, blocklist, pause, and custodian capabilities
/// @dev Inherits from OpenZeppelin contracts to provide comprehensive stablecoin functionality with advanced control
/// features
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
    bytes32 public constant COLLATERAL_MANAGER_ROLE = keccak256("COLLATERAL_MANAGER_ROLE");

    /// @notice Maximum amount that can be minted in a single transaction
    uint256 private immutable _maxMintAmount;

    /// @notice Minimum time between collateral updates
    uint256 private immutable _minCollateralUpdateInterval;

    error InvalidDecimals(uint8 decimals);
    error InvalidISIN();
    error InvalidLiveness();
    error InvalidCollateralRatio();
    error MintAmountTooLarge();
    error TooFrequentCollateralUpdate();
    error BatchOperationFailed(uint256 index);
    error InvalidBatchInput();
    error InsufficientCollateral();
    error InvalidMaxMintAmount();
    error InvalidUpdateInterval();

    /// @dev Stores the collateral proof details
    struct CollateralProof {
        uint256 amount;
        uint48 timestamp;
    }

    /// @dev The current collateral proof
    CollateralProof private _collateralProof;

    /// @notice The number of decimals used for token amounts
    uint8 private immutable _decimals;

    /// @notice The optional ISIN (International Securities Identification Number) of the stablecoin
    bytes12 private immutable _isin;

    /// @notice The timestamp of the last collateral update
    uint256 private _lastCollateralUpdate;

    // Events
    event CollateralUpdated(uint256 oldAmount, uint256 newAmount, uint256 timestamp);
    event BatchOperationCompleted(string operation, uint256 count);

    /// @notice Constructor
    /// @param name The token name
    /// @param symbol The token symbol
    /// @param decimals_ The number of decimals for the token
    /// @param initialOwner The address that will receive admin rights
    /// @param isin_ The optional ISIN (International Securities Identification Number) of the stablecoin
    /// @param collateralLivenessSeconds Duration in seconds that collateral proofs remain valid
    /// @param maxMintAmount_ Maximum amount that can be minted in a single transaction
    /// @param minCollateralUpdateInterval_ Minimum time between collateral updates in seconds
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        address initialOwner,
        string memory isin_,
        uint48 collateralLivenessSeconds,
        uint256 maxMintAmount_,
        uint256 minCollateralUpdateInterval_
    )
        ERC20(name, symbol)
        ERC20Permit(name)
        ERC20Collateral(collateralLivenessSeconds)
    {
        if (decimals_ > 18) revert InvalidDecimals(decimals_);
        if (collateralLivenessSeconds == 0) revert InvalidLiveness();
        if (bytes(isin_).length != 0 && bytes(isin_).length != 12) revert InvalidISIN();
        if (maxMintAmount_ == 0) revert InvalidMaxMintAmount();
        if (minCollateralUpdateInterval_ == 0) revert InvalidUpdateInterval();

        _decimals = decimals_;
        _isin = bytes12(bytes(isin_));
        _lastCollateralUpdate = block.timestamp;
        _maxMintAmount = maxMintAmount_;
        _minCollateralUpdateInterval = minCollateralUpdateInterval_;

        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(SUPPLY_MANAGEMENT_ROLE, initialOwner);
        _grantRole(USER_MANAGEMENT_ROLE, initialOwner);
        _grantRole(COLLATERAL_MANAGER_ROLE, initialOwner);
    }

    /// @notice Returns the number of decimals used to get its user representation
    /// @dev Override the default ERC20 decimals function to use the configurable value
    /// @return The number of decimals
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /// @notice Returns the optional ISIN (International Securities Identification Number) of the stablecoin
    /// @return The ISIN of the stablecoin, or empty string if not set
    function isin() public view returns (string memory) {
        // Check if all bytes are zero
        bool isEmpty = true;
        for (uint256 i = 0; i < 12; i++) {
            if (bytes12(_isin)[i] != 0) {
                isEmpty = false;
                break;
            }
        }
        return isEmpty ? "" : string(abi.encodePacked(_isin));
    }

    /// @notice Pauses all token transfers
    /// @dev Only callable by the admin. Emits a Paused event from ERC20Pausable
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpauses token transfers
    /// @dev Only callable by the admin. Emits an Unpaused event from ERC20Pausable
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /// @notice Creates new tokens and assigns them to an address
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE role
    /// @param to Recipient of the minted tokens
    /// @param amount Number of tokens to mint
    function mint(address to, uint256 amount) public onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        if (amount > _maxMintAmount) revert MintAmountTooLarge();

        (uint256 collateralAmount,) = collateral();
        if (collateralAmount < totalSupply() + amount) revert InsufficientCollateral();

        _mint(to, amount);
    }

    /// @notice Returns current collateral amount and timestamp
    /// @return amount Current proven collateral amount
    /// @return timestamp Timestamp when the collateral was last proven
    function collateral() public view virtual override returns (uint256 amount, uint48 timestamp) {
        return (_collateralProof.amount, _collateralProof.timestamp);
    }

    /// @notice Updates the proven collateral amount with a timestamp
    /// @param amount New collateral amount
    function updateCollateral(uint256 amount) public onlyRole(COLLATERAL_MANAGER_ROLE) {
        if (block.timestamp < _lastCollateralUpdate + _minCollateralUpdateInterval) {
            revert TooFrequentCollateralUpdate();
        }
        if (amount < totalSupply()) revert InsufficientCollateral();

        uint256 oldAmount = _collateralProof.amount;
        _collateralProof = CollateralProof({ amount: amount, timestamp: uint48(block.timestamp) });
        _lastCollateralUpdate = block.timestamp;

        emit CollateralUpdated(oldAmount, amount, block.timestamp);
    }

    /// @notice Checks if an address is a custodian
    /// @param user Address to check
    /// @return True if address has the admin role
    function _isCustodian(address user) internal view override returns (bool) {
        return hasRole(USER_MANAGEMENT_ROLE, user);
    }

    /// @notice Blocks a user from token operations
    /// @param user Address to block
    /// @return True if user was not previously blocked
    function blockUser(address user) public onlyRole(USER_MANAGEMENT_ROLE) returns (bool) {
        return super._blockUser(user);
    }

    /// @notice Unblocks a user from token operations
    /// @param user Address to unblock
    /// @return True if user was previously blocked
    function unblockUser(address user) public onlyRole(USER_MANAGEMENT_ROLE) returns (bool) {
        return super._unblockUser(user);
    }

    /// @notice Unfreezes all tokens for a user
    /// @param user Address to unfreeze tokens for
    /// @param amount Amount of tokens to unfreeze
    function unfreeze(address user, uint256 amount) public onlyRole(USER_MANAGEMENT_ROLE) {
        _frozen[user] = _frozen[user] - amount;
        emit TokensUnfrozen(user, amount);
    }

    /// @notice Blocks multiple users from token operations
    /// @param users Array of addresses to block
    function batchBlockUser(address[] calldata users) public onlyRole(USER_MANAGEMENT_ROLE) {
        if (users.length == 0) revert InvalidBatchInput();

        for (uint256 i = 0; i < users.length; i++) {
            try this.blockUser(users[i]) {
                // Operation successful, continue to next
            } catch {
                revert BatchOperationFailed(i);
            }
        }

        emit BatchOperationCompleted("blockUser", users.length);
    }

    /// @notice Unblocks multiple users from token operations
    /// @param users Array of addresses to unblock
    function batchUnblockUser(address[] calldata users) public onlyRole(USER_MANAGEMENT_ROLE) {
        if (users.length == 0) revert InvalidBatchInput();

        for (uint256 i = 0; i < users.length; i++) {
            try this.unblockUser(users[i]) {
                // Operation successful, continue to next
            } catch {
                revert BatchOperationFailed(i);
            }
        }

        emit BatchOperationCompleted("unblockUser", users.length);
    }

    /// @notice Unfreezes tokens for multiple users
    /// @param users Array of addresses to unfreeze tokens for
    /// @param amounts Array of token amounts to unfreeze
    function batchUnfreeze(
        address[] calldata users,
        uint256[] calldata amounts
    )
        public
        onlyRole(USER_MANAGEMENT_ROLE)
    {
        if (users.length != amounts.length || users.length == 0) revert InvalidBatchInput();

        for (uint256 i = 0; i < users.length; i++) {
            try this.unfreeze(users[i], amounts[i]) {
                // Operation successful, continue to next
            } catch {
                revert BatchOperationFailed(i);
            }
        }

        emit BatchOperationCompleted("unfreeze", users.length);
    }

    /// @notice Updates token balances during transfers
    /// @dev Handles balance updates while enforcing pausable, blocklist, and custodian rules
    /// @param from The sender address
    /// @param to The recipient address
    /// @param value The amount being transferred
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

    /// @notice Approves spending of tokens
    /// @dev Overrides both ERC20 and ERC20Blocklist to enforce blocklist restrictions
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
