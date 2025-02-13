// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title CryptoCurrency - A customizable ERC20 token implementation
/// @notice This contract provides a standard ERC20 token with minting capabilities controlled by roles.
/// It supports meta-transactions and role-based access control for supply management.
/// @dev Inherits from OpenZeppelin's ERC20, AccessControl, ERC20Permit, and ERC2771Context contracts
/// to provide standard token functionality with additional features.
/// @custom:security-contact support@settlemint.com
contract CryptoCurrency is ERC20, AccessControl, ERC20Permit, ERC2771Context {
    using SafeERC20 for IERC20;

    /// @notice Role identifier for addresses that can manage token supply
    /// @dev Keccak256 hash of "SUPPLY_MANAGEMENT_ROLE"
    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");

    /// @notice The number of decimals used for token amounts
    /// @dev Set at deployment and cannot be changed
    uint8 private immutable _decimals;

    /// @notice Custom errors for the CryptoCurrency contract
    /// @dev These errors provide more gas-efficient and descriptive error handling
    error InvalidDecimals(uint8 decimals);
    error InvalidTokenAddress();
    error InsufficientTokenBalance();

    /// @notice Emitted when mistakenly sent tokens are withdrawn
    /// @param token The address of the token being withdrawn
    /// @param to The address receiving the tokens
    /// @param amount The amount of tokens withdrawn
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);

    /// @notice Deploys a new CryptoCurrency token contract
    /// @dev Sets up the token with specified parameters and optionally mints initial supply.
    /// The deployer receives both DEFAULT_ADMIN_ROLE and SUPPLY_MANAGEMENT_ROLE.
    /// @param name The token name (e.g. "My Token")
    /// @param symbol The token symbol (e.g. "MTK")
    /// @param decimals_ The number of decimals for the token (must be <= 18)
    /// @param initialSupply The amount of tokens to mint at deployment (in base units)
    /// @param initialOwner The address that will receive admin rights and initial supply
    /// @param forwarder The address of the trusted forwarder for meta-transactions
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply,
        address initialOwner,
        address forwarder
    )
        ERC20(name, symbol)
        ERC20Permit(name)
        ERC2771Context(forwarder)
    {
        if (decimals_ > 18) revert InvalidDecimals(decimals_);
        _decimals = decimals_;
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(SUPPLY_MANAGEMENT_ROLE, initialOwner);

        if (initialSupply > 0) {
            _mint(initialOwner, initialSupply);
        }
    }

    /// @notice Returns the message sender in the context of meta-transactions
    /// @dev Overrides both Context and ERC2771Context to support meta-transactions
    /// @return The address of the message sender
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return super._msgSender();
    }

    /// @notice Returns the message data in the context of meta-transactions
    /// @dev Overrides both Context and ERC2771Context to support meta-transactions
    /// @return The message data
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }

    /// @notice Returns the length of the context suffix for meta-transactions
    /// @dev Overrides both Context and ERC2771Context to support meta-transactions
    /// @return The length of the context suffix
    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return super._contextSuffixLength();
    }

    /// @notice Returns the number of decimals used for token amounts
    /// @dev Overrides the default ERC20 decimals function to use the configurable value
    /// @return The number of decimals
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /// @notice Creates new tokens and assigns them to an address
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE. Emits a Transfer event.
    /// @param to The address that will receive the minted tokens
    /// @param amount The quantity of tokens to create (in base units)
    function mint(address to, uint256 amount) public onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        _mint(to, amount);
    }

    /// @notice Withdraws mistakenly sent tokens from the contract
    /// @dev Only callable by addresses with DEFAULT_ADMIN_ROLE. Cannot withdraw this token.
    /// @param token The token to withdraw
    /// @param to The recipient address
    /// @param amount The amount to withdraw
    function withdrawToken(address token, address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (token == address(0)) revert InvalidTokenAddress();
        if (to == address(0)) revert InvalidTokenAddress();
        if (amount == 0) return;

        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance < amount) revert InsufficientTokenBalance();

        IERC20(token).safeTransfer(to, amount);
        emit TokenWithdrawn(token, to, amount);
    }
}
