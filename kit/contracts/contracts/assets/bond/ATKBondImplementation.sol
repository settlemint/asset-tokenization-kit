// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

// Constants
import { ATKAssetRoles } from "../ATKAssetRoles.sol";

// Interface imports
import { IATKBond } from "./IATKBond.sol";
import { IContractWithIdentity } from "../../system/identity-factory/IContractWithIdentity.sol";
import { ISMARTBurnable } from "../../smart/extensions/burnable/ISMARTBurnable.sol";
import { ISMART } from "../../smart/interface/ISMART.sol";
import { _SMARTLogic } from "../../smart/extensions/core/internal/_SMARTLogic.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";

// Core extensions
import { SMARTUpgradeable } from "../../smart/extensions/core/SMARTUpgradeable.sol"; // Base SMART logic + ERC20
import { SMARTHooks } from "../../smart/extensions/common/SMARTHooks.sol";

// Feature extensions
import { SMARTPausableUpgradeable } from "../../smart/extensions/pausable/SMARTPausableUpgradeable.sol";
import { SMARTBurnableUpgradeable } from "../../smart/extensions/burnable/SMARTBurnableUpgradeable.sol";
import { SMARTCustodianUpgradeable } from "../../smart/extensions/custodian/SMARTCustodianUpgradeable.sol";
import { SMARTRedeemableUpgradeable } from "../../smart/extensions/redeemable/SMARTRedeemableUpgradeable.sol";
import {
    SMARTHistoricalBalancesUpgradeable
} from "../../smart/extensions/historical-balances/SMARTHistoricalBalancesUpgradeable.sol";
import { SMARTYieldUpgradeable } from "../../smart/extensions/yield/SMARTYieldUpgradeable.sol";
import {
    SMARTTokenAccessManagedUpgradeable
} from "../../smart/extensions/access-managed/SMARTTokenAccessManagedUpgradeable.sol";
import { SMARTCappedUpgradeable } from "../../smart/extensions/capped/SMARTCappedUpgradeable.sol";
/// @title ATKBondImplementation
/// @author SettleMint
/// @notice An implementation of a bond using the SMART extension framework,
///         backed by collateral and using custom roles.
/// @dev Combines core SMART features (compliance, verification) with extensions for pausing,
///      burning, custodian actions, and collateral tracking. Access control uses custom roles.

contract ATKBondImplementation is
    Initializable,
    IATKBond,
    IContractWithIdentity,
    SMARTUpgradeable,
    SMARTTokenAccessManagedUpgradeable,
    SMARTCustodianUpgradeable,
    SMARTPausableUpgradeable,
    SMARTBurnableUpgradeable,
    SMARTRedeemableUpgradeable,
    SMARTHistoricalBalancesUpgradeable,
    SMARTYieldUpgradeable,
    SMARTCappedUpgradeable,
    ERC2771ContextUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    /// @notice Timestamp when the bond matures
    /// @dev Set at deployment and cannot be changed
    uint256 private _maturityDate;

    /// @notice Tracks whether the bond has matured
    /// @dev Set to true when mature() is called after maturity date
    bool public isMatured;

    /// @notice The face value of the bond in denomination asset base units
    /// @dev Set at deployment and cannot be changed
    uint256 private _faceValue;

    /// @notice The denomination asset contract used for face value denomination
    /// @dev Must be a valid ERC20 token contract
    IERC20 private _denominationAsset;

    /// @notice Tracks how many bonds each holder has redeemed
    /// @dev Maps holder address to amount of bonds redeemed
    mapping(address holder => uint256 redeemed) public bondRedeemed;

    /// @notice Initializes the implementation contract with a trusted forwarder
    /// @dev Constructor is only called once during implementation deployment.
    ///      Actual initialization happens through the initialize function.
    /// @param forwarder_ The address of the trusted forwarder contract for meta-transactions
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address forwarder_) ERC2771ContextUpgradeable(forwarder_) {
        _disableInitializers();
    }

    /// @notice Initializes the SMART token contract and its extensions.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param decimals_ The number of decimals the token uses.
    /// @param cap_ Token cap
    /// @param bondParams Bond-specific parameters (maturityDate, faceValue, denominationAsset)
    /// @param initialModulePairs_ Initial compliance module configurations.
    /// @param identityRegistry_ The address of the Identity Registry contract.
    /// @param compliance_ The address of the main compliance contract.
    /// @param accessManager_ The address of the access manager contract.
    function initialize(
        string calldata name_,
        string calldata symbol_,
        uint8 decimals_,
        uint256 cap_,
        IATKBond.BondInitParams calldata bondParams,
        SMARTComplianceModuleParamPair[] calldata initialModulePairs_,
        address identityRegistry_,
        address compliance_,
        address accessManager_
    )
        external
        override
        initializer
    {
        if (bondParams.maturityDate < block.timestamp + 1) revert BondInvalidMaturityDate();
        if (bondParams.faceValue == 0) revert InvalidFaceValue();
        if (bondParams.denominationAsset == address(0)) revert InvalidDenominationAsset();

        // Verify the denomination asset contract exists by attempting to call a view function
        try IERC20(bondParams.denominationAsset).totalSupply() returns (uint256) {
        // Contract exists and implements IERC20
        }
        catch {
            revert InvalidDenominationAsset();
        }

        __SMART_init(name_, symbol_, decimals_, address(0), identityRegistry_, compliance_, initialModulePairs_);
        __SMARTTokenAccessManaged_init(accessManager_);
        __SMARTCustodian_init();
        __SMARTBurnable_init();
        __SMARTPausable_init(true);
        __SMARTYield_init();
        __SMARTRedeemable_init();
        __SMARTHistoricalBalances_init();
        __SMARTCapped_init(cap_);
        __ReentrancyGuard_init();

        _registerInterface(type(IATKBond).interfaceId);
        _registerInterface(type(IContractWithIdentity).interfaceId);

        _maturityDate = bondParams.maturityDate;
        _faceValue = bondParams.faceValue;
        _denominationAsset = IERC20(bondParams.denominationAsset);
    }

    // --- View Functions ---

    /// @notice Returns the timestamp when the bond matures
    /// @return The maturity date timestamp
    function maturityDate() external view override returns (uint256) {
        return _maturityDate;
    }

    /// @notice Returns the face value of the bond
    /// @return The bond's face value in denomination asset base units
    function faceValue() external view override returns (uint256) {
        return _faceValue;
    }

    /// @notice Returns the denomination asset contract
    /// @return The ERC20 contract of the denomination asset
    function denominationAsset() external view override returns (IERC20) {
        return _denominationAsset;
    }

    /// @notice Returns the amount of denomination assets held by the contract
    /// @return The balance of denomination assets
    function denominationAssetBalance() public view override returns (uint256) {
        return _denominationAsset.balanceOf(address(this));
    }

    /// @notice Returns the total amount of denomination assets needed for all potential redemptions
    /// @return The total amount of denomination assets needed
    function totalDenominationAssetNeeded() public view override returns (uint256) {
        return _calculateDenominationAssetAmount(totalSupply());
    }

    /// @notice Returns the amount of denomination assets missing for all potential redemptions
    /// @return The amount of denomination assets missing (0 if there's enough or excess)
    function missingDenominationAssetAmount() public view override returns (uint256) {
        uint256 needed = totalDenominationAssetNeeded();
        uint256 current = denominationAssetBalance();
        return needed > current ? needed - current : 0;
    }

    /// @notice Returns the amount of excess denomination assets that can be withdrawn
    /// @return The amount of excess denomination assets
    function withdrawableDenominationAssetAmount() public view override returns (uint256) {
        uint256 needed = totalDenominationAssetNeeded();
        uint256 current = denominationAssetBalance();
        return current > needed ? current - needed : 0;
    }

    /// @notice Returns the time remaining until the bond matures
    /// @return The time remaining until the bond matures (0 if time already passed)
    function timeToMaturity() public view returns (uint256) {
        return block.timestamp > _maturityDate ? 0 : _maturityDate - block.timestamp;
    }

    // --- State-Changing Functions ---

    /// @notice Closes off the bond at maturity
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE after maturity date
    /// @dev Requires sufficient denomination assets for all potential redemptions
    function mature() external override onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE) {
        if (block.timestamp < _maturityDate) {
            revert BondNotYetMatured(block.timestamp, _maturityDate);
        }
        if (isMatured) revert BondAlreadyMatured();

        uint256 needed = totalDenominationAssetNeeded();
        uint256 current = denominationAssetBalance();
        if (current < needed) revert InsufficientDenominationAssetBalance(current, needed);

        isMatured = true;
        emit BondMatured(block.timestamp);
    }

    // --- ISMART Implementation ---

    /// @notice Sets the onchain identity contract for this token
    /// @dev Only callable by addresses with GOVERNANCE_ROLE
    /// @param _onchainID The address of the new onchain identity contract
    function setOnchainID(address _onchainID) external override onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE) {
        _smart_setOnchainID(_onchainID);
    }

    /// @notice Sets the identity registry contract address
    /// @dev Only callable by addresses with GOVERNANCE_ROLE
    /// @param _identityRegistry The address of the new identity registry contract
    function setIdentityRegistry(address _identityRegistry)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE)
    {
        _smart_setIdentityRegistry(_identityRegistry);
    }

    /// @notice Sets the compliance contract address
    /// @dev Only callable by addresses with GOVERNANCE_ROLE
    /// @param _compliance The address of the new compliance contract
    function setCompliance(address _compliance) external override onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE) {
        _smart_setCompliance(_compliance);
    }

    /// @notice Sets parameters for a specific compliance module
    /// @dev Only callable by addresses with GOVERNANCE_ROLE
    /// @param _module The address of the compliance module
    /// @param _params The encoded parameters to set for the module
    function setParametersForComplianceModule(address _module, bytes calldata _params)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE)
    {
        _smart_setParametersForComplianceModule(_module, _params);
    }

    /// @notice Mints new bond tokens to a specified address
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE
    /// @param _to The address to mint tokens to
    /// @param _amount The amount of tokens to mint
    function mint(address _to, uint256 _amount)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE)
    {
        _smart_mint(_to, _amount);
    }

    /// @notice Mints bond tokens to multiple addresses in a single transaction
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE
    /// @param _toList Array of addresses to mint tokens to
    /// @param _amounts Array of amounts to mint to each address
    function batchMint(address[] calldata _toList, uint256[] calldata _amounts)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE)
    {
        _smart_batchMint(_toList, _amounts);
    }

    /// @notice Transfers bond tokens from the caller to another address
    /// @dev Enforces compliance checks and restrictions. Cannot transfer after bond maturity.
    /// @param _to The address to transfer tokens to
    /// @param _amount The amount of tokens to transfer
    /// @return bool Returns true if the transfer was successful
    function transfer(address _to, uint256 _amount)
        public
        override(SMARTUpgradeable, ERC20Upgradeable, IERC20)
        returns (bool)
    {
        return _smart_transfer(_to, _amount);
    }

    /// @notice Recovers ERC20 tokens accidentally sent to this contract
    /// @dev Only callable by addresses with EMERGENCY_ROLE
    /// @param token The address of the ERC20 token to recover
    /// @param to The address to send the recovered tokens to
    /// @param amount The amount of tokens to recover
    function recoverERC20(address token, address to, uint256 amount)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.EMERGENCY_ROLE)
    {
        _smart_recoverERC20(token, to, amount);
    }

    /// @notice Adds a new compliance module to the token
    /// @dev Only callable by addresses with GOVERNANCE_ROLE
    /// @param _module The address of the compliance module to add
    /// @param _params The initialization parameters for the module
    function addComplianceModule(address _module, bytes calldata _params)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE)
    {
        _smart_addComplianceModule(_module, _params);
    }

    /// @notice Removes a compliance module from the token
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

    /// @notice Burns bond tokens from a specified address
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE
    /// @param userAddress The address to burn tokens from
    /// @param amount The amount of tokens to burn
    function burn(address userAddress, uint256 amount)
        external
        override(ISMARTBurnable)
        onlyAccessManagerRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE)
    {
        _smart_burn(userAddress, amount);
    }

    /// @notice Burns bond tokens from multiple addresses in a single transaction
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE
    /// @param userAddresses Array of addresses to burn tokens from
    /// @param amounts Array of amounts to burn from each address
    function batchBurn(address[] calldata userAddresses, uint256[] calldata amounts)
        external
        override(ISMARTBurnable)
        onlyAccessManagerRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE)
    {
        _smart_batchBurn(userAddresses, amounts);
    }

    // --- ISMARTCapped Implementation ---

    /// @notice Sets a new maximum supply cap for the bond tokens
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE
    /// @param newCap The new maximum supply cap
    function setCap(uint256 newCap) external override onlyAccessManagerRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE) {
        _smart_setCap(newCap);
    }

    // --- ISMARTCustodian Implementation ---

    /// @notice Freezes or unfreezes all tokens for a specific address
    /// @dev Only callable by addresses with CUSTODIAN_ROLE
    /// @param userAddress The address to freeze/unfreeze
    /// @param freeze True to freeze the address, false to unfreeze
    function setAddressFrozen(address userAddress, bool freeze)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
    {
        _smart_setAddressFrozen(userAddress, freeze);
    }

    /// @notice Freezes a specific amount of tokens for an address
    /// @dev Only callable by addresses with CUSTODIAN_ROLE
    /// @param userAddress The address to freeze tokens for
    /// @param amount The amount of tokens to freeze
    function freezePartialTokens(address userAddress, uint256 amount)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
    {
        _smart_freezePartialTokens(userAddress, amount);
    }

    /// @notice Unfreezes a specific amount of tokens for an address
    /// @dev Only callable by addresses with CUSTODIAN_ROLE
    /// @param userAddress The address to unfreeze tokens for
    /// @param amount The amount of tokens to unfreeze
    function unfreezePartialTokens(address userAddress, uint256 amount)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
    {
        _smart_unfreezePartialTokens(userAddress, amount);
    }

    /// @notice Freezes or unfreezes multiple addresses in a single transaction
    /// @dev Only callable by addresses with CUSTODIAN_ROLE
    /// @param userAddresses Array of addresses to freeze/unfreeze
    /// @param freeze Array of booleans indicating freeze (true) or unfreeze (false) for each address
    function batchSetAddressFrozen(address[] calldata userAddresses, bool[] calldata freeze)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
    {
        _smart_batchSetAddressFrozen(userAddresses, freeze);
    }

    /// @notice Freezes specific amounts of tokens for multiple addresses
    /// @dev Only callable by addresses with CUSTODIAN_ROLE
    /// @param userAddresses Array of addresses to freeze tokens for
    /// @param amounts Array of amounts to freeze for each address
    function batchFreezePartialTokens(address[] calldata userAddresses, uint256[] calldata amounts)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
    {
        _smart_batchFreezePartialTokens(userAddresses, amounts);
    }

    /// @notice Unfreezes specific amounts of tokens for multiple addresses
    /// @dev Only callable by addresses with CUSTODIAN_ROLE
    /// @param userAddresses Array of addresses to unfreeze tokens for
    /// @param amounts Array of amounts to unfreeze for each address
    function batchUnfreezePartialTokens(address[] calldata userAddresses, uint256[] calldata amounts)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
    {
        _smart_batchUnfreezePartialTokens(userAddresses, amounts);
    }

    /// @notice Forces a transfer of tokens from one address to another
    /// @dev Only callable by addresses with CUSTODIAN_ROLE. Bypasses normal transfer restrictions.
    /// @param from The address to transfer tokens from
    /// @param to The address to transfer tokens to
    /// @param amount The amount of tokens to transfer
    /// @return bool Returns true if the transfer was successful
    function forcedTransfer(address from, address to, uint256 amount)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
        returns (bool)
    {
        return _smart_forcedTransfer(from, to, amount);
    }

    /// @notice Forces multiple transfers of tokens in a single transaction
    /// @dev Only callable by addresses with CUSTODIAN_ROLE. Bypasses normal transfer restrictions.
    /// @param fromList Array of addresses to transfer tokens from
    /// @param toList Array of addresses to transfer tokens to
    /// @param amounts Array of amounts to transfer
    function batchForcedTransfer(address[] calldata fromList, address[] calldata toList, uint256[] calldata amounts)
        external
        override
        onlyAccessManagerRole(ATKAssetRoles.CUSTODIAN_ROLE)
    {
        _smart_batchForcedTransfer(fromList, toList, amounts);
    }

    /// @notice Recovers tokens from a lost wallet to a new wallet
    /// @dev Only callable by addresses with CUSTODIAN_ROLE. Transfers all tokens from the lost wallet.
    /// @param lostWallet The address of the wallet that lost access
    /// @param newWallet The address of the new wallet to receive the tokens
    function forcedRecoverTokens(address lostWallet, address newWallet)
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

    // --- ISMARTYield Implementation ---

    /// @notice Sets the yield schedule contract for the bond
    /// @dev Only callable by addresses with GOVERNANCE_ROLE
    /// @param schedule The address of the yield schedule contract
    function setYieldSchedule(address schedule) external override onlyAccessManagerRole(ATKAssetRoles.GOVERNANCE_ROLE) {
        _smart_setYieldSchedule(schedule);
    }

    /// @notice Returns the yield basis per unit for a given address
    /// @dev Returns the face value of the bond. The address parameter is unused in this implementation.
    /// @return The face value representing the yield basis per unit
    // solhint-disable-next-line use-natspec
    function yieldBasisPerUnit(
        address /* holder */
    )
        external
        view
        override
        returns (uint256)
    {
        return _faceValue;
    }

    /// @notice Returns the token used for yield payments
    /// @dev Returns the denomination asset contract
    /// @return The IERC20 token used for yield payments
    function yieldToken() external view override returns (IERC20) {
        return _denominationAsset;
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
        return interfaceId == type(IATKBond).interfaceId || super.supportsInterface(interfaceId);
    }

    // --- Internal Functions ---

    /// @notice Calculates the denomination asset amount for a given bond amount
    /// @dev Multiplies the bond amount with the face value before dividing by decimals
    ///      to maintain precision
    /// @param bondAmount The amount of bonds to calculate for
    /// @return The amount of denomination assets
    function _calculateDenominationAssetAmount(uint256 bondAmount) private view returns (uint256) {
        return (bondAmount * _faceValue) / (10 ** decimals());
    }

    // --- Hooks (Overrides for Chaining) ---
    // These ensure that logic from multiple inherited extensions (SMART, SMARTCustodian, etc.) is called correctly.

    /// @inheritdoc SMARTHooks
    /// @notice Hook that is called before minting tokens
    /// @param to The address that will receive the minted tokens
    /// @param amount The amount of tokens to be minted
    function _beforeMint(address to, uint256 amount)
        internal
        virtual
        override(SMARTUpgradeable, SMARTCappedUpgradeable, SMARTCustodianUpgradeable, SMARTYieldUpgradeable, SMARTHooks)
    {
        super._beforeMint(to, amount);
    }

    /// @inheritdoc SMARTHooks
    /// @notice Hook that is called before transferring tokens
    /// @param from The address transferring the tokens
    /// @param to The address that will receive the tokens
    /// @param amount The amount of tokens to be transferred
    function _beforeTransfer(address from, address to, uint256 amount)
        internal
        virtual
        override(SMARTUpgradeable, SMARTCustodianUpgradeable, SMARTHooks)
    {
        // If not a forced update (recoverTokens or forcedTransfer) and the bond is matured,
        // we cannot transfer tokens anymore, only redeem them.
        if (!__isForcedUpdate && isMatured && (to != address(0))) {
            revert BondAlreadyMatured();
        }

        super._beforeTransfer(from, to, amount);
    }

    /// @inheritdoc SMARTHooks
    /// @notice Hook that is called before burning tokens
    /// @param from The address whose tokens will be burned
    /// @param amount The amount of tokens to be burned
    function _beforeBurn(address from, uint256 amount)
        internal
        virtual
        override(SMARTCustodianUpgradeable, SMARTHooks)
    {
        super._beforeBurn(from, amount);
    }

    /// @inheritdoc SMARTHooks
    /// @notice Hook that is called before redeeming tokens
    /// @param owner The address redeeming the tokens
    /// @param amount The amount of tokens to be redeemed
    function _beforeRedeem(address owner, uint256 amount)
        internal
        virtual
        override(SMARTCustodianUpgradeable, SMARTHooks)
    {
        if (!isMatured) revert BondNotYetMatured(block.timestamp, _maturityDate);
        if (amount == 0) revert InvalidRedemptionAmount();

        // Ensure sufficient denomination assets are available for this redemption
        uint256 denominationAssetAmount = _calculateDenominationAssetAmount(amount);
        uint256 contractBalance = denominationAssetBalance();
        if (contractBalance < denominationAssetAmount) {
            revert InsufficientDenominationAssetBalance(contractBalance, denominationAssetAmount);
        }

        super._beforeRedeem(owner, amount);
    }

    /// @inheritdoc SMARTHooks
    /// @notice Hook that is called after redeeming tokens
    /// @param owner The address that redeemed the tokens
    /// @param amount The amount of tokens that were redeemed
    function _afterRedeem(address owner, uint256 amount) internal virtual override(SMARTHooks) {
        // Chain to parent hooks first per convention
        super._afterRedeem(owner, amount);

        // Calculate payout amount deterministically (cheap math)
        uint256 denominationAssetAmount = _calculateDenominationAssetAmount(amount);

        // Effects: update redeemed accounting prior to external interaction
        uint256 currentRedeemed = bondRedeemed[owner];
        bondRedeemed[owner] = currentRedeemed + amount;

        // Interactions: transfer denomination asset to redeemer
        // Note: External ERC20 call occurs here; the `redeemFor` entrypoint is guarded with `nonReentrant`.
        _denominationAsset.safeTransfer(owner, denominationAssetAmount);

        // Emit custom bond redemption event (base Redeemed is emitted after this hook)
        emit BondRedeemed(_msgSender(), owner, amount, denominationAssetAmount);
    }

    /// @inheritdoc SMARTHooks
    /// @notice Hook that is called after minting tokens
    /// @param to The address that received the minted tokens
    /// @param amount The amount of tokens that were minted
    function _afterMint(address to, uint256 amount)
        internal
        virtual
        override(SMARTUpgradeable, SMARTHistoricalBalancesUpgradeable, SMARTHooks)
    {
        super._afterMint(to, amount);
    }

    /// @inheritdoc SMARTHooks
    /// @notice Hook that is called after transferring tokens
    /// @param from The address that transferred the tokens
    /// @param to The address that received the tokens
    /// @param amount The amount of tokens that were transferred
    function _afterTransfer(address from, address to, uint256 amount)
        internal
        virtual
        override(SMARTUpgradeable, SMARTHistoricalBalancesUpgradeable, SMARTHooks)
    {
        super._afterTransfer(from, to, amount);
    }

    /// @inheritdoc SMARTHooks
    /// @notice Hook that is called after burning tokens
    /// @param from The address whose tokens were burned
    /// @param amount The amount of tokens that were burned
    function _afterBurn(address from, uint256 amount)
        internal
        virtual
        override(SMARTUpgradeable, SMARTHistoricalBalancesUpgradeable, SMARTHooks)
    {
        super._afterBurn(from, amount);
    }

    /// @inheritdoc SMARTHooks
    /// @notice Hook that is called after recovering tokens from a lost wallet
    /// @param lostWallet The address of the wallet from which tokens were recovered
    /// @param newWallet The address of the wallet that received the recovered tokens
    function _afterRecoverTokens(address lostWallet, address newWallet)
        internal
        virtual
        override(SMARTCustodianUpgradeable, SMARTHooks)
    {
        super._afterRecoverTokens(lostWallet, newWallet);
    }

    // --- ISMARTRedeemable Implementation ---

    /// @notice Redeems `amount` of bond tokens from `owner`.
    /// @dev Guards the hook flow with `nonReentrant` because `_afterRedeem` transfers denomination assets.
    ///      Authorization policy: only the owner may redeem on their own behalf.
    /// @param owner The bond holder whose balance will decrease.
    /// @param amount The amount of tokens to redeem.
    /// @return success True if the redemption succeeded.
    function redeemFor(address owner, uint256 amount) external virtual override nonReentrant returns (bool success) {
        _smart_redeemFor(owner, amount);
        return true;
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

    // --- Internal Functions ---

    /// @notice Internal function that handles token transfers with pause and collateral checks
    /// @dev Overrides _update to ensure Pausable and Collateral checks are applied.
    /// @param from The address transferring tokens
    /// @param to The address receiving tokens
    /// @param value The amount of tokens being transferred
    function _update(address from, address to, uint256 value)
        internal
        virtual
        override(SMARTPausableUpgradeable, SMARTUpgradeable, ERC20Upgradeable)
    {
        // Calls chain: SMARTPausable -> ERC20Capped -> SMART -> ERC20
        super._update(from, to, value);
    }

    /// @notice Returns the address of the message sender
    /// @dev Resolves msgSender across Context and SMARTPausable.
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

    /// @notice Returns the complete calldata of the current transaction
    /// @dev Resolves msgData across Context and ERC2771Context.
    /// @return The complete calldata of the current transaction
    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return ERC2771ContextUpgradeable._msgData();
    }

    /// @notice Returns the length of the trusted forwarder address suffix in calldata
    /// @dev Hook defining the length of the trusted forwarder address suffix in `msg.data`.
    /// @return The length of the trusted forwarder address suffix
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
