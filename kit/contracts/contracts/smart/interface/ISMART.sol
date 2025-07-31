// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

// SMART interfaces
import { ISMARTIdentityRegistry } from "./ISMARTIdentityRegistry.sol";
import { ISMARTCompliance } from "./ISMARTCompliance.sol";

// Structs
import { SMARTComplianceModuleParamPair } from "./structs/SMARTComplianceModuleParamPair.sol";

/// @title ISMART Token Interface
/// @author SettleMint
/// @notice This interface defines the comprehensive set of functions, events, and errors for a SMART token.
/// A SMART token extends standard ERC20 functionality (token transfers, balances) and ERC20Metadata (name, symbol,
/// decimals)
/// with advanced features for regulatory compliance and identity management.
/// @dev Key features encapsulated by this interface include:
/// - Standard ERC20 operations (transfer, approve, balanceOf, etc. - inherited).
/// - Token metadata (name, symbol, decimals - inherited).
/// - Integration with an Identity Registry (`ISMARTIdentityRegistry`) for verifying token holders.
/// - Integration with a main Compliance contract (`ISMARTCompliance`) to enforce transfer rules.
/// - Management of modular compliance rules through individual Compliance Modules.
/// - Configuration of required claim topics for identity verification.
/// - Functions for minting, batch minting, batch transfers, and recovering mistakenly sent ERC20 tokens.
/// - Events for all significant state changes and operations.
/// - Custom errors for specific failure conditions.
/// This interface is intended to be implemented by concrete SMART token contracts.
/// This interface extends IERC165 for interface detection support.
interface ISMART is IERC20, IERC20Metadata, IERC165 {
    // --- Custom Errors ---

    /// @notice Error indicating that the provided decimals value is invalid.
    /// @param decimals The invalid decimals value that was provided.
    /// @dev This error is typically reverted if `decimals` is greater than 18, which is a common upper limit.
    error InvalidDecimals(uint8 decimals);

    /// @notice Error indicating that a compliance module is being added but already exists.
    /// @param module The address of the duplicate compliance module.
    error DuplicateModule(address module);

    /// @notice Error indicating that a mint operation failed compliance checks.
    /// @dev This means the conditions required by the active compliance modules for minting were not met.
    error MintNotCompliant();

    /// @notice Error indicating that a transfer operation failed compliance checks.
    /// @dev This means the conditions required by the active compliance modules for transferring tokens were not met.
    error TransferNotCompliant();

    /// @notice Error indicating that an attempt was made to add a compliance module that is already registered.
    error ModuleAlreadyAdded();

    /// @notice Error indicating that a specified compliance module was not found.
    /// @dev This can occur when trying to remove or update parameters for a non-existent module.
    error ModuleNotFound();

    /// @notice Error indicating that the token balance is insufficient for an operation.
    /// @dev This typically occurs during token recovery if the contract holds less of the target token than the amount
    /// requested for recovery.
    error InsufficientTokenBalance();

    /// @notice Error: Array Length Mismatch in Batch Operation.
    /// @dev This error is typically triggered in functions that process multiple items in batches,
    ///      such as `batchBurn` or `batchTransfer`, when the input arrays (e.g., an array of addresses
    ///      and an array of corresponding amounts) do not have the same number of elements.
    ///      For example, if 3 addresses are provided but only 2 amounts, this error would be raised
    ///      because it's unclear how to map the amounts to the addresses.
    error LengthMismatch();

    /// @notice Error: Zero Address Not Allowed.
    /// @dev This error is used to indicate that an operation or initialization was attempted with the
    ///      zero address (`address(0)`), which is often an invalid or disallowed address in many contexts.
    ///      For example, setting a critical administrative role to the zero address, or transferring tokens
    ///      to the zero address (which can effectively burn them, but should be explicit if intended).
    error ZeroAddressNotAllowed();

    /// @notice Error indicating that the provided lost wallet is not marked as lost.
    /// @dev This can occur if the wallet is not associated with any lost identity.
    error InvalidLostWallet();

    /// @notice Error indicating that there are no tokens to recover.
    /// @dev This can occur if the contract holds no tokens to recover.
    error NoTokensToRecover();

    /// @notice Error indicating an attempt to recover the token contract's own tokens.
    /// @dev The `recoverERC20` function is designed to recover other ERC20 tokens mistakenly sent to this contract,
    ///      not the token this contract itself represents.
    error CannotRecoverSelf();

    // --- Events ---
    /// @notice Emitted when the address of the `ISMARTIdentityRegistry` contract, used by this token, is successfully
    /// updated.
    /// @dev This event signals a change in the system component responsible for managing and verifying user identities.
    /// @param sender The address of the account (e.g., admin) that initiated this configuration change.
    /// @param _identityRegistry The address of the newly configured `ISMARTIdentityRegistry` contract.
    event IdentityRegistryAdded(address indexed sender, address indexed _identityRegistry);

    /// @notice Emitted when the address of the main `ISMARTCompliance` contract, used by this token, is successfully
    /// updated.
    /// @dev This event indicates a change in the primary contract responsible for enforcing compliance rules on token
    /// transfers.
    /// @param sender The address of the account (e.g., admin) that initiated this configuration change.
    /// @param _compliance The address of the newly configured `ISMARTCompliance` contract.
    event ComplianceAdded(address indexed sender, address indexed _compliance);

    /// @notice Emitted when fundamental information about the token, such as its decimals or on-chain ID, is updated.
    /// @dev Note: While `name` and `symbol` are part of `IERC20Metadata`, their update mechanism isn't explicitly
    /// defined here,
    ///      but if updatable, would likely also trigger such an event. This event specifically calls out decimals and
    /// onchainID.
    /// @param sender The address of the account (e.g., admin) that initiated the update.
    /// @param _newDecimals The new number of decimal places the token uses. (Note: Changing decimals post-deployment is
    /// highly unusual and complex for ERC20 tokens).
    /// @param _newOnchainID The address of the new on-chain Identity contract representing the token itself (if
    /// applicable).
    event UpdatedTokenInformation(address indexed sender, uint8 indexed _newDecimals, address indexed _newOnchainID);

    /// @notice Emitted when a new compliance module is successfully added to the token's compliance framework.
    /// @dev Compliance modules implement specific rules (e.g., geographic restrictions, holding limits).
    /// @param sender The address of the account (e.g., admin) that added the module.
    /// @param _module The address of the newly added compliance module contract (which should implement
    /// `ISMARTComplianceModule`).
    /// @param _params The ABI-encoded configuration parameters initially set for this module instance on this token.
    event ComplianceModuleAdded(address indexed sender, address indexed _module, bytes _params);

    /// @notice Emitted when an existing compliance module is successfully removed from the token's compliance
    /// framework.
    /// @dev Removing a module means its rules will no longer be applied to token operations.
    /// @param sender The address of the account (e.g., admin) that removed the module.
    /// @param _module The address of the compliance module contract that was removed.
    event ComplianceModuleRemoved(address indexed sender, address indexed _module);

    /// @notice Emitted when the configuration parameters for an existing, active compliance module are successfully
    /// updated.
    /// @dev This allows tweaking the behavior of a module without removing and re-adding it.
    /// @param sender The address of the account (e.g., admin) that updated the parameters.
    /// @param _module The address of the compliance module whose parameters were updated.
    /// @param _params The new ABI-encoded configuration parameters for the module.
    event ModuleParametersUpdated(address indexed sender, address indexed _module, bytes _params);

    /// @notice Emitted after a token transfer operation (e.g., via `transfer` or `transferFrom`) has successfully
    /// completed,
    ///         passing all identity and compliance checks.
    /// @param sender The address that initiated the transfer action (could be the `from` address or an operator).
    /// @param from The address from which tokens were sent.
    /// @param to The address to which tokens were received.
    /// @param amount The quantity of tokens transferred.
    event TransferCompleted(address indexed sender, address indexed from, address indexed to, uint256 amount);

    /// @notice Emitted after a token minting operation has successfully completed, passing all relevant checks.
    /// @param sender The address of the account (e.g., minter role) that initiated the minting.
    /// @param to The address that received the newly minted tokens.
    /// @param amount The quantity of tokens minted.
    event MintCompleted(address indexed sender, address indexed to, uint256 indexed amount);

    /// @notice Emitted when tokens are recovered from a lost wallet to the caller's address.
    /// @param sender The address that initiated the recovery operation.
    /// @param lostWallet The address of the lost wallet containing tokens to recover.
    /// @param newWallet The address to which the tokens were recovered.
    /// @param amount The amount of tokens recovered.
    event TokensRecovered(
        address indexed sender, address indexed lostWallet, address indexed newWallet, uint256 amount
    );

    /// @notice Emitted when mistakenly sent ERC20 tokens are recovered from the contract.
    /// @param sender The address that initiated the recovery operation.
    /// @param token The address of the ERC20 token recovered.
    /// @param to The address to which the tokens were recovered.
    /// @param amount The amount of tokens recovered.
    event ERC20TokenRecovered(address indexed sender, address indexed token, address indexed to, uint256 amount);

    // --- Configuration Setters (Admin/Authorized) ---

    /// @notice Sets or updates the optional on-chain identifier (e.g., an `IIdentity` contract) associated with the
    /// token contract itself.
    /// @dev This can be used to represent the token issuer or the token itself as an on-chain entity.
    ///      Typically, this function is restricted to an administrative role.
    /// @param _onchainID The address of the on-chain ID contract. Pass `address(0)` to remove an existing ID.
    function setOnchainID(address _onchainID) external;

    /// @notice Sets or updates the address of the `ISMARTIdentityRegistry` contract used by this token.
    /// @dev The Identity Registry is responsible for managing associations between investor wallet addresses and their
    /// on-chain Identity contracts,
    ///      and for verifying identities against required claims.
    ///      Typically restricted to an administrative role. Emits `IdentityRegistryAdded`.
    /// @param _identityRegistry The address of the new `ISMARTIdentityRegistry` contract. Must not be `address(0)`.
    function setIdentityRegistry(address _identityRegistry) external;

    /// @notice Sets or updates the address of the main `ISMARTCompliance` contract used by this token.
    /// @dev The Compliance contract orchestrates checks across various compliance modules to determine transfer
    /// legality.
    ///      Typically restricted to an administrative role. Emits `ComplianceAdded`.
    /// @param _compliance The address of the new `ISMARTCompliance` contract. Must not be `address(0)`.
    function setCompliance(address _compliance) external;

    /// @notice Sets or updates the configuration parameters for a specific, already added compliance module.
    /// @dev This allows an administrator to change how a particular compliance rule behaves for this token.
    ///      The implementing contract (or the `ISMARTCompliance` contract) MUST validate these `_params` by calling
    ///      the module's `validateParameters(_params)` function before applying them.
    ///      Typically restricted to an administrative role. Emits `ModuleParametersUpdated`.
    /// @param _module The address of the compliance module (must be an active module for this token).
    /// @param _params The new ABI-encoded configuration parameters for the module.
    function setParametersForComplianceModule(address _module, bytes calldata _params) external;

    // --- Core Token Functions ---

    /// @notice Creates (mints) a specified `_amount` of new tokens and assigns them to the `_to` address.
    /// @dev This function is typically restricted to accounts with a specific minter role.
    ///      Implementations MUST perform identity verification and compliance checks on the `_to` address before
    /// minting.
    ///      Failure to meet these checks should result in a revert (e.g., with `RecipientNotVerified` or a compliance
    /// error).
    ///      Emits `MintCompleted` and the standard ERC20 `Transfer` event (from `address(0)` to `_to`).
    /// @param _to The address that will receive the newly minted tokens.
    /// @param _amount The quantity of tokens to mint.
    function mint(address _to, uint256 _amount) external;

    /// @notice Mints tokens to multiple recipient addresses in a single batch transaction.
    /// @dev This is an efficiency function to reduce transaction costs when minting to many users.
    ///      Typically restricted to accounts with a specific minter role.
    ///      Implementations MUST perform identity verification and compliance checks for *each* recipient in `_toList`.
    ///      If any recipient fails checks, the entire batch operation should revert to maintain atomicity.
    ///      Emits multiple `MintCompleted` and ERC20 `Transfer` events.
    /// @param _toList An array of addresses to receive the newly minted tokens.
    /// @param _amounts An array of corresponding token quantities to mint for each address in `_toList`. The lengths of
    /// `_toList` and `_amounts` MUST be equal.
    function batchMint(address[] calldata _toList, uint256[] calldata _amounts) external;

    /// @notice Transfers tokens from the caller to multiple recipient addresses in a single batch transaction.
    /// @dev This is an efficiency function, useful for distributions or airdrops (if compliant).
    ///      The caller (`msg.sender`) must have a sufficient balance to cover the sum of all `_amounts`.
    ///      Implementations MUST perform identity verification and compliance checks for *each* recipient in `_toList`
    ///      and also check the sender (`msg.sender`) if sender-side compliance rules apply.
    ///      If any part of the batch fails checks, the entire operation should revert.
    ///      Emits multiple `TransferCompleted` and ERC20 `Transfer` events.
    /// @param _toList An array of addresses to receive the tokens.
    /// @param _amounts An array of corresponding token quantities to transfer. The lengths of `_toList` and `_amounts`
    /// MUST be equal.
    function batchTransfer(address[] calldata _toList, uint256[] calldata _amounts) external;

    /// @notice Recovers SMART tokens from a lost wallet to the caller's address.
    /// @dev This will make it possible to recover SMART tokens from the lostWallet to msgSender, if it was correctly
    /// marked as lost in the identity registry.
    /// @param _lostWallet The address of the lost wallet containing tokens to recover.
    function recoverTokens(address _lostWallet) external;

    /// @notice Allows an authorized account to recover ERC20 tokens that were mistakenly sent to this SMART token
    /// contract's address.
    /// @dev This function is crucial for retrieving assets that are not the SMART token itself but are held by the
    /// contract.
    ///      Access to this function MUST be strictly controlled (e.g., via an `_authorizeRecoverERC20` internal hook or
    /// role).
    ///      It is critical that this function CANNOT be used to recover the SMART token itself, as that could drain the
    /// contract or interfere with its logic.
    ///      It should use a safe transfer mechanism (like OpenZeppelin's `SafeERC20.safeTransfer`) to prevent issues
    /// with non-standard ERC20 tokens.
    /// @param token The contract address of the ERC20 token to be recovered. This MUST NOT be `address(this)`.
    /// @param to The address where the recovered tokens will be sent.
    /// @param amount The quantity of the `token` to recover and send to `to`.
    function recoverERC20(address token, address to, uint256 amount) external;

    // --- Compliance Module Management & Validation (Admin/Authorized) ---

    /// @notice Adds a new compliance module contract to this token's compliance framework and sets its initial
    /// configuration parameters.
    /// @dev Before adding, the implementation (or the main `ISMARTCompliance` contract) MUST validate:
    ///      1. That `_module` is a valid contract address.
    ///      2. That `_module` correctly implements the `ISMARTComplianceModule` interface (e.g., via ERC165
    /// `supportsInterface`).
    ///      3. That the provided `_params` are valid for the `_module` (by calling
    /// `_module.validateParameters(_params)`).
    ///      Typically restricted to an administrative role. Emits `ComplianceModuleAdded`.
    /// @param _module The address of the compliance module contract to add.
    /// @param _params The initial ABI-encoded configuration parameters for this module specific to this token.
    function addComplianceModule(address _module, bytes calldata _params) external;

    /// @notice Removes an active compliance module from this token's compliance framework.
    /// @dev Once removed, the rules enforced by this `_module` will no longer apply to token operations.
    ///      Typically restricted to an administrative role. Emits `ComplianceModuleRemoved`.
    /// @param _module The address of the compliance module contract to remove.
    function removeComplianceModule(address _module) external;

    // --- Getters ---

    /// @notice Retrieves the optional on-chain identifier (e.g., an `IIdentity` contract) associated with the token
    /// contract itself.
    /// @dev This can represent the token issuer or the token entity.
    /// @return idAddress The address of the on-chain ID contract, or `address(0)` if no on-chain ID is set for the
    /// token.
    function onchainID() external view returns (address idAddress);

    /// @notice Retrieves the address of the `ISMARTIdentityRegistry` contract currently configured for this token.
    /// @dev The Identity Registry is used for verifying token holders against required claims and linking wallets to
    /// identities.
    /// @return registryContract The `ISMARTIdentityRegistry` contract instance currently in use.
    function identityRegistry() external view returns (ISMARTIdentityRegistry registryContract);

    /// @notice Retrieves the address of the main `ISMARTCompliance` contract currently configured for this token.
    /// @dev The Compliance contract is responsible for orchestrating compliance checks for token operations.
    /// @return complianceContract The `ISMARTCompliance` contract instance currently in use.
    function compliance() external view returns (ISMARTCompliance complianceContract);

    /// @notice Retrieves a list of all currently active compliance modules for this token, along with their
    /// configuration parameters.
    /// @dev Each element in the returned array is a `SMARTComplianceModuleParamPair` struct, containing the module's
    /// address
    ///      and its current ABI-encoded parameters specific to this token.
    /// @return modulesList An array of `SMARTComplianceModuleParamPair` structs.
    function complianceModules() external view returns (SMARTComplianceModuleParamPair[] memory modulesList);

    /// @notice Retrieves a list of all currently active interfaces for this token.
    /// @dev This function returns an array of bytes4 interface IDs that the token supports.
    /// @return interfacesList An array of bytes4 interface IDs.
    function registeredInterfaces() external view returns (bytes4[] memory interfacesList);
}
