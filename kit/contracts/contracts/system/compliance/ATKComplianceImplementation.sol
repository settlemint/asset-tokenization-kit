// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";

// Interface imports
import { ISMARTCompliance } from "../../smart/interface/ISMARTCompliance.sol";
import { IATKCompliance } from "./IATKCompliance.sol";
import { ISMARTComplianceModule } from "../../smart/interface/ISMARTComplianceModule.sol";
import { ISMART } from "../../smart/interface/ISMART.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IATKSystemAccessManager } from "../access-manager/IATKSystemAccessManager.sol";
import { ATKPeopleRoles } from "../ATKPeopleRoles.sol";
import { ATKSystemRoles } from "../ATKSystemRoles.sol";
import { IATKSystemAccessManaged } from "../access-manager/IATKSystemAccessManaged.sol";

// Extensions
import { ATKSystemAccessManaged } from "../access-manager/ATKSystemAccessManaged.sol";

/// @title ATK Compliance Contract Implementation
/// @author SettleMint
/// @notice This contract is the upgradeable logic implementation for the main compliance functionality within the ATK
/// Protocol.
contract ATKComplianceImplementation is
    Initializable,
    ERC2771ContextUpgradeable,
    ATKSystemAccessManaged,
    IATKCompliance,
    ERC165Upgradeable
{
    // --- Storage ---
    /// @notice Optional centralized access manager for enhanced role checking
    /// @dev If set, enables multi-role access patterns alongside existing AccessControl
    IATKSystemAccessManager private _systemAccessManager;

    /// @notice Mapping of addresses that are on the bypass list to bypass compliance checks
    mapping(address => bool) private _bypassedAddresses;

    /// @notice Array of global compliance modules that apply to all tokens
    address[] private _globalComplianceModuleList;

    /// @notice Mapping from module address to its index (plus one) in the global module list
    /// @dev A value of 0 indicates the module is not in the list. Actual index is value - 1.
    mapping(address => uint256) private _globalModuleIndex;

    /// @notice Mapping from module address to its parameters
    /// @dev Stores the ABI-encoded parameters for each global compliance module
    mapping(address => bytes) private _globalModuleParameters;

    // --- Modifiers ---
    /// @notice Ensures that a hook is invoked only by the token specified in the call
    /// @param _token The token address that must be the caller
    modifier onlyToken(address _token) {
        _onlyToken(_token);
        _;
    }

    /// @notice Restricts hook calls to the originating SMART token.
    /// @param _token Expected token caller.
    function _onlyToken(address _token) internal view {
        if (msg.sender != _token) revert UnauthorizedCaller(msg.sender, _token);
    }

    // --- Constructor ---
    /// @notice Constructor that sets up the trusted forwarder and disables initializers
    /// @param trustedForwarder Address of the trusted forwarder for meta-transactions
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    // --- Initializer ---
    /// @notice Initializes the compliance contract with initial admin and bypass list manager admins
    /// @param accessManager Address that will receive the DEFAULT_ADMIN_ROLE
    function initialize(address accessManager) public virtual initializer {
        __ATKSystemAccessManaged_init(accessManager);
        __ERC165_init_unchained();
    }

    // --- Bypass List Management Functions ---

    /// @notice Adds an address to the compliance bypass list
    /// @dev Uses new multi-role access control. Can be called by COMPLIANCE_MANAGER_ROLE, SYSTEM_MANAGER_ROLE, or
    /// SYSTEM_MODULE_ROLE.
    /// Bypassed addresses can bypass compliance checks in canTransfer function.
    /// @param account The address to add to the bypass list
    function addToBypassList(address account)
        external
        onlySystemRoles3(
            ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE,
            ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE,
            ATKSystemRoles.ADDON_FACTORY_MODULE_ROLE
        )
    {
        if (account == address(0)) revert ZeroAddressNotAllowed();
        if (_bypassedAddresses[account]) revert AddressAlreadyOnBypassList(account);

        _bypassedAddresses[account] = true;
        emit AddressAddedToBypassList(account, _msgSender());
    }

    /// @notice Removes an address from the compliance bypass list
    /// @dev Uses new multi-role access control. Can be called by COMPLIANCE_MANAGER_ROLE, SYSTEM_MANAGER_ROLE, or
    /// SYSTEM_MODULE_ROLE.
    /// @param account The address to remove from the bypass list
    function removeFromBypassList(address account)
        external
        onlySystemRoles3(
            ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE,
            ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE,
            ATKSystemRoles.ADDON_FACTORY_MODULE_ROLE
        )
    {
        if (!_bypassedAddresses[account]) {
            revert AddressNotOnBypassList(account);
        }

        _bypassedAddresses[account] = false;
        emit AddressRemovedFromBypassList(account, _msgSender());
    }

    /// @notice Adds multiple addresses to the compliance bypass list in a single transaction
    /// @dev Uses new multi-role access control. Can be called by COMPLIANCE_MANAGER_ROLE, SYSTEM_MANAGER_ROLE, or
    /// SYSTEM_MODULE_ROLE.
    /// This is a gas-efficient way to add multiple addresses to the bypass list at once.
    /// @param accounts Array of addresses to add to the bypass list
    function addMultipleToBypassList(address[] calldata accounts)
        external
        onlySystemRoles3(
            ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE,
            ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE,
            ATKSystemRoles.ADDON_FACTORY_MODULE_ROLE
        )
    {
        uint256 accountsLength = accounts.length;
        for (uint256 i = 0; i < accountsLength;) {
            address account = accounts[i];
            if (account == address(0)) revert ZeroAddressNotAllowed();
            if (_bypassedAddresses[account]) revert AddressAlreadyOnBypassList(account);

            _bypassedAddresses[account] = true;
            emit AddressAddedToBypassList(account, _msgSender());

            unchecked {
                ++i;
            }
        }
    }

    /// @notice Removes multiple addresses from the compliance bypass list in a single transaction
    /// @dev Uses new multi-role access control. Can be called by COMPLIANCE_MANAGER_ROLE, SYSTEM_MANAGER_ROLE, or
    /// SYSTEM_MODULE_ROLE.
    /// @param accounts Array of addresses to remove from the bypass list
    function removeMultipleFromBypassList(address[] calldata accounts)
        external
        onlySystemRoles3(
            ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE,
            ATKSystemRoles.TOKEN_FACTORY_MODULE_ROLE,
            ATKSystemRoles.ADDON_FACTORY_MODULE_ROLE
        )
    {
        uint256 accountsLength = accounts.length;
        for (uint256 i = 0; i < accountsLength;) {
            address account = accounts[i];
            if (!_bypassedAddresses[account]) revert AddressNotOnBypassList(account);

            _bypassedAddresses[account] = false;
            emit AddressRemovedFromBypassList(account, _msgSender());

            unchecked {
                ++i;
            }
        }
    }

    /// @notice Checks if an address is on the compliance bypass list
    /// @param account The address to check
    /// @return True if the address is on the bypass list, false otherwise
    function isBypassed(address account) external view returns (bool) {
        return _bypassedAddresses[account];
    }

    // --- Global Compliance Module Management Functions ---

    /// @notice Adds a global compliance module that applies to all tokens
    /// @param module Address of the compliance module to add
    /// @param params ABI-encoded parameters for the module
    function addGlobalComplianceModule(
        address module,
        bytes calldata params
    )
        external
        onlySystemRoles2(ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE, ATKSystemRoles.SYSTEM_MODULE_ROLE)
    {
        // Validate module and parameters first
        _validateModuleAndParams(module, params);

        // Check if module is already added
        if (_globalModuleIndex[module] != 0) {
            revert GlobalModuleAlreadyAdded(module);
        }

        // Add to data structures
        _globalComplianceModuleList.push(module);
        _globalModuleIndex[module] = _globalComplianceModuleList.length; // Store index + 1
        _globalModuleParameters[module] = params;

        emit GlobalComplianceModuleAdded(_msgSender(), module, params);
    }

    /// @notice Removes a global compliance module
    /// @param module Address of the compliance module to remove
    function removeGlobalComplianceModule(address module)
        external
        onlySystemRole(ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE)
    {
        uint256 index = _globalModuleIndex[module]; // This is index + 1
        if (index == 0) {
            revert GlobalModuleNotFound(module);
        }

        uint256 listIndex = index - 1; // Actual array index
        uint256 lastIndex = _globalComplianceModuleList.length - 1;

        if (listIndex != lastIndex) {
            // If it's not the last element, swap with the last element
            address lastModule = _globalComplianceModuleList[lastIndex];
            _globalComplianceModuleList[listIndex] = lastModule;
            _globalModuleIndex[lastModule] = listIndex + 1; // Update index of the element that was moved
        }
        _globalComplianceModuleList.pop(); // Remove the last element

        delete _globalModuleIndex[module]; // Clear the module's index
        delete _globalModuleParameters[module]; // Clear the module's parameters

        emit GlobalComplianceModuleRemoved(_msgSender(), module);
    }

    /// @notice Updates the parameters for an existing global compliance module
    /// @param module Address of the compliance module to update
    /// @param params New ABI-encoded parameters for the module
    function setParametersForGlobalComplianceModule(
        address module,
        bytes calldata params
    )
        external
        onlySystemRole(ATKPeopleRoles.COMPLIANCE_MANAGER_ROLE)
    {
        if (_globalModuleIndex[module] == 0) {
            revert GlobalModuleNotFound(module);
        }
        _validateModuleAndParams(module, params);
        _globalModuleParameters[module] = params;
        emit GlobalComplianceModuleParametersUpdated(_msgSender(), module, params);
    }

    /// @notice Returns all global compliance modules with their parameters
    /// @return Array of module-parameter pairs for all global compliance modules
    function getGlobalComplianceModules() external view returns (SMARTComplianceModuleParamPair[] memory) {
        uint256 length = _globalComplianceModuleList.length;
        SMARTComplianceModuleParamPair[] memory modules = new SMARTComplianceModuleParamPair[](length);

        for (uint256 i = 0; i < length;) {
            modules[i] = SMARTComplianceModuleParamPair({
                module: _globalComplianceModuleList[i],
                params: _globalModuleParameters[_globalComplianceModuleList[i]]
            });
            unchecked {
                ++i;
            }
        }

        return modules;
    }

    // --- ISMARTCompliance Implementation (State-Changing) ---

    /// @notice Called after a token transfer to update compliance module states
    /// @param _token Address of the token contract
    /// @param _from Address tokens were transferred from
    /// @param _to Address tokens were transferred to
    /// @param _amount Amount of tokens transferred
    function transferred(
        address _token,
        address _from,
        address _to,
        uint256 _amount
    )
        external
        virtual
        override
        onlyToken(_token)
    {
        // First, call token-specific compliance modules
        SMARTComplianceModuleParamPair[] memory tokenModulePairs = ISMART(_token).complianceModules();
        uint256 tokenModulePairsLength = tokenModulePairs.length;
        for (uint256 i = 0; i < tokenModulePairsLength;) {
            ISMARTComplianceModule(tokenModulePairs[i].module).transferred(
                _token, _from, _to, _amount, tokenModulePairs[i].params
            );
            unchecked {
                ++i;
            }
        }

        // Second, call global compliance modules
        uint256 globalModulesLength = _globalComplianceModuleList.length;
        for (uint256 i = 0; i < globalModulesLength;) {
            ISMARTComplianceModule(_globalComplianceModuleList[i]).transferred(
                _token, _from, _to, _amount, _globalModuleParameters[_globalComplianceModuleList[i]]
            );
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Called after tokens are created/minted to update compliance module states
    /// @param _token Address of the token contract
    /// @param _to Address tokens were created for
    /// @param _amount Amount of tokens created
    function created(address _token, address _to, uint256 _amount) external virtual override onlyToken(_token) {
        // First, call token-specific compliance modules
        SMARTComplianceModuleParamPair[] memory tokenModulePairs = ISMART(_token).complianceModules();
        uint256 tokenModulePairsLength = tokenModulePairs.length;
        for (uint256 i = 0; i < tokenModulePairsLength;) {
            ISMARTComplianceModule(tokenModulePairs[i].module).created(_token, _to, _amount, tokenModulePairs[i].params);
            unchecked {
                ++i;
            }
        }

        // Second, call global compliance modules
        uint256 globalModulesLength = _globalComplianceModuleList.length;
        for (uint256 i = 0; i < globalModulesLength;) {
            ISMARTComplianceModule(_globalComplianceModuleList[i]).created(
                _token, _to, _amount, _globalModuleParameters[_globalComplianceModuleList[i]]
            );
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Called after tokens are destroyed/burned to update compliance module states
    /// @param _token Address of the token contract
    /// @param _from Address tokens were destroyed from
    /// @param _amount Amount of tokens destroyed
    function destroyed(address _token, address _from, uint256 _amount) external virtual override onlyToken(_token) {
        // First, call token-specific compliance modules
        SMARTComplianceModuleParamPair[] memory tokenModulePairs = ISMART(_token).complianceModules();
        uint256 tokenModulePairsLength = tokenModulePairs.length;
        for (uint256 i = 0; i < tokenModulePairsLength;) {
            ISMARTComplianceModule(tokenModulePairs[i].module).destroyed(
                _token, _from, _amount, tokenModulePairs[i].params
            );
            unchecked {
                ++i;
            }
        }

        // Second, call global compliance modules
        uint256 globalModulesLength = _globalComplianceModuleList.length;
        for (uint256 i = 0; i < globalModulesLength;) {
            ISMARTComplianceModule(_globalComplianceModuleList[i]).destroyed(
                _token, _from, _amount, _globalModuleParameters[_globalComplianceModuleList[i]]
            );
            unchecked {
                ++i;
            }
        }
    }

    // --- ISMARTCompliance Implementation (View) ---

    /// @notice Validates that a module and its parameters are valid
    /// @param _module Address of the compliance module to validate
    /// @param _params ABI-encoded parameters to validate
    function isValidComplianceModule(address _module, bytes calldata _params) external view virtual override {
        _validateModuleAndParams(_module, _params);
    }

    /// @notice Validates that multiple modules and their parameters are valid
    /// @param _pairs Array of module-parameter pairs to validate
    function areValidComplianceModules(SMARTComplianceModuleParamPair[] calldata _pairs)
        external
        view
        virtual
        override
    {
        uint256 pairsLength = _pairs.length;
        for (uint256 i = 0; i < pairsLength;) {
            _validateModuleAndParams(_pairs[i].module, _pairs[i].params);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Checks if a token transfer is compliant with all applicable modules
    /// @param _token Address of the token contract
    /// @param _from Address tokens would be transferred from
    /// @param _to Address tokens would be transferred to
    /// @param _amount Amount of tokens to transfer
    /// @return True if the transfer is compliant, false otherwise
    function canTransfer(
        address _token,
        address _from,
        address _to,
        uint256 _amount
    )
        external
        view
        virtual
        override
        returns (bool)
    {
        // Check if receiver is on the bypass list - if so, bypass all compliance checks
        if (_bypassedAddresses[_to]) {
            return true;
        }

        // First, check token-specific compliance modules
        SMARTComplianceModuleParamPair[] memory tokenModulePairs = ISMART(_token).complianceModules();
        uint256 tokenModulePairsLength = tokenModulePairs.length;
        for (uint256 i = 0; i < tokenModulePairsLength;) {
            ISMARTComplianceModule(tokenModulePairs[i].module).canTransfer(
                _token, _from, _to, _amount, tokenModulePairs[i].params
            );
            unchecked {
                ++i;
            }
        }

        // Second, check global compliance modules
        uint256 globalModulesLength = _globalComplianceModuleList.length;
        for (uint256 i = 0; i < globalModulesLength;) {
            ISMARTComplianceModule(_globalComplianceModuleList[i]).canTransfer(
                _token, _from, _to, _amount, _globalModuleParameters[_globalComplianceModuleList[i]]
            );
            unchecked {
                ++i;
            }
        }

        return true;
    }

    // -- Internal Validation Function --

    /// @notice Internal function to validate a compliance module and its parameters
    /// @param _module Address of the compliance module to validate
    /// @param _params ABI-encoded parameters to validate
    function _validateModuleAndParams(address _module, bytes calldata _params) private view {
        if (_module == address(0)) revert ZeroAddressNotAllowed();

        try IERC165(_module).supportsInterface(type(ISMARTComplianceModule).interfaceId) returns (bool supported) {
            if (!supported) {
                revert InvalidModule();
            }
        } catch {
            revert InvalidModule();
        }

        ISMARTComplianceModule(_module).validateParameters(_params);
    }

    // --- Overrides for ERC2771ContextUpgradeable ---

    /// @notice Checks if the contract supports a given interface
    /// @param interfaceId The interface identifier to check
    /// @return True if the interface is supported, false otherwise
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Upgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == type(ISMARTCompliance).interfaceId || interfaceId == type(IATKCompliance).interfaceId
            || interfaceId == type(IATKSystemAccessManaged).interfaceId || super.supportsInterface(interfaceId);
    }

    /// @notice Returns the message sender, considering meta-transactions
    /// @return sender The address of the message sender
    function _msgSender()
        internal
        view
        virtual
        override(ERC2771ContextUpgradeable, ATKSystemAccessManaged)
        returns (address sender)
    {
        return ERC2771ContextUpgradeable._msgSender();
    }
}
