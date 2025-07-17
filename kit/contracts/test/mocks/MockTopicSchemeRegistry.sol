// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ERC165 } from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ISMARTTopicSchemeRegistry } from "../../contracts/smart/interface/ISMARTTopicSchemeRegistry.sol";
import { IATKTopicSchemeRegistry } from "../../contracts/system/topic-scheme-registry/IATKTopicSchemeRegistry.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { ATKSystemRoles } from "../../contracts/system/ATKSystemRoles.sol";

contract MockTopicSchemeRegistry is ERC165, IATKTopicSchemeRegistry {
    mapping(uint256 => TopicScheme) private _topicSchemes;
    uint256[] private _topicIds;
    mapping(uint256 => uint256) private _topicIdIndex;

    // For testing purposes
    address public systemAccessManager;
    address public admin;
    address[] public registrars;
    mapping(address => bool) internal _hasRegistrarRole;
    bool internal _canSetSystemAccessManager = true;

    // Custom errors
    error EmptyName();
    error EmptySignature();
    error TopicSchemeAlreadyExists(string name);
    error TopicSchemeDoesNotExist(uint256 topicId);
    error TopicSchemeDoesNotExistByName(string name);
    error TopicIdNotFoundInArray(uint256 topicId);
    error SignatureUnchanged(string name, string signature);
    error ArrayLengthMismatch(uint256 namesLength, uint256 signaturesLength);
    error EmptyArraysProvided();
    error SystemAccessManagerNotSet();
    error ZeroAddressNotAllowed();

    // Using SystemAccessManagerUpdated from ATKSystemAccessControlled
    event SystemAccessManagerUpdated(address indexed oldManager, address indexed newManager);

    function initialize(
        address _systemAccessManager,
        address _initialAdmin,
        address[] memory _initialRegistrars
    )
        external
        override
    {
        systemAccessManager = _systemAccessManager;
        admin = _initialAdmin;

        // Set registrars
        for (uint256 i = 0; i < _initialRegistrars.length; i++) {
            _hasRegistrarRole[_initialRegistrars[i]] = true;
            registrars.push(_initialRegistrars[i]);
        }
    }

    // Special testing methods
    function setRegistrarRole(address account, bool value) external {
        _hasRegistrarRole[account] = value;
    }

    function setCanUpdateSystemAccessManager(bool value) external {
        _canSetSystemAccessManager = value;
    }

    function canSetSystemAccessManager() external view returns (bool) {
        return _canSetSystemAccessManager;
    }

    function setSystemAccessManager(address _systemAccessManagerAddress) external {
        if (!_canSetSystemAccessManager) {
            revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, ATKSystemRoles.DEFAULT_ADMIN_ROLE);
        }

        if (_systemAccessManagerAddress == address(0)) revert ZeroAddressNotAllowed();

        address oldManager = systemAccessManager;
        systemAccessManager = _systemAccessManagerAddress;

        emit SystemAccessManagerUpdated(oldManager, _systemAccessManagerAddress);
    }

    modifier onlyRegistrar() {
        if (!_hasRegistrarRole[msg.sender]) {
            revert IAccessControl.AccessControlUnauthorizedAccount(msg.sender, ATKSystemRoles.REGISTRAR_ROLE);
        }
        _;
    }

    function registerTopicScheme(string calldata name, string calldata signature) external override onlyRegistrar {
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(signature).length == 0) revert EmptySignature();

        // Generate topicId from name
        uint256 topicId = getTopicId(name);

        if (_topicSchemes[topicId].exists) revert TopicSchemeAlreadyExists(name);

        // Store the topic scheme
        _topicSchemes[topicId] = TopicScheme({ topicId: topicId, signature: signature, exists: true });

        // Add to enumeration array
        _topicIds.push(topicId);
        _topicIdIndex[topicId] = _topicIds.length;

        emit TopicSchemeRegistered(msg.sender, topicId, name, signature);
    }

    function batchRegisterTopicSchemes(
        string[] calldata names,
        string[] calldata signatures
    )
        external
        override
        onlyRegistrar
    {
        uint256 namesLength = names.length;
        uint256 signaturesLength = signatures.length;

        if (namesLength == 0 || signaturesLength == 0) revert EmptyArraysProvided();
        if (namesLength != signaturesLength) revert ArrayLengthMismatch(namesLength, signaturesLength);

        uint256[] memory topicIds = new uint256[](namesLength);

        for (uint256 i = 0; i < namesLength; i++) {
            string calldata name = names[i];
            string calldata signature = signatures[i];

            if (bytes(name).length == 0) revert EmptyName();
            if (bytes(signature).length == 0) revert EmptySignature();

            uint256 topicId = getTopicId(name);
            topicIds[i] = topicId;

            if (_topicSchemes[topicId].exists) revert TopicSchemeAlreadyExists(name);

            _topicSchemes[topicId] = TopicScheme({ topicId: topicId, signature: signature, exists: true });

            _topicIds.push(topicId);
            _topicIdIndex[topicId] = _topicIds.length;

            emit TopicSchemeRegistered(msg.sender, topicId, name, signature);
        }

        emit TopicSchemesBatchRegistered(msg.sender, topicIds, names, signatures);
    }

    /// @inheritdoc IATKTopicSchemeRegistry
    function initializeTopicSchemes(string[] calldata names, string[] calldata signatures) external override {
        // Implementation for initialization in tests - allows anyone to call
        uint256 namesLength = names.length;
        uint256 signaturesLength = signatures.length;

        if (namesLength == 0 || signaturesLength == 0) revert EmptyArraysProvided();
        if (namesLength != signaturesLength) revert ArrayLengthMismatch(namesLength, signaturesLength);

        uint256[] memory topicIds = new uint256[](namesLength);

        for (uint256 i = 0; i < namesLength; i++) {
            string calldata name = names[i];
            string calldata signature = signatures[i];

            if (bytes(name).length == 0) revert EmptyName();
            if (bytes(signature).length == 0) revert EmptySignature();

            uint256 topicId = getTopicId(name);
            topicIds[i] = topicId;

            if (_topicSchemes[topicId].exists) revert TopicSchemeAlreadyExists(name);

            _topicSchemes[topicId] = TopicScheme({ topicId: topicId, signature: signature, exists: true });

            _topicIds.push(topicId);
            _topicIdIndex[topicId] = _topicIds.length;

            emit TopicSchemeRegistered(msg.sender, topicId, name, signature);
        }

        emit TopicSchemesBatchRegistered(msg.sender, topicIds, names, signatures);
    }

    function updateTopicScheme(string calldata name, string calldata newSignature) external override onlyRegistrar {
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(newSignature).length == 0) revert EmptySignature();

        uint256 topicId = getTopicId(name);

        if (!_topicSchemes[topicId].exists) revert TopicSchemeDoesNotExistByName(name);

        string memory oldSignature = _topicSchemes[topicId].signature;
        if (keccak256(bytes(oldSignature)) == keccak256(bytes(newSignature))) {
            revert SignatureUnchanged(name, newSignature);
        }

        _topicSchemes[topicId].signature = newSignature;

        emit TopicSchemeUpdated(msg.sender, topicId, name, oldSignature, newSignature);
    }

    function removeTopicScheme(string calldata name) external override onlyRegistrar {
        if (bytes(name).length == 0) revert EmptyName();

        uint256 topicId = getTopicId(name);

        if (!_topicSchemes[topicId].exists) revert TopicSchemeDoesNotExistByName(name);

        // Remove from array
        _removeTopicIdFromArray(topicId);

        delete _topicSchemes[topicId];

        emit TopicSchemeRemoved(msg.sender, topicId, name);
    }

    function _removeTopicIdFromArray(uint256 topicId) internal {
        uint256 indexPlusOne = _topicIdIndex[topicId];
        if (indexPlusOne == 0) revert TopicIdNotFoundInArray(topicId);

        uint256 index = indexPlusOne - 1;
        uint256 lastIndex = _topicIds.length - 1;

        if (index != lastIndex) {
            uint256 lastTopicId = _topicIds[lastIndex];
            _topicIds[index] = lastTopicId;
            _topicIdIndex[lastTopicId] = index + 1;
        }

        _topicIds.pop();
        delete _topicIdIndex[topicId];
    }

    function hasRole(bytes32 role, address account) public view returns (bool) {
        if (role == ATKSystemRoles.REGISTRAR_ROLE) {
            return _hasRegistrarRole[account];
        }
        if (role == ATKSystemRoles.DEFAULT_ADMIN_ROLE) {
            return account == admin;
        }
        return false;
    }

    function hasTopicScheme(uint256 topicId) external view override returns (bool) {
        return _topicSchemes[topicId].exists;
    }

    function hasTopicSchemeByName(string calldata name) external view override returns (bool) {
        uint256 topicId = getTopicId(name);
        return _topicSchemes[topicId].exists;
    }

    function getTopicSchemeSignature(uint256 topicId) external view override returns (string memory) {
        if (!_topicSchemes[topicId].exists) revert TopicSchemeDoesNotExist(topicId);
        return _topicSchemes[topicId].signature;
    }

    function getTopicSchemeSignatureByName(string calldata name) external view override returns (string memory) {
        uint256 topicId = getTopicId(name);
        if (!_topicSchemes[topicId].exists) revert TopicSchemeDoesNotExistByName(name);
        return _topicSchemes[topicId].signature;
    }

    function getTopicId(string calldata name) public pure override returns (uint256) {
        return uint256(keccak256(abi.encodePacked(name)));
    }

    function getAllTopicIds() external view override returns (uint256[] memory) {
        return _topicIds;
    }

    function getTopicSchemeCount() external view override returns (uint256) {
        return _topicIds.length;
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(ISMARTTopicSchemeRegistry).interfaceId
            || interfaceId == type(IATKTopicSchemeRegistry).interfaceId || super.supportsInterface(interfaceId);
    }
}
