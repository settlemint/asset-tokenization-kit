// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { IERC3643Compliance } from "../ERC-3643/IERC3643Compliance.sol";
import { IERC3643IdentityRegistry } from "../ERC-3643/IERC3643IdentityRegistry.sol";
import { TokenRoles } from "./TokenStructs.sol";

// solhint-disable-next-line max-states-count
contract TokenStorage {
    /// @dev ERC20 basic variables
    mapping(address => uint256) internal _balances;
    mapping(address => mapping(address => uint256)) internal _allowances;
    uint256 internal _totalSupply;

    /// @dev Token information
    string internal _tokenName;
    string internal _tokenSymbol;
    uint8 internal _tokenDecimals;
    address internal _tokenOnchainID;
    string internal constant _TOKEN_VERSION = "4.1.3";

    /// @dev Variables of freeze and pause functions
    mapping(address => bool) internal _frozen;
    mapping(address => uint256) internal _frozenTokens;

    bool internal _tokenPaused = false;

    /// @dev Identity Registry contract used by the onchain validator system
    IERC3643IdentityRegistry internal _tokenIdentityRegistry;

    /// @dev Compliance contract linked to the onchain validator system
    IERC3643Compliance internal _tokenCompliance;

    mapping(address => TokenRoles) internal _agentsRestrictions;

    mapping(address spender => bool allowance) internal _defaultAllowances;

    mapping(address user => bool optOut) internal _defaultAllowanceOptOuts;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     */
    uint256[46] private __gap;
}
