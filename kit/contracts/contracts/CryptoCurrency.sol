// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title CryptoCurrency - A customizable ERC20 token implementation
/// @notice This contract provides a standard ERC20 token with minting capabilities controlled by roles
/// @dev Inherits from OpenZeppelin's ERC20, AccessControl and ERC20Permit contracts
/// @custom:security-contact support@settlemint.com
contract CryptoCurrency is ERC20, AccessControl, ERC20Permit {
    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");
    uint8 private immutable _decimals;

    error InvalidDecimals(uint8 decimals);
    error InvalidBatchOperation();
    error InvalidAddress();
    error InvalidMintAmount();

    event BatchMint(address[] accounts, uint256[] amounts);

    /// @notice Deploys a new CryptoCurrency token contract
    /// @dev Sets up the token with specified parameters and optionally mints initial supply
    /// @param name The token name (e.g. "My Token")
    /// @param symbol The token symbol (e.g. "MTK")
    /// @param decimals_ The number of decimals for the token
    /// @param initialSupply The amount of tokens to mint at deployment (in base units)
    /// @param initialOwner The address that will receive admin rights and initial supply
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply,
        address initialOwner
    )
        ERC20(name, symbol)
        ERC20Permit(name)
    {
        if (decimals_ > 18) revert InvalidDecimals(decimals_);
        _decimals = decimals_;
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(SUPPLY_MANAGEMENT_ROLE, initialOwner);

        if (initialSupply > 0) {
            _mint(initialOwner, initialSupply);
        }
    }

    /// @notice Returns the number of decimals used to get its user representation
    /// @dev Override the default ERC20 decimals function to use the configurable value
    /// @return The number of decimals
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /// @notice Creates new tokens and assigns them to an address
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE role. Amount is in base units
    /// @param to The address that will receive the minted tokens
    /// @param amount The quantity of tokens to create (in base units)
    function mint(address to, uint256 amount) public onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        _mint(to, amount);
    }

    /// @notice Mints tokens to multiple accounts in a single transaction
    /// @dev Only callable by accounts with SUPPLY_MANAGEMENT_ROLE
    /// @param accounts Array of addresses to mint tokens to
    /// @param amounts Array of token amounts to mint
    function batchMint(
        address[] calldata accounts,
        uint256[] calldata amounts
    )
        external
        onlyRole(SUPPLY_MANAGEMENT_ROLE)
    {
        if (accounts.length == 0 || accounts.length != amounts.length) revert InvalidBatchOperation();

        for (uint256 i = 0; i < accounts.length; i++) {
            if (accounts[i] == address(0)) revert InvalidAddress();
            if (amounts[i] == 0) revert InvalidMintAmount();
            _mint(accounts[i], amounts[i]);
        }

        emit BatchMint(accounts, amounts);
    }
}
