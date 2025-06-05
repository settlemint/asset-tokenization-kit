// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ISMART } from "../../interface/ISMART.sol";

/// @title ISMARTTokenSale Interface
/// @notice This interface defines the functions, events, and errors for a SMART token sale.
/// @dev The token sale contract enables compliant sales of SMART tokens for various payment currencies,
/// with flexible pricing mechanisms and regulatory controls.
interface ISMARTTokenSale {
    // --- Custom Errors ---

    /// @notice Thrown when an operation cannot proceed because the sale has not started yet
    error SaleNotStarted();

    /// @notice Thrown when an operation cannot proceed because the sale has already ended
    error SaleEnded();

    /// @notice Thrown when an operation requires the sale to be active
    error SaleNotActive();

    /// @notice Thrown when a purchase amount is below the minimum required
    error PurchaseAmountTooLow();

    /// @notice Thrown when a purchase would exceed the maximum allocation for a buyer
    error MaximumAllocationExceeded();

    /// @notice Thrown when a purchase would exceed the token sale hard cap
    error HardCapExceeded();

    /// @notice Thrown when a payment currency is not accepted in the token sale
    error UnsupportedPaymentCurrency();

    /// @notice Thrown when the buyer is not eligible to participate in the sale
    error BuyerNotEligible();

    /// @notice Thrown when the token amount to be distributed exceeds the available balance
    error InsufficientTokenBalance();

    /// @notice Thrown when an operation is attempted by an address that lacks the necessary permission
    error Unauthorized();

    /// @notice Thrown when a price calculation fails due to invalid parameters
    error InvalidPriceCalculation();

    // --- Events ---

    /// @notice Emitted when a buyer successfully purchases tokens
    /// @param buyer The address of the buyer
    /// @param paymentCurrency The address of the currency used for payment
    /// @param paymentAmount The amount of payment currency spent
    /// @param tokenAmount The amount of tokens purchased
    event TokensPurchased(
        address indexed buyer, address indexed paymentCurrency, uint256 paymentAmount, uint256 tokenAmount
    );

    /// @notice Emitted when tokens are withdrawn by a buyer after a vesting period
    /// @param buyer The address of the buyer
    /// @param amount The amount of tokens withdrawn
    event TokensWithdrawn(address indexed buyer, uint256 amount);

    /// @notice Emitted when the sale status is updated
    /// @param newStatus The new status of the sale (e.g., setup, active, paused, ended)
    event SaleStatusUpdated(uint8 newStatus);

    /// @notice Emitted when sale parameters are updated
    /// @param operator The address that initiated the update
    event SaleParametersUpdated(address indexed operator);

    /// @notice Emitted when funds from the sale are withdrawn by the issuer
    /// @param recipient The address receiving the funds
    /// @param currency The address of the currency withdrawn
    /// @param amount The amount withdrawn
    event FundsWithdrawn(address indexed recipient, address indexed currency, uint256 amount);

    /// @notice Emitted when a payment currency is added to the list of accepted currencies
    /// @param currency The address of the currency added
    /// @param priceRatio The price ratio for the currency (token price relative to base price)
    event PaymentCurrencyAdded(address indexed currency, uint256 priceRatio);

    /// @notice Emitted when a payment currency is removed from the list of accepted currencies
    /// @param currency The address of the currency removed
    event PaymentCurrencyRemoved(address indexed currency);

    // --- Sale Management Functions ---

    /// @notice Initializes the token sale with basic parameters
    /// @param tokenAddress The address of the SMART token being sold
    /// @param saleStart Timestamp when the sale starts
    /// @param saleDuration Duration of the sale in seconds
    /// @param hardCap Maximum amount of tokens to be sold
    /// @param basePrice Base price of tokens in smallest units (e.g. wei, satoshi)
    function initialize(
        address tokenAddress,
        uint256 saleStart,
        uint256 saleDuration,
        uint256 hardCap,
        uint256 basePrice
    )
        external;

    /// @notice Configures vesting parameters if tokens should vest over time
    /// @param vestingStart Timestamp when vesting begins
    /// @param vestingDuration Duration of the full vesting period in seconds
    /// @param vestingCliff Duration before any tokens can be claimed (in seconds)
    function configureVesting(uint256 vestingStart, uint256 vestingDuration, uint256 vestingCliff) external;

    /// @notice Adds a payment currency that can be used to purchase tokens
    /// @param currency Address of the ERC20 token to be used as payment
    /// @param priceRatio Price ratio compared to the base price (scaled by 10^18)
    function addPaymentCurrency(address currency, uint256 priceRatio) external;

    /// @notice Removes a payment currency from the list of accepted currencies
    /// @param currency Address of the ERC20 token to remove
    function removePaymentCurrency(address currency) external;

    /// @notice Sets individual purchase limits per buyer
    /// @param minPurchase Minimum amount of tokens that can be purchased
    /// @param maxPurchase Maximum amount of tokens that can be purchased per buyer
    function setPurchaseLimits(uint256 minPurchase, uint256 maxPurchase) external;

    /// @notice Activates the sale, allowing purchases to be made
    function activateSale() external;

    /// @notice Pauses the sale, temporarily preventing purchases
    function pauseSale() external;

    /// @notice Ends the sale permanently before its scheduled end time
    function endSale() external;

    // --- Buyer Functions ---

    /// @notice Allows a buyer to purchase tokens using native currency (e.g., ETH)
    /// @return tokenAmount The amount of tokens purchased
    function buyTokens() external payable returns (uint256 tokenAmount);

    /// @notice Allows a buyer to purchase tokens using an ERC20 token
    /// @param currency Address of the ERC20 token used for payment
    /// @param amount Amount of payment currency to spend
    /// @return tokenAmount The amount of tokens purchased
    function buyTokensWithERC20(address currency, uint256 amount) external returns (uint256 tokenAmount);

    /// @notice Allows a buyer to withdraw their vested tokens
    /// @return amount The amount of tokens withdrawn
    function withdrawTokens() external returns (uint256 amount);

    // --- Admin Functions ---

    /// @notice Allows the issuer to withdraw accumulated funds from sales
    /// @param currency Address of the currency to withdraw (address(0) for native currency)
    /// @param recipient Address to receive the funds
    /// @return amount The amount withdrawn
    function withdrawFunds(address currency, address recipient) external returns (uint256 amount);

    // --- View Functions ---

    /// @notice Returns the current sale status
    /// @return status Current status of the sale (e.g., setup, active, paused, ended)
    function saleStatus() external view returns (uint8 status);

    /// @notice Returns the token price in a specific payment currency
    /// @param currency Address of the payment currency (address(0) for native currency)
    /// @param amount Amount of tokens to calculate price for
    /// @return price The price in the specified currency
    function getTokenPrice(address currency, uint256 amount) external view returns (uint256 price);

    /// @notice Returns the amount of tokens a buyer has purchased
    /// @param buyer Address of the buyer
    /// @return purchased Amount of tokens purchased
    function purchasedAmount(address buyer) external view returns (uint256 purchased);

    /// @notice Returns the amount of tokens a buyer can withdraw based on vesting
    /// @param buyer Address of the buyer
    /// @return withdrawable Amount of tokens withdrawable
    function withdrawableAmount(address buyer) external view returns (uint256 withdrawable);

    /// @notice Returns various sale parameters
    /// @return soldAmount Total number of tokens sold
    /// @return remainingTokens Number of tokens remaining for sale
    /// @return saleStartTime Timestamp when the sale starts
    /// @return saleEndTime Timestamp when the sale ends
    function getSaleInfo()
        external
        view
        returns (uint256 soldAmount, uint256 remainingTokens, uint256 saleStartTime, uint256 saleEndTime);

    // --- Getter Functions for Public State Variables ---

    /// @notice Returns the SMART token being sold
    /// @return The SMART token contract
    function token() external view returns (ISMART);

    /// @notice Returns the maximum number of tokens that can be sold
    /// @return The hard cap amount
    function hardCap() external view returns (uint256);

    /// @notice Returns the base price of the token
    /// @return The base price in smallest units
    function basePrice() external view returns (uint256);

    /// @notice Returns the total number of tokens sold so far
    /// @return The total sold amount
    function totalSold() external view returns (uint256);

    /// @notice Returns the minimum purchase amount in tokens
    /// @return The minimum purchase amount
    function minPurchase() external view returns (uint256);

    /// @notice Returns the maximum purchase amount per buyer in tokens
    /// @return The maximum purchase amount
    function maxPurchase() external view returns (uint256);

    /// @notice Returns the start time of the sale
    /// @return The sale start timestamp
    function saleStartTime() external view returns (uint256);

    /// @notice Returns the end time of the sale
    /// @return The sale end timestamp
    function saleEndTime() external view returns (uint256);

    /// @notice Returns the vesting configuration
    /// @return enabled Whether vesting is enabled
    /// @return startTime Vesting start timestamp
    /// @return duration Vesting duration in seconds
    /// @return cliff Vesting cliff in seconds
    function vesting() external view returns (bool enabled, uint256 startTime, uint256 duration, uint256 cliff);

    /// @notice Returns the payment currency configuration
    /// @param currency The payment currency address
    /// @return priceRatio The price ratio for the currency
    /// @return accepted Whether the currency is accepted
    function paymentCurrencies(address currency) external view returns (uint256 priceRatio, bool accepted);
}
