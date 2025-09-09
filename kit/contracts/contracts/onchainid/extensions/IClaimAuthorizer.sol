// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title IClaimAuthorizer
/// @author SettleMint
/// @notice Interface for contracts that can authorize claim additions to identities
/// @dev This interface enables modular and secure control over who can add claims to an identity.
///      When a contract attempts to add a claim to an identity, the identity contract will query
///      one or more external contracts implementing this interface to evaluate permission per topic.
///      Only if at least one registered contract authorizes the action, the claim addition will be accepted.
/// @custom:security-contact support@settlemint.com
interface IClaimAuthorizer is IERC165 {
    /// @notice Checks if an issuer is authorized to add a claim for a specific topic
    /// @param issuer The address of the issuer attempting to add the claim
    /// @param topic The claim topic for which authorization is being checked
    /// @param subject The identity contract address of the subject
    /// @return True if the issuer is authorized to add claims for this topic, false otherwise
    /// @dev This function should be implemented to perform topic-specific authorization logic.
    ///      For example, a trusted issuer registry might check if the issuer is registered
    ///      and authorized for the specific claim topic.
    function isAuthorizedToAddClaim(address issuer, uint256 topic, address subject) external view returns (bool);
}
