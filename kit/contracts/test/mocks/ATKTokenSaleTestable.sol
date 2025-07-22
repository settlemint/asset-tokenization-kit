// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ATKTokenSale } from "../../contracts/addons/token-sale/ATKTokenSale.sol";

/// @title ATKTokenSaleTestable
/// @notice Testable version of ATKTokenSale with additional helper functions
/// @dev This contract extends ATKTokenSale to expose internal functions for testing
contract ATKTokenSaleTestable is ATKTokenSale {
    /// @notice Constructor for the testable version
    constructor() ATKTokenSale(address(0)) { }

    /// @notice Exposes the internal eligibility check for testing
    /// @param buyer The address to check
    /// @return True if the buyer is eligible
    function isEligibleBuyerPublic(address buyer) external view returns (bool) {
        return _isEligibleBuyer(buyer);
    }

    /// @notice Exposes the internal token amount calculation for testing
    /// @param currency The payment currency address
    /// @param paymentAmount The payment amount
    /// @return The calculated token amount
    function calculateTokenAmountPublic(address currency, uint256 paymentAmount) external view returns (uint256) {
        return _calculateTokenAmount(currency, paymentAmount);
    }

    /// @notice Allows setting the sale status directly for testing
    /// @param newStatus The new status to set
    function setStatusForTesting(uint8 newStatus) external {
        status = SaleStatus(newStatus);
    }

    /// @notice Allows setting the total sold amount for testing
    /// @param amount The amount to set
    function setTotalSoldForTesting(uint256 amount) external {
        totalSold = amount;
    }
}
