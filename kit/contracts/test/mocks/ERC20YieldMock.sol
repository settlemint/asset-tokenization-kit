// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Yield } from "../../contracts/extensions/ERC20Yield.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20YieldMock is ERC20, ERC20Yield, Ownable {
    uint256 private immutable _yieldBasisPerUnit;
    IERC20 private immutable _yieldToken;

    // Mapping: holder => timestamp => balance
    mapping(address => mapping(uint256 => uint256)) private _historicalBalances;
    // Mapping: account => blocked from managing yield
    mapping(address => bool) private _yieldManagementBlocked;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address yieldToken_,
        uint256 yieldBasisPerUnit_
    )
        ERC20(name, symbol)
        Ownable(msg.sender)
    {
        _mint(msg.sender, initialSupply);
        _yieldBasisPerUnit = yieldBasisPerUnit_;
        _yieldToken = IERC20(yieldToken_);
    }

    function yieldBasisPerUnit(address) public view override returns (uint256) {
        return _yieldBasisPerUnit;
    }

    function yieldToken() public view override returns (IERC20) {
        return _yieldToken;
    }

    function canManageYield(address account) public view override returns (bool) {
        return !_yieldManagementBlocked[account];
    }

    function blockYieldManagement(address account, bool blocked) public {
        _yieldManagementBlocked[account] = blocked;
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
