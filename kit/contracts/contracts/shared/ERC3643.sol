// SPDX-License-Identifier: FSL-1.1-MIT
// ERC20 implementation by OpenZeppelin 5.2.0
pragma solidity ^0.8.27;

import { IToken } from "@erc3643/contracts/token/IToken.sol";
import { IIdentity } from "@onchain-id/solidity/contracts/interface/IIdentity.sol";
import { IIdentityRegistry } from "@erc3643/contracts/registry/interface/IIdentityRegistry.sol";
import { IModularCompliance } from "@erc3643/contracts/compliance/modular/IModularCompliance.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { IERC3643Errors } from "./interfaces/IERC3643Errors.sol";
import { ERC2771Context } from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ERC3643 - Permissioned Token Standard Implementation
 * @dev Implementation of the ERC3643 token standard, which adds identity requirements
 * and compliance features to the standard ERC20 token. This token allows for freezing
 * tokens, forced transfers, and recovery of tokens for KYC/AML purposes.
 */
abstract contract ERC3643 is IToken, IERC3643Errors, IERC20Errors, ERC2771Context, AccessControl {
    using SafeERC20 for IERC20;

    // User token balances
    mapping(address account => uint256) internal _balances;
    // Token allowances mapping
    mapping(address account => mapping(address spender => uint256)) internal _allowances;
    // Amount of tokens frozen per user
    mapping(address user => uint256 amount) internal _frozenTokens;
    // Whether a user's account is completely frozen
    mapping(address user => bool) internal _frozen;
    // Total token supply
    uint256 internal _totalSupply;
    // Contract version, immutable
    string private constant _version = "1.0.0";
    // Token name
    string private _name;
    // Token symbol
    string private _symbol;
    // Token decimals, immutable (up to 18)
    uint8 private immutable _decimals;
    // Token onchain identity
    address private _onchainID;
    // Identity registry contract reference
    IIdentityRegistry internal _tokenIdentityRegistry;
    // Compliance contract reference
    IModularCompliance internal _tokenCompliance;
    // Pause state of the contract
    bool private _paused;

    // Role for minting/burning tokens and managing token supply
    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");
    // Role for managing user accounts (freezing/unfreezing)
    bytes32 public constant USER_MANAGEMENT_ROLE = keccak256("USER_MANAGEMENT_ROLE");
    // Role for auditing operations
    bytes32 public constant AUDIT_ROLE = keccak256("AUDIT_ROLE");

    /**
     * @dev Modifier to make a function callable only when the contract is not paused
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Event emitted when an underlying token is withdrawn from the contract
     * @param token Address of the token being withdrawn
     * @param to Address receiving the tokens
     * @param amount Amount of tokens withdrawn
     */
    event UnderlyingTokenWithdrawn(address token, address to, uint256 amount);

    /**
     * @notice Initializes the ERC3643 token contract
     * @dev Sets up the token with basic parameters and assigns initial roles
     * @param name_ Name of the token
     * @param symbol_ Symbol of the token
     * @param decimals_ Number of decimals (0-18)
     * @param onchainID_ Address of the token's onchain identity
     * @param paused_ Initial pause state of the contract
     * @param initialOwner Address of the initial contract owner/admin
     * @param forwarder Address of trusted forwarder for meta-transactions
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address onchainID_,
        bool paused_,
        address initialOwner,
        address forwarder
    )
        ERC2771Context(forwarder)
    {
        // Validate token parameters
        if (bytes(name_).length == 0) {
            revert ERC3643EmptyName();
        }
        if (bytes(symbol_).length == 0) {
            revert ERC3643EmptySymbol();
        }
        if (onchainID_ == address(0)) {
            revert ERC3643InvalidOnchainID(onchainID_);
        }
        if (decimals_ > 18) {
            revert ERC3643InvalidDecimals(decimals_);
        }

        // Initialize token parameters
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        _onchainID = onchainID_;
        _paused = paused_;
        emit UpdatedTokenInformation(_name, _symbol, _decimals, _version, _onchainID);

        // Setup initial roles
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(SUPPLY_MANAGEMENT_ROLE, initialOwner);
        _grantRole(USER_MANAGEMENT_ROLE, initialOwner);
        _grantRole(AUDIT_ROLE, initialOwner);
    }

    /**
     * @dev Returns the message sender taking into account meta-transactions
     * @return The address of the message sender
     */
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return super._msgSender();
    }

    /**
     * @dev Returns the message data taking into account meta-transactions
     * @return Message data as bytes
     */
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return super._msgData();
    }

    /**
     * @dev Returns the context suffix length for properly handling meta-transactions
     * @return Length of the context suffix
     */
    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return super._contextSuffixLength();
    }

    /**
     * @notice Returns the name of the token
     * @dev View function to get the token name
     * @return The name of the token as a string
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @notice Returns the symbol of the token
     * @dev View function to get the token symbol
     * @return The symbol of the token as a string
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @notice Set a new name for the token
     * @dev Updates the token name and emits an UpdatedTokenInformation event
     * @param name_ The new name to set (must not be empty)
     */
    function setName(string calldata name_) external virtual override onlyRole(DEFAULT_ADMIN_ROLE) {
        if (bytes(name_).length == 0) {
            revert ERC3643EmptyName();
        }
        _name = name_;
        emit UpdatedTokenInformation(_name, _symbol, _decimals, _version, _onchainID);
    }

    /**
     * @notice Set a new symbol for the token
     * @dev Updates the token symbol and emits an UpdatedTokenInformation event
     * @param symbol_ The new symbol to set (must not be empty)
     */
    function setSymbol(string calldata symbol_) external virtual override onlyRole(DEFAULT_ADMIN_ROLE) {
        if (bytes(symbol_).length == 0) {
            revert ERC3643EmptySymbol();
        }
        _symbol = symbol_;
        emit UpdatedTokenInformation(_name, _symbol, _decimals, _version, _onchainID);
    }

    /**
     * @notice Get the number of decimals used for token amounts
     * @dev Returns the immutable decimals value set at contract creation
     * @return The number of decimals as a uint8
     */
    function decimals() public view virtual returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Get the version of the token contract
     * @dev Returns the immutable version value set at contract creation
     * @return The version of the contract as a string
     */
    function version() public view virtual override returns (string memory) {
        return _version;
    }

    /**
     * @notice Get the onchain ID of the token
     * @dev Returns the current onchain ID
     * @return The onchain ID as an address
     */
    function onchainID() external view virtual override returns (address) {
        return _onchainID;
    }

    /**
     * @notice Set a new onchain ID for the token
     * @dev Updates the token's onchain ID and emits an UpdatedTokenInformation event
     * @param onchainID_ The new onchain ID to set (must not be zero address)
     */
    function setOnchainID(address onchainID_) external virtual override onlyRole(DEFAULT_ADMIN_ROLE) {
        if (onchainID_ == address(0)) {
            revert ERC3643InvalidOnchainID(onchainID_);
        }
        _onchainID = onchainID_;
        emit UpdatedTokenInformation(_name, _symbol, _decimals, _version, _onchainID);
    }

    /**
     * @notice Set the identity registry for this token
     * @dev Links this token to an identity registry contract for KYC/AML checks
     * @param _identityRegistry Address of the identity registry contract
     */
    function setIdentityRegistry(address _identityRegistry) external virtual override onlyRole(DEFAULT_ADMIN_ROLE) {
        _tokenIdentityRegistry = IIdentityRegistry(_identityRegistry);
        emit IdentityRegistryAdded(_identityRegistry);
    }

    /**
     * @notice Set the compliance contract for this token
     * @dev Links this token to a compliance contract for transfer rules
     * @param _compliance Address of the compliance contract
     */
    function setCompliance(address _compliance) external virtual override onlyRole(DEFAULT_ADMIN_ROLE) {
        // Unbind from current compliance if it exists
        if (address(_tokenCompliance) != address(0)) {
            _tokenCompliance.unbindToken(address(this));
        }
        // Set new compliance and bind token to it
        _tokenCompliance = IModularCompliance(_compliance);
        _tokenCompliance.bindToken(address(this));
        emit ComplianceAdded(_compliance);
    }

    /**
     * @notice Get the identity registry contract address
     * @dev External view function to access the linked identity registry
     * @return The identity registry contract interface
     */
    function identityRegistry() external view override returns (IIdentityRegistry) {
        return _tokenIdentityRegistry;
    }

    /**
     * @notice Get the compliance contract address
     * @dev External view function to access the linked compliance contract
     * @return The compliance contract interface
     */
    function compliance() external view override returns (IModularCompliance) {
        return _tokenCompliance;
    }

    /**
     * @dev Internal function to check if the contract is not paused
     * Reverts if the contract is paused
     */
    function _requireNotPaused() internal view virtual {
        if (paused()) {
            revert ERC3643EnforcedPause();
        }
    }

    /**
     * @dev Internal function to check if the contract is paused
     * Reverts if the contract is not paused
     */
    function _requirePaused() internal view virtual {
        if (!paused()) {
            revert ERC3643ExpectedPause();
        }
    }

    /**
     * @notice Pause the token contract
     * @dev Pauses all token transfers and operations, can only be called by admin
     */
    function pause() external virtual override onlyRole(DEFAULT_ADMIN_ROLE) {
        if (paused()) {
            revert ERC3643EnforcedPause();
        }
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @notice Unpause the token contract
     * @dev Unpauses token transfers and operations, can only be called by admin
     */
    function unpause() external virtual override onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!paused()) {
            revert ERC3643ExpectedPause();
        }
        _paused = false;
        emit Unpaused(_msgSender());
    }

    /**
     * @notice Check if the contract is paused
     * @dev Returns the current pause state
     * @return True if the contract is paused, false otherwise
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @notice Get the total supply of the token
     * @dev Returns the total token supply
     * @return The total amount of tokens
     */
    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    /**
     * @notice Get the token balance of an account
     * @dev Returns the token balance of a specific address
     * @param account Address to check balance for
     * @return The token balance of the specified address
     */
    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }

    /**
     * @notice Transfer tokens to a specified address
     * @dev Moves tokens from sender to recipient, requires the contract to not be paused
     * @param to Address to transfer tokens to
     * @param value Amount of tokens to transfer
     * @return True if the transfer was successful
     */
    function transfer(address to, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, value);
        return true;
    }

    /**
     * @notice Check the amount of tokens that an owner allowed to a spender
     * @dev Returns the remaining allowance of tokens for a spender
     * @param owner Address that owns the tokens
     * @param spender Address that can spend the tokens
     * @return Remaining number of tokens allowed to be spent
     */
    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @notice Approve a spender to spend tokens on behalf of the owner
     * @dev Sets the allowance for a spender, replacing any existing allowance
     * @param spender Address authorized to spend tokens
     * @param value Amount of tokens approved to spend
     * @return True if the approval was successful
     */
    function approve(address spender, uint256 value) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, value);
        return true;
    }

    /**
     * @notice Transfer tokens from one address to another
     * @dev Moves tokens between addresses using the allowance mechanism
     * @param from Address to transfer tokens from
     * @param to Address to transfer tokens to
     * @param value Amount of tokens to transfer
     * @return True if the transfer was successful
     */
    function transferFrom(address from, address to, uint256 value) public virtual returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transfer(from, to, value);
        return true;
    }

    /**
     * @dev Internal function to perform token transfers
     * @param from Address sending the tokens
     * @param to Address receiving the tokens
     * @param value Amount of tokens to transfer
     */
    function _transfer(address from, address to, uint256 value) internal {
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(from, to, value);
    }

    /**
     * @dev Internal function to update balances during transfer operations
     * Also checks if sender has sufficient unfrozen tokens
     * @param from Address sending tokens (or zero for minting)
     * @param to Address receiving tokens (or zero for burning)
     * @param value Amount of tokens to transfer
     */
    function _update(address from, address to, uint256 value) internal virtual whenNotPaused {
        if (from == address(0)) {
            // Minting new tokens
            // Overflow check required: The rest of the code assumes that totalSupply never overflows
            _totalSupply += value;
        } else {
            // Regular transfer - check balance
            uint256 fromBalance = _balances[from];
            if (fromBalance < value) {
                revert ERC20InsufficientBalance(from, fromBalance, value);
            }
            unchecked {
                // Overflow not possible: value <= fromBalance <= totalSupply.
                _balances[from] = fromBalance - value;
            }
        }

        if (to == address(0)) {
            // Burning tokens
            unchecked {
                // Overflow not possible: value <= totalSupply or value <= fromBalance <= totalSupply.
                _totalSupply -= value;
            }
        } else {
            // Regular transfer - update recipient balance
            unchecked {
                // Overflow not possible: balance + value is at most totalSupply, which we know fits into a uint256.
                _balances[to] += value;
            }
        }

        // Check if sender has enough unfrozen tokens for the transfer
        if (from != address(0) && (balanceOf(from) - _frozenTokens[from]) < value) {
            revert ERC3643InsufficientUnfrozenBalance(from);
        }

        emit Transfer(from, to, value);
    }

    /**
     * @dev Internal function to mint tokens
     * @param account Address receiving the minted tokens
     * @param value Amount of tokens to mint
     */
    function _mint(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(address(0), account, value);
    }

    /**
     * @dev Internal function to burn tokens
     * @param account Address to burn tokens from
     * @param value Amount of tokens to burn
     */
    function _burn(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        _update(account, address(0), value);
    }

    /**
     * @notice Mint new tokens and assign them to an address
     * @dev Creates new tokens and assigns them to the specified address
     * @param to Address to receive the minted tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external virtual override onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(address(0), to, amount);
    }

    /**
     * @notice Burn tokens from a specified address
     * @dev Destroys tokens from the specified address
     * @param user Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address user, uint256 amount) external virtual override onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        if (user == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        _update(user, address(0), amount);
    }

    /**
     * @notice Mint tokens to multiple addresses in a single transaction
     * @dev Batch minting of tokens to many addresses
     * @param tos Array of addresses to receive minted tokens
     * @param amounts Array of token amounts to mint for each address
     */
    function batchMint(
        address[] calldata tos,
        uint256[] calldata amounts
    )
        external
        virtual
        override
        onlyRole(SUPPLY_MANAGEMENT_ROLE)
    {
        for (uint256 i = 0; i < tos.length; i++) {
            if (tos[i] == address(0)) {
                revert ERC20InvalidReceiver(address(0));
            }
            _update(address(0), tos[i], amounts[i]);
        }
    }

    /**
     * @notice Burn tokens from multiple addresses in a single transaction
     * @dev Batch burning of tokens from many addresses
     * @param users Array of addresses to burn tokens from
     * @param amounts Array of token amounts to burn from each address
     */
    function batchBurn(
        address[] calldata users,
        uint256[] calldata amounts
    )
        external
        virtual
        override
        onlyRole(SUPPLY_MANAGEMENT_ROLE)
    {
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] == address(0)) {
                revert ERC20InvalidSender(address(0));
            }
            _update(users[i], address(0), amounts[i]);
        }
    }

    /**
     * @notice Transfer tokens to multiple addresses in a single transaction
     * @dev Batch transfer of tokens to many addresses
     * @param tos Array of addresses to receive transferred tokens
     * @param amounts Array of token amounts to transfer to each address
     */
    function batchTransfer(address[] calldata tos, uint256[] calldata amounts) external virtual {
        for (uint256 i = 0; i < tos.length; i++) {
            transfer(tos[i], amounts[i]);
        }
    }

    /**
     * @dev Internal function to approve a spender with event emission
     * @param owner Address that owns the tokens
     * @param spender Address authorized to spend tokens
     * @param value Amount of tokens approved to spend
     */
    function _approve(address owner, address spender, uint256 value) internal {
        _approve(owner, spender, value, true);
    }

    /**
     * @dev Internal function to approve a spender with optional event emission
     * @param owner Address that owns the tokens
     * @param spender Address authorized to spend tokens
     * @param value Amount of tokens approved to spend
     * @param emitEvent Whether to emit the Approval event
     */
    function _approve(address owner, address spender, uint256 value, bool emitEvent) internal virtual {
        if (owner == address(0)) {
            revert ERC20InvalidApprover(address(0));
        }
        if (spender == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }
        _allowances[owner][spender] = value;
        if (emitEvent) {
            emit Approval(owner, spender, value);
        }
    }

    /**
     * @dev Internal function to decrease the allowance of a spender
     * @param owner Address that owns the tokens
     * @param spender Address authorized to spend tokens
     * @param value Amount of tokens to spend
     */
    function _spendAllowance(address owner, address spender, uint256 value) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance < type(uint256).max) {
            // Only decrease allowance if it's not set to unlimited (max uint256)
            if (currentAllowance < value) {
                revert ERC20InsufficientAllowance(spender, currentAllowance, value);
            }
            unchecked {
                _approve(owner, spender, currentAllowance - value, false);
            }
        }
    }

    /**
     * @notice Returns the amount of frozen tokens for a specific user
     * @dev External view function to get frozen balance
     * @param user Address to check frozen tokens for
     * @return uint256 Amount of frozen tokens
     */
    function getFrozenTokens(address user) external view override returns (uint256) {
        return _frozenTokens[user];
    }

    /**
     * @notice Freeze a portion of a user's tokens
     * @dev Increases the frozen token count for a user, emits a TokensFrozen event
     * @param user Address whose tokens should be frozen
     * @param amount Amount of tokens to freeze
     */
    function freezePartialTokens(
        address user,
        uint256 amount
    )
        external
        virtual
        override
        onlyRole(USER_MANAGEMENT_ROLE)
    {
        if (_frozenTokens[user] + amount > balanceOf(user)) {
            revert ERC3643InsufficientUnfrozenBalance(user);
        }
        _frozenTokens[user] += amount;
        emit TokensFrozen(user, amount);
    }

    /**
     * @notice Unfreeze a portion of a user's tokens
     * @dev Decreases the frozen token count for a user, emits a TokensUnfrozen event
     * @param user Address whose tokens should be unfrozen
     * @param amount Amount of tokens to unfreeze
     */
    function unfreezePartialTokens(
        address user,
        uint256 amount
    )
        external
        virtual
        override
        onlyRole(USER_MANAGEMENT_ROLE)
    {
        if (_frozenTokens[user] < amount) {
            revert ERC3643InsufficientFrozenBalance(user);
        }
        _frozenTokens[user] -= amount;
        emit TokensUnfrozen(user, amount);
    }

    /**
     * @notice Set the frozen status for an address
     * @dev Changes the frozen status for a user, emits an AddressFrozen event
     * @param user Address to set frozen status for
     * @param freeze New frozen status (true = frozen, false = unfrozen)
     */
    function setAddressFrozen(address user, bool freeze) external virtual override onlyRole(USER_MANAGEMENT_ROLE) {
        if (_frozen[user] == freeze) {
            revert ERC3643AddressAlreadyFrozen(user);
        }
        _frozen[user] = freeze;
        emit AddressFrozen(user, freeze, _msgSender());
    }

    /**
     * @notice Batch function to set frozen status for multiple addresses
     * @dev Sets frozen status for each user in the arrays.
     * @param users Array of addresses to set frozen status for
     * @param freeze Array of frozen status values corresponding to each address
     */
    function batchSetAddressFrozen(
        address[] calldata users,
        bool[] calldata freeze
    )
        external
        virtual
        override
        onlyRole(USER_MANAGEMENT_ROLE)
    {
        for (uint256 i = 0; i < users.length; i++) {
            if (_frozen[users[i]] == freeze[i]) {
                revert ERC3643AddressAlreadyFrozen(users[i]);
            }
            _frozen[users[i]] = freeze[i];
            emit AddressFrozen(users[i], freeze[i], _msgSender());
        }
    }

    /**
     * @notice Batch function to freeze partial tokens for multiple addresses
     * @dev Freezes tokens for each user in the arrays.
     * @param users Array of addresses to freeze tokens for
     * @param amounts Array of token amounts to freeze for each address
     */
    function batchFreezePartialTokens(
        address[] calldata users,
        uint256[] calldata amounts
    )
        external
        virtual
        override
        onlyRole(USER_MANAGEMENT_ROLE)
    {
        for (uint256 i = 0; i < users.length; i++) {
            if (_frozenTokens[users[i]] + amounts[i] > balanceOf(users[i])) {
                revert ERC3643InsufficientUnfrozenBalance(users[i]);
            }
            _frozenTokens[users[i]] += amounts[i];
            emit TokensFrozen(users[i], amounts[i]);
        }
    }

    /**
     * @notice Batch function to unfreeze partial tokens for multiple addresses
     * @dev Unfreezes tokens for each user in the arrays.
     * @param users Array of addresses to unfreeze tokens for
     * @param amounts Array of token amounts to unfreeze for each address
     */
    function batchUnfreezePartialTokens(
        address[] calldata users,
        uint256[] calldata amounts
    )
        external
        virtual
        override
        onlyRole(USER_MANAGEMENT_ROLE)
    {
        for (uint256 i = 0; i < users.length; i++) {
            if (_frozenTokens[users[i]] < amounts[i]) {
                revert ERC3643InsufficientFrozenBalance(users[i]);
            }
            _frozenTokens[users[i]] -= amounts[i];
            emit TokensUnfrozen(users[i], amounts[i]);
        }
    }

    /**
     * @notice Recover tokens from a lost wallet to a new wallet
     * @dev Allows recovering tokens when access to a wallet is lost, requires onchain identity validation
     * @param lostWallet Address of the wallet that lost access
     * @param newWallet Address of the new wallet to recover tokens to
     * @param _investorOnchainID Address of the investor's identity contract
     * @return Boolean indicating success of the recovery
     */
    function recoveryAddress(
        address lostWallet,
        address newWallet,
        address _investorOnchainID
    )
        external
        virtual
        onlyRole(USER_MANAGEMENT_ROLE)
        returns (bool)
    {
        // Check if there are tokens to recover
        if (balanceOf(lostWallet) == 0) {
            revert ERC3643NoTokensToRecover(lostWallet);
        }

        // Verify the new wallet is linked to the investor's onchain identity
        IIdentity onchainID_ = IIdentity(_investorOnchainID);
        bytes32 _key = keccak256(abi.encode(newWallet));
        if (!onchainID_.keyHasPurpose(_key, 1)) {
            revert ERC3643RecoveryNotPossible();
        }

        // Record token balances before transfer
        uint256 investorTokens = balanceOf(lostWallet);
        uint256 frozenTokens = _frozenTokens[lostWallet];

        // Register identity for the new wallet
        _tokenIdentityRegistry.registerIdentity(
            newWallet, onchainID_, _tokenIdentityRegistry.investorCountry(lostWallet)
        );

        // Calculate free balance and unfreeze tokens if needed
        uint256 freeBalance = balanceOf(lostWallet) - (_frozenTokens[lostWallet]);
        if (investorTokens > freeBalance) {
            uint256 tokensToUnfreeze = investorTokens - (freeBalance);
            if (_frozenTokens[lostWallet] < tokensToUnfreeze) {
                revert ERC3643InsufficientFrozenBalance(lostWallet);
            }
            _frozenTokens[lostWallet] -= tokensToUnfreeze;
            emit TokensUnfrozen(lostWallet, tokensToUnfreeze);
        }

        // Transfer tokens to new wallet
        _transfer(lostWallet, newWallet, investorTokens);

        // Restore frozen tokens status on new wallet if needed
        if (frozenTokens > 0) {
            if (_frozenTokens[newWallet] + frozenTokens > balanceOf(newWallet)) {
                revert ERC3643InsufficientUnfrozenBalance(newWallet);
            }
            _frozenTokens[newWallet] += frozenTokens;
            emit TokensFrozen(newWallet, frozenTokens);
        }

        // Restore frozen address status if needed
        if (_frozen[lostWallet] == true) {
            if (_frozen[newWallet] == true) {
                revert ERC3643AddressAlreadyFrozen(newWallet);
            }
            _frozen[newWallet] = true;
            emit AddressFrozen(newWallet, true, _msgSender());
        }

        // Remove identity of lost wallet
        _tokenIdentityRegistry.deleteIdentity(lostWallet);
        emit RecoverySuccess(lostWallet, newWallet, _investorOnchainID);
        return true;
    }

    /**
     * @notice Force transfer tokens between addresses
     * @dev Allows privileged address to transfer tokens even when they're frozen
     * @param from Address to transfer tokens from
     * @param to Address to transfer tokens to
     * @param amount Amount of tokens to transfer
     * @return Boolean indicating success of the transfer
     */
    function forcedTransfer(
        address from,
        address to,
        uint256 amount
    )
        external
        virtual
        override
        onlyRole(USER_MANAGEMENT_ROLE)
        returns (bool)
    {
        // Unfreeze tokens if necessary to complete transfer
        if (amount <= balanceOf(from)) {
            uint256 freeBalance = balanceOf(from) - (_frozenTokens[from]);
            if (amount > freeBalance) {
                uint256 tokensToUnfreeze = amount - (freeBalance);
                if (_frozenTokens[from] < tokensToUnfreeze) {
                    revert ERC3643InsufficientFrozenBalance(from);
                }
                _frozenTokens[from] -= tokensToUnfreeze;
                emit TokensUnfrozen(from, tokensToUnfreeze);
            }
        }
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @notice Force transfer tokens between multiple address pairs
     * @dev Batch version of forcedTransfer
     * @param froms Array of addresses to transfer tokens from
     * @param tos Array of addresses to transfer tokens to
     * @param amounts Array of token amounts to transfer
     */
    function batchForcedTransfer(
        address[] calldata froms,
        address[] calldata tos,
        uint256[] calldata amounts
    )
        external
        virtual
        override
        onlyRole(USER_MANAGEMENT_ROLE)
    {
        for (uint256 i = 0; i < froms.length; i++) {
            // Unfreeze tokens if necessary to complete each transfer
            if (amounts[i] <= balanceOf(froms[i])) {
                uint256 freeBalance = balanceOf(froms[i]) - (_frozenTokens[froms[i]]);
                if (amounts[i] > freeBalance) {
                    uint256 tokensToUnfreeze = amounts[i] - (freeBalance);
                    if (_frozenTokens[froms[i]] < tokensToUnfreeze) {
                        revert ERC3643InsufficientFrozenBalance(froms[i]);
                    }
                    _frozenTokens[froms[i]] -= tokensToUnfreeze;
                    emit TokensUnfrozen(froms[i], tokensToUnfreeze);
                }
            }
            _transfer(froms[i], tos[i], amounts[i]);
        }
    }

    /**
     * @notice Check if an address is frozen
     * @dev Returns the frozen status of a user address
     * @param user Address to check frozen status for
     * @return Boolean indicating if the address is frozen
     */
    function isFrozen(address user) external view override returns (bool) {
        return _frozen[user];
    }

    /**
     * @notice Withdraw underlying ERC20 tokens that were accidentally sent to this contract
     * @dev Allows admin to recover tokens sent to this contract
     * @param token Address of the ERC20 token to withdraw
     * @param to Address to send the tokens to
     * @param amount Amount of tokens to withdraw
     */
    function withdrawUnderlyingToken(
        address token,
        address to,
        uint256 amount
    )
        external
        virtual
        onlyRole(SUPPLY_MANAGEMENT_ROLE)
    {
        // Validate parameters
        if (token == address(0)) {
            revert ERC3643InvalidToken(token);
        }
        if (to == address(0)) {
            revert ERC3643InvalidReceiver(to);
        }
        if (amount == 0) {
            return;
        }

        // Check if contract has enough tokens to withdraw
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance < amount) {
            revert ERC3643InsufficientTokenBalance(token, balance, amount);
        }

        // Safely transfer tokens
        IERC20(token).safeTransfer(to, amount);
        emit UnderlyingTokenWithdrawn(token, to, amount);
    }
}
