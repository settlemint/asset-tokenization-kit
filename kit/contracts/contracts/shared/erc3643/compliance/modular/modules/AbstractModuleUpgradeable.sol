// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableOnceNext2StepUpgradeable } from "../../../utils/OwnableOnceNext2StepUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { IModule } from "./IModule.sol";
import { ZeroAddress } from "../../../errors/InvalidArgumentErrors.sol";
import {
    ComplianceNotBound,
    ComplianceAlreadyBound,
    OnlyBoundComplianceCanCall,
    OnlyComplianceContractCanCall
} from "../../../errors/ComplianceErrors.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IERC173 } from "../../../roles/IERC173.sol";
import { ComplianceBound, ComplianceUnbound } from "./IModule.sol";

abstract contract AbstractModuleUpgradeable is
    IModule,
    Initializable,
    OwnableOnceNext2StepUpgradeable,
    UUPSUpgradeable,
    IERC165
{
    struct AbstractModuleStorage {
        /// compliance contract binding status
        mapping(address => bool) complianceBound;
        /// nonce for the module
        mapping(address => uint256) nonces;
    }

    // keccak256(abi.encode(uint256(keccak256("ERC3643.storage.AbstractModule")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant _ABSTRACT_MODULE_STORAGE_LOCATION =
        0xf6cc97de1266c180cd39f3b311632644143ce7873d2927755382ad4b39e8ae00;

    /**
     * @dev Throws if `_compliance` is not a bound compliance contract address.
     */
    modifier onlyBoundCompliance(address _compliance) {
        AbstractModuleStorage storage s = _getAbstractModuleStorage();
        require(s.complianceBound[_compliance], ComplianceNotBound());
        _;
    }

    /**
     * @dev Throws if called from an address that is not a bound compliance contract.
     */
    modifier onlyComplianceCall() {
        AbstractModuleStorage storage s = _getAbstractModuleStorage();
        require(s.complianceBound[_msgSender()], OnlyBoundComplianceCanCall());
        _;
    }

    /**
     *  @dev See {IModule-bindCompliance}.
     */
    function bindCompliance(address _compliance) external override {
        AbstractModuleStorage storage s = _getAbstractModuleStorage();
        require(_compliance != address(0), ZeroAddress());
        require(!s.complianceBound[_compliance], ComplianceAlreadyBound());
        require(_msgSender() == _compliance, OnlyComplianceContractCanCall());
        s.complianceBound[_compliance] = true;
        emit ComplianceBound(_compliance);
    }

    /**
     *  @dev See {IModule-unbindCompliance}.
     */
    function unbindCompliance(address _compliance) external override onlyComplianceCall {
        AbstractModuleStorage storage s = _getAbstractModuleStorage();
        require(_compliance != address(0), ZeroAddress());
        require(_msgSender() == _compliance, OnlyComplianceContractCanCall());

        s.complianceBound[_compliance] = false;
        s.nonces[_compliance]++;

        emit ComplianceUnbound(_compliance);
    }

    /**
     *  @dev See {IModule-isComplianceBound}.
     */
    function isComplianceBound(address _compliance) external view override returns (bool) {
        AbstractModuleStorage storage s = _getAbstractModuleStorage();
        return s.complianceBound[_compliance];
    }

    function getNonce(address _compliance) public view returns (uint256) {
        AbstractModuleStorage storage s = _getAbstractModuleStorage();
        return s.nonces[_compliance];
    }

    /**
     *  @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public pure virtual override returns (bool) {
        return interfaceId == type(IModule).interfaceId || interfaceId == type(IERC173).interfaceId
            || interfaceId == type(IERC165).interfaceId;
    }

    // solhint-disable-next-line func-name-mixedcase
    function __AbstractModule_init() internal onlyInitializing {
        __Ownable_init();
        __AbstractModule_init_unchained();
    }

    // solhint-disable-next-line no-empty-blocks, func-name-mixedcase
    function __AbstractModule_init_unchained() internal onlyInitializing { }

    // solhint-disable-next-line no-empty-blocks
    function _authorizeUpgrade(address /*newImplementation*/ ) internal virtual override onlyOwner { }

    function _getAbstractModuleStorage() private pure returns (AbstractModuleStorage storage s) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            s.slot := _ABSTRACT_MODULE_STORAGE_LOCATION
        }
    }
}
