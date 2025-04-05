// SPDX-License-Identifier: GPL-3.0
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
