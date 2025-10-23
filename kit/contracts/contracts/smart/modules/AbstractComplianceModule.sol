// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";

// Interface imports
import { ISMARTComplianceModule } from "../interface/ISMARTComplianceModule.sol";
import { ISMART } from "../interface/ISMART.sol";

/// @title Abstract Base for ATK Compliance Modules
/// @author SettleMint
/// @notice This abstract contract serves as a foundational building block for creating custom ATK compliance modules.
/// @dev It implements the `ISMARTComplianceModule` interface as a stateless, pure logic unit.
/// Key characteristics:
/// - **Abstract Functions**: Child contracts (concrete compliance modules) *must* implement `canTransfer`,
/// `validateParameters`, and `name`.
/// - **Hook Functions**: `transferred`, `created`, and `destroyed` are provided as empty virtual functions. Child
/// contracts can override these to react to token lifecycle events if needed.
/// - **Stateless Design**: Modules are pure logic units without internal state or access control.
/// - **ERC165 Support**: It correctly reports support for the `ISMARTComplianceModule` interface.
/// Developers should inherit from this contract to create specific compliance rule sets.
abstract contract AbstractComplianceModule is ERC2771Context, ISMARTComplianceModule {
    // --- Errors ---
    /// @notice Error thrown when a hook is called by an unauthorized contract
    /// @param caller The address that attempted the unauthorized call
    error UnauthorizedHookCaller(address caller);

    // --- Constructor ---
    /// @notice Constructor for the abstract compliance module.
    /// @dev When a contract inheriting from `AbstractComplianceModule` is deployed, this constructor is called.
    /// It initializes the ERC2771Context for meta-transaction support.
    /// As modules are now stateless logic units, no access control setup is needed.
    /// @param _trustedForwarder Address of the trusted forwarder for meta transactions
    constructor(address _trustedForwarder) ERC2771Context(_trustedForwarder) { }

    // --- Modifiers ---
    /// @dev Restricts hook invocations to either the `_token` itself or its configured compliance contract
    /// obtained via `ISMART(_token).compliance()` (see `ISMART.sol`).
    /// This ensures only the SMART token or its Compliance contract can trigger module hooks.
    modifier onlyTokenOrCompliance(address _token) {
        _onlyTokenOrCompliance(_token);
        _;
    }

    /// @notice Restricts hooks to the token or its compliance contract.
    /// @param _token SMART token invoking the hook.
    function _onlyTokenOrCompliance(address _token) internal view {
        if (msg.sender != _token) {
            address complianceAddress = address(ISMART(_token).compliance());
            if (msg.sender != complianceAddress) {
                revert UnauthorizedHookCaller(msg.sender);
            }
        }
    }

    // --- ISMARTComplianceModule State-Changing Hooks (Empty Virtual Implementations) ---

    /// @inheritdoc ISMARTComplianceModule
    /// @notice This function is a hook called by the main `ATKComplianceImplementation` contract *after* a token
    /// transfer has occurred.
    /// @dev This is an empty `virtual` implementation. Inheriting contracts can `override` this function
    /// if they need to perform actions or update state based on a successful transfer.
    /// For example, a module might log transfer details or update internal counters.
    /// If a module doesn't need to react to transfers, it doesn't need to override this.
    /// @param _token The address of the `ISMART` token contract that performed the transfer.
    /// @param _from The address from which tokens were transferred.
    /// @param _to The address to which tokens were transferred.
    /// @param _value The amount of tokens transferred.
    /// @param _params The parameters that were configured for this module when it was added to the `_token`.
    function transferred(
        address _token,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _params
    )
        external
        virtual
        override
        onlyTokenOrCompliance(_token)
    {  /* Default: Do nothing. Override in child contracts if needed. */
    }

    /// @inheritdoc ISMARTComplianceModule
    /// @notice This function is a hook called by the main `SMARTComplianceImplementation` contract *after* tokens have
    /// been destroyed (burned).
    /// @dev This is an empty `virtual` implementation. Inheriting contracts can `override` this function
    /// if they need to perform actions or update state based on successful token destruction.
    /// If a module doesn't need to react to token destruction, it doesn't need to override this.
    /// @param _token The address of the `ISMART` token contract from which tokens were destroyed.
    /// @param _from The address whose tokens were destroyed.
    /// @param _value The amount of tokens destroyed.
    /// @param _params The parameters that were configured for this module when it was added to the `_token`.
    function destroyed(
        address _token,
        address _from,
        uint256 _value,
        bytes calldata _params
    )
        external
        virtual
        override
        onlyTokenOrCompliance(_token)
    {  /* Default: Do nothing. Override in child contracts if needed. */
    }

    /// @inheritdoc ISMARTComplianceModule
    /// @notice This function is a hook called by the main `SMARTComplianceImplementation` contract *after* new tokens
    /// have been created (minted).
    /// @dev This is an empty `virtual` implementation. Inheriting contracts can `override` this function
    /// if they need to perform actions or update state based on successful token creation.
    /// If a module doesn't need to react to token creation, it doesn't need to override this.
    /// @param _token The address of the `ISMART` token contract where tokens were created.
    /// @param _to The address that received the newly created tokens.
    /// @param _value The amount of tokens created.
    /// @param _params The parameters that were configured for this module when it was added to the `_token`.
    function created(
        address _token,
        address _to,
        uint256 _value,
        bytes calldata _params
    )
        external
        virtual
        override
        onlyTokenOrCompliance(_token)
    {  /* Default: Do nothing. Override in child contracts if needed. */
    }

    // --- ERC165 Support ---

    /// @inheritdoc IERC165
    /// @notice Checks if the contract supports a given interface ID.
    /// @dev This function is part of the ERC165 standard, allowing other contracts to discover what interfaces this
    /// contract implements.
    /// It explicitly states that this module (and any inheriting contract) supports the `ISMARTComplianceModule`
    /// interface.
    /// @param interfaceId The interface identifier (bytes4) to check.
    /// @return `true` if the contract supports the `interfaceId`, `false` otherwise.
    function supportsInterface(bytes4 interfaceId) public pure virtual override(IERC165) returns (bool) {
        return interfaceId == type(ISMARTComplianceModule).interfaceId || interfaceId == type(IERC165).interfaceId;
    }

    // --- Abstract Functions (MUST be implemented by inheriting concrete compliance modules) ---

    /// @inheritdoc ISMARTComplianceModule
    /// @notice This is the primary compliance check function that concrete modules MUST implement.
    /// @dev It is called by the `SMARTComplianceImplementation` contract *before* a token transfer is attempted.
    /// The inheriting module's implementation of this function should contain the core logic to decide if a transfer is
    /// allowed or not based on its specific rules.
    /// - If the transfer IS allowed according to the module's rules, this function should simply return (do nothing).
    /// - If the transfer IS NOT allowed, this function MUST `revert` (e.g., `revert ComplianceCheckFailed("Reason");`).
    /// This function is a `view` function, meaning it should not modify state.
    /// @param _token The address of the `ISMART` token contract related to the proposed transfer.
    /// @param _from The address from which tokens would be transferred.
    /// @param _to The address to which tokens would be transferred.
    /// @param _value The amount of tokens proposed to be transferred.
    /// @param _params The ABI-encoded parameters that were configured for this specific module when it was added to the
    /// `_token`.
    ///                The module should decode and use these parameters as part of its compliance logic.
    function canTransfer(
        address _token,
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _params
    )
        external
        view
        virtual
        override;

    /// @inheritdoc ISMARTComplianceModule
    /// @notice Concrete compliance modules MUST implement this function to validate their specific parameters.
    /// @dev This function is called by the `SMARTComplianceImplementation` (via `_validateModuleAndParams`) when a
    /// module is being registered
    /// with a token or when checking if a module is valid.
    /// The implementation in the inheriting module should:
    /// 1. Attempt to decode `_params` according to the expected format for that module.
    /// 2. Validate the decoded parameters (e.g., check for valid ranges, correct array lengths, non-zero addresses
    /// etc.).
    /// - If the parameters ARE valid, this function should simply return.
    /// - If the parameters ARE NOT valid, this function MUST `revert` (e.g., `revert InvalidParameters("Reason");`).
    /// This function is a `view` function.
    /// @param _params The ABI-encoded parameters that need to be validated. The format is specific to each concrete
    /// module.
    function validateParameters(bytes calldata _params) external view virtual override;

    /// @inheritdoc ISMARTComplianceModule
    /// @notice Concrete compliance modules MUST implement this function to return a human-readable name for the module.
    /// @dev This function is used to identify the type or purpose of the compliance module. For example, "Country Allow
    /// List Module".
    /// It should be a `pure` function as the name is typically hardcoded and doesn't depend on state.
    /// @return A string representing the name of the compliance module.
    function name() external pure virtual override returns (string memory);

    // --- Internal Functions (Overrides for ERC2771Context) ---

    /// @dev Overrides the `_msgSender()` function from OpenZeppelin's `Context` and `ERC2771Context`.
    /// This ensures that in the context of a meta-transaction (via a trusted forwarder), `msg.sender` (and thus
    /// the return value of this function) correctly refers to the original user who signed the transaction,
    /// rather than the forwarder contract that relayed it.
    /// If not a meta-transaction, it behaves like the standard `msg.sender`.
    /// @notice Returns the sender of the transaction, accounting for meta transactions
    /// @return The address of the original transaction sender (user) or the direct caller
    function _msgSender() internal view override(ERC2771Context) returns (address) {
        return super._msgSender(); // Calls the ERC2771Context implementation.
    }

    /// @dev Overrides the `_msgData()` function from OpenZeppelin's `Context` and `ERC2771Context`.
    /// Similar to `_msgSender()`, this ensures that `msg.data` (and the return value of this function)
    /// refers to the original call data from the user in a meta-transaction context.
    /// If not a meta-transaction, it behaves like the standard `msg.data`.
    /// @notice Returns the call data of the transaction, accounting for meta transactions
    /// @return The original call data of the transaction
    function _msgData() internal view override(ERC2771Context) returns (bytes calldata) {
        return super._msgData(); // Calls the ERC2771Context implementation.
    }

    /// @dev Overrides `_contextSuffixLength` from OpenZeppelin's `ERC2771Context`.
    /// This function is part of the ERC2771 meta-transaction standard. It indicates the length of the suffix
    /// appended to the call data by a forwarder, which typically contains the original sender's address.
    /// The base `ERC2771Context` implementation handles this correctly.
    /// @notice Returns the length of the context suffix for meta transactions
    /// @return The length of the context suffix in the call data for meta-transactions
    function _contextSuffixLength() internal view override(ERC2771Context) returns (uint256) {
        return super._contextSuffixLength();
    }
}
