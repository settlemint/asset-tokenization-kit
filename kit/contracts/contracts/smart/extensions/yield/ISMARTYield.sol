// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ISMARTHistoricalBalances } from "../historical-balances/ISMARTHistoricalBalances.sol";

/// @title Interface for the SMART Yield Extension
/// @author SettleMint
/// @notice This interface defines the functions that a SMART Yield token extension must
/// implement.
/// It allows for the management of a yield schedule associated with a token, which dictates how yield is accrued and
/// paid out.
/// This interface also inherits from `ISMARTHistoricalBalances`, indicating that any implementing contract
/// must also support querying token balances at historical points in time, a feature often crucial for accurate yield
/// calculations.
/// @dev This interface is intended to be implemented by contracts that provide yield-generating capabilities for
/// tokens.
/// The functions are external, allowing them to be called from other contracts or off-chain applications.
interface ISMARTYield is ISMARTHistoricalBalances {
    /// @notice Error indicating that a yield schedule has already been set for the token and an attempt was made to set
    /// it
    /// again.
    /// @dev This error is typically reverted when a function like `setYieldSchedule` is called but the token
    /// already has an active or previously configured yield schedule. To change a schedule, it might need to be unset
    /// or
    /// updated via a different mechanism if supported.
    error YieldScheduleAlreadySet();

    /// @notice Error indicating that an action cannot be performed because the yield schedule is currently active.
    /// @dev For example, this might be reverted if an attempt is made to modify certain parameters of the token or the
    /// yield mechanism
    /// (like `_beforeMint` in `_SMARTYieldLogic` preventing minting) once the yield schedule has started (i.e.,
    /// `schedule.startDate() <= block.timestamp`).
    /// Some operations might be restricted to only occur before the yield schedule begins distributing rewards.
    error YieldScheduleActive();

    /// @notice Emitted when a new yield schedule is successfully set or updated for a token.
    /// @dev This event is critical for transparency and tracking changes to how a token generates and distributes
    /// yield.
    /// When this event is emitted, it signifies that the `schedule` address is now the authoritative contract dictating
    /// the terms of yield for this token.
    /// The `indexed` keyword for `sender` and `schedule` allows for efficient searching and filtering of these events
    /// based
    /// on these addresses.
    /// For example, one could easily find all tokens for which a specific yield schedule was set, or all schedules set
    /// by a
    /// particular admin.
    /// @param sender The address of the account (e.g., an admin or owner) that initiated the transaction to set the
    /// yield
    /// schedule.
    /// @param schedule The address of the newly set yield schedule contract. This contract implements
    /// `ISMARTYieldSchedule`
    /// and contains the yield logic.
    event YieldScheduleSet(address indexed sender, address indexed schedule);

    /// @notice Sets or updates the yield schedule contract for this token.
    /// @dev This function is crucial for configuring how yield is generated and distributed for the token.
    /// The `schedule` address points to another smart contract that implements the `ISMARTYieldSchedule` interface (or
    /// a more specific one like `ISMARTFixedYieldSchedule`).
    /// This schedule contract will contain the detailed logic for yield calculation, timing, and distribution.
    /// Implementers should consider adding access control to this function (e.g., only allowing an admin or owner role)
    /// to prevent unauthorized changes to the yield mechanism.
    /// @param schedule The address of the smart contract that defines the yield schedule. This contract must adhere to
    /// `ISMARTYieldSchedule`.
    function setYieldSchedule(address schedule) external;

    /// @notice Returns the address of the yield schedule contract for this token.
    /// @return schedule The address of the yield schedule contract.
    function yieldSchedule() external view returns (address schedule);

    /// @notice Returns the basis amount used to calculate yield per single unit of the token (e.g., per 1 token with 18
    /// decimals).
    /// @dev The "yield basis" is a fundamental value upon which yield calculations are performed. For example:
    /// - For a bond-like token, this might be its face value (e.g., 100 USD).
    /// - For an equity-like token, it might be its nominal value or a value derived from an oracle.
    /// This function allows the basis to be specific to a `holder`, enabling scenarios where different holders might
    /// have different
    /// yield bases (though often it will be a global value, in which case `holder` might be ignored).
    /// The returned value is typically a raw number (e.g., if basis is $100 and token has 2 decimals, this might return
    /// 10000).
    /// @param holder The address of the token holder for whom the yield basis is being queried. This allows for
    /// holder-specific configurations.
    /// @return basisPerUnit The amount (in the smallest unit of the basis currency/asset) per single unit of the token,
    /// used for yield calculations.
    function yieldBasisPerUnit(address holder) external view returns (uint256 basisPerUnit);

    /// @notice Returns the ERC20 token contract that is used for paying out the yield.
    /// @dev Yield can be paid in the token itself or in a different token (e.g., a stablecoin).
    /// This function specifies which ERC20 token will be transferred to holders when they claim their accrued yield.
    /// @return paymentToken An `IERC20` interface instance representing the token used for yield payments.
    function yieldToken() external view returns (IERC20 paymentToken);
}
