// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

// Constants
import { ATKAssetRoles } from "../ATKAssetRoles.sol";

// Interface imports
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IATKDeposit } from "./IATKDeposit.sol";
import { IContractWithIdentity } from "../../system/identity-factory/IContractWithIdentity.sol";
import { ISMART } from "../../smart/interface/ISMART.sol";
import { _SMARTLogic } from "../../smart/extensions/core/internal/_SMARTLogic.sol";

// Core extensions
import { SMARTUpgradeable } from "../../smart/extensions/core/SMARTUpgradeable.sol"; // Base SMART logic + ERC20
import { SMARTHooks } from "../../smart/extensions/common/SMARTHooks.sol";

// Feature extensions
import { SMARTPausableUpgradeable } from "../../smart/extensions/pausable/SMARTPausableUpgradeable.sol";
import { SMARTBurnableUpgradeable } from "../../smart/extensions/burnable/SMARTBurnableUpgradeable.sol";
import { SMARTCustodianUpgradeable } from "../../smart/extensions/custodian/SMARTCustodianUpgradeable.sol";
import {
    SMARTTokenAccessManagedUpgradeable
} from "../../smart/extensions/access-managed/SMARTTokenAccessManagedUpgradeable.sol";

/// @title ATKDeposit Implementation
/// @author SettleMint
/// @notice An implementation of a deposit token using the SMART extension framework using custom roles.
/// @dev Combines core SMART features (compliance, verification) with extensions for pausing,
///      burning, and custodian actions. Access control uses custom roles.
contract ATKDepositImplementation is
    Initializable,
    IATKDeposit,
    IContractWithIdentity,
    SMARTUpgradeable,
    SMARTTokenAccessManagedUpgradeable,
    SMARTCustodianUpgradeable,
    SMARTPausableUpgradeable,
    SMARTBurnableUpgradeable,
    ERC2771ContextUpgradeable
{
    // ERC20PermitUpgradeable
    /// @custom:oz-upgrades-unsafe-allow constructor
    /// @notice Constructor that disables initializers to prevent implementation contract initialization
    /// @param forwarder_ The address of the trusted forwarder contract for meta-transactions
    constructor(address forwarder_) ERC2771ContextUpgradeable(forwarder_) {
        _disableInitializers();
    }

    /// @notice Initializes the SMART token contract and its extensions.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param decimals_ The number of decimals the token uses.
    /// @param initialModulePairs_ Initial compliance module configurations.
    /// @param identityRegistry_ The address of the Identity Registry contract.
    /// @param compliance_ The address of the main compliance contract.
    /// @param accessManager_ The address of the access manager contract.
    function initialize(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        address identityRegistry_,
        address compliance_,
        address accessManager_
    )
        public
        initializer
    {
        __SMART_init(name_, symbol_, decimals_, address(0), identityRegistry_, compliance_, initialModulePairs_);
        __SMARTCustodian_init();
        __SMARTBurnable_init();
        __SMARTPausable_init(true);
        __SMARTTokenAccessManaged_init(accessManager_);

        _registerInterface(type(IATKDeposit).interfaceId);
        _registerInterface(type(IContractWithIdentity).interfaceId);
    }

    // --- IContractWithIdentity Implementation ---
    // Note: onchainID() is inherited from IATKToken via SMARTUpgradeable, but we need to explicitly override due to
    // multiple inheritance

    /// @inheritdoc IContractWithIdentity
    function onchainID() public view override(_SMARTLogic, ISMART, IContractWithIdentity) returns (address) {
        return super.onchainID();
    }

    /// @inheritdoc IContractWithIdentity
    function canAddClaim(address actor) external view override returns (bool) {
        // Delegate to AccessManager - only GOVERNANCE_ROLE can manage claims
        return _hasRole(ATKAssetRoles.GOVERNANCE_ROLE, actor);
    }

    /// @inheritdoc IContractWithIdentity
    function canRemoveClaim(address actor) external view override returns (bool) {
        // Delegate to AccessManager - only GOVERNANCE_ROLE can manage claims
        return _hasRole(ATKAssetRoles.GOVERNANCE_ROLE, actor);
    }

    // --- ISMART Implementation ---

    /// @notice Sets the OnchainID contract address for this token
    /// @param _onchainID The address of the OnchainID contract
    function setOnchainID(address _onchainID) external override onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE) {
        _smart_setOnchainID(_onchainID);
    }

    /// @notice Sets the identity registry address for the token
    /// @param _identityRegistry The address of the identity registry contract
    function setIdentityRegistry(address _identityRegistry)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE)
    {
        _smart_setIdentityRegistry(_identityRegistry);
    }

    /// @notice Sets the compliance contract address for the token
    /// @param _compliance The address of the compliance contract
    function setCompliance(address _compliance) external override onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE) {
        _smart_setCompliance(_compliance);
    }

    /// @notice Sets parameters for a specific compliance module
    /// @param _module The address of the compliance module
    /// @param _params The encoded parameters for the module
    function setParametersForComplianceModule(
        address _module,
        bytes calldata _params
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE)
    {
        _smart_setParametersForComplianceModule(_module, _params);
    }

    /// @notice Mints new tokens to a specified address
    /// @param _to The address to mint tokens to
    /// @param _amount The amount of tokens to mint
    function mint(
        address _to,
        uint256 _amount
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE)
    {
        _smart_mint(_to, _amount);
    }

    /// @notice Mints tokens to multiple addresses in a single transaction
    /// @param _toList Array of addresses to mint tokens to
    /// @param _amounts Array of amounts to mint to each address
    function batchMint(
        address[] calldata _toList,
        uint256[] calldata _amounts
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE)
    {
        _smart_batchMint(_toList, _amounts);
    }

    /// @notice Transfers tokens to a specified address
    /// @param _to The address to transfer tokens to
    /// @param _amount The amount of tokens to transfer
    /// @return bool True if the transfer was successful
    function transfer(
        address _to,
        uint256 _amount
    )
        public
        override(SMARTUpgradeable, ERC20Upgradeable, IERC20)
        returns (bool)
    {
        return _smart_transfer(_to, _amount);
    }

    /// @notice Recovers accidentally sent ERC20 tokens from the contract
    /// @param token The address of the ERC20 token to recover
    /// @param to The address to send the recovered tokens to
    /// @param amount The amount of tokens to recover
    function recoverERC20(
        address token,
        address to,
        uint256 amount
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.EMERGENCY_ROLE)
    {
        _smart_recoverERC20(token, to, amount);
    }

    /// @notice Adds a new compliance module to the token
    /// @param _module The address of the compliance module to add
    /// @param _params The initialization parameters for the module
    function addComplianceModule(
        address _module,
        bytes calldata _params
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE)
    {
        _smart_addComplianceModule(_module, _params);
    }

    /// @notice Removes a compliance module from the token
    /// @param _module The address of the compliance module to remove
    function removeComplianceModule(address _module)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE)
    {
        _smart_removeComplianceModule(_module);
    }

    // --- ISMARTBurnable Implementation ---

    /// @notice Burns tokens from a specified address
    /// @param userAddress The address to burn tokens from
    /// @param amount The amount of tokens to burn
    function burn(
        address userAddress,
        uint256 amount
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE)
    {
        _smart_burn(userAddress, amount);
    }

    /// @notice Burns tokens from multiple addresses in a single transaction
    /// @param userAddresses Array of addresses to burn tokens from
    /// @param amounts Array of amounts to burn from each address
    function batchBurn(
        address[] calldata userAddresses,
        uint256[] calldata amounts
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE)
    {
        _smart_batchBurn(userAddresses, amounts);
    }

    // --- ISMARTCustodian Implementation ---

    /// @notice Freezes or unfreezes all tokens for a specified address
    /// @param userAddress The address to freeze or unfreeze
    /// @param freeze True to freeze, false to unfreeze
    function setAddressFrozen(
        address userAddress,
        bool freeze
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
    {
        _smart_setAddressFrozen(userAddress, freeze);
    }

    /// @notice Freezes a specific amount of tokens for a user
    /// @param userAddress The address whose tokens to freeze
    /// @param amount The amount of tokens to freeze
    function freezePartialTokens(
        address userAddress,
        uint256 amount
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
    {
        _smart_freezePartialTokens(userAddress, amount);
    }

    /// @notice Unfreezes a specific amount of tokens for a user
    /// @param userAddress The address whose tokens to unfreeze
    /// @param amount The amount of tokens to unfreeze
    function unfreezePartialTokens(
        address userAddress,
        uint256 amount
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
    {
        _smart_unfreezePartialTokens(userAddress, amount);
    }

    /// @notice Freezes or unfreezes tokens for multiple addresses
    /// @param userAddresses Array of addresses to freeze or unfreeze
    /// @param freeze Array of boolean values (true to freeze, false to unfreeze)
    function batchSetAddressFrozen(
        address[] calldata userAddresses,
        bool[] calldata freeze
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
    {
        _smart_batchSetAddressFrozen(userAddresses, freeze);
    }

    /// @notice Freezes tokens for multiple addresses with specific amounts
    /// @param userAddresses Array of addresses whose tokens to freeze
    /// @param amounts Array of amounts to freeze for each address
    function batchFreezePartialTokens(
        address[] calldata userAddresses,
        uint256[] calldata amounts
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
    {
        _smart_batchFreezePartialTokens(userAddresses, amounts);
    }

    /// @notice Unfreezes tokens for multiple addresses with specific amounts
    /// @param userAddresses Array of addresses whose tokens to unfreeze
    /// @param amounts Array of amounts to unfreeze for each address
    function batchUnfreezePartialTokens(
        address[] calldata userAddresses,
        uint256[] calldata amounts
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
    {
        _smart_batchUnfreezePartialTokens(userAddresses, amounts);
    }

    /// @notice Forces a transfer of tokens from one address to another
    /// @param from The address to transfer tokens from
    /// @param to The address to transfer tokens to
    /// @param amount The amount of tokens to transfer
    /// @return bool True if the transfer was successful
    function forcedTransfer(
        address from,
        address to,
        uint256 amount
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
        returns (bool)
    {
        return _smart_forcedTransfer(from, to, amount);
    }

    /// @notice Forces transfers of tokens between multiple address pairs
    /// @param fromList Array of addresses to transfer tokens from
    /// @param toList Array of addresses to transfer tokens to
    /// @param amounts Array of amounts to transfer for each pair
    function batchForcedTransfer(
        address[] calldata fromList,
        address[] calldata toList,
        uint256[] calldata amounts
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
    {
        _smart_batchForcedTransfer(fromList, toList, amounts);
    }

    /// @notice Recovers all tokens from a lost wallet to a new wallet
    /// @param lostWallet The address of the lost wallet
    /// @param newWallet The address to transfer all tokens to
    function forcedRecoverTokens(
        address lostWallet,
        address newWallet
    )
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
    {
        _smart_recoverTokens(lostWallet, newWallet);
    }

    // --- ISMARTPausable Implementation ---

    /// @notice Pauses all token transfers
    function pause() external override onlyAccessManagerRole(ATKAssetRoles.EMERGENCY_ROLE) {
        _smart_pause();
    }

    /// @notice Unpauses token transfers
    function unpause() external override onlyAccessManagerRole(ATKAssetRoles.EMERGENCY_ROLE) {
        _smart_unpause();
    }

    // --- View Functions (Overrides) ---
    /// @inheritdoc ERC20Upgradeable
    function name() public view virtual override(ERC20Upgradeable, IERC20Metadata) returns (string memory) {
        // Delegation to SMARTUpgradeable -> _SMARTLogic ensures correct value is returned
        return super.name();
    }

    /// @inheritdoc ERC20Upgradeable
    function symbol() public view virtual override(ERC20Upgradeable, IERC20Metadata) returns (string memory) {
        // Delegation to SMARTUpgradeable -> _SMARTLogic ensures correct value is returned
        return super.symbol();
    }

    /// @inheritdoc SMARTUpgradeable
    /// @dev Need to explicitly override because ERC20Upgradeable also defines decimals().
    /// Ensures we read the value set by __SMART_init_unchained via _SMARTLogic.
    function decimals()
        public
        view
        virtual
        override(SMARTUpgradeable, ERC20Upgradeable, IERC20Metadata)
        returns (uint8)
    {
        // Delegation to SMARTUpgradeable -> _SMARTLogic ensures correct value is returned
        return super.decimals();
    }

    /// @inheritdoc SMARTUpgradeable
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(SMARTUpgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == type(IATKDeposit).interfaceId || super.supportsInterface(interfaceId);
    }

    // --- Hooks (Overrides for Chaining) ---
    // These ensure that logic from multiple inherited extensions (SMART, SMARTCustodian, etc.) is called correctly.

    /// @notice Hook that is called before tokens are minted
    /// @dev This hook chains validation logic from multiple extensions:
    ///      2. SMARTCustodianUpgradeable: Checks if recipient is frozen
    ///      3. SMARTUpgradeable: Performs compliance and identity checks
    /// @param to The address that will receive the minted tokens
    /// @param amount The amount of tokens to be minted
    /// @inheritdoc SMARTHooks
    function _beforeMint(
        address to,
        uint256 amount
    )
        internal
        virtual
        override(SMARTCustodianUpgradeable, SMARTUpgradeable, SMARTHooks)
    {
        super._beforeMint(to, amount);
    }

    /// @notice Hook that is called before tokens are transferred
    /// @dev This hook chains validation logic from multiple extensions:
    ///      1. SMARTCustodianUpgradeable: Checks frozen status and partial freezes
    ///      2. SMARTUpgradeable: Performs compliance and identity verification
    /// @param from The address tokens are transferred from
    /// @param to The address tokens are transferred to
    /// @param amount The amount of tokens being transferred
    /// @inheritdoc SMARTHooks
    function _beforeTransfer(
        address from,
        address to,
        uint256 amount
    )
        internal
        virtual
        override(SMARTCustodianUpgradeable, SMARTUpgradeable, SMARTHooks)
    {
        super._beforeTransfer(from, to, amount);
    }

    /// @notice Hook that is called before tokens are burned
    /// @dev This hook chains validation logic from multiple extensions:
    ///      SMARTCustodianUpgradeable: Validates frozen status and partial freezes
    /// @param from The address tokens are burned from
    /// @param amount The amount of tokens to be burned
    /// @inheritdoc SMARTHooks
    function _beforeBurn(
        address from,
        uint256 amount
    )
        internal
        virtual
        override(SMARTCustodianUpgradeable, SMARTHooks)
    {
        super._beforeBurn(from, amount);
    }

    /// @notice Hook that is called before tokens are redeemed
    /// @dev This hook chains validation logic from multiple extensions:
    ///      SMARTCustodianUpgradeable: Validates frozen status and partial freezes
    /// @param owner The address that owns the tokens being redeemed
    /// @param amount The amount of tokens to be redeemed
    /// @inheritdoc SMARTHooks
    function _beforeRedeem(
        address owner,
        uint256 amount
    )
        internal
        virtual
        override(SMARTCustodianUpgradeable, SMARTHooks)
    {
        super._beforeRedeem(owner, amount);
    }

    /// @notice Hook that is called after tokens are minted
    /// @dev This hook executes post-mint logic from SMARTUpgradeable which may emit events
    ///      or update internal accounting after successful minting
    /// @param to The address that received the minted tokens
    /// @param amount The amount of tokens that were minted
    /// @inheritdoc SMARTHooks
    function _afterMint(address to, uint256 amount) internal virtual override(SMARTUpgradeable, SMARTHooks) {
        super._afterMint(to, amount);
    }

    /// @notice Hook that is called after tokens are transferred
    /// @dev This hook executes post-transfer logic from SMARTUpgradeable which may emit events
    ///      or update internal accounting after successful transfer
    /// @param from The address tokens were transferred from
    /// @param to The address tokens were transferred to
    /// @param amount The amount of tokens that were transferred
    /// @inheritdoc SMARTHooks
    function _afterTransfer(
        address from,
        address to,
        uint256 amount
    )
        internal
        virtual
        override(SMARTUpgradeable, SMARTHooks)
    {
        super._afterTransfer(from, to, amount);
    }

    /// @notice Hook that is called after tokens are burned
    /// @dev This hook executes post-burn logic from SMARTUpgradeable which may emit events
    ///      or update internal accounting after successful burning
    /// @param from The address tokens were burned from
    /// @param amount The amount of tokens that were burned
    /// @inheritdoc SMARTHooks
    function _afterBurn(address from, uint256 amount) internal virtual override(SMARTUpgradeable, SMARTHooks) {
        super._afterBurn(from, amount);
    }

    /// @notice Hook that is called after tokens are recovered from a lost wallet
    /// @dev This hook executes post-recovery logic from SMARTCustodianUpgradeable which may
    ///      emit events or update internal state after successful token recovery
    /// @param lostWallet The address of the wallet that lost access
    /// @param newWallet The address that received the recovered tokens
    /// @inheritdoc SMARTHooks
    function _afterRecoverTokens(
        address lostWallet,
        address newWallet
    )
        internal
        virtual
        override(SMARTCustodianUpgradeable, SMARTHooks)
    {
        super._afterRecoverTokens(lostWallet, newWallet);
    }

    // --- Internal Functions (Overrides) ---

    /// @notice Internal function to update token balances with pausable checks
    /// @dev Overrides _update to ensure Pausable checks are applied
    /// @param from The address tokens are transferred from
    /// @param to The address tokens are transferred to
    /// @param value The amount of tokens being transferred
    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        virtual
        override(SMARTUpgradeable, SMARTPausableUpgradeable, ERC20Upgradeable)
    {
        // Calls chain:  SMARTPausable -> SMART -> ERC20
        super._update(from, to, value);
    }

    /// @notice Returns the message sender, accounting for meta-transactions
    /// @dev Resolves msgSender across Context and ERC2771Context
    /// @return The address of the message sender
    function _msgSender()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address)
    {
        return ERC2771ContextUpgradeable._msgSender();
    }

    /// @notice Returns the message data, accounting for meta-transactions
    /// @dev Resolves msgData across Context and ERC2771Context
    /// @return The message data
    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return ERC2771ContextUpgradeable._msgData();
    }

    /// @notice Returns the length of the context suffix for meta-transactions
    /// @dev Hook defining the length of the trusted forwarder address suffix in `msg.data`
    /// @return The length of the context suffix
    function _contextSuffixLength()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return ERC2771ContextUpgradeable._contextSuffixLength();
    }
}
