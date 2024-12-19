// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title CryptoCurrency - A customizable ERC20 token implementation
/// @notice This contract provides a standard ERC20 token with minting capabilities controlled by roles
/// @dev Inherits from OpenZeppelin's ERC20, AccessControl and ERC20Permit contracts
/// @custom:security-contact support@settlemint.com
contract CryptoCurrency is ERC20, AccessControl, ERC20Permit {
    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");

    /// @notice Deploys a new CryptoCurrency token contract
    /// @dev Sets up the token with specified parameters and optionally mints initial supply
    /// @param name The token name (e.g. "My Token")
    /// @param symbol The token symbol (e.g. "MTK")
    /// @param initialSupply The amount of tokens to mint at deployment (in base units)
    /// @param initialOwner The address that will receive admin rights and initial supply
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialOwner
    )
        ERC20(name, symbol)
        ERC20Permit(name)
    {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(SUPPLY_MANAGEMENT_ROLE, initialOwner);

        if (initialSupply > 0) {
            _mint(initialOwner, initialSupply);
        }
    }

    /// @notice Creates new tokens and assigns them to an address
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE role. Amount is in base units
    /// @param to The address that will receive the minted tokens
    /// @param amount The quantity of tokens to create (in base units)
    function mint(address to, uint256 amount) public onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        _mint(to, amount);
    }
}
