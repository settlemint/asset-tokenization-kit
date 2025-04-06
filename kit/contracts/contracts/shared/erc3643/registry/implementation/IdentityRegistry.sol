// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { IClaimIssuer } from "../../../onchainid/interface/IClaimIssuer.sol";
import { IIdentity } from "../../../onchainid/interface/IIdentity.sol";
import { IClaimTopicsRegistry } from "../interface/IClaimTopicsRegistry.sol";
import { ITrustedIssuersRegistry } from "../interface/ITrustedIssuersRegistry.sol";
import {
    IIdentityRegistry, EligibilityChecksDisabled, EligibilityChecksEnabled
} from "../interface/IIdentityRegistry.sol";
import { AgentRoleUpgradeable } from "../../roles/AgentRoleUpgradeable.sol";
import { IIdentityRegistryStorage } from "../interface/IIdentityRegistryStorage.sol";
import { IRStorage } from "../storage/IRStorage.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IERC173 } from "../../roles/IERC173.sol";
import { IERC3643TrustedIssuersRegistry } from "../../ERC-3643/IERC3643TrustedIssuersRegistry.sol";
import { IERC3643ClaimTopicsRegistry } from "../../ERC-3643/IERC3643ClaimTopicsRegistry.sol";
import { IERC3643IdentityRegistryStorage } from "../../ERC-3643/IERC3643IdentityRegistryStorage.sol";
import { ZeroAddress } from "../../errors/InvalidArgumentErrors.sol";
import {
    IERC3643IdentityRegistry,
    ClaimTopicsRegistrySet,
    TrustedIssuersRegistrySet,
    IdentityStorageSet,
    IdentityRegistered,
    IdentityRemoved,
    IdentityUpdated,
    CountryUpdated
} from "../../ERC-3643/IERC3643IdentityRegistry.sol";

/// error triggered when eligibility checks are disabled and the disable function is called
error EligibilityChecksDisabledAlready();

/// error triggered when eligibility checks are enabled and the enable function is called
error EligibilityChecksEnabledAlready();

contract IdentityRegistry is IIdentityRegistry, AgentRoleUpgradeable, IRStorage, IERC165 {
    /**
     *  @dev the constructor initiates the Identity Registry smart contract
     *  @param _trustedIssuersRegistry the trusted issuers registry linked to the Identity Registry
     *  @param _claimTopicsRegistry the claim topics registry linked to the Identity Registry
     *  @param _identityStorage the identity registry storage linked to the Identity Registry
     *  emits a `ClaimTopicsRegistrySet` event
     *  emits a `TrustedIssuersRegistrySet` event
     *  emits an `IdentityStorageSet` event
     */
    function init(
        address _trustedIssuersRegistry,
        address _claimTopicsRegistry,
        address _identityStorage
    )
        external
        initializer
    {
        require(
            _trustedIssuersRegistry != address(0) && _claimTopicsRegistry != address(0)
                && _identityStorage != address(0),
            ZeroAddress()
        );
        _tokenTopicsRegistry = IClaimTopicsRegistry(_claimTopicsRegistry);
        _tokenIssuersRegistry = ITrustedIssuersRegistry(_trustedIssuersRegistry);
        _tokenIdentityStorage = IIdentityRegistryStorage(_identityStorage);
        _checksDisabled = false;
        emit ClaimTopicsRegistrySet(_claimTopicsRegistry);
        emit TrustedIssuersRegistrySet(_trustedIssuersRegistry);
        emit IdentityStorageSet(_identityStorage);
        emit EligibilityChecksEnabled();
        __Ownable_init(_msgSender());
    }

    /**
     *  @dev See {IIdentityRegistry-batchRegisterIdentity}.
     */
    function batchRegisterIdentity(
        address[] calldata _userAddresses,
        IIdentity[] calldata _identities,
        uint16[] calldata _countries
    )
        external
        override
    {
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            registerIdentity(_userAddresses[i], _identities[i], _countries[i]);
        }
    }

    /**
     *  @dev See {IIdentityRegistry-updateIdentity}.
     */
    function updateIdentity(address _userAddress, IIdentity _identity) external override onlyAgent {
        IIdentity oldIdentity = identity(_userAddress);
        _tokenIdentityStorage.modifyStoredIdentity(_userAddress, _identity);
        emit IdentityUpdated(oldIdentity, _identity);
    }

    /**
     *  @dev See {IIdentityRegistry-updateCountry}.
     */
    function updateCountry(address _userAddress, uint16 _country) external override onlyAgent {
        _tokenIdentityStorage.modifyStoredInvestorCountry(_userAddress, _country);
        emit CountryUpdated(_userAddress, _country);
    }

    /**
     *  @dev See {IIdentityRegistry-deleteIdentity}.
     */
    function deleteIdentity(address _userAddress) external override onlyAgent {
        IIdentity oldIdentity = identity(_userAddress);
        _tokenIdentityStorage.removeIdentityFromStorage(_userAddress);
        emit IdentityRemoved(_userAddress, oldIdentity);
    }

    /**
     *  @dev See {IIdentityRegistry-setIdentityRegistryStorage}.
     */
    function setIdentityRegistryStorage(address _identityRegistryStorage) external override onlyOwner {
        _tokenIdentityStorage = IIdentityRegistryStorage(_identityRegistryStorage);
        emit IdentityStorageSet(_identityRegistryStorage);
    }

    /**
     *  @dev See {IIdentityRegistry-setClaimTopicsRegistry}.
     */
    function setClaimTopicsRegistry(address _claimTopicsRegistry) external override onlyOwner {
        _tokenTopicsRegistry = IClaimTopicsRegistry(_claimTopicsRegistry);
        emit ClaimTopicsRegistrySet(_claimTopicsRegistry);
    }

    /**
     *  @dev See {IIdentityRegistry-setTrustedIssuersRegistry}.
     */
    function setTrustedIssuersRegistry(address _trustedIssuersRegistry) external override onlyOwner {
        _tokenIssuersRegistry = ITrustedIssuersRegistry(_trustedIssuersRegistry);
        emit TrustedIssuersRegistrySet(_trustedIssuersRegistry);
    }

    /**
     *  @dev See {IIdentityRegistry-disableEligibilityChecks}.
     */
    function disableEligibilityChecks() external override onlyOwner {
        require(!_checksDisabled, EligibilityChecksDisabledAlready());
        _checksDisabled = true;
        emit EligibilityChecksDisabled();
    }

    /**
     *  @dev See {IIdentityRegistry-enableEligibilityChecks}.
     */
    function enableEligibilityChecks() external override onlyOwner {
        require(_checksDisabled, EligibilityChecksEnabledAlready());
        _checksDisabled = false;
        emit EligibilityChecksEnabled();
    }

    /**
     *  @dev See {IIdentityRegistry-isVerified}.
     */
    // solhint-disable-next-line code-complexity
    function isVerified(address _userAddress) external view override returns (bool) {
        if (_checksDisabled) return true;
        if (address(identity(_userAddress)) == address(0)) return false;
        uint256[] memory requiredClaimTopics = _tokenTopicsRegistry.getClaimTopics();
        if (requiredClaimTopics.length == 0) {
            return true;
        }

        uint256 foundClaimTopic;
        uint256 scheme;
        address issuer;
        bytes memory sig;
        bytes memory data;
        uint256 claimTopic;
        for (claimTopic = 0; claimTopic < requiredClaimTopics.length; claimTopic++) {
            IClaimIssuer[] memory trustedIssuers =
                _tokenIssuersRegistry.getTrustedIssuersForClaimTopic(requiredClaimTopics[claimTopic]);

            if (trustedIssuers.length == 0) return false;

            bytes32[] memory claimIds = new bytes32[](trustedIssuers.length);
            for (uint256 i = 0; i < trustedIssuers.length; i++) {
                claimIds[i] = keccak256(abi.encode(trustedIssuers[i], requiredClaimTopics[claimTopic]));
            }

            for (uint256 j = 0; j < claimIds.length; j++) {
                (foundClaimTopic, scheme, issuer, sig, data,) = identity(_userAddress).getClaim(claimIds[j]);

                if (foundClaimTopic == requiredClaimTopics[claimTopic]) {
                    try IClaimIssuer(issuer).isClaimValid(
                        identity(_userAddress), requiredClaimTopics[claimTopic], sig, data
                    ) returns (bool _validity) {
                        if (_validity) {
                            j = claimIds.length;
                        }
                        if (!_validity && j == (claimIds.length - 1)) {
                            return false;
                        }
                    } catch {
                        if (j == (claimIds.length - 1)) {
                            return false;
                        }
                    }
                } else if (j == (claimIds.length - 1)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     *  @dev See {IIdentityRegistry-investorCountry}.
     */
    function investorCountry(address _userAddress) external view override returns (uint16) {
        return _tokenIdentityStorage.storedInvestorCountry(_userAddress);
    }

    /**
     *  @dev See {IIdentityRegistry-issuersRegistry}.
     */
    function issuersRegistry() external view override returns (IERC3643TrustedIssuersRegistry) {
        return _tokenIssuersRegistry;
    }

    /**
     *  @dev See {IIdentityRegistry-topicsRegistry}.
     */
    function topicsRegistry() external view override returns (IERC3643ClaimTopicsRegistry) {
        return _tokenTopicsRegistry;
    }

    /**
     *  @dev See {IIdentityRegistry-identityStorage}.
     */
    function identityStorage() external view override returns (IERC3643IdentityRegistryStorage) {
        return _tokenIdentityStorage;
    }

    /**
     *  @dev See {IIdentityRegistry-contains}.
     */
    function contains(address _userAddress) external view override returns (bool) {
        if (address(identity(_userAddress)) == address(0)) {
            return false;
        }
        return true;
    }

    /**
     *  @dev See {IIdentityRegistry-registerIdentity}.
     */
    function registerIdentity(address _userAddress, IIdentity _identity, uint16 _country) public override onlyAgent {
        _tokenIdentityStorage.addIdentityToStorage(_userAddress, _identity, _country);
        emit IdentityRegistered(_userAddress, _identity);
    }

    /**
     *  @dev See {IIdentityRegistry-identity}.
     */
    function identity(address _userAddress) public view override returns (IIdentity) {
        return _tokenIdentityStorage.storedIdentity(_userAddress);
    }

    /**
     *  @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public pure virtual override returns (bool) {
        return interfaceId == type(IIdentityRegistry).interfaceId
            || interfaceId == type(IERC3643IdentityRegistry).interfaceId || interfaceId == type(IERC173).interfaceId
            || interfaceId == type(IERC165).interfaceId;
    }
}
