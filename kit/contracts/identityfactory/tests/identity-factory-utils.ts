import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  IdentityCreated,
  ImplementationAuthoritySet,
  Initialized,
  OwnershipTransferred,
  TokenIdentityCreated
} from "../generated/IdentityFactory/IdentityFactory"

export function createIdentityCreatedEvent(
  initiator: Address,
  identity: Address,
  wallet: Address
): IdentityCreated {
  let identityCreatedEvent = changetype<IdentityCreated>(newMockEvent())

  identityCreatedEvent.parameters = new Array()

  identityCreatedEvent.parameters.push(
    new ethereum.EventParam("initiator", ethereum.Value.fromAddress(initiator))
  )
  identityCreatedEvent.parameters.push(
    new ethereum.EventParam("identity", ethereum.Value.fromAddress(identity))
  )
  identityCreatedEvent.parameters.push(
    new ethereum.EventParam("wallet", ethereum.Value.fromAddress(wallet))
  )

  return identityCreatedEvent
}

export function createImplementationAuthoritySetEvent(
  initiator: Address,
  newAuthority: Address
): ImplementationAuthoritySet {
  let implementationAuthoritySetEvent =
    changetype<ImplementationAuthoritySet>(newMockEvent())

  implementationAuthoritySetEvent.parameters = new Array()

  implementationAuthoritySetEvent.parameters.push(
    new ethereum.EventParam("initiator", ethereum.Value.fromAddress(initiator))
  )
  implementationAuthoritySetEvent.parameters.push(
    new ethereum.EventParam(
      "newAuthority",
      ethereum.Value.fromAddress(newAuthority)
    )
  )

  return implementationAuthoritySetEvent
}

export function createInitializedEvent(version: BigInt): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  )

  return initializedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createTokenIdentityCreatedEvent(
  initiator: Address,
  identity: Address,
  token: Address
): TokenIdentityCreated {
  let tokenIdentityCreatedEvent =
    changetype<TokenIdentityCreated>(newMockEvent())

  tokenIdentityCreatedEvent.parameters = new Array()

  tokenIdentityCreatedEvent.parameters.push(
    new ethereum.EventParam("initiator", ethereum.Value.fromAddress(initiator))
  )
  tokenIdentityCreatedEvent.parameters.push(
    new ethereum.EventParam("identity", ethereum.Value.fromAddress(identity))
  )
  tokenIdentityCreatedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )

  return tokenIdentityCreatedEvent
}
