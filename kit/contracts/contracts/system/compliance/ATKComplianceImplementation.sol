// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

// Interface imports
import { ISMARTCompliance } from "../../smart/interface/ISMARTCompliance.sol";
import { IATKCompliance } from "./IATKCompliance.sol";
import { ISMARTComplianceModule } from "../../smart/interface/ISMARTComplianceModule.sol";
import { ISMART } from "../../smart/interface/ISMART.sol";
import { SMARTComplianceModuleParamPair } from "../../smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IATKSystemAccessManager } from "../access-manager/IATKSystemAccessManager.sol";
import { ATKSystemRoles } from "../ATKSystemRoles.sol";



/// @title ATK Compliance Contract Implementation
/// @author SettleMint
/// @notice This contract is the upgradeable logic implementation for the main compliance functionality within the ATK Protocol.
contract ATKComplianceImplementation is
    Initializable,
    ERC2771ContextUpgradeable,
    AccessControlUpgradeable,
    IATKCompliance
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

    // --- Access Control Modifiers ---

    /// @notice Modifier that checks if the caller has any of the specified roles in the system access manager
    modifier onlySystemAndComplianceManagerRoles() {
        bytes32[] memory roles = new bytes32[](3);
        roles[0] = ATKSystemRoles.COMPLIANCE_MANAGER_ROLE;       // Primary compliance manager
        roles[1] = ATKSystemRoles.SYSTEM_MANAGER_ROLE;           // System manager
        roles[2] = ATKSystemRoles.SYSTEM_MODULE_ROLE;            // System module role

        _onlySystemRoles(roles, _msgSender());
        _;
    }

    /// @notice Modifier that checks if the caller has the compliance manager role
    modifier onlyComplianceManagerRole() {
        bytes32[] memory roles = new bytes32[](1);
        roles[0] = ATKSystemRoles.COMPLIANCE_MANAGER_ROLE;

        _onlySystemRoles(roles, _msgSender());
        _;
    }

    // --- Internal Helper Functions ---

    /// @notice Internal helper function to check if the caller has any of the specified roles
    /// @dev Falls back to AccessControl if system access manager is not set
    /// @param roles Array of roles, where the caller must have at least one
    /// @param sender The address of the caller
    function _onlySystemRoles(bytes32[] memory roles, address sender) internal view {
        if (address(_systemAccessManager) == address(0)) revert SystemAccessManagerNotSet();
        if (!_systemAccessManager.hasAnyRole(roles, sender)) revert UnauthorizedAccess();
    }


    // --- Constructor ---
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    // --- Initializer ---
    function initialize(
        address initialAdmin,
        address[] calldata initialBypassListManagerAdmins
    )
        public
        virtual
        initializer
    {
        __ERC165_init_unchained();
        __AccessControl_init_unchained();

        _setRoleAdmin(ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE, ATKSystemRoles.BYPASS_LIST_MANAGER_ADMIN_ROLE);

        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);

        for (uint256 i = 0; i < initialBypassListManagerAdmins.length; ++i) {
            _grantRole(ATKSystemRoles.BYPASS_LIST_MANAGER_ROLE, initialBypassListManagerAdmins[i]);
            _grantRole(ATKSystemRoles.BYPASS_LIST_MANAGER_ADMIN_ROLE, initialBypassListManagerAdmins[i]);
        }
    }

    // --- System Access Manager Functions ---

    /// @notice Sets the system access manager for enhanced role checking
    /// @dev Only callable by accounts with DEFAULT_ADMIN_ROLE. Setting to address(0) disables centralized access control
    /// @param systemAccessManager The address of the ATK system access manager, or address(0) to disable
    function setSystemAccessManager(address systemAccessManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _systemAccessManager = IATKSystemAccessManager(systemAccessManager);
        emit SystemAccessManagerSet(_msgSender(), systemAccessManager);
    }

    /// @notice Returns the current system access manager address
    /// @return The address of the system access manager, or address(0) if not set
    function getSystemAccessManager() external view returns (address) {
        return address(_systemAccessManager);
    }

    /// @notice Event emitted when the system access manager is updated
    /// @param admin The address that updated the system access manager
    /// @param systemAccessManager The new system access manager address
    event SystemAccessManagerSet(address indexed admin, address indexed systemAccessManager);

    // --- Bypass List Management Functions ---

    /// @notice Adds an address to the compliance bypass list
    /// @dev Uses new multi-role access control. Can be called by COMPLIANCE_MANAGER_ROLE, SYSTEM_MANAGER_ROLE, or SYSTEM_MODULE_ROLE.
    /// Bypassed addresses can bypass compliance checks in canTransfer function.
    /// @param account The address to add to the bypass list
    function addToBypassList(address account) external onlySystemAndComplianceManagerRoles() {
        if (account == address(0)) revert ZeroAddressNotAllowed();
        if (_bypassedAddresses[account]) revert AddressAlreadyOnBypassList(account);

        _bypassedAddresses[account] = true;
        emit AddressAddedToBypassList(account, _msgSender());
    }

    /// @notice Removes an address from the compliance bypass list
    /// @dev Uses new multi-role access control. Can be called by COMPLIANCE_MANAGER_ROLE, SYSTEM_MANAGER_ROLE, or SYSTEM_MODULE_ROLE.
    /// @param account The address to remove from the bypass list
    function removeFromBypassList(address account) external onlySystemAndComplianceManagerRoles() {
        if (!_bypassedAddresses[account]) revert AddressNotOnBypassList(account);

        _bypassedAddresses[account] = false;
        emit AddressRemovedFromBypassList(account, _msgSender());
    }

    /// @notice Adds multiple addresses to the compliance bypass list in a single transaction
    /// @dev Uses new multi-role access control. Can be called by COMPLIANCE_MANAGER_ROLE, SYSTEM_MANAGER_ROLE, or SYSTEM_MODULE_ROLE.
    /// This is a gas-efficient way to add multiple addresses to the bypass list at once.
    /// @param accounts Array of addresses to add to the bypass list
    function addMultipleToBypassList(address[] calldata accounts)
        external
        onlySystemAndComplianceManagerRoles()
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
    /// @dev Uses new multi-role access control. Can be called by COMPLIANCE_MANAGER_ROLE, SYSTEM_MANAGER_ROLE, or SYSTEM_MODULE_ROLE.
    /// @param accounts Array of addresses to remove from the bypass list
    function removeMultipleFromBypassList(address[] calldata accounts)
        external
        onlySystemAndComplianceManagerRoles()
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

    function isBypassed(address account) external view returns (bool) {
        return _bypassedAddresses[account];
    }

    // --- Global Compliance Module Management Functions ---

    function addGlobalComplianceModule(address module, bytes calldata params)
        external
        onlyComplianceManagerRole()
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

    function removeGlobalComplianceModule(address module)
        external
        onlyComplianceManagerRole()
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

        emit GlobalComplianceModuleRemoved(_msgSender(),module);
    }

    function setParametersForGlobalComplianceModule(address module, bytes calldata params)
        external
        onlyComplianceManagerRole()
    {
        if (_globalModuleIndex[module] == 0) {
            revert GlobalModuleNotFound(module);
        }
        _validateModuleAndParams(module, params);
        _globalModuleParameters[module] = params;
        emit GlobalComplianceModuleParametersUpdated(_msgSender(), module, params);
    }

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

    function transferred(address _token, address _from, address _to, uint256 _amount) external virtual override {
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

    function created(address _token, address _to, uint256 _amount) external virtual override {
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
            ISMARTComplianceModule(_globalComplianceModuleList[i]).created(_token, _to, _amount, _globalModuleParameters[_globalComplianceModuleList[i]]);
            unchecked {
                ++i;
            }
        }
    }

    function destroyed(address _token, address _from, uint256 _amount) external virtual override {
        // First, call token-specific compliance modules
        SMARTComplianceModuleParamPair[] memory tokenModulePairs = ISMART(_token).complianceModules();
        uint256 tokenModulePairsLength = tokenModulePairs.length;
        for (uint256 i = 0; i < tokenModulePairsLength;) {
            ISMARTComplianceModule(tokenModulePairs[i].module).destroyed(_token, _from, _amount, tokenModulePairs[i].params);
            unchecked {
                ++i;
            }
        }

        // Second, call global compliance modules
        uint256 globalModulesLength = _globalComplianceModuleList.length;
        for (uint256 i = 0; i < globalModulesLength;) {
            ISMARTComplianceModule(_globalComplianceModuleList[i]).destroyed(_token, _from, _amount, _globalModuleParameters[_globalComplianceModuleList[i]]);
            unchecked {
                ++i;
            }
        }
    }

    // --- ISMARTCompliance Implementation (View) ---

    function isValidComplianceModule(address _module, bytes calldata _params) external view virtual override {
        _validateModuleAndParams(_module, _params);
    }

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

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlUpgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == type(ISMARTCompliance).interfaceId || interfaceId == type(IATKCompliance).interfaceId
            || super.supportsInterface(interfaceId);
    }

    function _msgSender()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address sender)
    {
        return ERC2771ContextUpgradeable._msgSender();
    }

    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return ERC2771ContextUpgradeable._msgData();
    }

    function _contextSuffixLength()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (uint256)
    {
        return ERC2771ContextUpgradeable._contextSuffixLength();
    }
}