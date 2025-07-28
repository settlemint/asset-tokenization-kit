// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { _SMARTExtension } from "../../common/_SMARTExtension.sol";
import { ISMARTYield } from "../ISMARTYield.sol";
import { ISMARTYieldSchedule } from "../schedules/ISMARTYieldSchedule.sol";

/// @title Internal Logic for the SMART Yield Extension
/// @author SettleMint
/// @notice This abstract contract provides the core, reusable logic for managing yield schedules
/// associated with a
/// SMART token.
/// It handles setting a yield schedule and includes a hook for `_beforeMint` to potentially restrict minting once a
/// schedule is active.
/// @dev This contract is designed to be inherited by other contracts (either standard or upgradeable versions of the
/// yield extension)
/// that will integrate this logic into a full token implementation.
/// It implements the `ISMARTYield` interface (partially, as some functions like `yieldBasisPerUnit`, `yieldToken` are
/// expected to be overridden or implemented by the final contract).
/// Key functionalities:
/// - Storing the address of the `yieldSchedule` contract.
/// - Providing an internal function `_smart_setYieldSchedule` to set this schedule with necessary checks.
/// - Registering the `ISMARTYield` interface for ERC165 discovery.
/// - Implementing a `__yield_beforeMintLogic` hook that reverts if minting is attempted while a yield schedule is
/// active and its start date has passed.
/// The `abstract` keyword means this contract itself cannot be deployed directly.
abstract contract _SMARTYieldLogic is _SMARTExtension, ISMARTYield {
    /// @notice The address of the smart contract that defines the yield schedule for this token.
    /// @dev This state variable stores the address of the external contract (implementing `ISMARTYieldSchedule`)
    /// that dictates how yield is calculated, accrued, and distributed. It is set via `_smart_setYieldSchedule`.
    /// If it's the zero address (`address(0)`), it means no yield schedule is currently associated with the token.
    /// It is `public`, so a getter function `yieldSchedule()` is automatically created by the compiler, allowing anyone
    /// to query this address.
    address public yieldSchedule;

    // -- Initializer --

    /// @notice Internal initializer function for the yield logic.
    /// @dev This function is intended to be called by the initializer of the inheriting contract.
    /// Its primary purpose is to register the `ISMARTYield` interfaceId using `_registerInterface` (from
    /// `_SMARTExtension`).
    /// This makes the contract's support for `ISMARTYield` discoverable via ERC165 `supportsInterface` checks.
    /// The `_unchained` suffix typically means it doesn't call initializers of its own parent contracts here.
    function __SMARTYield_init_unchained() internal {
        _registerInterface(type(ISMARTYield).interfaceId);
    }

    // -- Internal Implementation for SMARTYield interface functions --

    /// @notice Internal function to set the yield schedule for this token.
    /// @dev This function is responsible for associating a yield schedule contract with the token.
    /// It performs several checks before setting the schedule:
    /// 1. Ensures the provided `schedule` address is not the zero address (using `ZeroAddressNotAllowed` error).
    /// 2. Ensures that a `yieldSchedule` is not already set (using `YieldScheduleAlreadySet` error). This prevents
    /// overwriting an existing schedule inadvertently.
    /// If these checks pass, it updates the `yieldSchedule` state variable with the new `schedule` address and emits a
    /// `YieldScheduleSet` event.
    /// This function is `internal`, meaning it can only be called by the contract itself or by derived contracts.
    /// Access control (who can call this) should be implemented in the contract that exposes this functionality
    /// publicly (e.g., via a public `setYieldSchedule` function).
    /// @param schedule The address of the smart contract that defines the yield generation and distribution rules. This
    /// contract must implement `ISMARTYieldSchedule`.
    function _smart_setYieldSchedule(address schedule) internal {
        if (schedule == address(0)) revert ZeroAddressNotAllowed(); // The schedule address cannot be the null address.
        if (yieldSchedule != address(0)) revert YieldScheduleAlreadySet(); // A yield schedule can only be set once with
            // this function.

        yieldSchedule = schedule; // Store the address of the new yield schedule contract.
        emit ISMARTYield.YieldScheduleSet(_smartSender(), schedule); // Announce that a new schedule has been set.
    }

    // -- Internal Hook Helper Functions --

    /// @notice Internal logic executed typically before a token mint operation, to check conditions related to the
    /// yield schedule.
    /// @dev This function is designed to be called within a `_beforeMint` hook of the main token contract.
    /// Its purpose is to enforce rules related to minting once a yield schedule is active.
    /// If a `yieldSchedule` has been set (is not `address(0)`):
    /// 1. It checks the `startDate()` of the `yieldSchedule` contract (by calling it via the `ISMARTYieldSchedule`
    /// interface).
    /// 2. If the schedule's `startDate()` is less than or equal to the current `block.timestamp` (meaning the schedule
    /// has started or is in the past),
    ///    it reverts the transaction with a `YieldScheduleActive` error. This can prevent new tokens from being minted
    /// after yield distribution has begun,
    ///    which might be important for the fairness or mechanics of certain yield models.
    /// This function is `internal view virtual`, meaning it doesn't change state, can be called by derived contracts,
    /// and can be overridden.
    function __yield_beforeMintLogic() internal view virtual {
        if (yieldSchedule != address(0)) {
            // Only proceed if a yield schedule is actually set.
            // Check if the yield schedule has already started.
            // This is done by calling the `startDate()` function on the external `yieldSchedule` contract.
            if (
                ISMARTYieldSchedule(yieldSchedule).startDate() < block.timestamp
                    || ISMARTYieldSchedule(yieldSchedule).startDate() == block.timestamp
            ) {
                revert YieldScheduleActive(); // If the schedule has started, revert to prevent minting.
            }
        }
    }
}
