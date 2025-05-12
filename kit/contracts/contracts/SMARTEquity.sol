// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20, IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import { AccessControlEnumerable } from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { ERC20Capped } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { Nonces } from "@openzeppelin/contracts/utils/Nonces.sol";

import { SMARTConstants } from "./SMARTConstants.sol";

import { ISMART } from "smart-protocol/contracts/interface/ISMART.sol";
import { SMARTComplianceModuleParamPair } from
    "smart-protocol/contracts/interface/structs/SMARTComplianceModuleParamPair.sol";

import { SMART } from "smart-protocol/contracts/extensions/core/SMART.sol";
import { SMARTExtension } from "smart-protocol/contracts/extensions/common/SMARTExtension.sol";
import { SMARTHooks } from "smart-protocol/contracts/extensions/common/SMARTHooks.sol";

import { SMARTPausable } from "smart-protocol/contracts/extensions/pausable/SMARTPausable.sol";
import { SMARTCustodian } from "smart-protocol/contracts/extensions/custodian/SMARTCustodian.sol";
import { SMARTBurnable } from "smart-protocol/contracts/extensions/burnable/SMARTBurnable.sol";
import { ERC20Votes } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract SMARTEquity is
    SMART,
    AccessControlEnumerable,
    SMARTCustodian,
    SMARTPausable,
    SMARTBurnable,
    ERC20Permit,
    ERC20Votes,
    ERC2771Context
{
    error InvalidISIN();
    error InvalidTokenAddress();
    error InsufficientTokenBalance();

    string private _equityClass;
    string private _equityCategory;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256[] memory requiredClaimTopics_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        address identityRegistry_,
        address compliance_,
        address forwarder
    )
        SMART(
            name_,
            symbol_,
            decimals_,
            address(0),
            identityRegistry_,
            compliance_,
            requiredClaimTopics_,
            initialModulePairs_
        )
        ERC2771Context(forwarder)
        ERC20Permit(name_)
        SMARTCustodian()
        SMARTPausable()
        SMARTBurnable()
    {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());

        _grantRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, _msgSender());
        _grantRole(SMARTConstants.USER_MANAGEMENT_ROLE, _msgSender());
    }

    function _beforeMint(address to, uint256 amount) internal virtual override(SMART, SMARTCustodian, SMARTHooks) {
        super._beforeMint(to, amount);
    }

    function _beforeTransfer(
        address from,
        address to,
        uint256 amount
    )
        internal
        virtual
        override(SMART, SMARTCustodian, SMARTHooks)
    {
        super._beforeTransfer(from, to, amount);
    }

    function _beforeBurn(address account, uint256 amount) internal virtual override(SMARTCustodian, SMARTHooks) {
        super._beforeBurn(account, amount);
    }

    function _beforeRedeem(address from, uint256 amount) internal virtual override(SMARTCustodian, SMARTHooks) {
        super._beforeRedeem(from, amount);
    }

    function _afterMint(address to, uint256 amount) internal virtual override(SMART, SMARTHooks) {
        super._afterMint(to, amount);
    }

    function _afterTransfer(address from, address to, uint256 amount) internal virtual override(SMART, SMARTHooks) {
        super._afterTransfer(from, to, amount);
    }

    function _afterBurn(address account, uint256 amount) internal virtual override(SMART, SMARTHooks) {
        super._afterBurn(account, amount);
    }

    function equityClass() public view returns (string memory) {
        return _equityClass;
    }

    function equityCategory() public view returns (string memory) {
        return _equityCategory;
    }

    function name() public view virtual override(SMART, ERC20, IERC20Metadata) returns (string memory) {
        return super.name();
    }

    function symbol() public view virtual override(SMART, ERC20, IERC20Metadata) returns (string memory) {
        return super.symbol();
    }

    function decimals() public view virtual override(SMART, ERC20, IERC20Metadata) returns (uint8) {
        return super.decimals();
    }

    function transfer(address to, uint256 value) public virtual override(SMART, ERC20, IERC20) returns (bool) {
        return super.transfer(to, value);
    }

    function nonces(address owner) public view virtual override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        virtual
        override(SMARTPausable, SMART, ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength() internal view virtual override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }

    function _authorizeUpdateTokenSettings() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, DEFAULT_ADMIN_ROLE);
        }
    }

    function _authorizeUpdateComplianceSettings() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, DEFAULT_ADMIN_ROLE);
        }
    }

    function _authorizeUpdateVerificationSettings() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, DEFAULT_ADMIN_ROLE);
        }
    }

    function _authorizePause() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, DEFAULT_ADMIN_ROLE);
        }
    }

    function _authorizeBurn() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, DEFAULT_ADMIN_ROLE);
        }
    }

    function _authorizeFreezeAddress() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(SMARTConstants.USER_MANAGEMENT_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, SMARTConstants.USER_MANAGEMENT_ROLE);
        }
    }

    function _authorizeFreezePartialTokens() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(SMARTConstants.USER_MANAGEMENT_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, SMARTConstants.USER_MANAGEMENT_ROLE);
        }
    }

    function _authorizeMintToken() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, SMARTConstants.SUPPLY_MANAGEMENT_ROLE);
        }
    }

    function _authorizeForcedTransfer() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, SMARTConstants.SUPPLY_MANAGEMENT_ROLE);
        }
    }

    function _authorizeRecoveryAddress() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(SMARTConstants.USER_MANAGEMENT_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, SMARTConstants.USER_MANAGEMENT_ROLE);
        }
    }

    function _authorizeRecoverERC20() internal view virtual override {
        address sender = _msgSender();
        if (!hasRole(DEFAULT_ADMIN_ROLE, sender)) {
            revert IAccessControl.AccessControlUnauthorizedAccount(sender, DEFAULT_ADMIN_ROLE);
        }
    }

    /// @dev Overrides ERC165 to ensure that the SMART implementation is used.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(SMART, AccessControlEnumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
