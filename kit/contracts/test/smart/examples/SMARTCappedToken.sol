// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20, IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Interface imports
import { SMARTComplianceModuleParamPair } from
    "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";

// Core extensions
import { SMART } from "../../../contracts/smart/extensions/core/SMART.sol";
import { SMARTHooks } from "../../../contracts/smart/extensions/common/SMARTHooks.sol";

// Feature extensions
import { SMARTPausable } from "../../../contracts/smart/extensions/pausable/SMARTPausable.sol";
import { SMARTBurnable } from "../../../contracts/smart/extensions/burnable/SMARTBurnable.sol";
import { SMARTCustodian } from "../../../contracts/smart/extensions/custodian/SMARTCustodian.sol";
import { SMARTRedeemable } from "../../../contracts/smart/extensions/redeemable/SMARTRedeemable.sol";
import { SMARTCollateral } from "../../../contracts/smart/extensions/collateral/SMARTCollateral.sol";
import { SMARTHistoricalBalances } from
    "../../../contracts/smart/extensions/historical-balances/SMARTHistoricalBalances.sol";
import { SMARTTokenAccessManaged } from "../../../contracts/smart/extensions/access-managed/SMARTTokenAccessManaged.sol";
import { SMARTCapped } from "../../../contracts/smart/extensions/capped/SMARTCapped.sol";

/// @title SMARTCappedToken
/// @author SettleMint
/// @notice This contract extends SMARTToken with capped supply functionality for testing purposes.
/// @dev This is a test implementation that includes all SMART extensions plus the capped supply extension.

contract SMARTCappedToken is
    SMART,
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

    // Role constants (same as SMARTToken)
    bytes32 public constant TOKEN_ADMIN_ROLE = keccak256("TOKEN_ADMIN_ROLE");
    bytes32 public constant COMPLIANCE_ADMIN_ROLE = keccak256("COMPLIANCE_ADMIN_ROLE");
    bytes32 public constant VERIFICATION_ADMIN_ROLE = keccak256("VERIFICATION_ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");
    bytes32 public constant FORCED_TRANSFER_ROLE = keccak256("FORCED_TRANSFER_ROLE");
    bytes32 public constant RECOVERY_ROLE = keccak256("RECOVERY_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Constructor for the SMARTCappedToken.
    /// @dev Initializes the token with capped supply functionality.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param decimals_ The number of decimal places.
    /// @param onchainID_ The address of the OnchainID contract.
    /// @param identityRegistry_ The address of the Identity Registry contract.
    /// @param compliance_ The address of the main compliance contract.
    /// @param initialModulePairs_ Initial compliance modules configuration.
    /// @param collateralProofTopic_ Topic ID for collateral proof claims.
    /// @param accessManager_ The address of the AccessManager contract.
    /// @param cap_ The maximum total supply allowed for this token.
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address onchainID_,
        address identityRegistry_,
        address compliance_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_,
        uint256 collateralProofTopic_,
        address accessManager_,
        uint256 cap_
    )
        SMART(name_, symbol_, decimals_, onchainID_, identityRegistry_, compliance_, initialModulePairs_)
        SMARTTokenAccessManaged(accessManager_)
        SMARTCustodian()
        SMARTCollateral(collateralProofTopic_)
        SMARTPausable()
        SMARTBurnable()
        SMARTRedeemable()
        SMARTHistoricalBalances()
        SMARTCapped(cap_)
    { }

    // --- ISMART Implementation (same as SMARTToken) ---

    function setOnchainID(address _onchainID) external override onlyAccessManagerRole(TOKEN_ADMIN_ROLE) {
        _smart_setOnchainID(_onchainID);
    }

    function setIdentityRegistry(address _identityRegistry) external override onlyAccessManagerRole(TOKEN_ADMIN_ROLE) {
        _smart_setIdentityRegistry(_identityRegistry);
    }

    function setCompliance(address _compliance) external override onlyAccessManagerRole(COMPLIANCE_ADMIN_ROLE) {
        _smart_setCompliance(_compliance);
    }

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

    function mint(address _to, uint256 _amount) external override onlyAccessManagerRole(MINTER_ROLE) {
        _smart_mint(_to, _amount);
    }

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

    function transfer(address _to, uint256 _amount) public override(SMART, ERC20, IERC20) returns (bool) {
        return _smart_transfer(_to, _amount);
    }

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

    function removeComplianceModule(address _module) external override onlyAccessManagerRole(COMPLIANCE_ADMIN_ROLE) {
        _smart_removeComplianceModule(_module);
    }

    // --- ISMARTBurnable Implementation ---

    function burn(address userAddress, uint256 amount) external override onlyAccessManagerRole(BURNER_ROLE) {
        _smart_burn(userAddress, amount);
    }

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

    // --- ISMARTCustodian Implementation ---

    function setAddressFrozen(address userAddress, bool freeze) external override onlyAccessManagerRole(FREEZER_ROLE) {
        _smart_setAddressFrozen(userAddress, freeze);
    }

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

    function forcedRecoverTokens(
        address lostWallet,
        address newWallet
    )
        external
        override
        onlyAccessManagerRole(RECOVERY_ROLE)
    {
        _smart_recoverTokens(newWallet, lostWallet);
    }

    // --- ISMARTPausable Implementation ---

    function pause() external override onlyAccessManagerRole(PAUSER_ROLE) {
        _smart_pause();
    }

    function unpause() external override onlyAccessManagerRole(PAUSER_ROLE) {
        _smart_unpause();
    }

    // --- View Functions (Overrides) ---

    function name() public view virtual override(ERC20, IERC20Metadata) returns (string memory) {
        return super.name();
    }

    function symbol() public view virtual override(ERC20, IERC20Metadata) returns (string memory) {
        return super.symbol();
    }

    function decimals() public view virtual override(SMART, ERC20, IERC20Metadata) returns (uint8) {
        return super.decimals();
    }

    // --- Hooks ---

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

    function _beforeBurn(address from, uint256 amount) internal virtual override(SMARTCustodian, SMARTHooks) {
        super._beforeBurn(from, amount);
    }

    function _beforeRedeem(address owner, uint256 amount) internal virtual override(SMARTCustodian, SMARTHooks) {
        super._beforeRedeem(owner, amount);
    }

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

    function _update(address from, address to, uint256 value) internal virtual override(SMART, SMARTPausable, ERC20) {
        super._update(from, to, value);
    }

    function _msgSender() internal view virtual override(Context) returns (address) {
        return Context._msgSender();
    }
}
