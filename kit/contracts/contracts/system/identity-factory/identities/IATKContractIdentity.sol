// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { OnChainIdentity } from "../../../onchainid/extensions/OnChainIdentity.sol";

/// @title Interface for ATK Contract Identity
/// @author SettleMint Tokenization Services
/// @notice Interface for on-chain identities associated with contracts implementing IContractWithIdentity
/// @dev This interface replaces IATKTokenIdentity with a more generic solution that works for any contract
///      (tokens, vaults, etc.) that implements IContractWithIdentity. Permission checks are delegated
///      to the contract itself via canAddClaim/canRemoveClaim.
interface IATKContractIdentity is OnChainIdentity {
    /// @notice Initializes the contract identity with its owner contract address
    /// @param contractAddr The address of the contract that owns this identity
    function initialize(address contractAddr) external;

    /// @notice Returns the address of the contract that owns this identity
    /// @return The contract address
    function contractAddress() external view returns (address);
}
