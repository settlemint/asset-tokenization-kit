import { log } from "@graphprotocol/graph-ts";
import { DvPSwapContractCreated } from "../../generated/DvPSwapFactory/DvPSwapFactory";
import { DvPSwapContractCreatedEvent } from "../../generated/schema";
import { DvPSwap } from "../../generated/templates";
import { accountActivityEvent } from "../assets/events/accountactivity";
import { fetchAccount } from "../fetch/account";
import { fetchDvPSwap, updateDvPSwapCreator } from "../fetch/dvpswap";
import { EventName } from "../utils/enums";
import { eventId } from "../utils/events";
import { fetchDvPSwapFactory } from "./fetch/dvpswap-factory";

export function handleDvPSwapContractCreated(
  event: DvPSwapContractCreated
): void {
  // Fetch or create factory entity
  const factory = fetchDvPSwapFactory(event.address);

  // Fetch accounts
  const creator = fetchAccount(event.params.creator);
  const sender = fetchAccount(event.transaction.from);

  // Fetch or create DvPSwap entity
  const dvpSwap = fetchDvPSwap(
    event.params.dvpSwapContract,
    event.block.timestamp
  );

  // Update DvPSwap with correct creator
  updateDvPSwapCreator(dvpSwap.id, event.params.creator);

  // Increment contract count
  factory.dvpSwapContractsCount = factory.dvpSwapContractsCount + 1;

  // Create event entity - convert eventId from Bytes to String
  const eventIdValue = eventId(event);
  const contractCreatedEvent = new DvPSwapContractCreatedEvent(
    eventIdValue.toHexString()
  );
  contractCreatedEvent.eventName = EventName.DvPSwapContractCreated;
  contractCreatedEvent.timestamp = event.block.timestamp;
  contractCreatedEvent.factory = factory.id;
  contractCreatedEvent.sender = sender.id;
  contractCreatedEvent.dvpSwapContract = dvpSwap.id;
  contractCreatedEvent.creator = creator.id;

  // Create activity event
  accountActivityEvent(
    creator,
    EventName.DvPSwapContractCreated,
    event.block.timestamp,
    "dvpswap",
    dvpSwap.id
  );

  // Save entities
  factory.save();
  contractCreatedEvent.save();

  // Create contract template
  DvPSwap.create(event.params.dvpSwapContract);

  log.info(
    "DvPSwapFactory - DvPSwap contract created: contract={}, creator={}",
    [event.params.dvpSwapContract.toHexString(), creator.id.toHexString()]
  );
}
