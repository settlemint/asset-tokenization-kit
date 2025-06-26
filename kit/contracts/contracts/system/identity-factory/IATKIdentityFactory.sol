// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/// @title IATKIdentityFactory Interface
/// @author SettleMint Tokenization Services
/// @notice This interface defines the functions for a factory contract responsible for creating and managing
///         on-chain identities for both user wallets and token contracts within the ATK Protocol.
/// @dev These identities are typically based on standards like ERC725 (OnchainID) and are deployed as proxy contracts
///      to allow for upgradeability. The factory pattern ensures that identities are created in a consistent and
/// predictable manner.
/// This interface extends IERC165 for interface detection support.
interface IATKIdentityFactory is IERC165 {
    // --- Events ---
    /// @notice Emitted when a new identity contract is successfully created and registered for an investor wallet.
    /// @param sender The address that initiated the identity creation (e.g., an address with `REGISTRAR_ROLE`).
    /// @param identity The address of the newly deployed `ATKIdentityProxy` contract.
    /// @param wallet The investor wallet address for which the identity was created.
    event IdentityCreated(address indexed sender, address indexed identity, address indexed wallet);
    /// @notice Emitted when a new identity contract is successfully created and registered for a token contract.
    /// @param sender The address that initiated the token identity creation (e.g., an address with `REGISTRAR_ROLE`).
    /// @param identity The address of the newly deployed `ATKTokenIdentityProxy` contract.
    /// @param token The address of the token contract for which the identity was created.
    event TokenIdentityCreated(address indexed sender, address indexed identity, address indexed token);

    function initialize(address systemAddress) external;

    // --- State-Changing Functions ---

    /// @notice Creates a new on-chain identity for a given user wallet address.
    /// @dev This function is expected to deploy a new identity contract (e.g., a `ATKIdentityProxy`)
    ///      and associate it with the `_wallet` address. It may also set up initial management keys for the identity.
    ///      The creation process often involves deterministic deployment using CREATE2 for predictable addresses.
    /// @param _wallet The wallet address for which the identity is being created. This address might also serve as an
    /// initial manager.
    /// @param _managementKeys An array of `bytes32` representing pre-hashed management keys to be added to the new
    /// identity.
    ///                        These keys grant administrative control over the identity contract according to
    /// ERC734/ERC725 standards.
    /// @return identityContract The address of the newly deployed identity contract.
    function createIdentity(
        address _wallet,
        bytes32[] calldata _managementKeys
    )
        external
        returns (address identityContract);

    /// @notice Creates a new on-chain identity specifically for a token contract using metadata-based salt.
    /// @dev This function deploys a new identity contract (e.g., a `ATKTokenIdentityProxy`) using the token's
    ///      metadata (name, symbol, decimals) queried from the ISMART interface to generate a unique salt.
    ///      This provides more predictable and meaningful identity addresses based on token characteristics.
    /// @param _token The address of
    /// @param _accessManager The address of the access manager contract to be used for the token identity.
    /// @return tokenIdentityContract The address of the newly deployed token identity contract.
    function createTokenIdentity(
        address _token,
        address _accessManager
    )
        external
        returns (address tokenIdentityContract);

    // --- View Functions ---

    /// @notice Retrieves the address of an already created on-chain identity associated with a given user wallet.
    /// @param _wallet The wallet address to look up.
    /// @return identityContract The address of the identity contract if one exists for the wallet, otherwise
    /// `address(0)`.
    function getIdentity(address _wallet) external view returns (address identityContract);

    /// @notice Retrieves the address of an already created on-chain identity associated with a given token contract.
    /// @param _token The token contract address to look up.
    /// @return tokenIdentityContract The address of the token identity contract if one exists for the token, otherwise
    /// `address(0)`.
    function getTokenIdentity(address _token) external view returns (address tokenIdentityContract);

    /// @notice Calculates the deterministic address at which an identity contract for a user wallet *would be* or *was*
    /// deployed.
    /// @dev This function typically uses the CREATE2 opcode logic to predict the address based on the factory's
    /// address,
    ///      a unique salt (often derived from `_walletAddress`), and the creation code of the identity proxy contract,
    ///      including its constructor arguments like `_initialManager`.
    /// @param _walletAddress The wallet address for which the identity address is being calculated.
    /// @param _initialManager The address that would be (or was) set as the initial manager during the identity's
    /// creation.
    /// @return predictedAddress The pre-computed or actual deployment address of the wallet's identity contract.
    function calculateWalletIdentityAddress(
        address _walletAddress,
        address _initialManager
    )
        external
        view
        returns (address predictedAddress);

    /// @notice Calculates the deterministic address at which an identity contract for a token *would be* or *was*
    /// deployed using metadata-based salt.
    /// @dev Uses token metadata (name, symbol, decimals) combined with token address to calculate the deployment
    ///      address. This provides a way to predict addresses for tokens based on their characteristics.
    /// @param _name The name of the token used in salt generation.
    /// @param _symbol The symbol of the token used in salt generation.
    /// @param _decimals The decimals of the token used in salt generation.
    /// @param _initialManager The address that would be (or was) set as the initial manager during the token identity's
    /// creation.
    /// @return predictedAddress The pre-computed or actual deployment address of the token's identity contract.
    function calculateTokenIdentityAddress(
        string calldata _name,
        string calldata _symbol,
        uint8 _decimals,
        address _initialManager
    )
        external
        view
        returns (address predictedAddress);
}
