// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

import { ISMARTIdentityRegistry } from "../../contracts/interface/ISMARTIdentityRegistry.sol";
import { ISMARTTokenSale } from "../../contracts/assets/token-sale/ISMARTTokenSale.sol";
import { ISMART } from "../../contracts/interface/ISMART.sol";
import { MockedSMARTToken } from "./MockedSMARTToken.sol";

/// @title SMARTTokenSaleTestable
/// @notice Test version of SMARTTokenSale that bypasses ERC2771Context for testing
/// @dev This contract handles the compliant sale of SMART tokens with various payment methods and compliance checks
contract SMARTTokenSaleTestable is
    ISMARTTokenSale,
    Initializable,
    ReentrancyGuardUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable
{
    using SafeERC20 for IERC20;
    using Math for uint256;

    // --- Constants ---

    /// @notice Role for managing the token sale parameters and operations
    bytes32 public constant SALE_ADMIN_ROLE = keccak256("SALE_ADMIN_ROLE");

    /// @notice Role for withdrawing funds from the sale
    bytes32 public constant FUNDS_MANAGER_ROLE = keccak256("FUNDS_MANAGER_ROLE");

    /// @notice Scale factor for price calculations
    uint256 private constant PRICE_SCALE = 1e18;

    // --- Enum ---

    /// @notice Status values for the token sale
    /// @dev SETUP: Initial configuration phase, not ready for purchases
    ///      ACTIVE: Sale is active and accepting purchases
    ///      PAUSED: Sale is temporarily paused
    ///      ENDED: Sale has permanently ended
    enum SaleStatus {
        SETUP,
        ACTIVE,
        PAUSED,
        ENDED
    }

    // --- Structs ---

    /// @notice Configuration for payment currencies
    /// @dev priceRatio: Price ratio relative to base price (scaled by PRICE_SCALE)
    ///      accepted: Whether this currency is currently accepted
    struct PaymentCurrencyConfig {
        uint256 priceRatio;
        bool accepted;
    }

    /// @notice Configuration for vesting
    /// @dev enabled: Whether vesting is enabled
    ///      startTime: Unix timestamp when vesting starts
    ///      duration: Duration of the vesting period in seconds
    ///      cliff: Duration of the cliff period in seconds
    struct VestingConfig {
        bool enabled;
        uint256 startTime;
        uint256 duration;
        uint256 cliff;
    }

    /// @notice Purchase record for a buyer
    /// @dev purchased: Total amount of tokens purchased
    ///      withdrawn: Amount of tokens already withdrawn
    struct PurchaseRecord {
        uint256 purchased;
        uint256 withdrawn;
    }

    // --- State Variables ---

    /// @notice The token being sold (using MockedSMARTToken for testing)
    MockedSMARTToken private _token;

    /// @notice Current status of the sale
    SaleStatus public status;

    /// @notice Start time of the sale (Unix timestamp)
    uint256 public saleStartTime;

    /// @notice End time of the sale (Unix timestamp)
    uint256 public saleEndTime;

    /// @notice Base price of the token in smallest units
    uint256 public basePrice;

    /// @notice Maximum number of tokens that can be sold
    uint256 public hardCap;

    /// @notice Total number of tokens sold so far
    uint256 public totalSold;

    /// @notice Minimum purchase amount in tokens
    uint256 public minPurchase;

    /// @notice Maximum purchase amount per buyer in tokens
    uint256 public maxPurchase;

    /// @notice Vesting configuration
    VestingConfig public vesting;

    /// @notice Mapping of payment currencies to their configurations
    mapping(address => PaymentCurrencyConfig) public paymentCurrencies;

    /// @notice Mapping of buyers to their purchase records
    mapping(address => PurchaseRecord) public purchases;

    // --- Modifiers ---

    /// @notice Ensures the sale is in the specified status
    modifier onlyInStatus(SaleStatus _status) {
        if (status != _status) {
            if (_status == SaleStatus.ACTIVE) {
                revert SaleNotActive();
            }
            revert Unauthorized();
        }
        _;
    }

    /// @notice Ensures the sale is active and within the valid time window
    modifier whenSaleOpen() {
        if (status != SaleStatus.ACTIVE) {
            revert SaleNotActive();
        }
        if (block.timestamp < saleStartTime) {
            revert SaleNotStarted();
        }
        if (block.timestamp > saleEndTime) {
            revert SaleEnded();
        }
        _;
    }

    /// @notice Ensures the buyer is eligible to participate in the sale
    /// @dev Checks the identity registry to ensure the buyer has the required claims
    modifier onlyEligibleBuyer() {
        if (!_isEligibleBuyer(_msgSender())) {
            revert BuyerNotEligible();
        }
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        // Don't disable initializers for testing to allow direct initialization
    }

    /// @inheritdoc ISMARTTokenSale
    function initialize(
        address tokenAddress,
        uint256 saleStart,
        uint256 saleDuration,
        uint256 hardCap_,
        uint256 basePrice_
    )
        external
        initializer
    {
        __ReentrancyGuard_init();
        __AccessControl_init();
        __Pausable_init();

        if (tokenAddress == address(0)) revert Unauthorized();

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(SALE_ADMIN_ROLE, _msgSender());
        _grantRole(FUNDS_MANAGER_ROLE, _msgSender());

        // Setup token sale parameters
        _token = MockedSMARTToken(tokenAddress);
        saleStartTime = saleStart;
        saleEndTime = saleStart + saleDuration;
        hardCap = hardCap_;
        basePrice = basePrice_;
        status = SaleStatus.SETUP;

        // Default purchase limits
        minPurchase = 1 * 10 ** _token.decimals(); // 1 token
        maxPurchase = hardCap_; // No limit by default

        emit SaleParametersUpdated(_msgSender());
    }

    /// @inheritdoc ISMARTTokenSale
    function configureVesting(
        uint256 vestingStart,
        uint256 vestingDuration,
        uint256 vestingCliff
    )
        external
        onlyRole(SALE_ADMIN_ROLE)
        onlyInStatus(SaleStatus.SETUP)
    {
        vesting.enabled = true;
        vesting.startTime = vestingStart;
        vesting.duration = vestingDuration;
        vesting.cliff = vestingCliff;

        emit SaleParametersUpdated(_msgSender());
    }

    /// @inheritdoc ISMARTTokenSale
    function addPaymentCurrency(address currency, uint256 priceRatio) external onlyRole(SALE_ADMIN_ROLE) {
        if (currency == address(0)) revert Unauthorized();
        if (priceRatio == 0) revert InvalidPriceCalculation();

        paymentCurrencies[currency] = PaymentCurrencyConfig({ priceRatio: priceRatio, accepted: true });

        emit PaymentCurrencyAdded(currency, priceRatio);
    }

    /// @inheritdoc ISMARTTokenSale
    function removePaymentCurrency(address currency) external onlyRole(SALE_ADMIN_ROLE) {
        if (!paymentCurrencies[currency].accepted) revert UnsupportedPaymentCurrency();

        paymentCurrencies[currency].accepted = false;

        emit PaymentCurrencyRemoved(currency);
    }

    /// @inheritdoc ISMARTTokenSale
    function setPurchaseLimits(uint256 minPurchase_, uint256 maxPurchase_) external onlyRole(SALE_ADMIN_ROLE) {
        if (minPurchase_ > maxPurchase_) revert InvalidPriceCalculation();

        minPurchase = minPurchase_;
        maxPurchase = maxPurchase_;

        emit SaleParametersUpdated(_msgSender());
    }

    /// @inheritdoc ISMARTTokenSale
    function activateSale() external onlyRole(SALE_ADMIN_ROLE) {
        if (status == SaleStatus.ENDED) revert SaleEnded();

        // Check that the sale has sufficient token balance before activation
        uint256 tokenBalance = _token.balanceOf(address(this));
        if (tokenBalance < hardCap) revert InsufficientTokenBalance();

        status = SaleStatus.ACTIVE;

        emit SaleStatusUpdated(uint8(SaleStatus.ACTIVE));
    }

    /// @inheritdoc ISMARTTokenSale
    function pauseSale() external onlyRole(SALE_ADMIN_ROLE) onlyInStatus(SaleStatus.ACTIVE) {
        status = SaleStatus.PAUSED;

        emit SaleStatusUpdated(uint8(SaleStatus.PAUSED));
    }

    /// @inheritdoc ISMARTTokenSale
    function endSale() external onlyRole(SALE_ADMIN_ROLE) {
        if (status == SaleStatus.ENDED) revert SaleEnded();

        status = SaleStatus.ENDED;

        emit SaleStatusUpdated(uint8(SaleStatus.ENDED));
    }

    /// @inheritdoc ISMARTTokenSale
    function buyTokens() external payable nonReentrant whenSaleOpen onlyEligibleBuyer returns (uint256 tokenAmount) {
        if (msg.value == 0) revert PurchaseAmountTooLow();

        // Calculate token amount from native currency payment
        tokenAmount = _calculateTokenAmount(address(0), msg.value);

        _processPurchase(_msgSender(), address(0), msg.value, tokenAmount);

        return tokenAmount;
    }

    /// @inheritdoc ISMARTTokenSale
    function buyTokensWithERC20(
        address currency,
        uint256 amount
    )
        external
        nonReentrant
        whenSaleOpen
        onlyEligibleBuyer
        returns (uint256 tokenAmount)
    {
        if (!paymentCurrencies[currency].accepted) revert UnsupportedPaymentCurrency();
        if (amount == 0) revert PurchaseAmountTooLow();

        // Calculate token amount from ERC20 payment
        tokenAmount = _calculateTokenAmount(currency, amount);

        // Transfer payment tokens from buyer to sale contract
        IERC20(currency).safeTransferFrom(_msgSender(), address(this), amount);

        _processPurchase(_msgSender(), currency, amount, tokenAmount);

        return tokenAmount;
    }

    /// @inheritdoc ISMARTTokenSale
    function withdrawTokens() external nonReentrant returns (uint256 amount) {
        address buyer = _msgSender();
        PurchaseRecord storage purchase = purchases[buyer];

        uint256 withdrawable = withdrawableAmount(buyer);
        if (withdrawable == 0) revert PurchaseAmountTooLow();

        purchase.withdrawn += withdrawable;

        // Transfer tokens to buyer
        _token.transfer(buyer, withdrawable);

        emit TokensWithdrawn(buyer, withdrawable);

        return withdrawable;
    }

    /// @inheritdoc ISMARTTokenSale
    function withdrawFunds(
        address currency,
        address recipient
    )
        external
        nonReentrant
        onlyRole(FUNDS_MANAGER_ROLE)
        returns (uint256 amount)
    {
        if (recipient == address(0)) revert Unauthorized();

        if (currency == address(0)) {
            // Withdraw native currency
            amount = address(this).balance;
            if (amount > 0) {
                (bool success,) = recipient.call{ value: amount }("");
                require(success, "Native currency transfer failed");
            }
        } else {
            // Withdraw ERC20 tokens
            IERC20 paymentToken = IERC20(currency);
            amount = paymentToken.balanceOf(address(this));
            if (amount > 0) {
                paymentToken.safeTransfer(recipient, amount);
            }
        }

        emit FundsWithdrawn(recipient, currency, amount);

        return amount;
    }

    /// @inheritdoc ISMARTTokenSale
    function withdrawableAmount(address buyer) public view returns (uint256) {
        PurchaseRecord storage purchase = purchases[buyer];

        if (!vesting.enabled) {
            // No vesting - all purchased tokens are withdrawable immediately
            return purchase.purchased - purchase.withdrawn;
        }

        // With vesting
        if (block.timestamp < vesting.startTime + vesting.cliff) {
            // Still in cliff period
            return 0;
        }

        uint256 timeSinceStart = block.timestamp - vesting.startTime;
        if (timeSinceStart >= vesting.duration) {
            // Vesting period completed
            return purchase.purchased - purchase.withdrawn;
        }

        // Partial vesting
        uint256 vestedAmount = (purchase.purchased * timeSinceStart) / vesting.duration;
        return vestedAmount - purchase.withdrawn;
    }

    /// @inheritdoc ISMARTTokenSale
    function purchasedAmount(address buyer) external view returns (uint256) {
        return purchases[buyer].purchased;
    }

    /// @inheritdoc ISMARTTokenSale
    function saleStatus() external view returns (uint8) {
        return uint8(status);
    }

    /// @notice Calculate token amount based on payment currency and amount
    /// @param currency Address of the payment currency (address(0) for native currency)
    /// @param amount Amount of payment currency
    /// @return Amount of tokens that can be purchased
    function calculateTokenAmount(address currency, uint256 amount) external view returns (uint256) {
        return _calculateTokenAmount(currency, amount);
    }

    /// @inheritdoc ISMARTTokenSale
    function getTokenPrice(address currency, uint256 amount) external view returns (uint256 price) {
        if (amount == 0) return 0;

        if (currency == address(0)) {
            // Price in native currency
            price = (amount * basePrice) / 10 ** _token.decimals();
        } else {
            // Price in ERC20 tokens
            if (!paymentCurrencies[currency].accepted) revert UnsupportedPaymentCurrency();

            uint256 currencyDecimals = IERC20Metadata(currency).decimals();
            uint256 priceRatio = paymentCurrencies[currency].priceRatio;

            // The priceRatio represents: (payment currency amount per token) * PRICE_SCALE
            // To calculate price: price = (amount * priceRatio * 10^currencyDecimals) / (PRICE_SCALE *
            // 10^tokenDecimals)
            price = (amount * priceRatio * 10 ** currencyDecimals) / (PRICE_SCALE * 10 ** _token.decimals());
        }

        return price;
    }

    /// @inheritdoc ISMARTTokenSale
    function getSaleInfo()
        external
        view
        returns (uint256 soldAmount, uint256 remainingTokens, uint256 saleStartTime_, uint256 saleEndTime_)
    {
        uint256 remaining = hardCap - totalSold;

        return (totalSold, remaining, saleStartTime, saleEndTime);
    }

    /// @notice Internal function to check if a buyer is eligible
    /// @param buyer The address to check eligibility for
    /// @return true if the buyer is eligible, false otherwise
    function _isEligibleBuyer(address buyer) internal view returns (bool) {
        ISMARTIdentityRegistry identityRegistry = _token.identityRegistry();

        // If identity registry is zero address (mock), always return true for testing
        if (address(identityRegistry) == address(0)) {
            return true;
        }

        uint256[] memory requiredTopics = _token.requiredClaimTopics();
        return identityRegistry.isVerified(buyer, requiredTopics);
    }

    /// @notice Internal function to calculate token amount based on payment
    /// @param currency Address of the payment currency (address(0) for native currency)
    /// @param amount Amount of payment currency
    /// @return tokenAmount Amount of tokens that can be purchased
    function _calculateTokenAmount(address currency, uint256 amount) internal view returns (uint256 tokenAmount) {
        if (currency == address(0)) {
            // Native currency - use base price directly
            tokenAmount = (amount * PRICE_SCALE) / basePrice;
        } else {
            // ERC20 currency - use price ratio
            PaymentCurrencyConfig storage config = paymentCurrencies[currency];
            if (!config.accepted) revert UnsupportedPaymentCurrency();

            // Adjust for token decimals
            uint256 currencyDecimals = IERC20Metadata(currency).decimals();
            uint256 tokenDecimals = _token.decimals();

            // Calculate with proper decimal adjustment
            uint256 adjustedAmount = amount;
            if (currencyDecimals != tokenDecimals) {
                if (currencyDecimals > tokenDecimals) {
                    adjustedAmount = amount / (10 ** (currencyDecimals - tokenDecimals));
                } else {
                    adjustedAmount = amount * (10 ** (tokenDecimals - currencyDecimals));
                }
            }

            tokenAmount = (adjustedAmount * PRICE_SCALE) / config.priceRatio;
        }

        return tokenAmount;
    }

    /// @notice Internal function to process a purchase
    /// @param buyer The address of the buyer
    /// @param currency The payment currency address
    /// @param paymentAmount The amount of payment currency
    /// @param tokenAmount The amount of tokens to be purchased
    function _processPurchase(address buyer, address currency, uint256 paymentAmount, uint256 tokenAmount) internal {
        // Validate purchase amount
        if (tokenAmount < minPurchase) {
            revert PurchaseAmountTooLow();
        }

        // Check maximum purchase amount per buyer
        PurchaseRecord storage purchase = purchases[buyer];
        uint256 newTotal = purchase.purchased + tokenAmount;
        if (newTotal > maxPurchase) {
            revert MaximumAllocationExceeded();
        }

        // Check hard cap
        if (totalSold + tokenAmount > hardCap) {
            revert HardCapExceeded();
        }

        // Update purchase record
        purchase.purchased += tokenAmount;
        totalSold += tokenAmount;

        // If no vesting, transfer tokens immediately; otherwise they'll be claimed later
        if (!vesting.enabled) {
            _token.transfer(buyer, tokenAmount);
            purchase.withdrawn += tokenAmount;
        }

        emit TokensPurchased(buyer, currency, paymentAmount, tokenAmount);
    }

    /// @dev Override to use standard Context instead of ERC2771Context for testing
    function _msgSender() internal view override returns (address) {
        return msg.sender;
    }

    /// @dev Override to use standard Context instead of ERC2771Context for testing
    function _msgData() internal view override returns (bytes calldata) {
        return msg.data;
    }

    /// @notice Returns the token being sold
    /// @return The token contract as ISMART interface
    function token() external view returns (ISMART) {
        return ISMART(address(_token));
    }
}
