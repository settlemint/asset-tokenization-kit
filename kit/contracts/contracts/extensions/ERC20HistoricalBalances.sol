// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Checkpoints } from "@openzeppelin/contracts/utils/structs/Checkpoints.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import { Time } from "@openzeppelin/contracts/utils/types/Time.sol";

/**
 * @title ERC20HistoricalBalances
 * @dev Extension for ERC20 tokens that tracks historical balances of token holders.
 * This allows querying the balance of any account at any past block number.
 */
abstract contract ERC20HistoricalBalances {
    using Checkpoints for Checkpoints.Trace208;

    /**
     * @dev Error thrown when attempting to query a timepoint in the future
     * @param requestedTimepoint The timepoint that was requested
     * @param currentTimepoint The current timepoint
     */
    error FutureLookup(uint256 requestedTimepoint, uint48 currentTimepoint);

    // Track historical balances for each account
    mapping(address account => Checkpoints.Trace208) private _balanceCheckpoints;

    // Track historical total supply
    Checkpoints.Trace208 private _totalSupplyCheckpoints;

    /**
     * @dev Emitted when a balance checkpoint is created
     */
    event CheckpointCreated(address indexed account, uint256 oldBalance, uint256 newBalance);

    /**
     * @dev Clock used for timestamping checkpoints
     */
    function clock() public view virtual returns (uint48) {
        return Time.blockNumber();
    }

    /**
     * @dev Machine-readable description of the clock
     */
    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public view virtual returns (string memory) {
        return "mode=blocknumber&from=default";
    }

    /**
     * @dev Returns the balance of an account at a specific block number
     * @param account The address to query the balance of
     * @param timepoint The block number to query the balance at
     */
    function balanceOfAt(address account, uint256 timepoint) public view virtual returns (uint256) {
        uint48 currentTimepoint = clock();
        if (timepoint >= currentTimepoint) {
            revert FutureLookup(timepoint, currentTimepoint);
        }
        return _balanceCheckpoints[account].upperLookupRecent(SafeCast.toUint48(timepoint));
    }

    /**
     * @dev Returns the total supply at a specific block number
     * @param timepoint The block number to query the total supply at
     */
    function totalSupplyAt(uint256 timepoint) public view virtual returns (uint256) {
        uint48 currentTimepoint = clock();
        if (timepoint >= currentTimepoint) {
            revert FutureLookup(timepoint, currentTimepoint);
        }
        return _totalSupplyCheckpoints.upperLookupRecent(SafeCast.toUint48(timepoint));
    }

    /**
     * @dev Hook to be called after any transfer of tokens
     * @param from The address tokens are transferred from
     * @param to The address tokens are transferred to
     * @param amount The amount of tokens transferred
     */
    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {
        if (from == address(0)) {
            // Mint
            _push(_totalSupplyCheckpoints, _add, SafeCast.toUint208(amount));
        } else {
            _push(_balanceCheckpoints[from], _subtract, SafeCast.toUint208(amount));
        }

        if (to == address(0)) {
            // Burn
            _push(_totalSupplyCheckpoints, _subtract, SafeCast.toUint208(amount));
        } else {
            _push(_balanceCheckpoints[to], _add, SafeCast.toUint208(amount));
        }
    }

    /**
     * @dev Push a new checkpoint with the result of an operation
     */
    function _push(
        Checkpoints.Trace208 storage store,
        function(uint208, uint208) view returns (uint208) op,
        uint208 delta
    )
        private
        returns (uint208, uint208)
    {
        return store.push(clock(), op(store.latest(), delta));
    }

    /**
     * @dev Add two numbers
     */
    function _add(uint208 a, uint208 b) private pure returns (uint208) {
        return a + b;
    }

    /**
     * @dev Subtract two numbers
     */
    function _subtract(uint208 a, uint208 b) private pure returns (uint208) {
        return a - b;
    }
}
