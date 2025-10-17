// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ISMART } from "../../../interface/ISMART.sol";
import { ISMARTIdentityRegistry } from "../../../interface/ISMARTIdentityRegistry.sol";
import { ISMARTCompliance } from "../../../interface/ISMARTCompliance.sol";
import { SMARTComplianceModuleParamPair } from "../../../interface/structs/SMARTComplianceModuleParamPair.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { _SMARTExtension } from "../../common/_SMARTExtension.sol";

/// @title Internal Core Logic for SMART Tokens
/// @author SettleMint
/// @notice This abstract contract serves as the central repository for shared state, core
/// business logic,
///         event emissions, and authorization hook placeholders for all SMART token implementations.
///         It's designed to be inherited by both standard (`SMART.sol`) and upgradeable (`SMARTUpgradeable.sol`)
///         concrete token contracts, ensuring consistent behavior across different token types.
/// @dev An 'abstract contract' is like a blueprint; it defines structure and some behavior but cannot be deployed
///      on its own. It must be inherited by another contract that fills in any missing pieces (like the abstract
///      functions below). This contract manages key aspects like token decimals, on-chain identity,
///      connections to identity and compliance services, and lists of compliance modules.
///      It inherits from `_SMARTExtension`, which provides common functionalities like ERC165 interface
///      registration and the `_smartSender()` context utility.

abstract contract _SMARTLogic is _SMARTExtension {
    // -- Storage Variables --

    /// @notice Stores the number of decimal places the token uses. For example, if `__decimals` is 18,
    ///         1 token is represented as 1 * 10^18 base units.
    /// @dev This is a standard ERC20 concept. `internal` means it's accessible within this contract and
    ///      contracts that inherit from it.
    uint8 internal __decimals;

    /// @notice Stores the address of an optional on-chain identifier associated with this token.
    /// @dev This could be another contract or an Externally Owned Account (EOA) that provides
    ///      additional identity information or context for the token. `address(0)` usually means no ID is set.
    address internal __onchainID;

    /// @notice Stores a reference to the `ISMARTIdentityRegistry` contract.
    /// @dev This external contract is responsible for verifying the identities of token recipients.
    ///      SMART tokens interact with this registry to check if an address is authorized to receive tokens
    ///      based on specific claims (e.g., KYC verified).
    ISMARTIdentityRegistry internal __identityRegistry;

    /// @notice Stores a reference to the `ISMARTCompliance` contract.
    /// @dev This external contract, along with its associated compliance modules, enforces rules
    ///      on token transfers, mints, and burns to ensure regulatory or policy adherence.
    ISMARTCompliance internal __compliance;

    /// @notice Mapping to quickly check if a compliance module address exists and to find its index.
    /// @dev `mapping(address module => uint256 indexPlusOne)`: For a given module's `address`, this stores
    ///      its `index + 1` in the `__complianceModuleList` array. If the value is `0`, the module is not registered.
    ///      Using `index + 1` avoids ambiguity with the default value `0` for non-existent keys.
    ///      This provides an O(1) (constant time) lookup for module existence.
    mapping(address module => uint256 indexPlusOne) internal __moduleIndex;

    /// @notice Mapping to store the configuration parameters for each compliance module.
    /// @dev `mapping(address module => bytes parameters)`: For a given module's `address`, this stores its
    ///      custom configuration data as `bytes`. This data is passed to the module when it checks compliance.
    mapping(address module => bytes parameters) internal __moduleParameters;

    /// @notice An array holding the addresses of all active compliance modules.
    /// @dev This list is iterated through during compliance checks. The order might be significant
    ///      depending on the compliance logic.
    address[] internal __complianceModuleList;

    // -- Abstract Functions (Dependencies) --

    /// @notice Abstract function placeholder for the actual token minting mechanism.
    /// @dev This function doesn't contain logic itself; it's a declaration that concrete child contracts
    ///      (like `SMART.sol` or `SMARTUpgradeable.sol`) MUST implement. The implementation will typically
    ///      call the underlying ERC20 `_mint` function.
    ///      `internal virtual` means it's accessible by this contract and derived contracts, and it can be overridden.
    /// @param to The address to which tokens will be minted.
    /// @param amount The quantity of tokens to mint.
    function __smart_executeMint(address to, uint256 amount) internal virtual;

    /// @notice Abstract function placeholder for the actual token transfer mechanism.
    /// @dev Similar to `__smart_executeMint`, this is implemented by child contracts to call the
    ///      underlying ERC20 `_transfer` function.
    /// @param from The address from which tokens are sent.
    /// @param to The address to which tokens are sent.
    /// @param amount The quantity of tokens to transfer.
    function __smart_executeTransfer(address from, address to, uint256 amount) internal virtual;

    /// @notice Abstract function placeholder for the actual token balance retrieval mechanism.
    /// @dev This function is implemented by child contracts to call the underlying ERC20 `balanceOf` function.
    /// @param account The address to query the balance of.
    /// @return The balance of the specified account.
    function __smart_balanceOf(address account) internal virtual returns (uint256);

    // -- Internal Implementation for ISMART Interface Functions --

    /// @notice Internal function to perform the core mint operation.
    /// @dev This function is called after any authorization checks have passed. It executes the actual minting
    ///      via `__smart_executeMint` (which is implemented by the child contract) and then emits a `MintCompleted`
    /// event.
    ///      It uses `_smartSender()` (from `SMARTContext`) to get the initiator of the transaction.
    /// @param userAddress The address to mint tokens to.
    /// @param amount The amount of tokens to mint.
    function _smart_mint(address userAddress, uint256 amount) internal virtual {
        __smart_executeMint(userAddress, amount); // Delegate to child contract's mint logic
        emit MintCompleted(_smartSender(), userAddress, amount);
    }

    /// @notice Mints tokens to multiple addresses in a single transaction.
    /// @dev This function iterates through lists of recipients and amounts, calling `_smart_mint` for each pair.
    ///      It first checks if the lengths of the `toList` and `amounts` arrays match to prevent errors.
    ///      Each individual mint operation within the batch will still go through its own compliance and
    ///      verification checks triggered by `_smart_mint` (via hooks).
    ///      The `unchecked { ++i; }` block is a gas optimization for loop increments in Solidity 0.8+.
    /// @param toList An array of addresses to mint tokens to.
    /// @param amounts An array of token amounts to mint, corresponding to `toList`.
    function _smart_batchMint(address[] calldata toList, uint256[] calldata amounts) internal virtual {
        if (toList.length != amounts.length) revert LengthMismatch();
        uint256 length = toList.length;
        for (uint256 i = 0; i < length;) {
            _smart_mint(toList[i], amounts[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Internal function to perform a token transfer from the transaction sender.
    /// @dev This function is the core of a single token transfer. It gets the sender using `_smartSender()`,
    ///      then executes the transfer via `__smart_executeTransfer` (implemented by the child contract).
    ///      The `__smart_executeTransfer` will, in turn, trigger `_update` in the ERC20 contract, which then
    ///      calls `_beforeTransfer` and `_afterTransfer` hooks where SMART compliance/verification logic resides.
    /// @param to The address to transfer tokens to.
    /// @param amount The amount of tokens to transfer.
    /// @return bool Always returns `true` upon successful execution by the underlying `_transfer`.
    function _smart_transfer(address to, uint256 amount) internal virtual returns (bool) {
        address sender = _smartSender();
        __smart_executeTransfer(sender, to, amount); // Delegate to child contract's transfer logic
            // The actual success/failure is handled by the underlying ERC20 _transfer, which reverts on failure.
        return true;
    }

    /// @notice Transfers tokens from the transaction sender to multiple addresses.
    /// @dev Similar to `_smart_batchMint`, this iterates through `toList` and `amounts`, calling `_smart_transfer`
    ///      for each pair. It also checks for array length mismatches.
    /// @param toList An array of addresses to transfer tokens to.
    /// @param amounts An array of token amounts to transfer.
    function _smart_batchTransfer(address[] calldata toList, uint256[] calldata amounts) internal virtual {
        if (toList.length != amounts.length) revert LengthMismatch();

        uint256 length = toList.length;
        for (uint256 i = 0; i < length;) {
            _smart_transfer(toList[i], amounts[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Internal function to recover tokens from a lost wallet.
    /// @dev This function performs a series of checks and actions to ensure the recovery is valid and secure.
    ///      It first checks if the lost wallet is a valid address and not the contract itself.
    ///      Then, it checks if the lost wallet has any tokens to recover.
    ///      It then checks if the new wallet is a valid address.
    /// @param lostWallet The address of the wallet that has lost access to its tokens.
    /// @param newWallet The address of the wallet that will receive the recovered tokens.
    function _smart_recoverTokens(address lostWallet, address newWallet) internal {
        if (lostWallet == address(0)) revert ZeroAddressNotAllowed();
        if (lostWallet == address(this)) revert CannotRecoverSelf();

        uint256 balance = __smart_balanceOf(lostWallet);
        if (balance == 0) revert NoTokensToRecover();

        ISMARTIdentityRegistry registry = this.identityRegistry();

        // Check if the caller (newWallet) is the registered replacement for the lostWallet
        address recoveredWallet = registry.getRecoveredWallet(lostWallet);
        if (recoveredWallet != newWallet) revert InvalidLostWallet();

        // Additional check: ensure lostWallet is actually marked as lost
        if (!registry.isWalletLost(lostWallet)) revert InvalidLostWallet();

        _beforeRecoverTokens(lostWallet, newWallet);
        __isForcedUpdate = true;
        __smart_executeTransfer(lostWallet, newWallet, balance);
        __isForcedUpdate = false;
        _afterRecoverTokens(lostWallet, newWallet);

        emit ISMART.TokensRecovered(_smartSender(), lostWallet, newWallet, balance);
    }

    /// @notice Internal function to update the address of the compliance contract.
    /// @dev Reverts if the provided address is the zero address (`address(0)`), which is invalid.
    ///      Updates the `__compliance` state variable and emits a `ComplianceAdded` event.
    ///      (Note: Event name might be `ComplianceUpdated` in a future version for clarity).
    /// @param compliance_ The new address for the `ISMARTCompliance` contract.
    function _smart_setCompliance(address compliance_) internal virtual {
        if (compliance_ == address(0)) revert ZeroAddressNotAllowed();
        __compliance = ISMARTCompliance(compliance_);
        emit ComplianceAdded(_smartSender(), address(__compliance)); // Consider ComplianceSet or ComplianceUpdated
            // event
    }

    /// @notice Internal function to update the address of the identity registry contract.
    /// @dev Reverts if the provided address is the zero address. Updates `__identityRegistry`
    ///      and emits an `IdentityRegistryAdded` event.
    ///      (Note: Event name might be `IdentityRegistryUpdated` for clarity).
    /// @param identityRegistry_ The new address for the `ISMARTIdentityRegistry` contract.
    function _smart_setIdentityRegistry(address identityRegistry_) internal virtual {
        if (identityRegistry_ == address(0)) revert ZeroAddressNotAllowed();
        __identityRegistry = ISMARTIdentityRegistry(identityRegistry_);
        emit IdentityRegistryAdded(_smartSender(), address(__identityRegistry)); // Consider IdentityRegistrySet
    }

    /// @notice Internal function to update the on-chain ID address associated with the token.
    /// @dev Updates `__onchainID` and emits an `UpdatedTokenInformation` event.
    ///      The zero address is permissible if no on-chain ID is desired.
    /// @param onchainID_ The new on-chain ID address (can be `address(0)`).
    function _smart_setOnchainID(address onchainID_) internal virtual {
        __onchainID = onchainID_;
        emit UpdatedTokenInformation(_smartSender(), __decimals, __onchainID);
    }

    /// @notice Internal function to set or update the parameters for a specific compliance module.
    /// @dev First, it checks if the module exists using `__moduleIndex`; reverts with `ModuleNotFound` if not.
    ///      Then, it asks the main `__compliance` contract to validate the module and its new parameters using
    ///      `__compliance.isValidComplianceModule()`.
    ///      If valid, it updates `__moduleParameters` and emits `ModuleParametersUpdated`.
    /// @param _module The address of the compliance module whose parameters are to be set.
    /// @param _params The new `bytes` data containing the parameters for the module.
    function _smart_setParametersForComplianceModule(address _module, bytes calldata _params) internal virtual {
        if (__moduleIndex[_module] == 0) revert ModuleNotFound(); // Check existence
        __compliance.isValidComplianceModule(_module, _params); // Validate with main compliance contract
        __moduleParameters[_module] = _params;
        emit ModuleParametersUpdated(_smartSender(), _module, _params);
    }

    /// @notice Internal function to add a new compliance module to the token's active list.
    /// @dev It first validates the module and its parameters with `__compliance.isValidComplianceModule()`.
    ///      Then, it checks if the module is already added using `__moduleIndex`; reverts with `ModuleAlreadyAdded`
    /// if so.
    ///      If new and valid, it adds the module to `__complianceModuleList`, updates `__moduleIndex` and
    ///      `__moduleParameters`, and emits `ComplianceModuleAdded`.
    /// @param _module The address of the new compliance module to add.
    /// @param _params The initial `bytes` parameters for this module.
    function _smart_addComplianceModule(address _module, bytes calldata _params) internal virtual {
        __compliance.isValidComplianceModule(_module, _params);
        if (__moduleIndex[_module] != 0) revert ModuleAlreadyAdded(); // Check if already exists

        __complianceModuleList.push(_module);
        __moduleIndex[_module] = __complianceModuleList.length; // Store index + 1
        __moduleParameters[_module] = _params;

        emit ComplianceModuleAdded(_smartSender(), _module, _params);
    }

    /// @notice Internal function to remove an active compliance module.
    /// @dev Checks if the module exists using `__moduleIndex`; reverts with `ModuleNotFound` if not.
    ///      To remove the module efficiently from the `__complianceModuleList` array without leaving a gap
    ///      (which would be gas-inefficient to manage), it swaps the target module with the last module in the array,
    ///      updates the index of the moved module in `__moduleIndex`, and then pops the last element.
    ///      Finally, it deletes the module's entries from `__moduleIndex` and `__moduleParameters` and emits
    ///      `ComplianceModuleRemoved`.
    /// @param _module The address of the compliance module to remove.
    function _smart_removeComplianceModule(address _module) internal virtual {
        uint256 index = __moduleIndex[_module]; // This is index + 1
        if (index == 0) revert ModuleNotFound(); // Module doesn't exist

        uint256 listIndex = index - 1; // Actual array index
        uint256 lastIndex = __complianceModuleList.length - 1;

        if (listIndex != lastIndex) {
            // If it's not the last element, swap with the last element
            address lastModule = __complianceModuleList[lastIndex];
            __complianceModuleList[listIndex] = lastModule;
            __moduleIndex[lastModule] = listIndex + 1; // Update index of the element that was moved
        }
        __complianceModuleList.pop(); // Remove the last element (either the target or the one swapped into target's old
            // spot)

        delete __moduleIndex[_module]; // Clear the module's index
        delete __moduleParameters[_module]; // Clear the module's parameters

        emit ComplianceModuleRemoved(_smartSender(), _module);
    }

    /// @notice Internal function to recover ERC20 tokens mistakenly sent to this contract's address.
    /// @dev This function CANNOT be used to recover the contract's own tokens (i.e., `address(this)`).
    ///      It checks for zero addresses for `token` and `to`, and that `amount` is not zero.
    ///      It verifies that the contract has a sufficient balance of the `token` to be recovered.
    ///      Uses OpenZeppelin's `SafeERC20.safeTransfer` for a secure transfer.
    ///      Emits a `ERC20TokenRecovered` event.
    /// @param token The address of the ERC20 token to recover.
    /// @param to The address to send the recovered tokens to.
    /// @param amount The quantity of tokens to recover.
    function _smart_recoverERC20(address token, address to, uint256 amount) internal virtual {
        if (token == address(this)) revert CannotRecoverSelf(); // Cannot recover the contract's own token
        if (token == address(0)) revert ZeroAddressNotAllowed(); // Token address cannot be zero
        if (to == address(0)) revert ZeroAddressNotAllowed(); // Recipient address cannot be zero
        if (amount == 0) return; // No amount to recover

        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance < amount) revert InsufficientTokenBalance(); // Not enough tokens to recover

        SafeERC20.safeTransfer(IERC20(token), to, amount);
        emit ISMART.ERC20TokenRecovered(_smartSender(), token, to, amount);
    }

    // -- View Functions --

    /// @inheritdoc ISMART
    /// @notice Returns the on-chain ID address associated with this token.
    /// @return address The current on-chain ID address.
    function onchainID() public view virtual override returns (address) {
        return __onchainID;
    }

    /// @inheritdoc ISMART
    /// @notice Returns the `ISMARTIdentityRegistry` contract instance used by this token.
    /// @return ISMARTIdentityRegistry The current identity registry contract.
    function identityRegistry() external view virtual override returns (ISMARTIdentityRegistry) {
        return __identityRegistry;
    }

    /// @inheritdoc ISMART
    /// @notice Returns the `ISMARTCompliance` contract instance used by this token.
    /// @return ISMARTCompliance The current compliance contract.
    function compliance() external view virtual override returns (ISMARTCompliance) {
        return __compliance;
    }

    /// @inheritdoc ISMART
    /// @notice Returns a list of all active compliance modules and their current parameters.
    /// @dev Iterates through `__complianceModuleList` and constructs an array of `SMARTComplianceModuleParamPair`
    /// structs.
    /// @return SMARTComplianceModuleParamPair[] memory An array of module-parameter pairs.
    function complianceModules() external view virtual override returns (SMARTComplianceModuleParamPair[] memory) {
        uint256 length = __complianceModuleList.length;
        SMARTComplianceModuleParamPair[] memory pairs = new SMARTComplianceModuleParamPair[](length);

        for (uint256 i = 0; i < length;) {
            address module = __complianceModuleList[i];
            pairs[i] = SMARTComplianceModuleParamPair({ module: module, params: __moduleParameters[module] });
            unchecked {
                ++i;
            }
        }
        return pairs;
    }

    // -- Internal Setup Function --

    /// @notice Internal "unchained" initializer for core SMART state variables. Not subject to `onlyInitializing`
    /// modifier.
    /// @dev This function is designed to be called ONLY ONCE, either by the constructor of a standard (non-upgradeable)
    ///      SMART token or by the `initializer` function of an upgradeable SMART token. It sets up all critical
    ///      state like decimals, identity registry, compliance contract, required claims, and initial compliance
    /// modules.
    ///      It performs essential validation checks (e.g., non-zero addresses for registry/compliance, valid decimals).
    ///      It also validates and registers the `initialModulePairs` with the main compliance contract.
    ///      Various events are emitted to log the initial setup.
    ///      The parameters `name_` and `symbol_` are commented out as they are typically handled by the ERC20
    /// constructor/initializer in the inheriting contract.
    /// @param decimals_ The number of decimal places for the token (e.g., 18). Max 18 enforced.
    /// @param onchainID_ The optional on-chain identifier address for this token.
    /// @param identityRegistry_ The address of the `ISMARTIdentityRegistry` contract. Must not be zero.
    /// @param compliance_ The address of the `ISMARTCompliance` contract. Must not be zero.
    /// @param initialModulePairs_ An array of `SMARTComplianceModuleParamPair` structs, defining initial compliance
    /// modules and their parameters.
    function __SMART_init_unchained(
        // string memory name_, // Handled by ERC20 constructor/initializer
        // string memory symbol_, // Handled by ERC20 constructor/initializer
        uint8 decimals_,
        address onchainID_,
        address identityRegistry_,
        address compliance_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        internal
        virtual
    {
        if (compliance_ == address(0)) revert ZeroAddressNotAllowed();
        if (identityRegistry_ == address(0)) revert ZeroAddressNotAllowed();
        if (decimals_ > 18) revert InvalidDecimals(decimals_); // Common max for ERC20

        __decimals = decimals_;
        __onchainID = onchainID_;
        __identityRegistry = ISMARTIdentityRegistry(identityRegistry_);
        __compliance = ISMARTCompliance(compliance_);

        // Validate all initial modules with the main compliance contract first
        __compliance.areValidComplianceModules(initialModulePairs_);

        address sender = _smartSender(); // Get the initializing sender

        // Register initial modules and their parameters
        uint256 initialModulePairsLength = initialModulePairs_.length;
        address currentModule;
        bytes memory currentParams;
        for (uint256 i = 0; i < initialModulePairsLength;) {
            currentModule = initialModulePairs_[i].module;
            currentParams = initialModulePairs_[i].params;

            // This check should ideally be redundant if areValidComplianceModules is robust,
            // but good for defense-in-depth or if a module appears twice in initialModulePairs_.
            if (__moduleIndex[currentModule] != 0) revert DuplicateModule(currentModule);

            __complianceModuleList.push(currentModule);
            __moduleIndex[currentModule] = __complianceModuleList.length; // Store index + 1
            __moduleParameters[currentModule] = currentParams;
            emit ComplianceModuleAdded(sender, currentModule, currentParams);
            unchecked {
                ++i;
            }
        }

        // Emit events for initial setup
        emit IdentityRegistryAdded(sender, identityRegistry_);
        emit ComplianceAdded(sender, compliance_);
        emit UpdatedTokenInformation(sender, decimals_, onchainID_); // Includes initial decimals and onchainId
    }

    // -- Internal Hook Helper Functions --

    /// @notice Central dispatcher logic called *before* any token state change (mint, burn, transfer).
    /// @dev This function is typically invoked by the `_update` (or similar) function in the concrete
    ///      ERC20 implementation (e.g., `SMART.sol` or `SMARTUpgradeable.sol`). It determines if the operation
    ///      is a mint, burn, or regular transfer based on `from` and `to` addresses being `address(0)`,
    ///      and then calls the appropriate `_before<Action>` hook (e.g., `_beforeMint`, `_beforeBurn`,
    /// `_beforeTransfer`).
    ///      These `_before<Action>` hooks are part of the `SMARTHooks` system and will, in turn, call the
    ///      `__smart_before<Action>Logic` functions defined below.
    /// @param from The address sending tokens (or `address(0)` for a mint).
    /// @param to The address receiving tokens (or `address(0)` for a burn).
    /// @param amount The quantity of tokens involved.
    function __smart_beforeUpdateLogic(address from, address to, uint256 amount) internal virtual {
        if (from == address(0)) {
            // This is a mint operation
            _beforeMint(to, amount);
        } else if (to == address(0)) {
            // This is a burn operation
            _beforeBurn(from, amount);
        } else {
            // This is a regular transfer operation
            _beforeTransfer(from, to, amount);
        }
    }

    /// @notice Central dispatcher logic called *after* any token state change has occurred.
    /// @dev Similar to `__smart_beforeUpdateLogic`, this is invoked by the concrete ERC20 implementation's
    ///      `_update` function, after the core token ledger has been modified. It determines the operation
    ///      type and calls the corresponding `_after<Action>` hook from `SMARTHooks`.
    /// @param from The address that sent tokens (or `address(0)` for a mint).
    /// @param to The address that received tokens (or `address(0)` for a burn).
    /// @param amount The quantity of tokens involved.
    function __smart_afterUpdateLogic(address from, address to, uint256 amount) internal virtual {
        if (from == address(0)) {
            // Mint operation completed
            _afterMint(to, amount);
        } else if (to == address(0)) {
            // Burn operation completed
            _afterBurn(from, amount);
        } else {
            // Transfer operation completed
            _afterTransfer(from, to, amount);
        }
    }

    /// @notice Core logic executed *before* a mint operation, typically called by `_beforeMint` hook.
    /// @dev This is where pre-mint checks occur. If `__isForcedUpdate` (from `_SMARTExtension`) is `false` (normal
    /// operation):
    ///      2. It checks if the mint operation is allowed by the `__compliance` contract (and its modules)
    ///         by calling `canTransfer` with `from` as `address(0)`. Reverts with `MintNotCompliant` if not.
    ///      If `__isForcedUpdate` is `true`, these checks are skipped.
    /// @param to The address that will receive the minted tokens.
    /// @param amount The quantity of tokens to be minted.
    function __smart_beforeMintLogic(address to, uint256 amount) internal virtual {
        if (!__isForcedUpdate) {
            // Only perform checks if not a forced update
            if (!__compliance.canTransfer(address(this), address(0), to, amount)) revert MintNotCompliant();
        }
    }

    /// @notice Core logic executed *after* a mint operation, typically called by `_afterMint` hook.
    /// @dev This function notifies the `__compliance` contract that new tokens have been created by calling
    ///      its `created` function. This allows compliance modules to log or react to the supply change.
    /// @param to The address that received the minted tokens.
    /// @param amount The quantity of tokens that were minted.
    function __smart_afterMintLogic(address to, uint256 amount) internal virtual {
        // Notify the compliance contract about the newly created tokens
        __compliance.created(address(this), to, amount);
    }

    /// @notice Core logic executed *before* a transfer operation, typically called by `_beforeTransfer` hook.
    /// @dev Similar to `__smart_beforeMintLogic`, if `__isForcedUpdate` is `false`:
    ///      1. Verifies the recipient (`to`) with the `__identityRegistry`. Reverts with `RecipientNotVerified` if
    /// failed.
    ///      2. Checks if the transfer is allowed by the `__compliance` contract using `canTransfer`. Reverts with
    ///         `TransferNotCompliant` if failed.
    ///      Checks are skipped if `__isForcedUpdate` is `true`.
    /// @param from The address sending the tokens.
    /// @param to The address receiving the tokens.
    /// @param amount The quantity of tokens being transferred.
    function __smart_beforeTransferLogic(address from, address to, uint256 amount) internal virtual {
        if (!__isForcedUpdate) {
            // Only perform checks if not a forced update
            if (!__compliance.canTransfer(address(this), from, to, amount)) revert TransferNotCompliant();
        }
    }

    /// @notice Core logic executed *after* a transfer operation, typically called by `_afterTransfer` hook.
    /// @dev Emits a `TransferCompleted` event (note: standard ERC20 `Transfer` event is emitted by the base
    ///      ERC20 contract's `_update` or `_transfer` function).
    ///      Notifies the `__compliance` contract about the transfer by calling its `transferred` function.
    /// @param from The address that sent the tokens.
    /// @param to The address that received the tokens.
    /// @param amount The quantity of tokens that were transferred.
    function __smart_afterTransferLogic(address from, address to, uint256 amount) internal virtual {
        emit TransferCompleted(_smartSender(), from, to, amount);
        // Notify the compliance contract about the completed transfer
        __compliance.transferred(address(this), from, to, amount);
    }

    /// @notice Core logic executed *after* a burn operation, typically called by `_afterBurn` hook.
    /// @dev Notifies the `__compliance` contract that tokens have been destroyed by calling its `destroyed` function.
    ///      (Note: `BurnCompleted` event might be emitted here or in a burn-specific extension).
    /// @param from The address whose tokens were burned.
    /// @param amount The quantity of tokens that were burned.
    function __smart_afterBurnLogic(address from, uint256 amount) internal virtual {
        // Notify the compliance contract about the destroyed tokens
        __compliance.destroyed(address(this), from, amount);
    }

    /// @notice Internal function to check if a specific interface ID is supported, extending ERC165.
    /// @dev This function is part of the ERC165 introspection mechanism. It checks two things:
    ///      1. If the `interfaceId` was explicitly registered using `_registerInterface` (stored in
    ///         `_isInterfaceRegistered` mapping from `_SMARTExtension`).
    ///      2. If the `interfaceId` is that of `ISMART` itself (`type(ISMART).interfaceId`), which all
    ///         SMART tokens inherently support.
    ///      This function is typically called by the `supportsInterface` function in the concrete contract
    ///      (e.g., `SMART.sol`) which combines this logic with `super.supportsInterface` from OpenZeppelin's
    /// `ERC165.sol`.
    /// @param interfaceId The `bytes4` interface identifier to check.
    /// @return bool `true` if the interface is supported according to SMART logic, `false` otherwise.
    function __smart_supportsInterface(bytes4 interfaceId) internal view virtual returns (bool) {
        // Check if registered by an extension OR if it's the core ISMART interface.
        return _isInterfaceRegistered(interfaceId) || interfaceId == type(ISMART).interfaceId;
    }
}
