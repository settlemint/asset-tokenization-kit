// SPDX-License-Identifier: GPL-3.0
/**
 *     T-REX is a suite of smart contracts implementing the ERC-3643 standard and
 *     developed by Tokeny to manage and transfer financial assets on EVM blockchains
 *
 *     Copyright (C) 2023, Tokeny sàrl.
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
pragma solidity ^0.8.27;

import { IModule, ComplianceBound, ComplianceUnbound } from "./IModule.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {
    ComplianceNotBound,
    ComplianceAlreadyBound,
    OnlyBoundComplianceCanCall,
    OnlyComplianceContractCanCall
} from "../../../errors/ComplianceErrors.sol";
import { ZeroAddress } from "../../../errors/InvalidArgumentErrors.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";

abstract contract AbstractModule is IModule, IERC165, Context {
    /// compliance contract binding status
    mapping(address => bool) private _complianceBound;

    /**
     * @dev Throws if `_compliance` is not a bound compliance contract address.
     */
    modifier onlyBoundCompliance(address _compliance) {
        require(_complianceBound[_compliance], ComplianceNotBound());
        _;
    }

    /**
     * @dev Throws if called from an address that is not a bound compliance contract.
     */
    modifier onlyComplianceCall() {
        require(_complianceBound[_msgSender()], OnlyBoundComplianceCanCall());
        _;
    }

    /**
     *  @dev See {IModule-bindCompliance}.
     */
    function bindCompliance(address _compliance) external override {
        require(_compliance != address(0), ZeroAddress());
        require(!_complianceBound[_compliance], ComplianceAlreadyBound());
        require(_msgSender() == _compliance, OnlyComplianceContractCanCall());
        _complianceBound[_compliance] = true;
        emit ComplianceBound(_compliance);
    }

    /**
     *  @dev See {IModule-unbindCompliance}.
     */
    function unbindCompliance(address _compliance) external override onlyComplianceCall {
        require(_compliance != address(0), ZeroAddress());
        require(_msgSender() == _compliance, OnlyComplianceContractCanCall());
        _complianceBound[_compliance] = false;
        emit ComplianceUnbound(_compliance);
    }

    /**
     *  @dev See {IModule-isComplianceBound}.
     */
    function isComplianceBound(address _compliance) external view override returns (bool) {
        return _complianceBound[_compliance];
    }

    /**
     *  @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public pure virtual override returns (bool) {
        return interfaceId == type(IModule).interfaceId || interfaceId == type(IERC165).interfaceId;
    }
}
