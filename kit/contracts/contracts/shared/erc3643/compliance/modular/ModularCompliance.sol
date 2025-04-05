// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { OwnableOnceNext2StepUpgradeable } from "../../utils/OwnableOnceNext2StepUpgradeable.sol";
import { TokenBound, TokenUnbound } from "../../ERC-3643/IERC3643Compliance.sol";
import { IModularCompliance, ModuleRemoved, ModuleAdded, ModuleInteraction } from "./IModularCompliance.sol";
import { MCStorage } from "./MCStorage.sol";
import { IModule } from "./modules/IModule.sol";
import { ZeroAddress, ZeroValue } from "../../errors/InvalidArgumentErrors.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IERC173 } from "../../roles/IERC173.sol";
import {
    AddressNotATokenBoundToComplianceContract,
    ComplianceNotSuitableForBindingToModule
} from "../../errors/ComplianceErrors.sol";
import { ArraySizeLimited } from "../../errors/CommonErrors.sol";
import { IERC3643Compliance } from "../../ERC-3643/IERC3643Compliance.sol";

/// errors

/// @dev Thrown when trying to add more than max modules.
/// @param maxValue maximum number of modules.
error MaxModulesReached(uint256 maxValue);

/// @dev Thrown when module is already bound.
error ModuleAlreadyBound();

/// @dev Thrown when module is not bound.
error ModuleNotBound();

/// @dev Thrown when called by other than owner or token.
error OnlyOwnerOrTokenCanCall();

/// @dev Thrown when token is not bound.
error TokenNotBound();

contract ModularCompliance is IModularCompliance, OwnableOnceNext2StepUpgradeable, MCStorage, IERC165 {
    /// modifiers

    /**
     * @dev Throws if called by any address that is not a token bound to the compliance.
     */
    modifier onlyToken() {
        require(_msgSender() == _tokenBound, AddressNotATokenBoundToComplianceContract());
        _;
    }

    function init() external initializer {
        __Ownable_init();
    }

    /**
     *  @dev See {IERC3643Compliance-bindToken}.
     */
    function bindToken(address _token) external override {
        require(
            owner() == _msgSender() || (_tokenBound == address(0) && _msgSender() == _token), OnlyOwnerOrTokenCanCall()
        );
        require(_token != address(0), ZeroAddress());
        _tokenBound = _token;
        emit TokenBound(_token);
    }

    /**
     *  @dev See {IERC3643Compliance-unbindToken}.
     */
    function unbindToken(address _token) external override {
        require(owner() == _msgSender() || _msgSender() == _token, OnlyOwnerOrTokenCanCall());
        require(_token == _tokenBound, TokenNotBound());
        require(_token != address(0), ZeroAddress());
        delete _tokenBound;
        emit TokenUnbound(_token);
    }

    /**
     *  @dev See {IModularCompliance-removeModule}.
     */
    function removeModule(address _module) external override onlyOwner {
        require(_module != address(0), ZeroAddress());
        require(_moduleBound[_module], ModuleNotBound());
        uint256 length = _modules.length;
        for (uint256 i = 0; i < length; i++) {
            if (_modules[i] == _module) {
                IModule(_module).unbindCompliance(address(this));
                _modules[i] = _modules[length - 1];
                _modules.pop();
                _moduleBound[_module] = false;
                emit ModuleRemoved(_module);
                break;
            }
        }
    }

    /**
     *  @dev See {IERC3643Compliance-transferred}.
     */
    function transferred(address _from, address _to, uint256 _value) external override onlyToken {
        require(_from != address(0) && _to != address(0), ZeroAddress());
        require(_value > 0, ZeroValue());
        uint256 length = _modules.length;
        for (uint256 i = 0; i < length; i++) {
            IModule(_modules[i]).moduleTransferAction(_from, _to, _value);
        }
    }

    /**
     *  @dev See {IERC3643Compliance-created}.
     */
    function created(address _to, uint256 _value) external override onlyToken {
        require(_to != address(0), ZeroAddress());
        require(_value > 0, ZeroValue());
        uint256 length = _modules.length;
        for (uint256 i = 0; i < length; i++) {
            IModule(_modules[i]).moduleMintAction(_to, _value);
        }
    }

    /**
     *  @dev See {IERC3643Compliance-destroyed}.
     */
    function destroyed(address _from, uint256 _value) external override onlyToken {
        require(_from != address(0), ZeroAddress());
        require(_value > 0, ZeroValue());
        uint256 length = _modules.length;
        for (uint256 i = 0; i < length; i++) {
            IModule(_modules[i]).moduleBurnAction(_from, _value);
        }
    }

    /**
     *  @dev See {IModularCompliance-addAndSetModule}.
     */
    function addAndSetModule(address _module, bytes[] calldata _interactions) external override onlyOwner {
        require(_interactions.length <= 5, ArraySizeLimited(5));
        addModule(_module);
        for (uint256 i = 0; i < _interactions.length; i++) {
            callModuleFunction(_interactions[i], _module);
        }
    }

    /**
     *  @dev See {IModularCompliance-isModuleBound}.
     */
    function isModuleBound(address _module) external view override returns (bool) {
        return _moduleBound[_module];
    }

    /**
     *  @dev See {IModularCompliance-getModules}.
     */
    function getModules() external view override returns (address[] memory) {
        return _modules;
    }

    /**
     *  @dev See {IERC3643Compliance-getTokenBound}.
     */
    function getTokenBound() external view override returns (address) {
        return _tokenBound;
    }

    /**
     *  @dev See {IERC3643Compliance-getTokenBound}.
     */
    function isTokenBound(address _token) external view override returns (bool) {
        if (_token == _tokenBound) {
            return true;
        }
        return false;
    }

    /**
     *  @dev See {IERC3643Compliance-canTransfer}.
     */
    function canTransfer(address _from, address _to, uint256 _value) external view override returns (bool) {
        uint256 length = _modules.length;
        for (uint256 i = 0; i < length; i++) {
            if (!IModule(_modules[i]).moduleCheck(_from, _to, _value, address(this))) {
                return false;
            }
        }
        return true;
    }

    /**
     *  @dev See {IModularCompliance-addModule}.
     */
    function addModule(address _module) public override onlyOwner {
        require(_module != address(0), ZeroAddress());
        require(!_moduleBound[_module], ModuleAlreadyBound());
        require(_modules.length <= 24, MaxModulesReached(25));
        IModule module = IModule(_module);
        require(
            module.isPlugAndPlay() || module.canComplianceBind(address(this)),
            ComplianceNotSuitableForBindingToModule(_module)
        );

        module.bindCompliance(address(this));
        _modules.push(_module);
        _moduleBound[_module] = true;
        emit ModuleAdded(_module);
    }

    /**
     *  @dev see {IModularCompliance-callModuleFunction}.
     */
    function callModuleFunction(bytes calldata callData, address _module) public override onlyOwner {
        require(_moduleBound[_module], ModuleNotBound());
        // NOTE: Use assembly to call the interaction instead of a low level
        // call for two reasons:
        // - We don't want to copy the return data, since we discard it for
        // interactions.
        // - Solidity will under certain conditions generate code to copy input
        // calldata twice to memory (the second being a "memcopy loop").
        // solhint-disable-next-line no-inline-assembly
        assembly {
            let freeMemoryPointer := mload(0x40) // Load the free memory pointer from memory location 0x40

            // Copy callData from calldata to the free memory location
            calldatacopy(freeMemoryPointer, callData.offset, callData.length)

            if iszero( // Check if the call returns zero (indicating failure)
                call( // Perform the external call
                    gas(), // Provide all available gas
                    _module, // Address of the target module
                    0, // No ether is sent with the call
                    freeMemoryPointer, // Input data starts at the free memory pointer
                    callData.length, // Input data length
                    0, // Output data location (not used)
                    0 // Output data size (not used)
                )
            ) {
                returndatacopy(0, 0, returndatasize()) // Copy return data to memory starting at position 0
                revert(0, returndatasize()) // Revert the transaction with the return data
            }
        }

        emit ModuleInteraction(_module, _selector(callData));
    }

    /**
     *  @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public pure virtual override returns (bool) {
        return interfaceId == type(IModularCompliance).interfaceId
            || interfaceId == type(IERC3643Compliance).interfaceId || interfaceId == type(IERC173).interfaceId
            || interfaceId == type(IERC165).interfaceId;
    }

    /// @dev Extracts the Solidity ABI selector for the specified interaction.
    /// @param callData Interaction data.
    /// @return result The 4 byte function selector of the call encoded in
    /// this interaction.
    function _selector(bytes calldata callData) internal pure returns (bytes4 result) {
        if (callData.length >= 4) {
            // NOTE: Read the first word of the interaction's calldata. The
            // value does not need to be shifted since `bytesN` values are left
            // aligned, and the value does not need to be masked since masking
            // occurs when the value is accessed and not stored:
            // <https://docs.soliditylang.org/en/v0.7.6/abi-spec.html#encoding-of-indexed-event-parameters>
            // <https://docs.soliditylang.org/en/v0.7.6/assembly.html#access-to-external-variables-functions-and-libraries>
            // solhint-disable-next-line no-inline-assembly
            assembly {
                result := calldataload(callData.offset)
            }
        }
    }
}
