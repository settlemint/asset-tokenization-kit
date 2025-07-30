// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ISMART } from "../../contracts/smart/interface/ISMART.sol";
import { ISMARTIdentityRegistry } from "../../contracts/smart/interface/ISMARTIdentityRegistry.sol";
import { ISMARTCompliance } from "../../contracts/smart/interface/ISMARTCompliance.sol";
import { SMARTComplianceModuleParamPair } from
    "../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ExpressionNode } from "../../contracts/smart/interface/structs/ExpressionNode.sol";

/// @title MockIdentityRegistry
/// @notice A mock identity registry that always returns true for isVerified
contract MockIdentityRegistry {
    function isVerified(address, ExpressionNode[] memory) external pure returns (bool) {
        return true; // Always return true for testing
    }
}

/// @title MockedSMARTToken
/// @notice A simple mock implementation of ISMART for testing purposes
/// @dev This mock bypasses the complex SMART ecosystem and provides basic functionality for testing
contract MockedSMARTToken is ERC20, ISMART {
    mapping(address => bool) private _verifiedAddresses;
    uint256[] private _requiredClaimTopics;
    MockIdentityRegistry private _identityRegistry;

    constructor() ERC20("Mocked SMART Token", "MSMART") {
        // Set all addresses as verified by default for testing
        _identityRegistry = new MockIdentityRegistry();
    }

    // Mock implementations of ISMART interface
    function identityRegistry() external view returns (ISMARTIdentityRegistry) {
        return ISMARTIdentityRegistry(address(_identityRegistry));
    }

    function compliance() external pure returns (ISMARTCompliance) {
        return ISMARTCompliance(address(0)); // Return zero address for mock
    }

    function requiredClaimTopics() external view returns (uint256[] memory) {
        return _requiredClaimTopics;
    }

    function setVerified(address user, bool verified) external {
        _verifiedAddresses[user] = verified;
    }

    function setRequiredClaimTopics(uint256[] memory topics) external {
        _requiredClaimTopics = topics;
    }

    // Standard ERC20 functions with minting capability
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }

    // Mock SMART-specific functions (not in ISMART interface but might be called)
    function isVerified(address user) external view returns (bool) {
        return _verifiedAddresses[user] || true; // Default to verified for testing
    }

    // Minimal implementations of ISMART interface functions
    function setIdentityRegistry(address) external pure {
        // Mock implementation - do nothing
    }

    function setOnchainID(address) external pure {
        // Mock implementation - do nothing
    }

    function setCompliance(address) external pure {
        // Mock implementation - do nothing
    }

    function setParametersForComplianceModule(address, bytes calldata) external pure {
        // Mock implementation - do nothing
    }

    function batchMint(address[] calldata _toList, uint256[] calldata _amounts) external {
        require(_toList.length == _amounts.length, "Arrays length mismatch");
        for (uint256 i = 0; i < _toList.length; i++) {
            _mint(_toList[i], _amounts[i]);
        }
    }

    function batchTransfer(address[] calldata _toList, uint256[] calldata _amounts) external {
        require(_toList.length == _amounts.length, "Arrays length mismatch");
        for (uint256 i = 0; i < _toList.length; i++) {
            transfer(_toList[i], _amounts[i]);
        }
    }

    function recoverTokens(address) external pure {
        // Mock implementation - do nothing
    }

    function recoverERC20(address, address, uint256) external pure {
        // Mock implementation - do nothing
    }

    function addComplianceModule(address, bytes calldata) external pure {
        // Mock implementation - do nothing
    }

    function removeComplianceModule(address) external pure {
        // Mock implementation - do nothing
    }

    function onchainID() external pure returns (address) {
        return address(0);
    }

    function complianceModules() external pure returns (SMARTComplianceModuleParamPair[] memory) {
        return new SMARTComplianceModuleParamPair[](0);
    }

    function supportsInterface(bytes4) external pure returns (bool) {
        return true;
    }

    function registeredInterfaces() external pure returns (bytes4[] memory interfacesList) {
        return new bytes4[](0);
    }
}
