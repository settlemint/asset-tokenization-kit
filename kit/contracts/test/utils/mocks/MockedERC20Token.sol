// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// Basic Mock ERC20 for testing transfers

contract MockedERC20Token is Test, IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    mapping(address account => uint256 balance) public balanceOf;
    mapping(address account => mapping(address spender => uint256 allowance)) public allowance;
    uint256 public totalSupply;

    // Custom Errors
    error ERC20BurnAmountExceedsBalance(address from, uint256 balance, uint256 amount);
    error ERC20TransferFromZeroAddress();
    error ERC20TransferToZeroAddress();
    error ERC20TransferAmountExceedsBalance(address from, uint256 balance, uint256 amount);
    error ERC20ApproveFromZeroAddress();
    error ERC20ApproveToZeroAddress();
    error ERC20InsufficientAllowance(address spender, uint256 currentAllowance, uint256 amount);

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    function mint(address to, uint256 amount) public {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount); // Mint event
    }

    function burn(address from, uint256 amount) public {
        if (balanceOf[from] < amount) {
            revert ERC20BurnAmountExceedsBalance(from, balanceOf[from], amount);
        }
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount); // Burn event
    }

    function transfer(address to, uint256 amount) public virtual returns (bool) {
        address owner = msg.sender;
        _transfer(owner, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public virtual returns (bool) {
        address owner = msg.sender;
        _approve(owner, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public virtual returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal virtual {
        if (from == address(0)) {
            revert ERC20TransferFromZeroAddress();
        }
        if (to == address(0)) {
            revert ERC20TransferToZeroAddress();
        }

        uint256 fromBalance = balanceOf[from];
        if (fromBalance < amount) {
            revert ERC20TransferAmountExceedsBalance(from, fromBalance, amount);
        }
        unchecked {
            balanceOf[from] = fromBalance - amount;
        }
        balanceOf[to] += amount;

        emit Transfer(from, to, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        if (owner == address(0)) {
            revert ERC20ApproveFromZeroAddress();
        }
        if (spender == address(0)) {
            revert ERC20ApproveToZeroAddress();
        }

        allowance[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = allowance[owner][spender];
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance < amount) {
                revert ERC20InsufficientAllowance(spender, currentAllowance, amount);
            }
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }
}
