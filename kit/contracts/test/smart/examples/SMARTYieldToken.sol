// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SMARTToken } from "./SMARTToken.sol";
import { ISMARTYield } from "../../../contracts/smart/extensions/yield/ISMARTYield.sol";
import { ISMARTYieldSchedule } from "../../../contracts/smart/extensions/yield/schedules/ISMARTYieldSchedule.sol";
import { SMARTComplianceModuleParamPair } from
    "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";

contract SMARTYieldToken is SMARTToken, ISMARTYield {
    uint256 private constant DEFAULT_YIELD_BASIS = 1; // Default basis for yield calculations (1:1)
    IERC20 private _yieldToken; // Token used for yield payments
    address public yieldSchedule; // Store yield schedule address

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address onchainID_,
        address identityRegistry_,
        address compliance_,
        SMARTComplianceModuleParamPair[] memory modulePairs_,
        uint256 collateralTopicSchemeId_,
        address accessManager_,
        address yieldToken_
    )
        SMARTToken(
            name_,
            symbol_,
            decimals_,
            1_000_000 ether,
            onchainID_,
            identityRegistry_,
            compliance_,
            modulePairs_,
            collateralTopicSchemeId_,
            accessManager_
        )
    {
        _yieldToken = IERC20(yieldToken_);
    }

    // ISMARTYield implementation
    function setYieldSchedule(address schedule) external override {
        _checkRole(TOKEN_ADMIN_ROLE, _msgSender());

        if (schedule == address(0)) revert ZeroAddressNotAllowed();
        if (yieldSchedule != address(0)) revert YieldScheduleAlreadySet();

        yieldSchedule = schedule;
        emit YieldScheduleSet(_msgSender(), schedule);
    }

    function yieldBasisPerUnit(address /* holder */ ) external pure override returns (uint256) {
        return DEFAULT_YIELD_BASIS;
    }

    function yieldToken() external view override returns (IERC20) {
        return _yieldToken;
    }

    // Modifier to ensure minting is only allowed before yield schedule starts
    modifier onlyBeforeYieldStart() {
        if (yieldSchedule != address(0)) {
            if (ISMARTYieldSchedule(yieldSchedule).startDate() <= block.timestamp) {
                revert YieldScheduleActive();
            }
        }
        _;
    }

    // Override _beforeMint to add yield schedule check
    function _beforeMint(address to, uint256 amount) internal override(SMARTToken) onlyBeforeYieldStart {
        super._beforeMint(to, amount);
    }

    // Override supportsInterface to add ISMARTYield support
    function supportsInterface(bytes4 interfaceId) public view virtual override(SMARTToken) returns (bool) {
        return interfaceId == type(ISMARTYield).interfaceId || super.supportsInterface(interfaceId);
    }
}
