// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20, IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Interface imports
import {
    SMARTComplianceModuleParamPair
} from "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IContractWithIdentity } from "../../../contracts/system/identity-factory/IContractWithIdentity.sol";
import { ISMART } from "../../../contracts/smart/interface/ISMART.sol";
import { _SMARTLogic } from "../../../contracts/smart/extensions/core/internal/_SMARTLogic.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// Core extensions
import { SMART } from "../../../contracts/smart/extensions/core/SMART.sol";
import { SMARTHooks } from "../../../contracts/smart/extensions/common/SMARTHooks.sol";

// Feature extensions
import { SMARTPausable } from "../../../contracts/smart/extensions/pausable/SMARTPausable.sol";
import { SMARTBurnable } from "../../../contracts/smart/extensions/burnable/SMARTBurnable.sol";
import { SMARTCustodian } from "../../../contracts/smart/extensions/custodian/SMARTCustodian.sol";
import { SMARTRedeemable } from "../../../contracts/smart/extensions/redeemable/SMARTRedeemable.sol";
import { ISMARTRedeemable } from "../../../contracts/smart/extensions/redeemable/ISMARTRedeemable.sol";
import { SMARTCollateral } from "../../../contracts/smart/extensions/collateral/SMARTCollateral.sol";
import {
    SMARTHistoricalBalances
} from "../../../contracts/smart/extensions/historical-balances/SMARTHistoricalBalances.sol";
import {
    SMARTTokenAccessManaged
} from "../../../contracts/smart/extensions/access-managed/SMARTTokenAccessManaged.sol";
import { SMARTCapped } from "../../../contracts/smart/extensions/capped/SMARTCapped.sol";

/// @title SMARTToken
/// @author SettleMint
/// @notice This contract is a comprehensive implementation of a "SMART" (Secure, Managable, Accountable, Regulated,
/// Transparent) token.
/// @dev It integrates various functionalities such as compliance, custodian features, collateralization, pausable
/// transfers, burnable tokens,
/// redeemable tokens, and historical balance tracking. It leverages OpenZeppelin's ERC20 and AccessControl contracts as
/// a base.
/// The token aims to provide a robust framework for representing real-world assets or other financial instruments on
/// the blockchain
/// while adhering to regulatory requirements through its modular compliance system.

contract SMARTToken is
    SMART,
    IContractWithIdentity,
    SMARTTokenAccessManaged,
    SMARTCustodian,
    SMARTCollateral,
    SMARTPausable,
    SMARTBurnable,
    SMARTRedeemable,
    SMARTHistoricalBalances,
    SMARTCapped
{
    using SafeERC20 for IERC20;

    // Role constants
    /// @notice Role identifier for administrators who can update general token settings like name, symbol, and the
    /// OnchainID contract address.
    /// @dev This role is critical for managing the token's basic identity and its link to an external identity system
    /// (OnchainID).
    bytes32 public constant TOKEN_ADMIN_ROLE = keccak256("TOKEN_ADMIN_ROLE");
    /// @notice Role identifier for administrators who manage compliance-related settings.
    /// @dev This includes setting the main compliance contract, adding/removing compliance modules, and configuring
    /// their parameters.
    /// This role is key to enforcing regulatory rules on token transfers and interactions.
    bytes32 public constant COMPLIANCE_ADMIN_ROLE = keccak256("COMPLIANCE_ADMIN_ROLE");
    /// @notice Role identifier for administrators who manage investor verification settings.
    /// @dev This involves setting the identity registry and specifying which claim topics are required for investors to
    /// interact with the token.
    /// This role is crucial for KYC/AML processes.
    bytes32 public constant VERIFICATION_ADMIN_ROLE = keccak256("VERIFICATION_ADMIN_ROLE");
    /// @notice Role identifier for entities authorized to mint new tokens.
    /// @dev Minting creates new tokens and increases the total supply. Access to this role should be strictly
    /// controlled.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Role identifier for entities authorized to burn (destroy) tokens.
    /// @dev Burning tokens removes them from circulation, decreasing the total supply. This is often used for
    /// redemptions or supply management.
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    /// @notice Role identifier for entities authorized to freeze or unfreeze token balances for specific addresses.
    /// @dev This can be used to comply with legal orders or to manage accounts in specific situations.
    /// It also allows freezing partial amounts of tokens for an address.
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");

    error UnauthorizedRedeemer(address caller, address owner);
    error InvalidRedemptionAmount();
    /// @notice Role identifier for entities authorized to execute forced transfers of tokens between addresses.
    /// @dev This is a powerful role typically used in exceptional circumstances, such as recovering assets or
    /// rectifying errors under strict governance.

    bytes32 public constant FORCED_TRANSFER_ROLE = keccak256("FORCED_TRANSFER_ROLE");
    /// @notice Role identifier for entities authorized to perform address recovery for investors.
    /// @dev This allows transferring tokens from a lost wallet to a new wallet, provided proper verification (e.g., via
    /// OnchainID) is met.
    bytes32 public constant RECOVERY_ROLE = keccak256("RECOVERY_ROLE");

    /// @notice Role identifier for entities authorized to pause or unpause the entire contract.
    /// @dev When paused, most token operations (like transfers, minting, burning) are blocked. This is an emergency
    /// safety feature.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Role identifier for entities authorized to set the cap on the token.
    /// @dev This allows setting the cap on the token, which is the maximum number of tokens that can be minted.
    bytes32 public constant CAP_MANAGEMENT_ROLE = keccak256("CAP_MANAGEMENT_ROLE");

    /// @notice Role identifier for entities authorized to manage the token's supply.
    /// @dev This allows minting and burning tokens.
    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");

    /// @notice Constructor for the SMARTToken.
    /// @dev Initializes the token with its core properties, sets up initial compliance modules, collateral proof topic,
    /// and assigns administrative roles.
    /// @param name_ The name of the token (e.g., "My SMART Token").
    /// @param symbol_ The symbol of the token (e.g., "MST").
    /// @param decimals_ The number of decimal places the token uses (e.g., 18 for standard ERC20 tokens).
    /// @param cap_ The maximum number of tokens that can be minted.
    /// @param onchainID_ The address of the OnchainID contract used for identity verification.
    /// @param identityRegistry_ The address of the Identity Registry contract, which stores identity claims.
    /// @param compliance_ The address of the main compliance contract that enforces transfer restrictions.
    /// @param initialModulePairs_ An array of `SMARTComplianceModuleParamPair` structs, configuring initial compliance
    /// modules and their parameters.
    /// @param collateralProofTopic_ A `uint256` topic identifier for claims related to collateral proof, used by the
    /// `SMARTCollateral` extension.
    /// @param accessManager_ The address of the AccessManager contract that will manage the token's access control.
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 cap_,
        address onchainID_,
        address identityRegistry_,
        address compliance_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        uint256 collateralProofTopic_,
        address accessManager_
    )
        SMART(name_, symbol_, decimals_, onchainID_, identityRegistry_, compliance_, initialModulePairs_)
        SMARTTokenAccessManaged(accessManager_)
        SMARTCollateral(collateralProofTopic_)
        SMARTPausable(false)
        SMARTCapped(cap_)
    { }

    // --- ISMART Implementation ---

    /// @notice Updates the OnchainID contract address associated with this token.
    /// @dev The OnchainID contract is used for identity verification. Only callable by an address with
    /// `TOKEN_ADMIN_ROLE`.
    /// @param _onchainID The new address of the OnchainID contract.
    function setOnchainID(address _onchainID) external override onlyAccessManagerRole(TOKEN_ADMIN_ROLE) {
        _smart_setOnchainID(_onchainID);
    }

    /// @notice Updates the Identity Registry contract address.
    /// @dev The Identity Registry stores claims about identities. Only callable by an address with `TOKEN_ADMIN_ROLE`.
    /// @param _identityRegistry The new address of the Identity Registry contract.
    function setIdentityRegistry(address _identityRegistry) external override onlyAccessManagerRole(TOKEN_ADMIN_ROLE) {
        _smart_setIdentityRegistry(_identityRegistry);
    }

    /// @notice Updates the main compliance contract address.
    /// @dev The compliance contract is responsible for checking if token transfers are allowed. Only callable by an
    /// address with `COMPLIANCE_ADMIN_ROLE`.
    /// @param _compliance The new address of the compliance contract.
    function setCompliance(address _compliance) external override onlyAccessManagerRole(COMPLIANCE_ADMIN_ROLE) {
        _smart_setCompliance(_compliance);
    }

    /// @notice Sets or updates the parameters for a specific compliance module.
    /// @dev Compliance modules are components of the main compliance contract that can enforce specific rules. Only
    /// callable by an address with `COMPLIANCE_ADMIN_ROLE`.
    /// @param _module The address of the compliance module to configure.
    /// @param _params The new parameters for the module, encoded as bytes.
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

    /// @notice Mints new tokens and assigns them to a specified address.
    /// @dev This increases the total supply of the token. Only callable by an address with `MINTER_ROLE`.
    /// All compliance and verification checks are performed before minting.
    /// @param _to The address to receive the newly minted tokens.
    /// @param _amount The quantity of tokens to mint.
    function mint(address _to, uint256 _amount) external override onlyAccessManagerRole(MINTER_ROLE) {
        _smart_mint(_to, _amount);
    }

    /// @notice Mints tokens for multiple addresses in a single transaction.
    /// @dev This is a batch version of the `mint` function for efficiency. Only callable by an address with
    /// `MINTER_ROLE`.
    /// All compliance and verification checks are performed for each recipient before minting.
    /// @param _toList An array of addresses to receive the newly minted tokens.
    /// @param _amounts An array of token quantities to mint, corresponding to each address in `_toList`.
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
    function redeemFor(address owner, uint256 amount) external override returns (bool success) {
        address caller = _msgSender();
        if (caller != owner) revert UnauthorizedRedeemer(caller, owner);
        if (amount == 0) revert InvalidRedemptionAmount();

        _smart_redeemFor(owner, amount);
        return true;
    }

    /// @notice Transfers tokens from the caller's account to a specified recipient address.
    /// @dev This function overrides the standard ERC20 `transfer` to integrate SMART token features like compliance
    /// checks and hooks.
    /// @param _to The address of the recipient.
    /// @param _amount The quantity of tokens to transfer.
    /// @return A boolean indicating whether the transfer was successful.
    function transfer(address _to, uint256 _amount) public override(SMART, ERC20, IERC20) returns (bool) {
        return _smart_transfer(_to, _amount);
    }

    /// @notice Recovers ERC20 tokens that were accidentally sent to this contract address.
    /// @dev This function allows an admin to send out any ERC20 tokens (other than the SMART token itself) held by this
    /// contract. Only callable by an address with `TOKEN_ADMIN_ROLE`.
    /// @param token The address of the ERC20 token contract to recover.
    /// @param to The address to send the recovered tokens to.
    /// @param amount The quantity of tokens to recover and send.
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

    /// @notice Adds a new compliance module to the token's compliance system.
    /// @dev Compliance modules extend the rules for token transfers. Only callable by an address with
    /// `COMPLIANCE_ADMIN_ROLE`.
    /// @param _module The address of the compliance module to add.
    /// @param _params The initial parameters for the new module, encoded as bytes.
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

    /// @notice Removes an existing compliance module from the token's compliance system.
    /// @dev Only callable by an address with `COMPLIANCE_ADMIN_ROLE`.
    /// @param _module The address of the compliance module to remove.
    function removeComplianceModule(address _module) external override onlyAccessManagerRole(COMPLIANCE_ADMIN_ROLE) {
        _smart_removeComplianceModule(_module);
    }

    // --- ISMARTBurnable Implementation ---

    /// @notice Burns (destroys) a specified amount of tokens from a user's address.
    /// @dev This reduces the total supply of the token. Only callable by an address with `BURNER_ROLE`.
    /// Typically used for token redemption or supply management.
    /// @param userAddress The address from which tokens will be burned.
    /// @param amount The quantity of tokens to burn.
    function burn(address userAddress, uint256 amount) external override onlyAccessManagerRole(BURNER_ROLE) {
        _smart_burn(userAddress, amount);
    }

    /// @notice Burns tokens from multiple user addresses in a single transaction.
    /// @dev Batch version of the `burn` function for efficiency. Only callable by an address with `BURNER_ROLE`.
    /// @param userAddresses An array of addresses from which tokens will be burned.
    /// @param amounts An array of token quantities to burn, corresponding to each address.
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

    /// @notice Freezes or unfreezes an address, preventing or allowing token transfers.
    /// @dev If an address is frozen, it cannot send or receive tokens. Only callable by an address with `FREEZER_ROLE`.
    /// @param userAddress The address to freeze or unfreeze.
    /// @param freeze `true` to freeze the address, `false` to unfreeze it.
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

    /// @notice Freezes a specific amount of tokens for a given user address.
    /// @dev The frozen tokens cannot be transferred until unfrozen. Only callable by an address with `FREEZER_ROLE`.
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

    /// @notice Unfreezes a specific amount of tokens for a given user address.
    /// @dev Allows previously frozen tokens to be transferred again. Only callable by an address with `FREEZER_ROLE`.
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

    /// @notice Freezes or unfreezes multiple addresses in a single transaction.
    /// @dev Batch version of `setAddressFrozen`. Only callable by an address with `FREEZER_ROLE`.
    /// @param userAddresses An array of addresses to freeze or unfreeze.
    /// @param freeze An array of boolean values indicating whether to freeze (`true`) or unfreeze (`false`) each
    /// corresponding address.
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

    /// @notice Freezes specific amounts of tokens for multiple user addresses.
    /// @dev Batch version of `freezePartialTokens`. Only callable by an address with `FREEZER_ROLE`.
    /// @param userAddresses An array of addresses whose tokens are to be partially frozen.
    /// @param amounts An array of token quantities to freeze for each corresponding address.
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

    /// @notice Unfreezes specific amounts of tokens for multiple user addresses.
    /// @dev Batch version of `unfreezePartialTokens`. Only callable by an address with `FREEZER_ROLE`.
    /// @param userAddresses An array of addresses whose tokens are to be partially unfrozen.
    /// @param amounts An array of token quantities to unfreeze for each corresponding address.
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

    /// @notice Performs a forced transfer of tokens from one address to another.
    /// @dev This function bypasses standard sender authorization, intended for administrative actions like asset
    /// recovery or legal enforcement. Only callable by an address with `FORCED_TRANSFER_ROLE`.
    /// @param from The address from which tokens will be transferred.
    /// @param to The address to which tokens will be transferred.
    /// @param amount The quantity of tokens to transfer.
    /// @return A boolean indicating whether the forced transfer was successful.
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

    /// @notice Performs forced transfers for multiple address pairs.
    /// @dev Batch version of `forcedTransfer`. Only callable by an address with `FORCED_TRANSFER_ROLE`.
    /// @param fromList An array of addresses from which tokens will be transferred.
    /// @param toList An array of addresses to which tokens will be transferred.
    /// @param amounts An array of token quantities to transfer for each corresponding pair.
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

    /// @notice Pauses all token transfers and other major operations in the contract.
    /// @dev This is an emergency stop mechanism. Only callable by an address with `PAUSER_ROLE`.
    /// When paused, functions like `transfer`, `mint`, `burn` will revert.
    function pause() external override onlyAccessManagerRole(PAUSER_ROLE) {
        _smart_pause();
    }

    /// @notice Unpauses the contract, resuming normal token operations.
    /// @dev Only callable by an address with `PAUSER_ROLE`.
    function unpause() external override onlyAccessManagerRole(PAUSER_ROLE) {
        _smart_unpause();
    }

    // --- View Functions (Overrides) ---

    /// @notice Returns the name of the token.
    /// @dev Overrides ERC20 and IERC20Metadata. This function is virtual for potential further overrides in inheriting
    /// contracts.
    /// @return The token's name as a string.
    function name() public view virtual override(ERC20, IERC20Metadata) returns (string memory) {
        return super.name();
    }

    /// @notice Returns the symbol of the token.
    /// @dev Overrides ERC20 and IERC20Metadata. This function is virtual for potential further overrides in inheriting
    /// contracts.
    /// @return The token's symbol as a string.
    function symbol() public view virtual override(ERC20, IERC20Metadata) returns (string memory) {
        return super.symbol();
    }

    /// @notice Returns the number of decimals used to represent token amounts.
    /// @dev Overrides SMART, ERC20 and IERC20Metadata. This function is virtual for potential further overrides.
    /// @return The number of decimals as a uint8.
    function decimals() public view virtual override(SMART, ERC20, IERC20Metadata) returns (uint8) {
        return super.decimals();
    }

    // --- Hooks ---

    /// @notice Internal hook called before any token minting operation.
    /// @dev This function allows derived contracts or extensions (like SMARTCollateral, SMARTCustodian) to add custom
    /// logic
    /// that should execute before tokens are created. For example, checking collateral requirements or custodian
    /// status.
    /// @param to The address that will receive the minted tokens.
    /// @param amount The amount of tokens to be minted.
    function _beforeMint(
        address to,
        uint256 amount
    )
        internal
        virtual
        override(SMART, SMARTCollateral, SMARTCustodian, SMARTCapped, SMARTHooks)
    {
        super._beforeMint(to, amount);
    }

    /// @notice Internal hook called before any token transfer operation (including mints and burns, which are transfers
    /// to/from the zero address).
    /// @dev This allows extensions (like SMARTCustodian) to implement checks or actions before a transfer occurs, such
    /// as verifying compliance or unfreezing tokens.
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
        override(SMART, SMARTCustodian, SMARTHooks)
    {
        super._beforeTransfer(from, to, amount);
    }

    /// @notice Internal hook called before any token burning operation.
    /// @dev Allows extensions (like SMARTCustodian) to add custom logic before tokens are destroyed.
    /// @param from The address whose tokens are being burned.
    /// @param amount The amount of tokens to be burned.
    function _beforeBurn(address from, uint256 amount) internal virtual override(SMARTCustodian, SMARTHooks) {
        super._beforeBurn(from, amount);
    }

    /// @notice Internal hook called before any token redemption operation.
    /// @dev Allows extensions (like SMARTCustodian) to add custom logic before tokens are redeemed.
    /// Redemption is a specific type of burn, often associated with exchanging tokens for an underlying asset.
    /// @param owner The address redeeming tokens.
    /// @param amount The amount of tokens to be redeemed.
    function _beforeRedeem(address owner, uint256 amount) internal virtual override(SMARTCustodian, SMARTHooks) {
        super._beforeRedeem(owner, amount);
    }

    /// @notice Internal hook called after any token minting operation.
    /// @dev Allows extensions (like SMARTHistoricalBalances) to update their state after tokens have been created, for
    /// instance, to record balance snapshots.
    /// @param to The address that received the minted tokens.
    /// @param amount The amount of tokens that were minted.
    function _afterMint(
        address to,
        uint256 amount
    )
        internal
        virtual
        override(SMART, SMARTHistoricalBalances, SMARTHooks)
    {
        super._afterMint(to, amount);
    }

    /// @notice Internal hook called after any token transfer operation.
    /// @dev Allows extensions (like SMARTHistoricalBalances) to update their state after a transfer is completed.
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
        override(SMART, SMARTHistoricalBalances, SMARTHooks)
    {
        super._afterTransfer(from, to, amount);
    }

    /// @notice Internal hook called after any token burning operation.
    /// @dev Allows extensions (like SMARTHistoricalBalances) to update their state after tokens have been destroyed.
    /// @param from The address whose tokens were burned.
    /// @param amount The amount of tokens that were burned.
    function _afterBurn(
        address from,
        uint256 amount
    )
        internal
        virtual
        override(SMART, SMARTHistoricalBalances, SMARTHooks)
    {
        super._afterBurn(from, amount);
    }

    /// @inheritdoc SMARTHooks
    function _afterRecoverTokens(
        address lostWallet,
        address newWallet
    )
        internal
        virtual
        override(SMARTCustodian, SMARTHooks)
    {
        super._afterRecoverTokens(lostWallet, newWallet);
    }

    // --- Internal Functions (Overrides) ---
    /**
     * @notice Core internal function that updates token balances, overridden to include pausable functionality.
     * @dev This function is called by `transfer`, `mint`, and `burn`. By overriding it here, we ensure that the
     * `whenNotPaused`
     * modifier from `SMARTPausable` is applied to all balance-changing operations.
     * It explicitly calls the `SMARTPausable` implementation, which in turn calls the `ERC20`'s `_update`.
     * @param from The address sending tokens (or zero address for minting).
     * @param to The address receiving tokens (or zero address for burning).
     * @param value The amount of tokens being transferred.
     */
    function _update(address from, address to, uint256 value) internal virtual override(SMART, SMARTPausable, ERC20) {
        super._update(from, to, value);
    }

    /// @notice Returns the address of the current transaction's sender or the original sender if using a
    /// meta-transaction forwarder (ERC2771).
    /// @dev Overrides OpenZeppelin's `Context._msgSender()` to potentially support gasless transactions if a trusted
    /// forwarder is configured.
    /// For a novice: This function helps identify who is trying to perform an action, even if they are using a helper
    /// contract (forwarder) to submit their transaction.
    /// @return The address of the authenticated sender.
    function _msgSender() internal view virtual override(Context) returns (address) {
        return Context._msgSender();
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
    function supportsInterface(bytes4 interfaceId) public view virtual override(SMART, IERC165) returns (bool) {
        return interfaceId == type(IContractWithIdentity).interfaceId || super.supportsInterface(interfaceId);
    }
}
