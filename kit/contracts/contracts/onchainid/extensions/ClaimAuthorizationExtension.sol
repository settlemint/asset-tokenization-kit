// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { IClaimAuthorizer } from "./IClaimAuthorizer.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title ClaimAuthorizationExtension
/// @author SettleMint Tokenization Services
/// @notice Extension for managing claim authorization contracts in identities
/// @dev This extension allows identities to register multiple authorization contracts
///      that implement IClaimAuthorization. When adding claims, the identity will query
///      these contracts to determine if the issuer is authorized for the specific topic.
///      This enables flexible, modular permission systems while maintaining user sovereignty.
contract ClaimAuthorizationExtension {
    // --- Storage Variables ---

    /// @notice Array of registered claim authorization contracts
    /// @dev These contracts are queried when checking claim addition permissions
    address[] internal _claimAuthorizationContracts;

    /// @notice Mapping to track registered authorization contracts for O(1) existence checks
    /// @dev Maps authorization contract address to (index + 1) in the array, 0 means not registered
    mapping(address authContract => uint256 indexPlusOne) internal _authContractIndex;

    // --- Events ---

    /// @notice Emitted when a claim authorization contract is registered
    /// @param sender The address that registered the authorization contract
    /// @param authorizationContract The address of the registered authorization contract
    event ClaimAuthorizationContractRegistered(address indexed sender, address indexed authorizationContract);

    /// @notice Emitted when a claim authorization contract is removed
    /// @param sender The address that removed the authorization contract
    /// @param authorizationContract The address of the removed authorization contract
    event ClaimAuthorizationContractRemoved(address indexed sender, address indexed authorizationContract);

    // --- Errors ---

    /// @notice Error thrown when trying to register an invalid authorization contract
    /// @param invalidContract The address that was attempted to be registered
    error InvalidAuthorizationContract(address invalidContract);

    /// @notice Error thrown when trying to register an authorization contract that is already registered
    /// @param alreadyRegisteredContract The address that is already registered
    error AuthorizationContractAlreadyRegistered(address alreadyRegisteredContract);

    /// @notice Error thrown when trying to remove an authorization contract that is not registered
    /// @param notRegisteredContract The address that was attempted to be removed
    error AuthorizationContractNotRegistered(address notRegisteredContract);

    // --- Internal Functions ---

    /// @notice Registers a claim authorization contract
    /// @param authorizationContract The address of the contract implementing IClaimAuthorization
    /// @dev This function should be called by inheriting contracts with proper access control
    function _registerClaimAuthorizationContract(address authorizationContract) internal {
        if (authorizationContract == address(0)) {
            revert InvalidAuthorizationContract(authorizationContract);
        }

        // Check if contract implements IClaimAuthorization
        try IERC165(authorizationContract).supportsInterface(type(IClaimAuthorizer).interfaceId) returns (
            bool supported
        ) {
            if (!supported) {
                revert InvalidAuthorizationContract(authorizationContract);
            }
        } catch {
            revert InvalidAuthorizationContract(authorizationContract);
        }

        if (_authContractIndex[authorizationContract] != 0) {
            revert AuthorizationContractAlreadyRegistered(authorizationContract);
        }

        _claimAuthorizationContracts.push(authorizationContract);
        _authContractIndex[authorizationContract] = _claimAuthorizationContracts.length;

        emit ClaimAuthorizationContractRegistered(msg.sender, authorizationContract);
    }

    /// @notice Removes a claim authorization contract
    /// @param authorizationContract The address of the contract to remove
    /// @dev This function should be called by inheriting contracts with proper access control
    function _removeClaimAuthorizationContract(address authorizationContract) internal {
        uint256 indexPlusOne = _authContractIndex[authorizationContract];
        if (indexPlusOne == 0) {
            revert AuthorizationContractNotRegistered(authorizationContract);
        }

        uint256 indexToRemove = indexPlusOne - 1;
        uint256 lastIndex = _claimAuthorizationContracts.length - 1;

        if (indexToRemove != lastIndex) {
            address lastContract = _claimAuthorizationContracts[lastIndex];
            _claimAuthorizationContracts[indexToRemove] = lastContract;
            _authContractIndex[lastContract] = indexToRemove + 1;
        }

        _claimAuthorizationContracts.pop();
        delete _authContractIndex[authorizationContract];

        emit ClaimAuthorizationContractRemoved(msg.sender, authorizationContract);
    }

    /// @notice Checks if an issuer is authorized to add a claim for a specific topic
    /// @param issuer The address of the issuer attempting to add the claim
    /// @param topic The claim topic for which authorization is being checked
    /// @return True if at least one registered authorization contract approves, false otherwise
    /// @dev Uses short-circuit evaluation - returns true on first approval found
    function _isAuthorizedToAddClaim(address issuer, uint256 topic) internal view returns (bool) {
        uint256 contractsLength = _claimAuthorizationContracts.length;

        // If no authorization contracts are registered, return false
        if (contractsLength == 0) {
            return false;
        }

        // Check each authorization contract - return true on first approval
        for (uint256 i = 0; i < contractsLength;) {
            address authContract = _claimAuthorizationContracts[i];

            try IClaimAuthorizer(authContract).isAuthorizedToAddClaim(issuer, topic) returns (bool authorized) {
                if (authorized) {
                    return true;
                }
            } catch {
                // If a contract fails, continue checking others
                // This ensures one broken contract doesn't block the entire system
            }

            unchecked {
                ++i;
            }
        }

        return false;
    }

    // --- View Functions ---

    /// @notice Returns all registered claim authorization contracts
    /// @return Array of authorization contract addresses
    function getClaimAuthorizationContracts() external view returns (address[] memory) {
        return _claimAuthorizationContracts;
    }

    /// @notice Checks if a contract is registered as a claim authorization contract
    /// @param authorizationContract The address to check
    /// @return True if registered, false otherwise
    function isClaimAuthorizationContractRegistered(address authorizationContract) external view returns (bool) {
        return _authContractIndex[authorizationContract] != 0;
    }
}
