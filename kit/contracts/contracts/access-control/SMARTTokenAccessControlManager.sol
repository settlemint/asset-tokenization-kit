// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity 0.8.28;

// OpenZeppelin imports
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { AccessControlEnumerable } from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";

// Interface import
import { ISMARTTokenAccessControlManager } from "./interfaces/ISMARTTokenAccessControlManager.sol";

/// @title Centralized Access Control Manager for SMART Tokens
/// @notice Manages roles and provides authorization checks for various SMART token operations.
///         Intended to be used by SMART token contracts that inherit `SMARTTokenAccessControlManaged`.
contract SMARTTokenAccessControlManager is ISMARTTokenAccessControlManager, AccessControlEnumerable, ERC2771Context {
    // --- Roles ---
    // Defined centrally here for all potential SMART extensions

    /// @notice Role for managing token settings (e.g., updating registries, compliance modules).
    bytes32 public constant TOKEN_ADMIN_ROLE = keccak256("TOKEN_ADMIN_ROLE");
    /// @notice Role for managing compliance settings (e.g., adding/removing required topics).
    bytes32 public constant COMPLIANCE_ADMIN_ROLE = keccak256("COMPLIANCE_ADMIN_ROLE");
    /// @notice Role for managing verification settings (e.g., updating verifiers).
    bytes32 public constant VERIFICATION_ADMIN_ROLE = keccak256("VERIFICATION_ADMIN_ROLE");
    /// @notice Role required to mint new tokens.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    /// @notice Role required to execute burn operations.
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    /// @notice Role required to freeze/unfreeze addresses and partial token amounts.
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");
    /// @notice Role required to execute forced transfers.
    bytes32 public constant FORCED_TRANSFER_ROLE = keccak256("FORCED_TRANSFER_ROLE");
    /// @notice Role required to perform address recovery.
    bytes32 public constant RECOVERY_ROLE = keccak256("RECOVERY_ROLE");
    /// @notice Role required to pause or unpause the contract.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    // Note: DEFAULT_ADMIN_ROLE is inherited from AccessControl

    /// @dev Constructor grants initial roles to the deployer.
    /// @param forwarder Address of the trusted forwarder for ERC2771 meta-transactions.
    constructor(address forwarder) AccessControlEnumerable() ERC2771Context(forwarder) {
        address deployer = _msgSender(); // Use _msgSender() to support deployment via forwarder

        // Grant standard admin role (can manage other roles)
        _grantRole(DEFAULT_ADMIN_ROLE, deployer);

        // Grant all operational roles to the deployer initially
        _grantRole(TOKEN_ADMIN_ROLE, deployer);
        _grantRole(COMPLIANCE_ADMIN_ROLE, deployer);
        _grantRole(VERIFICATION_ADMIN_ROLE, deployer);
        _grantRole(MINTER_ROLE, deployer);
        _grantRole(BURNER_ROLE, deployer);
        _grantRole(FREEZER_ROLE, deployer);
        _grantRole(FORCED_TRANSFER_ROLE, deployer);
        _grantRole(RECOVERY_ROLE, deployer);
        _grantRole(PAUSER_ROLE, deployer);
    }

    // --- Public Authorization Check Functions ---
    // Implementations of the ISMARTTokenAccessControlManager interface

    /// @inheritdoc ISMARTTokenAccessControlManager
    function authorizeUpdateTokenSettings(address caller) public view virtual override {
        _checkRole(TOKEN_ADMIN_ROLE, caller);
    }

    /// @inheritdoc ISMARTTokenAccessControlManager
    function authorizeUpdateComplianceSettings(address caller) public view virtual override {
        _checkRole(COMPLIANCE_ADMIN_ROLE, caller);
    }

    /// @inheritdoc ISMARTTokenAccessControlManager
    function authorizeUpdateVerificationSettings(address caller) public view virtual override {
        _checkRole(VERIFICATION_ADMIN_ROLE, caller);
    }

    /// @inheritdoc ISMARTTokenAccessControlManager
    function authorizeMintToken(address caller) public view virtual override {
        _checkRole(MINTER_ROLE, caller);
    }

    /// @inheritdoc ISMARTTokenAccessControlManager
    function authorizeRecoverERC20(address caller) public view virtual override {
        // Typically, token admin handles recovery
        _checkRole(TOKEN_ADMIN_ROLE, caller);
    }

    /// @inheritdoc ISMARTTokenAccessControlManager
    function authorizeBurn(address caller) public view virtual override {
        _checkRole(BURNER_ROLE, caller);
    }

    /// @inheritdoc ISMARTTokenAccessControlManager
    function authorizeFreezeAddress(address caller) public view virtual override {
        _checkRole(FREEZER_ROLE, caller);
    }

    /// @inheritdoc ISMARTTokenAccessControlManager
    function authorizeFreezePartialTokens(address caller) public view virtual override {
        _checkRole(FREEZER_ROLE, caller);
    }

    /// @inheritdoc ISMARTTokenAccessControlManager
    function authorizeForcedTransfer(address caller) public view virtual override {
        _checkRole(FORCED_TRANSFER_ROLE, caller);
    }

    /// @inheritdoc ISMARTTokenAccessControlManager
    function authorizeRecoveryAddress(address caller) public view virtual override {
        _checkRole(RECOVERY_ROLE, caller);
    }

    /// @inheritdoc ISMARTTokenAccessControlManager
    function authorizePause(address caller) public view virtual override {
        _checkRole(PAUSER_ROLE, caller);
    }

    // --- Overrides ---

    /// @inheritdoc AccessControl
    function hasRole(
        bytes32 role,
        address account
    )
        public
        view
        virtual
        override(AccessControl, IAccessControl)
        returns (bool)
    {
        return super.hasRole(role, account);
    }

    /// @inheritdoc ERC2771Context
    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address) {
        return super._msgSender(); // Use ERC2771Context's implementation
    }

    /// @inheritdoc ERC2771Context
    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData(); // Use ERC2771Context's implementation
    }

    /// @inheritdoc ERC2771Context
    function _contextSuffixLength() internal view virtual override(Context, ERC2771Context) returns (uint256) {
        return super._contextSuffixLength(); // Use ERC2771Context's implementation
    }

    /// @inheritdoc AccessControlEnumerable
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerable)
        returns (bool)
    {
        return interfaceId == type(ISMARTTokenAccessControlManager).interfaceId || super.supportsInterface(interfaceId);
    }
}
