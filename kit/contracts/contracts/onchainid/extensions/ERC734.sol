// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IERC734 } from "@onchainid/contracts/interface/IERC734.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { ERC734KeyPurposes } from "../ERC734KeyPurposes.sol";

// Example: error MissingApprovalPermission(bytes32 key, uint256 requiredPurpose);

/// @title ERC734 Key Holder Standard Implementation
/// @author SettleMint
/// @notice This contract implements the ERC734 standard for managing cryptographic keys with different purposes
/// @dev Implementation of the IERC734 (Key Holder) standard.
/// This contract manages keys with different purposes and allows for execution of operations based on key approvals.
contract ERC734 is IERC734, ReentrancyGuard {
    // --- Custom Errors ---
    error KeyCannotBeZero();
    error KeyAlreadyHasThisPurpose(bytes32 key, uint256 purpose);
    error ExecutionIdDoesNotExist(uint256 executionId);
    error ExecutionAlreadyPerformed(uint256 executionId);
    error KeyDoesNotExist(bytes32 key);
    error KeyDoesNotHaveThisPurpose(bytes32 key, uint256 purpose);
    error CannotExecuteToZeroAddress();
    error InvalidInitialManagementKey();
    error InitialKeyAlreadySetup();

    struct Key {
        bytes32 key;
        uint256[] purposes;
        uint256 keyType; // e.g., 1 for ECDSA, 2 for RSA, etc.
    }

    struct Execution {
        address to;
        bool approved;
        bool executed;
        uint256 value;
        bytes data;
    }

    mapping(bytes32 => Key) internal _keys;
    mapping(uint256 => bytes32[]) internal _keysByPurpose;
    mapping(uint256 => Execution) internal _executions;
    uint256 internal _executionNonce;
    bool internal _initialized = false;

    /// @notice Initializes the ERC734 contract with an initial management key
    /// @param initialManagementKey The address to be set as the initial management key
    /// @param _isLibrary Flag indicating if this is deployed as a library (skips initialization)
    constructor(address initialManagementKey, bool _isLibrary) {
        if (!_isLibrary) {
            __ERC734_init(initialManagementKey);
        } else {
            _initialized = true;
        }
    }

    /// @notice Initializes the contract with a management key
    /// @param initialManagementKey The address to be set as the initial management key
    function initialize(address initialManagementKey) external virtual {
        __ERC734_init(initialManagementKey);
    }

    /// @notice Internal initialization function for ERC734
    /// @param initialManagementKey The address to be set as the initial management key
    function __ERC734_init(address initialManagementKey) internal {
        if (_initialized && !_isConstructor()) revert InitialKeyAlreadySetup();
        if (initialManagementKey == address(0)) revert InvalidInitialManagementKey();

        _initialized = true;

        bytes32 keyHash = keccak256(abi.encode(initialManagementKey));

        // Directly set up the first management key using storage from ERC734
        // This mimics the behavior of OnchainID's __Identity_init
        _keys[keyHash].key = keyHash;
        _keys[keyHash].purposes = [ERC734KeyPurposes.MANAGEMENT_KEY]; // Initialize dynamic array with one element
        _keys[keyHash].keyType = 1; // Assuming KeyType 1 for ECDSA / standard Ethereum address key

        _keysByPurpose[ERC734KeyPurposes.MANAGEMENT_KEY].push(keyHash);

        // Emit event defined in ERC734/IERC734
        emit KeyAdded(keyHash, ERC734KeyPurposes.MANAGEMENT_KEY, 1);
    }

    /// @notice Adds a key to the identity with a specific purpose
    /// @dev See {IERC734-addKey}.
    /// Adds a _key to the identity. The _purpose specifies the purpose of the key.
    /// Emits a {KeyAdded} event.
    /// Requirements:
    /// - This function should typically be restricted (e.g., by an owner or management key in the inheriting contract).
    /// @param _key The key identifier to add
    /// @param _purpose The purpose for the key (e.g., MANAGEMENT_KEY, ACTION_KEY, CLAIM_SIGNER_KEY)
    /// @param _keyType The type of key (e.g., 1 for ECDSA)
    /// @return success True if the key was successfully added
    function addKey(bytes32 _key, uint256 _purpose, uint256 _keyType) public virtual override returns (bool success) {
        if (_key == 0) revert KeyCannotBeZero();

        if (_keys[_key].key == _key) {
            // Key already exists, add new purpose
            uint256 purposesLength = _keys[_key].purposes.length;
            for (uint256 i = 0; i < purposesLength; ++i) {
                if (_keys[_key].purposes[i] == _purpose) {
                    revert KeyAlreadyHasThisPurpose({ key: _key, purpose: _purpose });
                }
            }
            _keys[_key].purposes.push(_purpose);
        } else {
            // New key
            _keys[_key].key = _key;
            _keys[_key].purposes = [_purpose];
            _keys[_key].keyType = _keyType;
        }

        _keysByPurpose[_purpose].push(_key);
        emit KeyAdded(_key, _purpose, _keyType);
        return true;
    }

    /// @notice Approves or disapproves an execution request
    /// @dev See {IERC734-approve}.
    /// Approves an execution.
    /// Emits an {Approved} event. If approval leads to execution, {Executed} or {ExecutionFailed} is emitted.
    /// Requirements:
    /// - `_id` must correspond to an existing, non-executed execution request.
    /// - The caller must have the appropriate permissions to approve (typically checked in the inheriting contract or
    /// via keyHasPurpose).
    /// @param _id The ID of the execution request
    /// @param _approve True to approve, false to disapprove
    /// @return success True if the approval was processed successfully
    function approve(uint256 _id, bool _approve) public virtual override nonReentrant returns (bool success) {
        // solhint-disable-next-line gas-strict-inequalities
        if (_id >= _executionNonce) revert ExecutionIdDoesNotExist({ executionId: _id });
        Execution storage execution = _executions[_id];
        if (execution.executed) revert ExecutionAlreadyPerformed({ executionId: _id });

        // Note: In a full Identity contract, you'd check msg.sender's key purpose here.
        // For example:
        // if (!keyHasPurpose(keccak256(abi.encode(msg.sender)), (execution.to == address(this) ? 1 : 2))) {
        //     revert MissingApprovalPermission({key: keccak256(abi.encode(msg.sender)), requiredPurpose: (execution.to
        // == address(this) ? 1 : 2) });
        // }

        emit Approved(_id, _approve);

        if (_approve) {
            execution.approved = true;

            // Attempt execution
            // solhint-disable-next-line security/no-low-level-calls
            (bool callSuccess,) = execution.to.call{ value: execution.value }(execution.data);
            if (callSuccess) {
                execution.executed = true; // Only mark as executed if the call succeeded
                emit Executed(_id, execution.to, execution.value, execution.data);
                return true;
            } else {
                emit ExecutionFailed(_id, execution.to, execution.value, execution.data);
                return false;
            }
        } else {
            execution.approved = false; // Explicitly mark as not approved
        }
        return true; // Successfully processed the approve call (approved or disapproved)
    }

    /// @notice Removes a specific purpose from a key
    /// @dev See {IERC734-removeKey}.
    /// Removes a _purpose from a _key. If it's the last purpose, the key is removed entirely.
    /// Emits a {KeyRemoved} event.
    /// Requirements:
    /// - This function should typically be restricted (e.g., by an owner or management key in the inheriting contract).
    /// - The _key must exist and have the specified _purpose.
    /// @param _key The key identifier to remove the purpose from
    /// @param _purpose The purpose to remove from the key
    /// @return success True if the key purpose was successfully removed
    function removeKey(bytes32 _key, uint256 _purpose) public virtual override returns (bool success) {
        if (_keys[_key].key != _key) revert KeyDoesNotExist({ key: _key });

        uint256[] storage purposes = _keys[_key].purposes;
        uint256 purposeIndex = type(uint256).max;
        uint256 purposesLength = purposes.length;
        for (uint256 i = 0; i < purposesLength; ++i) {
            if (purposes[i] == _purpose) {
                purposeIndex = i;
                break;
            }
        }
        if (purposeIndex == type(uint256).max) {
            revert KeyDoesNotHaveThisPurpose({ key: _key, purpose: _purpose });
        }

        // Remove purpose from _keys[_key].purposes array
        purposes[purposeIndex] = purposes[purposesLength - 1];
        purposes.pop();

        // Remove key from _keysByPurpose[_purpose] array
        bytes32[] storage keysWithPurpose = _keysByPurpose[_purpose];
        uint256 keyIndex = type(uint256).max;
        uint256 keysWithPurposeLength = keysWithPurpose.length;
        for (uint256 i = 0; i < keysWithPurposeLength; ++i) {
            if (keysWithPurpose[i] == _key) {
                keyIndex = i;
                break;
            }
        }
        // This should always find the key if the above logic is correct, but good to be safe or handle if necessary
        if (keyIndex != type(uint256).max) {
            keysWithPurpose[keyIndex] = keysWithPurpose[keysWithPurposeLength - 1];
            keysWithPurpose.pop();
        }

        uint256 keyType = _keys[_key].keyType;

        if (purposes.length == 0) {
            delete _keys[_key];
        }

        emit KeyRemoved(_key, _purpose, keyType);
        return true;
    }

    /// @notice Creates an execution request
    /// @dev See {IERC734-execute}.
    /// Initiates an execution. If the caller has appropriate keys, it might be auto-approved.
    /// Emits an {ExecutionRequested} event. If auto-approved and executed, also emits {Executed} or {ExecutionFailed}.
    /// Returns the `executionId`.
    /// The actual approval logic based on `msg.sender`'s keys (e.g., MANAGEMENT or ACTION) is usually handled
    /// in the `approve` function or by an overriding `execute` in the inheriting Identity contract.
    /// This base implementation creates the request.
    /// @param _to The address to execute the call to
    /// @param _value The amount of ETH to send
    /// @param _data The data payload for the call
    /// @return executionId The ID of the created execution request
    function execute(
        address _to,
        uint256 _value,
        bytes calldata _data
    )
        public
        payable
        virtual
        override
        nonReentrant
        returns (uint256 executionId)
    {
        if (_to == address(0)) revert CannotExecuteToZeroAddress();
        executionId = _executionNonce;
        _executions[executionId].to = _to;
        _executions[executionId].value = _value;
        _executions[executionId].data = _data;
        _executions[executionId].approved = false; // Default to not approved
        _executions[executionId].executed = false;
        ++_executionNonce;

        emit ExecutionRequested(executionId, _to, _value, _data);

        // Example of auto-approval logic that might exist in a full Identity contract:
        // bytes32 senderKey = keccak256(abi.encode(msg.sender));
        // if (keyHasPurpose(senderKey, 1)) { // MANAGEMENT_KEY
        //     approve(executionId, true);
        // } else if (_to != address(this) && keyHasPurpose(senderKey, 2)) { // ACTION_KEY and not self-call
        //     approve(executionId, true);
        // }

        return executionId;
    }

    /// @notice Retrieves information about a key
    /// @dev See {IERC734-getKey}.
    /// Returns the purposes, key type, and the key itself for a given `_key` hash.
    /// @param _key The key identifier to query
    /// @return purposes Array of purposes associated with the key
    /// @return keyType The type of the key
    /// @return key The key identifier itself
    function getKey(bytes32 _key)
        external
        view
        virtual
        override
        returns (uint256[] memory purposes, uint256 keyType, bytes32 key)
    {
        return (_keys[_key].purposes, _keys[_key].keyType, _keys[_key].key);
    }

    /// @notice Returns all purposes associated with a key
    /// @dev See {IERC734-getKeyPurposes}.
    /// Returns the list of purposes associated with a `_key`.
    /// @param _key The key identifier to query
    /// @return purposes Array of purposes associated with the key
    function getKeyPurposes(bytes32 _key) external view virtual override returns (uint256[] memory purposes) {
        return _keys[_key].purposes;
    }

    /// @notice Returns all keys that have a specific purpose
    /// @dev See {IERC734-getKeysByPurpose}.
    /// Returns an array of key hashes that have the given `_purpose`.
    /// @param _purpose The purpose to query keys for
    /// @return keys Array of key identifiers that have the specified purpose
    function getKeysByPurpose(uint256 _purpose) external view virtual override returns (bytes32[] memory keys) {
        return _keysByPurpose[_purpose];
    }

    /// @notice Checks if a key has a specific purpose
    /// @dev See {IERC734-keyHasPurpose}.
    /// Returns `true` if a `_key` is present and has the given `_purpose`.
    /// @param _key The key identifier to check
    /// @param _purpose The purpose to check for
    /// @return exists True if the key has the specified purpose
    function keyHasPurpose(bytes32 _key, uint256 _purpose) public view virtual override returns (bool exists) {
        Key storage k = _keys[_key];
        if (k.key == 0) {
            // Key does not exist
            return false;
        }
        uint256 purposesLength = k.purposes.length;
        for (uint256 i = 0; i < purposesLength; ++i) {
            uint256 purpose = k.purposes[i];
            if (purpose == ERC734KeyPurposes.MANAGEMENT_KEY || purpose == _purpose) {
                return true;
            }
        }
        return false;
    }

    /// @notice Checks if the current context is within a constructor
    /// @dev Computes if the context in which the function is called is a constructor or not.
    /// @return True if the context is a constructor
    function _isConstructor() private view returns (bool) {
        address self = address(this);
        uint256 cs;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            cs := extcodesize(self)
        }
        return cs == 0;
    }
}
