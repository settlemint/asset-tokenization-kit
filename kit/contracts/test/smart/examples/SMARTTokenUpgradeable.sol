// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {
    ReentrancyGuardUpgradeable
} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

// Interface imports
import {
    SMARTComplianceModuleParamPair
} from "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IContractWithIdentity } from "../../../contracts/system/identity-factory/IContractWithIdentity.sol";
import { _SMARTLogic } from "../../../contracts/smart/extensions/core/internal/_SMARTLogic.sol";
import { ISMART } from "../../../contracts/smart/interface/ISMART.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Core extensions
import { SMARTUpgradeable } from "../../../contracts/smart/extensions/core/SMARTUpgradeable.sol";
import { SMARTHooks } from "../../../contracts/smart/extensions/common/SMARTHooks.sol";

// Feature extensions
import { SMARTPausableUpgradeable } from "../../../contracts/smart/extensions/pausable/SMARTPausableUpgradeable.sol";
import { SMARTBurnableUpgradeable } from "../../../contracts/smart/extensions/burnable/SMARTBurnableUpgradeable.sol";
import { SMARTCustodianUpgradeable } from "../../../contracts/smart/extensions/custodian/SMARTCustodianUpgradeable.sol";
import {
    SMARTRedeemableUpgradeable
} from "../../../contracts/smart/extensions/redeemable/SMARTRedeemableUpgradeable.sol";
import {
    SMARTCollateralUpgradeable
} from "../../../contracts/smart/extensions/collateral/SMARTCollateralUpgradeable.sol";
import {
    SMARTHistoricalBalancesUpgradeable
} from "../../../contracts/smart/extensions/historical-balances/SMARTHistoricalBalancesUpgradeable.sol";
import {
    SMARTTokenAccessManagedUpgradeable
} from "../../../contracts/smart/extensions/access-managed/SMARTTokenAccessManagedUpgradeable.sol";
import { SMARTCappedUpgradeable } from "../../../contracts/smart/extensions/capped/SMARTCappedUpgradeable.sol";

/// @title SMARTTokenUpgradeable
/// @author SettleMint
/// @notice This contract is an upgradeable version of the SMARTToken, designed to be used with a UUPS (Universal
/// Upgradeable Proxy Standard) proxy pattern.
/// @dev It provides the same comprehensive functionalities as SMARTToken, including compliance, custodian features,
/// collateralization, etc.,
/// but allows the contract logic to be upgraded without losing state or changing the contract address. This is achieved
/// by separating
/// the logic contract (this implementation) from the proxy contract that users interact with.
/// All initial setup is performed via the `initialize` function rather than a constructor.

contract SMARTTokenUpgradeable is
    Initializable,
    SMARTUpgradeable,
    IContractWithIdentity,
    SMARTTokenAccessManagedUpgradeable,
    SMARTCustodianUpgradeable,
    SMARTCollateralUpgradeable,
    SMARTPausableUpgradeable,
    SMARTBurnableUpgradeable,
    SMARTRedeemableUpgradeable,
    SMARTHistoricalBalancesUpgradeable,
    SMARTCappedUpgradeable,
    ReentrancyGuardUpgradeable
{
    error UnauthorizedRedeemer(address caller, address owner);
    error InvalidRedemptionAmount();

    // Role constants
    /// @notice Role identifier for administrators who can update general token settings like name, symbol, and the
    /// OnchainID contract address.
    /// @dev In an upgradeable contract, these settings are part of the persistent storage managed by the proxy.
    bytes32 public constant TOKEN_ADMIN_ROLE = keccak256("TOKEN_ADMIN_ROLE");
    /// @notice Role identifier for administrators who manage compliance-related settings.
    /// @dev This includes setting the main compliance contract, adding/removing compliance modules, and their
    /// parameters.
    bytes32 public constant COMPLIANCE_ADMIN_ROLE = keccak256("COMPLIANCE_ADMIN_ROLE");
    /// @notice Role identifier for administrators who manage investor verification settings.
    /// @dev This involves setting the identity registry and specifying required claim topics for KYC/AML.
    bytes32 public constant VERIFICATION_ADMIN_ROLE = keccak256("VERIFICATION_ADMIN_ROLE");
    /// @notice Role identifier for entities authorized to mint new tokens.
    /// @dev Minting increases the total supply and should be strictly controlled.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Role identifier for entities authorized to burn (destroy) tokens.
    /// @dev Burning tokens decreases total supply, used for redemptions or supply management.
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    /// @notice Role identifier for entities authorized to freeze or unfreeze token balances for specific addresses.
    /// @dev Used for legal compliance or account management, including partial freezes.
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");
    /// @notice Role identifier for entities authorized to execute forced transfers of tokens.
    /// @dev A powerful role for exceptional circumstances like asset recovery under strict governance.
    bytes32 public constant FORCED_TRANSFER_ROLE = keccak256("FORCED_TRANSFER_ROLE");
    /// @notice Role identifier for entities authorized to perform address recovery for investors.
    /// @dev Allows transferring tokens from a lost wallet to a new one, subject to identity verification.
    bytes32 public constant RECOVERY_ROLE = keccak256("RECOVERY_ROLE");

    /// @notice Role identifier for entities authorized to pause or unpause the entire contract.
    /// @dev An emergency safety feature that blocks most token operations.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    /// @notice Role identifier for entities authorized to manage the token's supply cap.
    /// @dev Used to set or update the maximum number of tokens that can be minted.
    bytes32 public constant CAP_MANAGEMENT_ROLE = keccak256("CAP_MANAGEMENT_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    /// @dev This empty constructor is required for upgradeable contracts following the UUPS pattern.
    /// It calls `_disableInitializers()` to prevent the `initialize` function from being called multiple times
    /// implicitly.
    /// The actual initialization is done via the `initialize` function, which must be called explicitly after
    /// deployment through the proxy.
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the SMART token contract and all its inherited extensions.
    /// @dev This function replaces the constructor in an upgradeable contract setup. It should only be called once,
    /// typically by the deployer of the proxy contract.
    /// It sets up the token name, symbol, decimals, identity and compliance systems, collateral proof, and initial
    /// ownership.
    /// @param name_ The name of the token (e.g., "My Upgradeable SMART Token").
    /// @param symbol_ The symbol of the token (e.g., "MUST").
    /// @param decimals_ The number of decimal places the token uses (e.g., 18).
    /// @param cap_ The maximum number of tokens that can be minted.
    /// @param onchainID_ The address of the OnchainID contract for identity verification.
    /// @param identityRegistry_ The address of the Identity Registry contract.
    /// @param compliance_ The address of the main compliance contract.
    /// @param initialModulePairs_ Initial compliance module configurations.
    /// @param collateralProofTopic_ A `uint256` topic identifier for claims related to collateral proof.
    /// @param accessManager_ The address of the AccessManager contract that will manage the token's access control.
    function initialize(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 cap_,
        address onchainID_,
        address identityRegistry_,
        address compliance_,
        SMARTComplianceModuleParamPair[] calldata initialModulePairs_,
        uint256 collateralProofTopic_,
        address accessManager_
    )
        public
        initializer // OpenZeppelin modifier to ensure this function is called only once

    {
        __ERC20_init(name_, symbol_); // Initializes ERC20 basic properties (name, symbol)
        __SMART_init( // Initializes core SMART logic (decimals, identity, compliance)
            name_,
            symbol_,
            decimals_,
            onchainID_,
            identityRegistry_,
            compliance_,
            initialModulePairs_
        );
        __SMARTTokenAccessManaged_init(accessManager_);
        __SMARTCustodian_init(); // Initializes custodian features
        __SMARTBurnable_init(); // Initializes burnable token features
        __SMARTRedeemable_init(); // Initializes redeemable token features
        __SMARTPausable_init(false); // Initializes pausable contract features
        __SMARTCollateral_init(collateralProofTopic_); // Initializes collateral features
        __SMARTHistoricalBalances_init(); // Initializes historical balance tracking
        __SMARTCapped_init(cap_); // Initializes capped token features
        __ReentrancyGuard_init();
    }

    // --- ISMART Implementation ---

    /// @notice Updates the OnchainID contract address.
    /// @dev Only callable by `TOKEN_ADMIN_ROLE`. Modifies state stored in the proxy.
    /// @param _onchainID The new address of the OnchainID contract.
    function setOnchainID(address _onchainID) external override onlyAccessManagerRole(TOKEN_ADMIN_ROLE) {
        _smart_setOnchainID(_onchainID);
    }

    /// @notice Updates the Identity Registry contract address.
    /// @dev Only callable by `TOKEN_ADMIN_ROLE`.
    /// @param _identityRegistry The new address of the Identity Registry contract.
    function setIdentityRegistry(address _identityRegistry) external override onlyAccessManagerRole(TOKEN_ADMIN_ROLE) {
        _smart_setIdentityRegistry(_identityRegistry);
    }

    /// @notice Updates the main compliance contract address.
    /// @dev Only callable by `COMPLIANCE_ADMIN_ROLE`.
    /// @param _compliance The new address of the compliance contract.
    function setCompliance(address _compliance) external override onlyAccessManagerRole(COMPLIANCE_ADMIN_ROLE) {
        _smart_setCompliance(_compliance);
    }

    /// @notice Sets or updates parameters for a specific compliance module.
    /// @dev Only callable by `COMPLIANCE_ADMIN_ROLE`.
    /// @param _module The address of the compliance module.
    /// @param _params The new parameters for the module (encoded bytes).
    function setParametersForComplianceModule(
        address _module,
        bytes calldata _params
    )
        external
        override
        onlyAccessManagerRole(COMPLIANCE_ADMIN_ROLE)
    {
        _smart_setParametersForComplianceModule(_module, _params);
    }

    /// @notice Mints new tokens to a specified address.
    /// @dev Increases total supply. Only callable by `MINTER_ROLE`. Subject to compliance checks.
    /// @param _to The recipient address.
    /// @param _amount The quantity of tokens to mint.
    function mint(address _to, uint256 _amount) external override onlyAccessManagerRole(MINTER_ROLE) {
        _smart_mint(_to, _amount);
    }

    /// @notice Mints tokens for multiple addresses in a batch.
    /// @dev Only callable by `MINTER_ROLE`. Subject to compliance checks for each recipient.
    /// @param _toList Array of recipient addresses.
    /// @param _amounts Array of token quantities to mint.
    function batchMint(
        address[] calldata _toList,
        uint256[] calldata _amounts
    )
        external
        override
        onlyAccessManagerRole(MINTER_ROLE)
    {
        _smart_batchMint(_toList, _amounts);
    }

    /// @notice Redeems `amount` of tokens from `owner`.
    /// @dev Authorization policy: only the owner may redeem on their behalf.
    function redeemFor(address owner, uint256 amount) external override nonReentrant returns (bool success) {
        address caller = _msgSender();
        if (caller != owner) revert UnauthorizedRedeemer(caller, owner);
        if (amount == 0) revert InvalidRedemptionAmount();

        _smart_redeemFor(owner, amount);
        return true;
    }

    /// @notice Transfers tokens from the caller to a recipient.
    /// @dev Overrides ERC20 `transfer` to include SMART compliance and hooks. This is the standard user-facing transfer
    /// function.
    /// @param _to The recipient address.
    /// @param _amount The quantity of tokens to transfer.
    /// @return `true` if successful.
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

    /// @notice Recovers ERC20 tokens accidentally sent to this contract.
    /// @dev Only callable by `TOKEN_ADMIN_ROLE`. Useful for retrieving other tokens mistakenly transferred to the
    /// SMARTToken contract address.
    /// @param token The address of the ERC20 token to recover.
    /// @param to The address to send the recovered tokens to.
    /// @param amount The quantity of tokens to recover.
    function recoverERC20(
        address token,
        address to,
        uint256 amount
    )
        external
        override
        onlyAccessManagerRole(TOKEN_ADMIN_ROLE)
    {
        _smart_recoverERC20(token, to, amount);
    }

    /// @notice Adds a new compliance module.
    /// @dev Only callable by `COMPLIANCE_ADMIN_ROLE`.
    /// @param _module The address of the compliance module to add.
    /// @param _params Initial parameters for the module (encoded bytes).
    function addComplianceModule(
        address _module,
        bytes calldata _params
    )
        external
        override
        onlyAccessManagerRole(COMPLIANCE_ADMIN_ROLE)
    {
        _smart_addComplianceModule(_module, _params);
    }

    /// @notice Removes an existing compliance module.
    /// @dev Only callable by `COMPLIANCE_ADMIN_ROLE`.
    /// @param _module The address of the compliance module to remove.
    function removeComplianceModule(address _module) external override onlyAccessManagerRole(COMPLIANCE_ADMIN_ROLE) {
        _smart_removeComplianceModule(_module);
    }

    // --- ISMARTBurnable Implementation ---

    /// @notice Burns a specified amount of tokens from a user's address.
    /// @dev Reduces total supply. Only callable by `BURNER_ROLE`.
    /// @param userAddress The address from which tokens will be burned.
    /// @param amount The quantity of tokens to burn.
    function burn(address userAddress, uint256 amount) external override onlyAccessManagerRole(BURNER_ROLE) {
        _smart_burn(userAddress, amount);
    }

    /// @notice Burns tokens from multiple user addresses in a batch.
    /// @dev Only callable by `BURNER_ROLE`.
    /// @param userAddresses Array of addresses from which tokens will be burned.
    /// @param amounts Array of token quantities to burn.
    function batchBurn(
        address[] calldata userAddresses,
        uint256[] calldata amounts
    )
        external
        override
        onlyAccessManagerRole(BURNER_ROLE)
    {
        _smart_batchBurn(userAddresses, amounts);
    }

    // --- ISMARTCapped Implementation ---

    function setCap(uint256 newCap) external override onlyAccessManagerRole(CAP_MANAGEMENT_ROLE) {
        _smart_setCap(newCap);
    }

    // --- ISMARTCustodian Implementation ---

    /// @notice Freezes or unfreezes an address, preventing/allowing token transfers.
    /// @dev Only callable by `FREEZER_ROLE`.
    /// @param userAddress The address to freeze or unfreeze.
    /// @param freeze `true` to freeze, `false` to unfreeze.
    function setAddressFrozen(
        address userAddress,
        bool freeze
    )
        external
        override
        onlyAccessManagerRole(FREEZER_ROLE)
    {
        _smart_setAddressFrozen(userAddress, freeze);
    }

    /// @notice Freezes a specific amount of tokens for a user.
    /// @dev Only callable by `FREEZER_ROLE`.
    /// @param userAddress The address whose tokens are to be partially frozen.
    /// @param amount The quantity of tokens to freeze.
    function freezePartialTokens(
        address userAddress,
        uint256 amount
    )
        external
        override
        onlyAccessManagerRole(FREEZER_ROLE)
    {
        _smart_freezePartialTokens(userAddress, amount);
    }

    /// @notice Unfreezes a specific amount of tokens for a user.
    /// @dev Only callable by `FREEZER_ROLE`.
    /// @param userAddress The address whose tokens are to be partially unfrozen.
    /// @param amount The quantity of tokens to unfreeze.
    function unfreezePartialTokens(
        address userAddress,
        uint256 amount
    )
        external
        override
        onlyAccessManagerRole(FREEZER_ROLE)
    {
        _smart_unfreezePartialTokens(userAddress, amount);
    }

    /// @notice Freezes or unfreezes multiple addresses in a batch.
    /// @dev Only callable by `FREEZER_ROLE`.
    /// @param userAddresses Array of addresses to freeze/unfreeze.
    /// @param freeze Array of booleans indicating freeze/unfreeze status.
    function batchSetAddressFrozen(
        address[] calldata userAddresses,
        bool[] calldata freeze
    )
        external
        override
        onlyAccessManagerRole(FREEZER_ROLE)
    {
        _smart_batchSetAddressFrozen(userAddresses, freeze);
    }

    /// @notice Freezes specific amounts of tokens for multiple users in a batch.
    /// @dev Only callable by `FREEZER_ROLE`.
    /// @param userAddresses Array of addresses for partial freeze.
    /// @param amounts Array of token quantities to freeze.
    function batchFreezePartialTokens(
        address[] calldata userAddresses,
        uint256[] calldata amounts
    )
        external
        override
        onlyAccessManagerRole(FREEZER_ROLE)
    {
        _smart_batchFreezePartialTokens(userAddresses, amounts);
    }

    /// @notice Unfreezes specific amounts of tokens for multiple users in a batch.
    /// @dev Only callable by `FREEZER_ROLE`.
    /// @param userAddresses Array of addresses for partial unfreeze.
    /// @param amounts Array of token quantities to unfreeze.
    function batchUnfreezePartialTokens(
        address[] calldata userAddresses,
        uint256[] calldata amounts
    )
        external
        override
        onlyAccessManagerRole(FREEZER_ROLE)
    {
        _smart_batchUnfreezePartialTokens(userAddresses, amounts);
    }

    /// @notice Performs a forced transfer of tokens between two addresses.
    /// @dev Bypasses sender authorization. Only callable by `FORCED_TRANSFER_ROLE`.
    /// @param from The address to transfer tokens from.
    /// @param to The address to transfer tokens to.
    /// @param amount The quantity of tokens to transfer.
    /// @return `true` if successful.
    function forcedTransfer(
        address from,
        address to,
        uint256 amount
    )
        external
        override
        onlyAccessManagerRole(FORCED_TRANSFER_ROLE)
        returns (bool)
    {
        return _smart_forcedTransfer(from, to, amount);
    }

    /// @notice Performs forced transfers for multiple address pairs in a batch.
    /// @dev Only callable by `FORCED_TRANSFER_ROLE`.
    /// @param fromList Array of sender addresses.
    /// @param toList Array of recipient addresses.
    /// @param amounts Array of token quantities to transfer.
    function batchForcedTransfer(
        address[] calldata fromList,
        address[] calldata toList,
        uint256[] calldata amounts
    )
        external
        override
        onlyAccessManagerRole(FORCED_TRANSFER_ROLE)
    {
        _smart_batchForcedTransfer(fromList, toList, amounts);
    }

    /// @notice Recovers tokens from a lost wallet to a new wallet for an investor, based on their OnchainID.
    /// @dev This function helps users regain access to their tokens if they lose control of their private keys,
    /// provided their identity is verified. Only callable by an address with `RECOVERY_ROLE`.
    /// @param lostWallet The address of the compromised or lost wallet.
    /// @param newWallet The address of the new wallet to which tokens will be transferred.
    function forcedRecoverTokens(
        address lostWallet,
        address newWallet
    )
        external
        override
        onlyAccessManagerRole(RECOVERY_ROLE)
    {
        _smart_recoverTokens(lostWallet, newWallet);
    }

    // --- ISMARTPausable Implementation ---

    /// @notice Pauses all major token operations.
    /// @dev Emergency stop mechanism. Only callable by `PAUSER_ROLE`.
    function pause() external override onlyAccessManagerRole(PAUSER_ROLE) {
        _smart_pause();
    }

    /// @notice Unpauses the contract, resuming normal operations.
    /// @dev Only callable by `PAUSER_ROLE`.
    function unpause() external override onlyAccessManagerRole(PAUSER_ROLE) {
        _smart_unpause();
    }

    // --- View Functions (Overrides) ---

    /// @notice Returns the name of the token.
    /// @dev Overrides ERC20Upgradeable and IERC20Metadata. The name is set during initialization and stored in the
    /// SMART logic layer.
    /// @return The token's name.
    function name() public view virtual override(ERC20Upgradeable, IERC20Metadata) returns (string memory) {
        // Delegation to SMARTUpgradeable -> _SMARTLogic ensures correct value is returned
        return super.name();
    }

    /// @notice Returns the symbol of the token.
    /// @dev Overrides ERC20Upgradeable and IERC20Metadata. The symbol is set during initialization.
    /// @return The token's symbol.
    function symbol() public view virtual override(ERC20Upgradeable, IERC20Metadata) returns (string memory) {
        // Delegation to SMARTUpgradeable -> _SMARTLogic ensures correct value is returned
        return super.symbol();
    }

    /// @notice Returns the number of decimals used by the token.
    /// @dev Overrides SMARTUpgradeable, ERC20Upgradeable, and IERC20Metadata to ensure consistency.
    /// The decimals are set during initialization via `__SMART_init_unchained`.
    /// @return The number of decimals.
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

    /**
     * @notice Internal function to update token balances, overridden to include pausable functionality.
     * @dev This core function is hit by transfers, mints, and burns. This override ensures that all such operations
     * respect the pausable state of the contract by implicitly using the `whenNotPaused` modifier from
     * `SMARTPausableUpgradeable`.
     * It correctly chains up to `SMARTPausableUpgradeable` which then calls `ERC20Upgradeable._update`.
     * @param from Sender's address (or zero address for mints).
     * @param to Recipient's address (or zero address for burns).
     * @param value Amount of tokens to transfer.
     */
    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        virtual
        override(SMARTUpgradeable, SMARTPausableUpgradeable, ERC20Upgradeable)
    {
        // Note: SMARTUpgradeable also overrides _update, but SMARTPausable's takes precedence for the pause check.
        // Both eventually call ERC20Upgradeable._update
        super._update(from, to, value);
    }

    // --- Overrides for Hook Functions ---
    // These overrides ensure that hooks from all relevant inherited extensions are correctly called in sequence,
    // maintaining the order of operations for features like collateral checks, custodian actions, and historical
    // balance updates.

    /// @notice Internal hook called before any token minting operation.
    /// @dev Chains up to implementations in `SMARTUpgradeable`, `SMARTCollateralUpgradeable`,
    /// `SMARTCustodianUpgradeable` and `SMARTHooks`.
    /// Allows for pre-mint checks like collateral sufficiency or custodian approvals.
    /// @param to The address receiving minted tokens.
    /// @param amount The amount of tokens to be minted.
    function _beforeMint(
        address to,
        uint256 amount
    )
        internal
        virtual
        override(
            SMARTUpgradeable,
            SMARTCollateralUpgradeable,
            SMARTCustodianUpgradeable,
            SMARTCappedUpgradeable,
            SMARTHooks
        )
    {
        super._beforeMint(to, amount);
    }

    /// @notice Internal hook called before any token transfer operation.
    /// @dev Chains up to `SMARTUpgradeable`, `SMARTCustodianUpgradeable`, and `SMARTHooks`.
    /// Enables pre-transfer checks such as compliance or account freeze status.
    /// @param from The address sending tokens.
    /// @param to The address receiving tokens.
    /// @param amount The amount of tokens being transferred.
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

    /// @notice Internal hook called before any token burning operation.
    /// @dev Chains up to `SMARTCustodianUpgradeable` and `SMARTHooks`.
    /// (Note: `SMARTUpgradeable` itself does not directly implement `_beforeBurn`).
    /// Used for pre-burn custodian checks or other logic.
    /// @param from The address whose tokens are being burned.
    /// @param amount The amount of tokens to be burned.
    function _beforeBurn(
        address from,
        uint256 amount
    )
        internal
        virtual
        override(SMARTCustodianUpgradeable, SMARTHooks) // SMARTUpgradeable
            // does not implement _beforeBurn

    {
        super._beforeBurn(from, amount);
    }

    /// @notice Internal hook called before any token redemption operation.
    /// @dev Chains up to `SMARTCustodianUpgradeable` and `SMARTHooks`.
    /// For pre-redemption checks, often related to custodian actions.
    /// @param owner The address redeeming tokens.
    /// @param amount The amount of tokens being redeemed.
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

    /// @notice Internal hook called after any token minting operation.
    /// @dev Chains up to `SMARTUpgradeable`, `SMARTHistoricalBalancesUpgradeable`, and `SMARTHooks`.
    /// Used for post-mint actions like updating historical balance snapshots.
    /// @param to The address that received the minted tokens.
    /// @param amount The amount of tokens that were minted.
    function _afterMint(
        address to,
        uint256 amount
    )
        internal
        virtual
        override(SMARTUpgradeable, SMARTHistoricalBalancesUpgradeable, SMARTHooks)
    {
        // SMARTCustodianUpgradeable, SMARTPausableUpgradeable, SMARTBurnableUpgradeable do not implement _afterMint
        super._afterMint(to, amount);
    }

    /// @notice Internal hook called after any token transfer operation.
    /// @dev Chains up to `SMARTUpgradeable`, `SMARTHistoricalBalancesUpgradeable`, and `SMARTHooks`.
    /// For post-transfer actions like updating balance snapshots.
    /// @param from The address that sent tokens.
    /// @param to The address that received tokens.
    /// @param amount The amount of tokens that were transferred.
    function _afterTransfer(
        address from,
        address to,
        uint256 amount
    )
        internal
        virtual
        override(SMARTUpgradeable, SMARTHistoricalBalancesUpgradeable, SMARTHooks)
        // SMARTCustodianUpgradeable, SMARTPausableUpgradeable, SMARTBurnableUpgradeable do not implement _afterTransfer

    {
        super._afterTransfer(from, to, amount);
    }

    /// @notice Internal hook called after any token burning operation.
    /// @dev Chains up to `SMARTUpgradeable`, `SMARTHistoricalBalancesUpgradeable`, and `SMARTHooks`.
    /// For post-burn actions like updating balance snapshots.
    /// @param from The address whose tokens were burned.
    /// @param amount The amount of tokens that were burned.
    function _afterBurn(
        address from,
        uint256 amount
    )
        internal
        virtual
        override(SMARTUpgradeable, SMARTHistoricalBalancesUpgradeable, SMARTHooks)
    {
        // SMARTCustodianUpgradeable, SMARTPausableUpgradeable do not implement _afterBurn
        super._afterBurn(from, amount);
    }

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

    /// @notice Internal hook called after any token redemption operation.
    /// @dev Chains up to `SMARTHooks`. This hook can be used for custom logic after redemption.
    /// @param owner The address that redeemed tokens.
    /// @param amount The amount of tokens that were redeemed.
    function _afterRedeem(address owner, uint256 amount) internal virtual override(SMARTHooks) {
        super._afterRedeem(owner, amount);
    }

    /// @notice Returns the address of the current transaction's sender, accounting for meta-transactions (ERC2771).
    /// @dev Overrides `ContextUpgradeable._msgSender()` to support gasless transactions if a trusted forwarder is
    /// configured for the contract.
    /// This is crucial in an upgradeable context to maintain consistent sender identification across upgrades.
    /// @return The authenticated sender address.
    function _msgSender() internal view virtual override(ContextUpgradeable) returns (address) {
        return super._msgSender();
    }

    // --- IContractWithIdentity Implementation ---

    /// @inheritdoc IContractWithIdentity
    function onchainID() public view override(_SMARTLogic, ISMART, IContractWithIdentity) returns (address) {
        return super.onchainID();
    }

    /// @inheritdoc IContractWithIdentity
    function canAddClaim(address actor) external view override returns (bool) {
        return _hasRole(TOKEN_ADMIN_ROLE, actor);
    }

    /// @inheritdoc IContractWithIdentity
    function canRemoveClaim(address actor) external view override returns (bool) {
        return _hasRole(TOKEN_ADMIN_ROLE, actor);
    }

    /// @notice Checks if this contract supports a given interface
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(SMARTUpgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == type(IContractWithIdentity).interfaceId || super.supportsInterface(interfaceId);
    }
}
