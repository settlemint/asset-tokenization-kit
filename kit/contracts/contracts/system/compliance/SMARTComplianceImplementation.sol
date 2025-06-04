// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

// OpenZeppelin imports
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ERC2771ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ERC165Upgradeable } from "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";

// Interface imports
import { ISMARTCompliance } from "../../interface/ISMARTCompliance.sol";
import { ISMARTComplianceModule } from "../../interface/ISMARTComplianceModule.sol";
import { ISMART } from "../../interface/ISMART.sol";
import { SMARTComplianceModuleParamPair } from "../../interface/structs/SMARTComplianceModuleParamPair.sol";

/// @title SMART Compliance Contract Implementation
/// @author SettleMint Tokenization Services
/// @notice This contract is the upgradeable logic implementation for the main compliance functionality within the SMART
/// Protocol.
/// @dev It acts as a central orchestrator for compliance checks related to SMART tokens (which implement the `ISMART`
/// interface).
/// When a SMART token operation occurs (like a transfer, creation, or destruction of tokens),
/// this compliance contract is notified. It then iterates through all compliance modules registered
/// with that specific token and calls the relevant functions (hooks) on each module.
/// For example, before a transfer, it checks `canTransfer` on all modules. After a transfer, it calls `transferred`.
/// This contract is designed to be used behind a proxy (like `SMARTComplianceProxy`) to allow its logic to be upgraded.
/// It supports meta-transactions via `ERC2771ContextUpgradeable` allowing a trusted forwarder to pay for gas fees.
/// It also implements `ERC165Upgradeable` for interface detection.
contract SMARTComplianceImplementation is
    Initializable,
    ISMARTCompliance,
    ERC2771ContextUpgradeable,
    ERC165Upgradeable
{
    // --- Constructor ---
    /// @notice Constructor for the compliance implementation contract.
    /// @dev This constructor is specific to OpenZeppelin's upgradeable contracts pattern.
    /// It initializes the `ERC2771ContextUpgradeable` with the address of a trusted forwarder for meta-transactions.
    /// The `_disableInitializers()` call is crucial for upgradeable contracts; it ensures that the `initialize`
    /// function
    /// cannot be called on the implementation contract directly after deployment, reserving it for the proxy context.
    /// @param trustedForwarder The address of the ERC-2771 trusted forwarder contract. This allows users to interact
    /// with this contract without paying gas fees directly, if the forwarder is set up to relay their transactions.
    /// @custom:oz-upgrades-unsafe-allow constructor This annotation is used by OpenZeppelin Upgrades plugins to
    /// acknowledge
    /// that this constructor is part of an upgradeable contract pattern and is handled correctly.
    constructor(address trustedForwarder) ERC2771ContextUpgradeable(trustedForwarder) {
        _disableInitializers();
    }

    // --- Initializer ---
    /// @notice Initializes the compliance contract after it has been deployed (typically via a proxy).
    /// @dev This function is called once to set up the initial state of the contract. In this case, it initializes
    /// the ERC165 interface detection capability. For upgradeable contracts, initializers replace constructors for
    /// setup logic.
    /// The `initializer` modifier ensures this function can only be called once.
    function initialize() public virtual initializer {
        __ERC165_init_unchained(); // Initializes ERC165 aannouncing which interfaces this contract supports
    }

    // --- ISMARTCompliance Implementation (State-Changing) ---

    /// @inheritdoc ISMARTCompliance
    /// @notice Called by an `ISMART` token contract after a token transfer has successfully occurred.
    /// @dev This function iterates through all compliance modules registered with the given `_token`.
    /// For each module, it calls the module's `transferred` function, passing along the transfer details.
    /// This allows modules to react to transfers, for example, by updating internal state or logging.
    /// It is critical that this function is only callable by the `ISMART` token contract it is associated with
    /// to prevent unauthorized notifications. The current implementation assumes this restriction is handled by the
    /// token contract itself.
    /// @param _token The address of the `ISMART` token contract that performed the transfer.
    /// @param _from The address from which tokens were transferred. This will be `address(0)` for token
    /// minting/creation events.
    /// @param _to The address to which tokens were transferred. This will be `address(0)` for token burning/destruction
    /// events.
    /// @param _amount The quantity of tokens that were transferred.
    function transferred(address _token, address _from, address _to, uint256 _amount) external virtual override {
        // Assumption: The ISMART token contract (_token) is responsible for access control,
        // ensuring only it can call this `transferred` function on its designated compliance contract.
        SMARTComplianceModuleParamPair[] memory modulePairs = ISMART(_token).complianceModules();
        uint256 modulePairsLength = modulePairs.length;
        for (uint256 i = 0; i < modulePairsLength;) {
            // Call the `transferred` hook on each registered compliance module.
            // The `modulePairs[i].params` are specific parameters configured for this module when it was added to the
            // token.
            ISMARTComplianceModule(modulePairs[i].module).transferred(
                _token, _from, _to, _amount, modulePairs[i].params
            );
            // Using unchecked arithmetic for the loop increment is safe here as modulePairsLength
            // is derived from storage and cannot cause an overflow that leads to an infinite loop within reasonable gas
            // limits.
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc ISMARTCompliance
    /// @notice Called by an `ISMART` token contract after new tokens have been successfully created (minted).
    /// @dev This function iterates through all compliance modules registered with the given `_token`.
    /// For each module, it calls the module's `created` function, passing along the creation details.
    /// This allows modules to react to token creation events.
    /// It is critical that this function is only callable by the `ISMART` token contract.
    /// @param _token The address of the `ISMART` token contract where tokens were created.
    /// @param _to The address to which the new tokens were minted.
    /// @param _amount The quantity of tokens that were created.
    function created(address _token, address _to, uint256 _amount) external virtual override {
        SMARTComplianceModuleParamPair[] memory modulePairs = ISMART(_token).complianceModules();
        uint256 modulePairsLength = modulePairs.length;
        for (uint256 i = 0; i < modulePairsLength;) {
            ISMARTComplianceModule(modulePairs[i].module).created(_token, _to, _amount, modulePairs[i].params);
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc ISMARTCompliance
    /// @notice Called by an `ISMART` token contract after tokens have been successfully destroyed (burned).
    /// @dev This function iterates through all compliance modules registered with the given `_token`.
    /// For each module, it calls the module's `destroyed` function, passing along the destruction details.
    /// This allows modules to react to token destruction events.
    /// It is critical that this function is only callable by the `ISMART` token contract.
    /// @param _token The address of the `ISMART` token contract from which tokens were destroyed.
    /// @param _from The address from which tokens were burned.
    /// @param _amount The quantity of tokens that were destroyed.
    function destroyed(address _token, address _from, uint256 _amount) external virtual override {
        SMARTComplianceModuleParamPair[] memory modulePairs = ISMART(_token).complianceModules();
        uint256 modulePairsLength = modulePairs.length;
        for (uint256 i = 0; i < modulePairsLength;) {
            ISMARTComplianceModule(modulePairs[i].module).destroyed(_token, _from, _amount, modulePairs[i].params);
            unchecked {
                ++i;
            }
        }
    }

    // --- ISMARTCompliance Implementation (View) ---

    /// @inheritdoc ISMARTCompliance
    /// @notice Checks if a single given module address and its associated parameters are valid.
    /// @dev This function calls the internal `_validateModuleAndParams` helper.
    /// It's a view function, meaning it doesn't change state and can be called without gas costs (if called
    /// externally).
    /// It will revert if the module is invalid (e.g., doesn't support `ISMARTComplianceModule` interface or parameters
    /// are incorrect for the module).
    /// @param _module The address of the compliance module contract to validate.
    /// @param _params The ABI-encoded parameters intended for this specific module. Each module defines how its
    /// parameters should be structured and validated.
    function isValidComplianceModule(address _module, bytes calldata _params) external view virtual override {
        _validateModuleAndParams(_module, _params);
    }

    /// @inheritdoc ISMARTCompliance
    /// @notice Checks if an array of compliance module and parameter pairs are all valid.
    /// @dev This function iterates through the provided array and calls `_validateModuleAndParams` for each pair.
    /// If any module/parameter pair in the array is invalid, the entire function call will revert.
    /// This is useful for validating a set of modules before registering them with a token.
    /// @param _pairs An array of `SMARTComplianceModuleParamPair` structs. Each struct contains a module address and
    /// its ABI-encoded parameters.
    function areValidComplianceModules(SMARTComplianceModuleParamPair[] calldata _pairs)
        external
        view
        virtual
        override
    {
        uint256 pairsLength = _pairs.length;
        // aderyn-fp-next-line(require-revert-in-loop)
        for (uint256 i = 0; i < pairsLength;) {
            _validateModuleAndParams(_pairs[i].module, _pairs[i].params);
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc ISMARTCompliance
    /// @notice Checks if a proposed token transfer is compliant with all registered modules for a given token.
    /// @dev This function is typically called by an `ISMART` token contract *before* a transfer is executed.
    /// It retrieves all compliance modules registered for the `_token` and calls the `canTransfer` view function on
    /// each module.
    /// If *any* of the modules revert during their `canTransfer` check (indicating the transfer is not allowed by that
    /// module),
    /// this entire function call will also revert, signaling that the transfer is not compliant.
    /// If all modules allow the transfer (i.e., none of them revert), this function returns `true`.
    /// @param _token The address of the `ISMART` token contract for which the compliance check is being performed.
    /// @param _from The address from which tokens would be transferred.
    /// @param _to The address to which tokens would be transferred.
    /// @param _amount The quantity of tokens proposed to be transferred.
    /// @return `true` if all registered compliance modules allow the transfer, otherwise the function reverts.
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
        SMARTComplianceModuleParamPair[] memory modulePairs = ISMART(_token).complianceModules();
        uint256 modulePairsLength = modulePairs.length;
        for (uint256 i = 0; i < modulePairsLength;) {
            // Each module's `canTransfer` function is expected to revert if the transfer is not allowed according to
            // its rules.
            // If a module reverts, this loop (and the entire `canTransfer` call) will also revert.
            ISMARTComplianceModule(modulePairs[i].module).canTransfer(
                _token, _from, _to, _amount, modulePairs[i].params
            );
            unchecked {
                ++i;
            }
        }
        // If the loop completes without any module reverting, it means all modules allow the transfer.
        return true;
    }

    // -- Internal Validation Function --

    /// @notice Internal helper function to validate a single compliance module and its parameters.
    /// @dev This function performs two main checks:
    /// 1. Ensures the `_module` address is not the zero address.
    /// 2. Verifies that the `_module` contract implements the `ISMARTComplianceModule` interface (using ERC165
    /// `supportsInterface`).
    /// 3. Calls the `validateParameters` function on the `_module` itself, allowing the module to check if `_params`
    /// are valid for its specific logic.
    /// If any of these checks fail, the function will revert with an appropriate error (`ZeroAddressNotAllowed`,
    /// `InvalidModuleImplementation`, or an error from the module's `validateParameters`).
    /// @param _module The address of the compliance module contract to validate.
    /// @param _params The ABI-encoded parameters to be validated by the module.
    function _validateModuleAndParams(address _module, bytes calldata _params) private view {
        if (_module == address(0)) revert ZeroAddressNotAllowed();

        // Check if the module supports the ISMARTComplianceModule interface (ERC165 check).
        // A `try-catch` block is used because the external call to `supportsInterface` could itself revert
        // (e.g., if _module is not a contract or runs out of gas)..
        try IERC165(_module).supportsInterface(type(ISMARTComplianceModule).interfaceId) returns (bool supported) {
            if (!supported) {
                revert InvalidModule(); // Revert if the interface is not supported by the module.
            }
        } catch {
            revert InvalidModule(); // Revert if the supportsInterface call itself fails for any reason.
        }

        // After confirming interface support, call the module's own parameter validation function.
        // This external call can revert if the parameters are invalid according to the module's logic.
        // If it reverts, the error will propagate up, causing `_validateModuleAndParams` to revert.
        ISMARTComplianceModule(_module).validateParameters(_params);
    }

    /// @inheritdoc ERC165Upgradeable
    /// @notice Checks if the contract supports a given interface ID.
    /// @dev This is part of the ERC165 standard, allowing other contracts to query what interfaces this contract
    /// implements.
    /// It declares support for the `ISMARTCompliance` interface and any interfaces supported by its parent contracts
    /// (via `super.supportsInterface`).
    /// @param interfaceId The interface identifier (bytes4) to check.
    /// @return `true` if the contract supports the interfaceId, `false` otherwise.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Upgradeable, IERC165)
        returns (bool)
    {
        return interfaceId == type(ISMARTCompliance).interfaceId || super.supportsInterface(interfaceId);
    }
}
