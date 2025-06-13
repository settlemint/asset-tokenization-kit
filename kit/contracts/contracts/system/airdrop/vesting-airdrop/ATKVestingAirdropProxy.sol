// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { StorageSlot } from "@openzeppelin/contracts/utils/StorageSlot.sol";
import { IATKVestingAirdrop } from "./IATKVestingAirdrop.sol";
import { VestingAirdropImplementationNotSet } from "./ATKVestingAirdropErrors.sol";
import { InitializationWithZeroAddress, ETHTransfersNotAllowed } from "../../ATKSystemErrors.sol";

/// @title Proxy contract for ATK Vesting Airdrops.
/// @author SettleMint Tokenization Services
/// @notice This contract serves as a proxy, allowing for upgradeability of the underlying vesting airdrop logic.
/// It retrieves the implementation address from a provided implementation contract address.
/// @dev Unlike token proxies which use a factory pattern, this proxy takes the implementation address directly
///      during construction, allowing for more flexible deployment patterns for airdrop contracts.
contract ATKVestingAirdropProxy is Proxy {
    /// @dev Storage slot for the implementation address.
    /// Value: keccak256("org.atk.contracts.proxy.ATKVestingAirdropProxy.implementation")
    bytes32 private constant _VESTING_AIRDROP_IMPLEMENTATION_SLOT =
        0x4d5d4c5e389b95bc7bc5e9da9b8b6b5e5e5e5e5e5e5e5e5e5e5e5e5e5e1234ef;

    /// @notice Constructs the ATKVestingAirdropProxy.
    /// @dev Initializes the proxy by storing the implementation address and delegating a call to the `initialize`
    /// function
    /// of the implementation contract.
    /// @param implementationAddress The address of the vesting airdrop implementation contract.
    /// @param token_ The address of the ERC20 token to be distributed.
    /// @param root_ The Merkle root for verifying claims.
    /// @param owner_ The initial owner of the contract.
    /// @param vestingStrategy_ The address of the vesting strategy contract for vesting calculations.
    /// @param initializationDeadline_ The timestamp after which no new vesting can be initialized.
    constructor(
        address implementationAddress,
        address token_,
        bytes32 root_,
        address owner_,
        address vestingStrategy_,
        uint256 initializationDeadline_
    )
        payable
    {
        if (implementationAddress == address(0)) revert VestingAirdropImplementationNotSet();

        // Store implementation address
        StorageSlot.getAddressSlot(_VESTING_AIRDROP_IMPLEMENTATION_SLOT).value = implementationAddress;

        // Prepare initialization data
        bytes memory data = abi.encodeWithSelector(
            IATKVestingAirdrop.initialize.selector, token_, root_, owner_, vestingStrategy_, initializationDeadline_
        );

        _performInitializationDelegatecall(implementationAddress, data);
    }

    /// @dev Performs the delegatecall to initialize the implementation contract.
    /// @param implementationAddress The non-zero address of the logic contract to `delegatecall` to.
    /// @param initializeData The ABI-encoded data for the `initialize` function call.
    function _performInitializationDelegatecall(address implementationAddress, bytes memory initializeData) internal {
        if (implementationAddress == address(0)) {
            revert InitializationWithZeroAddress();
        }
        // slither-disable-next-line low-level-calls: Delegatecall is inherent and fundamental to proxy functionality.
        (bool success, bytes memory returnData) = implementationAddress.delegatecall(initializeData);
        if (!success) {
            assembly {
                revert(add(returnData, 0x20), mload(returnData))
            }
        }
    }

    /// @dev Overrides `Proxy._implementation()`. This is used by OpenZeppelin's proxy mechanisms.
    /// @return The address of the current logic/implementation contract.
    function _implementation() internal view override returns (address) {
        address implementationAddress = StorageSlot.getAddressSlot(_VESTING_AIRDROP_IMPLEMENTATION_SLOT).value;
        if (implementationAddress == address(0)) {
            revert VestingAirdropImplementationNotSet();
        }
        return implementationAddress;
    }

    /// @notice Fallback function to reject any direct Ether transfers to this proxy contract.
    receive() external payable virtual {
        revert ETHTransfersNotAllowed();
    }
}
