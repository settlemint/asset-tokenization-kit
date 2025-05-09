import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  EIP712DomainChanged,
  ExecutedForwardRequest
} from "../generated/Forwarder/Forwarder"

export function createEIP712DomainChangedEvent(): EIP712DomainChanged {
  let eip712DomainChangedEvent = changetype<EIP712DomainChanged>(newMockEvent())

  eip712DomainChangedEvent.parameters = new Array()

  return eip712DomainChangedEvent
}

export function createExecutedForwardRequestEvent(
  signer: Address,
  nonce: BigInt,
  success: boolean
): ExecutedForwardRequest {
  let executedForwardRequestEvent =
    changetype<ExecutedForwardRequest>(newMockEvent())

  executedForwardRequestEvent.parameters = new Array()

  executedForwardRequestEvent.parameters.push(
    new ethereum.EventParam("signer", ethereum.Value.fromAddress(signer))
  )
  executedForwardRequestEvent.parameters.push(
    new ethereum.EventParam("nonce", ethereum.Value.fromUnsignedBigInt(nonce))
  )
  executedForwardRequestEvent.parameters.push(
    new ethereum.EventParam("success", ethereum.Value.fromBoolean(success))
  )

  return executedForwardRequestEvent
}
