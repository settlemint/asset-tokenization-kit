// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC20Blocklist } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Blocklist.sol";
import { ERC20Custodian } from "@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Custodian.sol";
import { ERC20Votes } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import { Nonces } from "@openzeppelin/contracts/utils/Nonces.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Fund - A security token representing fund shares
/// @notice This contract implements a security token that represents fund shares with voting rights, blocklist,
/// and custodian features
/// @dev Inherits from OpenZeppelin contracts to provide comprehensive security token functionality with governance
/// capabilities
/// @custom:security-contact support@settlemint.com
contract Fund is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    AccessControl,
    ERC20Permit,
    ERC20Blocklist,
    ERC20Custodian,
    ERC20Votes
{
    using Math for uint256;
    using SafeERC20 for IERC20;

    bytes32 public constant SUPPLY_MANAGEMENT_ROLE = keccak256("SUPPLY_MANAGEMENT_ROLE");
    bytes32 public constant USER_MANAGEMENT_ROLE = keccak256("USER_MANAGEMENT_ROLE");

    uint256 public constant MIN_INVESTMENT = 100 ether; // Minimum investment amount
    uint256 public constant MAX_INVESTMENT = 10_000_000 ether; // Maximum investment amount
    uint256 public constant MIN_FEE_INTERVAL = 1 days; // Minimum time between fee collections
    uint256 public constant REDEMPTION_COOLDOWN = 7 days; // Cooldown period for redemptions
    uint256 public constant SLIPPAGE_TOLERANCE = 100; // 1% slippage tolerance for NAV-based operations

    error InvalidDecimals(uint8 decimals);
    error InvalidISIN();
    error OutsideSubscriptionWindow();
    error OutsideRedemptionWindow();
    error InvalidNAV();
    error InsufficientLiquidity();
    error InsufficientCooldown();
    error InvestmentTooSmall();
    error InvestmentTooLarge();
    error SlippageExceeded();
    error TooFrequentFeeCollection();
    error BatchOperationFailed(uint256 index);
    error InvalidBatchInput();
    error TokenTransferFailed();
    error InvalidTokenAddress();
    error InsufficientTokenBalance();

    /// @notice The number of decimals used for token amounts
    uint8 private immutable _decimals;

    /// @notice The ISIN (International Securities Identification Number) of the fund
    bytes12 private immutable _isin;

    /// @notice The class of the fund (e.g., "Hedge Fund", "Mutual Fund")
    bytes32 private _fundClass;

    /// @notice The category of the fund (e.g., "Long/Short Equity", "Global Macro")
    bytes32 private _fundCategory;

    // Fund management state variables
    uint256 private _nav; // Current NAV in base units
    uint256 private _subscriptionWindowStart; // Start of subscription window
    uint256 private _subscriptionWindowEnd; // End of subscription window
    uint256 private _redemptionWindowStart; // Start of redemption window
    uint256 private _redemptionWindowEnd; // End of redemption window
    bool private _openEndedFund; // Whether the fund is open-ended

    // Fee management state variables
    uint256 private immutable _managementFeeBps; // Management fee in basis points
    uint256 private immutable _hurdleRateBps; // Hurdle rate in basis points
    uint256 private _lastFeeCollection; // Timestamp of last fee collection
    uint256 private _highWaterMark; // Highest historical NAV per share in base units

    // Investor state tracking
    mapping(address => uint256) private _lastInvestmentTime; // Last investment timestamp per investor

    // Additional events for fund management
    event NAVUpdated(uint256 oldNAV, uint256 newNAV, uint256 timestamp);
    event SubscriptionWindowSet(uint256 start, uint256 end);
    event RedemptionWindowSet(uint256 start, uint256 end);
    event FundTypeUpdated(string fundClass, string fundCategory);
    event InvestmentReceived(address indexed investor, uint256 amount, uint256 shares, uint256 navPerShare);
    event RedemptionProcessed(address indexed investor, uint256 shares, uint256 amount, uint256 navPerShare);
    event ManagementFeeCollected(uint256 amount, uint256 timestamp, uint256 navPerShare);
    event PerformanceFeeCollected(uint256 amount, uint256 timestamp, uint256 navPerShare);
    event HighWaterMarkUpdated(uint256 oldValue, uint256 newValue);
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);
    event BatchTokenWithdrawn(address[] tokens, address[] recipients, uint256[] amounts);

    /// @notice Constructor
    /// @param name The token name
    /// @param symbol The token symbol
    /// @param decimals_ The number of decimals for the token
    /// @param initialOwner The address that will receive admin rights
    /// @param isin_ The ISIN (International Securities Identification Number) of the fund
    /// @param managementFeeBps_ The management fee in basis points
    /// @param hurdleRateBps_ The hurdle rate in basis points
    /// @param fundClass_ The class of the fund
    /// @param fundCategory_ The category of the fund
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        address initialOwner,
        string memory isin_,
        uint256 managementFeeBps_,
        uint256 hurdleRateBps_,
        string memory fundClass_,
        string memory fundCategory_
    )
        ERC20(name, symbol)
        ERC20Permit(name)
    {
        if (decimals_ > 18) revert InvalidDecimals(decimals_);
        if (bytes(isin_).length != 12) revert InvalidISIN();
        require(managementFeeBps_ <= 1000, "Management fee too high"); // Max 10%
        require(hurdleRateBps_ <= 5000, "Hurdle rate too high"); // Max 50%

        _decimals = decimals_;
        _isin = bytes12(bytes(isin_));
        _managementFeeBps = managementFeeBps_;
        _hurdleRateBps = hurdleRateBps_;
        _fundClass = bytes32(bytes(fundClass_));
        _fundCategory = bytes32(bytes(fundCategory_));
        _lastFeeCollection = block.timestamp;
        _highWaterMark = 0;
        _nav = 0;
        _openEndedFund = true;

        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(SUPPLY_MANAGEMENT_ROLE, initialOwner);
        _grantRole(USER_MANAGEMENT_ROLE, initialOwner);
    }

    /// @notice Returns the fund class
    function fundClass() public view returns (string memory) {
        return _stripNullBytes(_fundClass);
    }

    /// @notice Returns the fund category
    function fundCategory() public view returns (string memory) {
        return _stripNullBytes(_fundCategory);
    }

    /// @notice Returns the ISIN
    function isin() public view returns (string memory) {
        return string(abi.encodePacked(_isin));
    }

    /// @dev Helper function to strip null bytes from a bytes32 value
    /// @param value The bytes32 value to strip null bytes from
    /// @return The string with null bytes removed
    function _stripNullBytes(bytes32 value) internal pure returns (string memory) {
        uint256 i;
        for (i = 0; i < 32 && value[i] != 0; i++) { }
        bytes memory bytesArray = new bytes(i);
        for (uint256 j = 0; j < i; j++) {
            bytesArray[j] = value[j];
        }
        return string(bytesArray);
    }

    /// @notice Pauses all token transfers
    /// @dev Only callable by the admin. Emits a Paused event from ERC20Pausable
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpauses token transfers
    /// @dev Only callable by the admin. Emits an Unpaused event from ERC20Pausable
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /// @notice Creates new tokens and assigns them to an address
    /// @dev Only callable by addresses with SUPPLY_MANAGEMENT_ROLE role. Emits a Transfer event from ERC20
    /// @param to The address that will receive the minted tokens
    /// @param amount The quantity of tokens to create in base units
    function mint(address to, uint256 amount) public onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        _mint(to, amount);
    }

    /// @notice Returns the current block timestamp for voting snapshots
    /// @dev Implementation of ERC20Votes clock method for voting delay and period calculations
    /// @return Current block timestamp cast to uint48
    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    /// @notice Returns the description of the clock mode for voting snapshots
    /// @dev Implementation of ERC20Votes CLOCK_MODE method as required by EIP-6372
    /// @return String indicating timestamp-based clock mode
    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }

    /// @notice Get the current nonce for an address
    /// @dev Required override to resolve ambiguity between ERC20Permit and Nonces
    /// @param owner The address to get the nonce for
    /// @return The current nonce used for permits and other signed approvals
    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    /// @notice Checks if an address is a custodian
    /// @dev Only addresses with admin role are considered custodians for custodial operations
    /// @param user The address to check
    /// @return True if the address has the admin role, false otherwise
    function _isCustodian(address user) internal view override returns (bool) {
        return hasRole(USER_MANAGEMENT_ROLE, user);
    }

    /// @dev Blocks a user from token operations
    /// @param user Address to block
    /// @return True if user was not previously blocked
    function blockUser(address user) public onlyRole(USER_MANAGEMENT_ROLE) returns (bool) {
        return super._blockUser(user);
    }

    /// @dev Unblocks a user from token operations
    /// @param user Address to unblock
    /// @return True if user was previously blocked
    function unblockUser(address user) public onlyRole(USER_MANAGEMENT_ROLE) returns (bool) {
        return super._unblockUser(user);
    }

    /// @dev Unfreezes all tokens for a user
    /// @param user Address to unfreeze tokens for
    /// @param amount Amount of tokens to unfreeze
    function unfreeze(address user, uint256 amount) public onlyRole(USER_MANAGEMENT_ROLE) {
        _frozen[user] = _frozen[user] - amount;
        emit TokensUnfrozen(user, amount);
    }

    /// @notice Approves spending of tokens
    /// @dev Overrides both ERC20 and ERC20Blocklist to enforce blocklist restrictions
    /// @param owner The token owner
    /// @param spender The approved spender
    /// @param value The approved amount in base units
    /// @param emitEvent Whether to emit an Approval event
    function _approve(
        address owner,
        address spender,
        uint256 value,
        bool emitEvent
    )
        internal
        override(ERC20, ERC20Blocklist)
    {
        super._approve(owner, spender, value, emitEvent);
    }

    /// @notice Updates token balances during transfers
    /// @dev Handles balance updates while enforcing pausable, blocklist, custodian and voting power rules
    /// @param from The sender address
    /// @param to The recipient address
    /// @param value The amount being transferred in base units
    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        override(ERC20, ERC20Pausable, ERC20Blocklist, ERC20Custodian, ERC20Votes)
    {
        super._update(from, to, value);
    }

    /// @notice Updates the fund's NAV with slippage protection
    /// @param newNAV The new NAV value in base units
    /// @param maxSlippageBps Maximum allowed slippage in basis points
    function updateNAV(uint256 newNAV, uint256 maxSlippageBps) public onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        if (newNAV == 0) revert InvalidNAV();

        // Check slippage if there's a previous NAV
        if (_nav != 0) {
            uint256 slippageBps =
                _nav > newNAV ? (((_nav - newNAV) * 10_000) / _nav) : ((newNAV - _nav) * 10_000) / _nav;

            if (slippageBps > maxSlippageBps) revert SlippageExceeded();
        }

        emit NAVUpdated(_nav, newNAV, block.timestamp);
        _nav = newNAV;

        if (_highWaterMark == 0) {
            _highWaterMark = newNAV;
        }
    }

    /// @notice Processes an investment with minimum and maximum limits
    /// @param investor The address investing in the fund
    /// @param amount The amount being invested in base units
    function processInvestment(address investor, uint256 amount) public onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        if (amount < MIN_INVESTMENT) revert InvestmentTooSmall();
        if (amount > MAX_INVESTMENT) revert InvestmentTooLarge();
        if (!_openEndedFund) {
            if (block.timestamp < _subscriptionWindowStart || block.timestamp > _subscriptionWindowEnd) {
                revert OutsideSubscriptionWindow();
            }
        }
        if (_nav == 0) revert InvalidNAV();

        uint256 shares = Math.mulDiv(amount, 10 ** decimals(), _nav);
        _mint(investor, shares);
        _lastInvestmentTime[investor] = block.timestamp;

        emit InvestmentReceived(investor, amount, shares, _nav);
    }

    /// @notice Processes a redemption with cooldown period
    /// @param investor The address redeeming from the fund
    /// @param shares The number of shares to redeem
    /// @return amount The amount to be returned to the investor
    function processRedemption(
        address investor,
        uint256 shares
    )
        public
        onlyRole(SUPPLY_MANAGEMENT_ROLE)
        returns (uint256 amount)
    {
        if (block.timestamp < _lastInvestmentTime[investor] + REDEMPTION_COOLDOWN) {
            revert InsufficientCooldown();
        }
        if (!_openEndedFund) {
            if (block.timestamp < _redemptionWindowStart || block.timestamp > _redemptionWindowEnd) {
                revert OutsideRedemptionWindow();
            }
        }
        if (_nav == 0) revert InvalidNAV();

        amount = Math.mulDiv(shares, _nav, 10 ** decimals());
        _burn(investor, shares);

        emit RedemptionProcessed(investor, shares, amount, _nav);
        return amount;
    }

    /// @notice Collects management fee with minimum interval check
    function collectManagementFee() public onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        if (block.timestamp < _lastFeeCollection + MIN_FEE_INTERVAL) {
            revert TooFrequentFeeCollection();
        }

        uint256 timeElapsed = block.timestamp - _lastFeeCollection;
        uint256 aum = Math.mulDiv(totalSupply(), _nav, 10 ** decimals());

        // Calculate fee: (AUM * fee_rate * time_elapsed) / (100% * 1 year)
        // Rearranged to minimize precision loss
        uint256 fee = Math.mulDiv(Math.mulDiv(aum, _managementFeeBps, 10_000), timeElapsed, 365 days);

        if (fee > 0) {
            uint256 shares = Math.mulDiv(fee, 10 ** decimals(), _nav);
            _mint(msg.sender, shares);
            emit ManagementFeeCollected(fee, block.timestamp, _nav);
        }

        _lastFeeCollection = block.timestamp;
        return fee;
    }

    /// @notice Collects performance fee with high water mark
    function collectPerformanceFee() public onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        if (totalSupply() == 0) return 0;

        if (_nav <= _highWaterMark) return 0;

        uint256 hurdleAmount = (_highWaterMark * _hurdleRateBps) / 10_000;
        uint256 hurdleNav = _highWaterMark + hurdleAmount;

        if (_nav <= hurdleNav) return 0;

        uint256 excessReturn = _nav - hurdleNav;
        uint256 fee = (excessReturn * 2000) / 10_000; // 20% performance fee

        if (fee > 0) {
            uint256 shares = Math.mulDiv(fee, 10 ** decimals(), _nav);
            _mint(msg.sender, shares);
            emit PerformanceFeeCollected(fee, block.timestamp, _nav);
            _highWaterMark = _nav;
        }

        return fee;
    }

    /// @notice Updates the fund type
    /// @dev Only callable by admin
    /// @param newFundClass The new fund class
    /// @param newFundCategory The new fund category
    function updateFundType(
        string memory newFundClass,
        string memory newFundCategory
    )
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _fundClass = bytes32(bytes(newFundClass));
        _fundCategory = bytes32(bytes(newFundCategory));
        emit FundTypeUpdated(newFundClass, newFundCategory);
    }

    /// @notice Sets whether the fund is open-ended
    /// @dev Only callable by admin
    /// @param openEnded Whether the fund should be open-ended
    function setOpenEnded(bool openEnded) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _openEndedFund = openEnded;
    }

    /// @notice Checks if the fund is open-ended
    /// @return Whether the fund is open-ended
    function isOpenEnded() public view returns (bool) {
        return _openEndedFund;
    }

    /// @notice Sets the subscription window for the fund
    /// @dev Only callable by admin
    /// @param start Start timestamp of the window
    /// @param end End timestamp of the window
    function setSubscriptionWindow(uint256 start, uint256 end) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(start < end, "Invalid window");
        _subscriptionWindowStart = start;
        _subscriptionWindowEnd = end;
        emit SubscriptionWindowSet(start, end);
    }

    /// @notice Sets the redemption window for the fund
    /// @dev Only callable by admin
    /// @param start Start timestamp of the window
    /// @param end End timestamp of the window
    function setRedemptionWindow(uint256 start, uint256 end) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(start < end, "Invalid window");
        _redemptionWindowStart = start;
        _redemptionWindowEnd = end;
        emit RedemptionWindowSet(start, end);
    }

    /// @notice Gets the current NAV
    /// @return The current NAV in base units
    function currentNAV() public view returns (uint256) {
        return _nav;
    }

    /// @notice Gets the subscription window settings
    /// @return start The start timestamp of the subscription window
    /// @return end The end timestamp of the subscription window
    function subscriptionWindow() public view returns (uint256 start, uint256 end) {
        return (_subscriptionWindowStart, _subscriptionWindowEnd);
    }

    /// @notice Gets the redemption window settings
    /// @return start The start timestamp of the redemption window
    /// @return end The end timestamp of the redemption window
    function redemptionWindow() public view returns (uint256 start, uint256 end) {
        return (_redemptionWindowStart, _redemptionWindowEnd);
    }

    /// @notice Processes multiple investments in a single transaction
    /// @param investors Array of addresses investing in the fund
    /// @param amounts Array of investment amounts in base units
    function batchProcessInvestment(
        address[] calldata investors,
        uint256[] calldata amounts
    )
        public
        onlyRole(SUPPLY_MANAGEMENT_ROLE)
    {
        if (investors.length != amounts.length || investors.length == 0) revert InvalidBatchInput();

        for (uint256 i = 0; i < investors.length; i++) {
            processInvestment(investors[i], amounts[i]);
        }
    }

    /// @notice Processes multiple redemptions in a single transaction
    /// @param investors Array of addresses redeeming from the fund
    /// @param shares Array of share amounts to redeem
    /// @return amounts Array of amounts returned to investors
    function batchProcessRedemption(
        address[] calldata investors,
        uint256[] calldata shares
    )
        public
        onlyRole(SUPPLY_MANAGEMENT_ROLE)
        returns (uint256[] memory amounts)
    {
        if (investors.length != shares.length || investors.length == 0) revert InvalidBatchInput();

        amounts = new uint256[](investors.length);
        for (uint256 i = 0; i < investors.length; i++) {
            amounts[i] = processRedemption(investors[i], shares[i]);
        }
        return amounts;
    }

    /// @notice Blocks multiple users from token operations
    /// @param users Array of addresses to block
    function batchBlockUser(address[] calldata users) public onlyRole(USER_MANAGEMENT_ROLE) {
        if (users.length == 0) revert InvalidBatchInput();

        for (uint256 i = 0; i < users.length; i++) {
            try this.blockUser(users[i]) {
                // Operation successful, continue to next
            } catch {
                revert BatchOperationFailed(i);
            }
        }
    }

    /// @notice Unblocks multiple users from token operations
    /// @param users Array of addresses to unblock
    function batchUnblockUser(address[] calldata users) public onlyRole(USER_MANAGEMENT_ROLE) {
        if (users.length == 0) revert InvalidBatchInput();

        for (uint256 i = 0; i < users.length; i++) {
            try this.unblockUser(users[i]) {
                // Operation successful, continue to next
            } catch {
                revert BatchOperationFailed(i);
            }
        }
    }

    /// @notice Unfreezes tokens for multiple users
    /// @param users Array of addresses to unfreeze tokens for
    /// @param amounts Array of token amounts to unfreeze
    function batchUnfreeze(
        address[] calldata users,
        uint256[] calldata amounts
    )
        public
        onlyRole(USER_MANAGEMENT_ROLE)
    {
        if (users.length != amounts.length || users.length == 0) revert InvalidBatchInput();

        for (uint256 i = 0; i < users.length; i++) {
            try this.unfreeze(users[i], amounts[i]) {
                // Operation successful, continue to next
            } catch {
                revert BatchOperationFailed(i);
            }
        }
    }

    /// @notice Withdraws tokens from the fund
    /// @dev Only callable by supply manager. Emits a TokenWithdrawn event
    /// @param token The token to withdraw
    /// @param to The recipient address
    /// @param amount The amount to withdraw
    function withdrawToken(address token, address to, uint256 amount) public onlyRole(SUPPLY_MANAGEMENT_ROLE) {
        if (token == address(0)) revert InvalidTokenAddress();
        if (to == address(0)) revert InvalidTokenAddress();
        if (amount == 0) return;

        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance < amount) revert InsufficientTokenBalance();

        IERC20(token).safeTransfer(to, amount);
        emit TokenWithdrawn(token, to, amount);
    }

    /// @notice Batch withdraws multiple tokens from the fund
    /// @dev Only callable by portfolio manager. Emits a BatchTokenWithdrawn event
    /// @param tokens Array of token addresses to withdraw
    /// @param recipients Array of recipient addresses
    /// @param amounts Array of amounts to withdraw
    function batchWithdrawTokens(
        address[] calldata tokens,
        address[] calldata recipients,
        uint256[] calldata amounts
    )
        public
        onlyRole(SUPPLY_MANAGEMENT_ROLE)
    {
        if (tokens.length != recipients.length || tokens.length != amounts.length || tokens.length == 0) {
            revert InvalidBatchInput();
        }

        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == address(0)) revert InvalidTokenAddress();
            if (recipients[i] == address(0)) revert InvalidTokenAddress();
            if (amounts[i] == 0) continue;

            uint256 balance = IERC20(tokens[i]).balanceOf(address(this));
            if (balance < amounts[i]) revert InsufficientTokenBalance();

            IERC20(tokens[i]).safeTransfer(recipients[i], amounts[i]);
        }

        emit BatchTokenWithdrawn(tokens, recipients, amounts);
    }

    /// @notice Gets the balance of a specific token held by the fund
    /// @param token The token address to query
    /// @return The balance of the token
    function getTokenBalance(address token) public view returns (uint256) {
        if (token == address(0)) revert InvalidTokenAddress();
        return IERC20(token).balanceOf(address(this));
    }

    /// @notice Gets the balances of multiple tokens held by the fund
    /// @param tokens Array of token addresses to query
    /// @return balances Array of token balances
    function getTokenBalances(address[] calldata tokens) public view returns (uint256[] memory) {
        uint256[] memory balances = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == address(0)) revert InvalidTokenAddress();
            balances[i] = IERC20(tokens[i]).balanceOf(address(this));
        }
        return balances;
    }
}
