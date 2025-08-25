// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { SMARTToken } from "../../smart/examples/SMARTToken.sol";
import { SMARTComplianceModuleParamPair } from "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title MockSMARTToken
/// @notice Mock implementation extending SMARTToken for testing compliance modules
/// @dev Allows mocking balance for direct module testing without real token operations
contract MockSMARTToken is SMARTToken {
    mapping(address => uint256) private _mockBalances;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 cap,
        address onchainID_,
        address identityRegistry_,
        address compliance_,
        SMARTComplianceModuleParamPair[] memory complianceModules_,
        uint256 collateralClaimTopic_,
        address accessManager_
    ) SMARTToken(
        name,
        symbol,
        decimals,
        cap,
        onchainID_,
        identityRegistry_,
        compliance_,
        complianceModules_,
        collateralClaimTopic_,
        accessManager_
    ) {}

    /// @notice Override balanceOf to return mock balance
    /// @dev This allows testing lifecycle hooks without actual token operations
    function balanceOf(address account) public view override(ERC20, IERC20) returns (uint256) {
        return _mockBalances[account];
    }

    /// @notice Set mock balance for testing
    /// @dev Used by tests to simulate token balances
    function setBalance(address account, uint256 amount) external {
        _mockBalances[account] = amount;
    }
}