// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC20VotesUpgradeable } from
    "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

// Constants
import { ATKAssetRoles } from "../ATKAssetRoles.sol";

// Interface imports
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IATKEquity } from "./IATKEquity.sol";
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
import { SMARTTokenAccessManagedUpgradeable } from
    "../../smart/extensions/access-managed/SMARTTokenAccessManagedUpgradeable.sol";

/// @title ATKEquityImplementation - A security token representing equity shares
/// @author SettleMint
/// @notice This contract implements a security token that represents equity shares with voting rights,
/// compliance modules, custodian features, and role-based access control. It supports governance
/// capabilities through the ERC20Votes extension and implements ERC-3643 compliant security tokens.
/// @dev Inherits from multiple OpenZeppelin contracts to provide comprehensive security token functionality
/// with governance capabilities, meta-transactions support, and upgradeable architecture using UUPS pattern.
/// @custom:security-contact support@settlemint.com
contract ATKEquityImplementation is
    Initializable,
    IATKEquity,
    IContractWithIdentity,
    SMARTUpgradeable,
    SMARTTokenAccessManagedUpgradeable,
    SMARTCustodianUpgradeable,
    SMARTPausableUpgradeable,
    SMARTBurnableUpgradeable,
    ERC20VotesUpgradeable,
    // TODO?
    ERC2771ContextUpgradeable
{
    /// @notice Constructor that disables initialization for the implementation contract
    /// @dev This constructor prevents the implementation contract from being initialized.
    /// Only the proxy instances can be initialized.
    /// @custom:oz-upgrades-unsafe-allow constructor
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
        override
        initializer
    {
        __SMART_init(name_, symbol_, decimals_, address(0), identityRegistry_, compliance_, initialModulePairs_);
        __SMARTCustodian_init();
        __SMARTBurnable_init();
        __SMARTPausable_init(true);
        __SMARTTokenAccessManaged_init(accessManager_);

        _registerInterface(type(IATKEquity).interfaceId);
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

    /// @notice Sets the OnchainID contract address for the equity token
    /// @dev Only callable by addresses with GOVERNANCE_ROLE
    /// @param _onchainID The address of the OnchainID contract to associate with this token
    function setOnchainID(address _onchainID) external override onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE) {
        _smart_setOnchainID(_onchainID);
    }

    /// @notice Sets the Identity Registry contract address
    /// @dev Only callable by addresses with GOVERNANCE_ROLE
    /// @param _identityRegistry The address of the Identity Registry contract
    function setIdentityRegistry(address _identityRegistry)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE)
    {
        _smart_setIdentityRegistry(_identityRegistry);
    }

    /// @notice Sets the Compliance contract address
    /// @dev Only callable by addresses with GOVERNANCE_ROLE
    /// @param _compliance The address of the main compliance contract
    function setCompliance(address _compliance)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE)
    {
        _smart_setCompliance(_compliance);
    }

    /// @notice Sets parameters for a specific compliance module
    /// @dev Only callable by addresses with GOVERNANCE_ROLE
    /// @param _module The address of the compliance module
    /// @param _params The encoded parameters to set for the module
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

    /// @notice Mints new equity tokens to a specified address
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE
    /// @param _to The address to receive the minted tokens
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

    /// @notice Mints equity tokens to multiple addresses in a single transaction
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE. Arrays must have the same length.
    /// @param _toList Array of addresses to receive the minted tokens
    /// @param _amounts Array of amounts to mint to each corresponding address
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

    /// @notice Transfers equity tokens to a specified address
    /// @dev Checks compliance and custodian restrictions before transfer
    /// @param _to The address to receive the tokens
    /// @param _amount The amount of tokens to transfer
    /// @return bool indicating whether the transfer was successful
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
    /// @dev Only callable by addresses with EMERGENCY_ROLE
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

    /// @notice Adds a new compliance module to the equity token
    /// @dev Only callable by addresses with GOVERNANCE_ROLE
    /// @param _module The address of the compliance module to add
    /// @param _params The encoded parameters for the module
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

    /// @notice Removes a compliance module from the equity token
    /// @dev Only callable by addresses with GOVERNANCE_ROLE
    /// @param _module The address of the compliance module to remove
    function removeComplianceModule(address _module)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE)
    {
        _smart_removeComplianceModule(_module);
    }

    // --- ISMARTBurnable Implementation ---

    /// @notice Burns equity tokens from a specified address
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE
    /// @param userAddress The address from which to burn tokens
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

    /// @notice Burns equity tokens from multiple addresses in a single transaction
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE. Arrays must have the same length.
    /// @param userAddresses Array of addresses from which to burn tokens
    /// @param amounts Array of amounts to burn from each corresponding address
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

    /// @notice Freezes or unfreezes an address from transferring tokens
    /// @dev Only callable by addresses with CUSTODIAN_ROLE
    /// @param userAddress The address to freeze or unfreeze
    /// @param freeze True to freeze the address, false to unfreeze
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

    /// @notice Freezes a specific amount of tokens for an address
    /// @dev Only callable by addresses with CUSTODIAN_ROLE
    /// @param userAddress The address for which to freeze tokens
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

    /// @notice Unfreezes a specific amount of tokens for an address
    /// @dev Only callable by addresses with CUSTODIAN_ROLE
    /// @param userAddress The address for which to unfreeze tokens
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

    /// @notice Freezes or unfreezes multiple addresses in a single transaction
    /// @dev Only callable by addresses with CUSTODIAN_ROLE. Arrays must have the same length.
    /// @param userAddresses Array of addresses to freeze or unfreeze
    /// @param freeze Array of boolean values indicating whether to freeze (true) or unfreeze (false)
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

    /// @notice Freezes specific amounts of tokens for multiple addresses
    /// @dev Only callable by addresses with CUSTODIAN_ROLE. Arrays must have the same length.
    /// @param userAddresses Array of addresses for which to freeze tokens
    /// @param amounts Array of amounts to freeze for each corresponding address
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

    /// @notice Unfreezes specific amounts of tokens for multiple addresses
    /// @dev Only callable by addresses with CUSTODIAN_ROLE. Arrays must have the same length.
    /// @param userAddresses Array of addresses for which to unfreeze tokens
    /// @param amounts Array of amounts to unfreeze for each corresponding address
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
    /// @dev Only callable by addresses with CUSTODIAN_ROLE. Bypasses compliance checks.
    /// @param from The address to transfer tokens from
    /// @param to The address to transfer tokens to
    /// @param amount The amount of tokens to transfer
    /// @return bool indicating whether the transfer was successful
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

    /// @notice Forces multiple transfers of tokens in a single transaction
    /// @dev Only callable by addresses with CUSTODIAN_ROLE. Arrays must have the same length. Bypasses compliance
    /// checks.
    /// @param fromList Array of addresses to transfer tokens from
    /// @param toList Array of addresses to transfer tokens to
    /// @param amounts Array of amounts to transfer for each corresponding address pair
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
    /// @dev Only callable by addresses with CUSTODIAN_ROLE. Used for account recovery scenarios.
    /// @param lostWallet The address of the wallet that lost access
    /// @param newWallet The address of the new wallet to receive the tokens
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
    /// @dev Only callable by addresses with EMERGENCY_ROLE
    function pause() external override onlyAccessManagerRole(ATKAssetRoles.EMERGENCY_ROLE) {
        _smart_pause();
    }

    /// @notice Unpauses token transfers
    /// @dev Only callable by addresses with EMERGENCY_ROLE
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
        return interfaceId == type(IATKEquity).interfaceId || super.supportsInterface(interfaceId);
    }

    // --- Hooks (Overrides for Chaining) ---
    // These ensure that logic from multiple inherited extensions (SMART, SMARTCustodian, etc.) is called correctly.

    /// @notice Hook called before minting tokens
    /// @dev Executes validation logic from multiple extensions before minting:
    ///      1. SMARTCustodianUpgradeable: Checks if recipient is frozen
    ///      2. SMARTUpgradeable: Performs compliance and identity checks
    /// @param to The address that will receive the minted tokens
    /// @param amount The amount of tokens to mint
    /// @inheritdoc SMARTHooks
    function _beforeMint(
        address to,
        uint256 amount
    )
        internal
        virtual
        override(SMARTUpgradeable, SMARTCustodianUpgradeable, SMARTHooks)
    {
        super._beforeMint(to, amount);
    }

    /// @notice Hook called before transferring tokens
    /// @dev Executes validation logic from multiple extensions before transfer:
    ///      1. SMARTCustodianUpgradeable: Checks frozen status and partial freezes
    ///      2. SMARTUpgradeable: Performs compliance and identity verification
    /// @param from The address sending the tokens
    /// @param to The address receiving the tokens
    /// @param amount The amount of tokens to transfer
    /// @inheritdoc SMARTHooks
    function _beforeTransfer(
        address from,
        address to,
        uint256 amount
    )
        internal
        virtual
        override(SMARTUpgradeable, SMARTCustodianUpgradeable, SMARTHooks)
    {
        super._beforeTransfer(from, to, amount);
    }

    /// @notice Hook called before burning tokens
    /// @dev Executes validation logic from multiple extensions before burning:
    ///      SMARTCustodianUpgradeable: Validates frozen status and partial freezes
    /// @param from The address from which tokens will be burned
    /// @param amount The amount of tokens to burn
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

    /// @notice Hook called before redeeming tokens
    /// @dev Executes validation logic from multiple extensions before redemption:
    ///      SMARTCustodianUpgradeable: Validates frozen status and partial freezes
    /// @param owner The address that owns the tokens to be redeemed
    /// @param amount The amount of tokens to redeem
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

    /// @notice Hook called after minting tokens
    /// @dev Executes post-mint logic from multiple extensions:
    ///      SMARTUpgradeable: May emit events or update internal accounting
    /// @param to The address that received the minted tokens
    /// @param amount The amount of tokens minted
    /// @inheritdoc SMARTHooks
    function _afterMint(address to, uint256 amount) internal virtual override(SMARTUpgradeable, SMARTHooks) {
        super._afterMint(to, amount);
    }

    /// @notice Hook called after transferring tokens
    /// @dev Executes post-transfer logic from multiple extensions:
    ///      SMARTUpgradeable: May emit events or update internal accounting
    /// @param from The address that sent the tokens
    /// @param to The address that received the tokens
    /// @param amount The amount of tokens transferred
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

    /// @notice Hook called after burning tokens
    /// @dev Executes post-burn logic from multiple extensions:
    ///      SMARTUpgradeable: May emit events or update internal accounting
    /// @param from The address from which tokens were burned
    /// @param amount The amount of tokens burned
    /// @inheritdoc SMARTHooks
    function _afterBurn(address from, uint256 amount) internal virtual override(SMARTUpgradeable, SMARTHooks) {
        super._afterBurn(from, amount);
    }

    /// @notice Hook called after recovering tokens from a lost wallet
    /// @dev Executes post-recovery logic from multiple extensions:
    ///      SMARTCustodianUpgradeable: May emit events or update recovery state
    /// @param lostWallet The address of the wallet that lost access
    /// @param newWallet The address of the new wallet that received the tokens
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

    /// @notice Internal function to update token balances
    /// @dev Overrides _update to ensure Pausable and Collateral checks are applied.
    /// @param from The address sending tokens (address(0) for minting)
    /// @param to The address receiving tokens (address(0) for burning)
    /// @param value The amount of tokens being transferred
    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        virtual
        override(SMARTPausableUpgradeable, SMARTUpgradeable, ERC20VotesUpgradeable, ERC20Upgradeable)
    {
        // Calls chain: SMARTPausable -> SMART -> ERC20Votes -> ERC20
        super._update(from, to, value);
    }

    /// @notice Returns the address of the transaction sender
    /// @dev Resolves msgSender across Context and ERC2771Context for meta-transaction support
    /// @return The address of the transaction sender
    function _msgSender()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address)
    {
        return ERC2771ContextUpgradeable._msgSender();
    }

    /// @notice Returns the calldata of the transaction
    /// @dev Resolves msgData across Context and ERC2771Context for meta-transaction support
    /// @return The calldata of the transaction
    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return ERC2771ContextUpgradeable._msgData();
    }

    /// @notice Returns the length of the context suffix for ERC2771
    /// @dev Hook defining the length of the trusted forwarder address suffix in `msg.data`.
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
