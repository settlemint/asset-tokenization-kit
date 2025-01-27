// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Yield } from "../../contracts/extensions/ERC20Yield.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ERC20YieldMock is ERC20, ERC20Yield {
    uint256 private immutable _yieldBasis;
    IERC20 private immutable _yieldToken;

    // Mapping: holder => timestamp => balance
    mapping(address => mapping(uint256 => uint256)) private _historicalBalances;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address yieldToken_,
        uint256 yieldBasis_
    )
        ERC20(name, symbol)
    {
        _mint(msg.sender, initialSupply);
        _yieldBasis = yieldBasis_;
        _yieldToken = IERC20(yieldToken_);
    }

    function yieldBasis(address) public view override returns (uint256) {
        return _yieldBasis;
    }

    function yieldToken() public view override returns (IERC20) {
        return _yieldToken;
    }

    function canManageYield(address) public pure override returns (bool) {
        return true;
    }

    function balanceAt(address holder, uint256 timestamp) public view override returns (uint256) {
        if (timestamp >= block.timestamp) return balanceOf(holder);

        // Return mocked historical balance if set, otherwise return 0
        return _historicalBalances[holder][timestamp];
    }

    // Test helper function to set historical balances
    function setHistoricalBalance(address holder, uint256 timestamp, uint256 balance) public {
        _historicalBalances[holder][timestamp] = balance;
    }
}
