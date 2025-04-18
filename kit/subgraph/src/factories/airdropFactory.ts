import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  log,
} from "@graphprotocol/graph-ts";

import {
  AirdropFactory,
  Asset,
  LinearVestingStrategy,
  StandardAirdrop,
  VestingAirdrop,
} from "../../generated/schema";

import {
  AirdropFactory as AirdropFactoryContract,
  StandardAirdropDeployed,
  VestingAirdropDeployed,
} from "../../generated/AirdropFactory/AirdropFactory";

import {
  StandardAirdropTemplate,
  VestingAirdropTemplate,
} from "../../generated/templates";

// Import contract bindings for fetching state
import { StandardAirdrop as StandardAirdropContract } from "../../generated/templates/StandardAirdropTemplate/StandardAirdrop";
import { LinearVestingStrategy as LinearVestingStrategyContract } from "../../generated/templates/VestingAirdropTemplate/LinearVestingStrategy";
import { VestingAirdrop as VestingAirdropContract } from "../../generated/templates/VestingAirdropTemplate/VestingAirdrop";

// Use fetchAccount instead of loadOrCreateAccount
import { fetchAccount } from "../fetch/account"; // Corrected import path and function
// Constants are replaced with direct values
// Removed unused decimal import

export function handleStandardAirdropDeployed(
  event: StandardAirdropDeployed
): void {
  let factoryAddress = event.address;
  let factoryContract = AirdropFactoryContract.bind(factoryAddress);
  let factoryEntity = loadOrCreateAirdropFactory(factoryAddress); // Keep helper for factory itself

  factoryEntity.totalAirdropsDeployed =
    factoryEntity.totalAirdropsDeployed.plus(BigInt.fromI32(1)); // Use BigInt.fromI32(1)
  factoryEntity.save();

  let airdropAddress = event.params.airdropContract;
  let tokenAddress = event.params.tokenAddress;
  let ownerAddress = event.params.owner;

  log.info(
    "StandardAirdropDeployed event processed: Factory {}, Airdrop {}, Token {}, Owner {}",
    [
      factoryAddress.toHex(),
      airdropAddress.toHex(),
      tokenAddress.toHex(),
      ownerAddress.toHex(),
    ]
  );

  // Create entities
  let airdrop = new StandardAirdrop(airdropAddress);
  let owner = fetchAccount(ownerAddress); // Use fetchAccount
  let token = Asset.load(tokenAddress); // Assuming token is already indexed

  if (!token) {
    log.warning(
      "Token {} not found for StandardAirdrop {}. Airdrop indexing might be incomplete.",
      [tokenAddress.toHex(), airdropAddress.toHex()]
    );
    return; // Skip if token not found
  }

  airdrop.factory = factoryEntity.id;
  airdrop.token = token.id;
  airdrop.owner = owner.id;
  airdrop.deployedOn = event.block.timestamp;
  airdrop.deploymentTx = event.transaction.hash;
  airdrop.totalClaimed = BigDecimal.fromString("0"); // Use BigDecimal.fromString("0")
  airdrop.totalClaimedExact = BigInt.fromI32(0); // Use BigInt.fromI32(0)
  airdrop.totalRecipients = 0;
  airdrop.totalClaims = 0;
  airdrop.isWithdrawn = false;

  // --- Fetch contract state --- //

  // Fetch TrustedForwarder from Factory state
  let trustedForwarderResult = factoryContract.try_trustedForwarder();
  if (!trustedForwarderResult.reverted) {
    airdrop.trustedForwarder = fetchAccount(trustedForwarderResult.value).id; // Use fetchAccount
  } else {
    log.error(
      "Failed to fetch trustedForwarder for Factory {} while creating StandardAirdrop {}",
      [factoryAddress.toHex(), airdropAddress.toHex()]
    );
    airdrop.trustedForwarder = fetchAccount(Address.zero()).id; // Use fetchAccount, still might need placeholder handling if zero account fetch fails
  }

  // Fetch details from the newly deployed StandardAirdrop contract
  let airdropContract = StandardAirdropContract.bind(airdropAddress);
  let merkleRootResult = airdropContract.try_merkleRoot();
  let startTimeResult = airdropContract.try_startTime();
  let endTimeResult = airdropContract.try_endTime();

  if (!merkleRootResult.reverted) {
    airdrop.merkleRoot = merkleRootResult.value;
  } else {
    log.error("Failed to fetch merkleRoot for StandardAirdrop {}", [
      airdropAddress.toHex(),
    ]);
    airdrop.merkleRoot = Bytes.fromHexString("0x00"); // Placeholder
  }
  if (!startTimeResult.reverted) {
    airdrop.startTime = startTimeResult.value;
  } else {
    log.error("Failed to fetch startTime for StandardAirdrop {}", [
      airdropAddress.toHex(),
    ]);
    airdrop.startTime = BigInt.fromI32(0); // Use BigInt.fromI32(0)
  }
  if (!endTimeResult.reverted) {
    airdrop.endTime = endTimeResult.value;
  } else {
    log.error("Failed to fetch endTime for StandardAirdrop {}", [
      airdropAddress.toHex(),
    ]);
    airdrop.endTime = BigInt.fromI32(0); // Use BigInt.fromI32(0)
  }
  // ---------------------------- //

  airdrop.save();

  // Start indexing the new airdrop contract using the template
  StandardAirdropTemplate.create(airdropAddress);

  log.info("Created StandardAirdrop entity {} and started template indexing", [
    airdropAddress.toHex(),
  ]);
}

export function handleVestingAirdropDeployed(
  event: VestingAirdropDeployed
): void {
  let factoryAddress = event.address;
  let factoryContract = AirdropFactoryContract.bind(factoryAddress);
  let factoryEntity = loadOrCreateAirdropFactory(factoryAddress);

  factoryEntity.totalAirdropsDeployed =
    factoryEntity.totalAirdropsDeployed.plus(BigInt.fromI32(1)); // Use BigInt.fromI32(1)
  factoryEntity.save();

  let airdropAddress = event.params.airdropContract;
  let tokenAddress = event.params.tokenAddress;
  let ownerAddress = event.params.owner;
  let strategyAddress = event.params.strategy;

  log.info(
    "VestingAirdropDeployed event processed: Factory {}, Airdrop {}, Token {}, Owner {}, Strategy {}",
    [
      factoryAddress.toHex(),
      airdropAddress.toHex(),
      tokenAddress.toHex(),
      ownerAddress.toHex(),
      strategyAddress.toHex(),
    ]
  );

  // Create entities
  let airdrop = new VestingAirdrop(airdropAddress);
  let owner = fetchAccount(ownerAddress); // Use fetchAccount
  let token = Asset.load(tokenAddress);
  let strategy = new LinearVestingStrategy(strategyAddress); // Assuming Linear for now

  if (!token) {
    log.warning(
      "Token {} not found for VestingAirdrop {}. Airdrop indexing might be incomplete.",
      [tokenAddress.toHex(), airdropAddress.toHex()]
    );
    return; // Skip if token not found
  }

  // --- Fetch contract state --- //

  // Fetch TrustedForwarder from Factory state
  let trustedForwarderResult = factoryContract.try_trustedForwarder();
  let trustedForwarderAccountAddress = Address.zero(); // Store address temporarily
  if (!trustedForwarderResult.reverted) {
    trustedForwarderAccountAddress = trustedForwarderResult.value;
  } else {
    log.error(
      "Failed to fetch trustedForwarder for Factory {} while creating VestingAirdrop {}",
      [factoryAddress.toHex(), airdropAddress.toHex()]
    );
    // Keep trustedForwarderAccountAddress as Address.zero()
  }

  // Fetch details from the newly deployed LinearVestingStrategy contract
  let strategyContract = LinearVestingStrategyContract.bind(strategyAddress);
  let vestingDurationResult = strategyContract.try_vestingDuration();
  let cliffDurationResult = strategyContract.try_cliffDuration();
  let strategyOwnerResult = strategyContract.try_owner(); // Fetch actual owner

  strategy.type = "Linear";
  strategy.airdrop = airdrop.id;

  if (!strategyOwnerResult.reverted) {
    strategy.owner = fetchAccount(strategyOwnerResult.value).id; // Use fetchAccount
  } else {
    log.error(
      "Failed to fetch owner for Strategy {}. Using airdrop owner as fallback.",
      [strategyAddress.toHex()]
    );
    strategy.owner = owner.id; // Fallback to airdrop owner
  }
  if (!vestingDurationResult.reverted) {
    strategy.vestingDuration = vestingDurationResult.value;
  } else {
    log.error("Failed to fetch vestingDuration for Strategy {}", [
      strategyAddress.toHex(),
    ]);
    strategy.vestingDuration = BigInt.fromI32(0); // Use BigInt.fromI32(0)
  }
  if (!cliffDurationResult.reverted) {
    strategy.cliffDuration = cliffDurationResult.value;
  } else {
    log.error("Failed to fetch cliffDuration for Strategy {}", [
      strategyAddress.toHex(),
    ]);
    strategy.cliffDuration = BigInt.fromI32(0); // Use BigInt.fromI32(0)
  }
  strategy.save();

  // Fetch details from the newly deployed VestingAirdrop contract
  let airdropContract = VestingAirdropContract.bind(airdropAddress);
  let merkleRootResult = airdropContract.try_merkleRoot();
  let claimPeriodEndResult = airdropContract.try_claimPeriodEnd();

  airdrop.factory = factoryEntity.id;
  airdrop.token = token.id;
  airdrop.owner = owner.id;
  airdrop.deployedOn = event.block.timestamp;
  airdrop.deploymentTx = event.transaction.hash;
  airdrop.totalClaimed = BigDecimal.fromString("0"); // Use BigDecimal.fromString("0")
  airdrop.totalClaimedExact = BigInt.fromI32(0); // Use BigInt.fromI32(0)
  airdrop.totalRecipients = 0;
  airdrop.totalClaims = 0;
  airdrop.isWithdrawn = false;
  airdrop.strategy = strategy.id;
  airdrop.trustedForwarder = fetchAccount(trustedForwarderAccountAddress).id; // Use fetchAccount with the fetched/zero address

  if (!merkleRootResult.reverted) {
    airdrop.merkleRoot = merkleRootResult.value;
  } else {
    log.error("Failed to fetch merkleRoot for VestingAirdrop {}", [
      airdropAddress.toHex(),
    ]);
    airdrop.merkleRoot = Bytes.fromHexString("0x00"); // Placeholder
  }
  if (!claimPeriodEndResult.reverted) {
    airdrop.claimPeriodEnd = claimPeriodEndResult.value;
  } else {
    log.error("Failed to fetch claimPeriodEnd for VestingAirdrop {}", [
      airdropAddress.toHex(),
    ]);
    airdrop.claimPeriodEnd = BigInt.fromI32(0); // Use BigInt.fromI32(0)
  }
  // ---------------------------- //

  airdrop.save();

  // Start indexing the new airdrop contract using the template
  VestingAirdropTemplate.create(airdropAddress);

  log.info(
    "Created VestingAirdrop {} and Strategy {} entities, started template indexing",
    [airdropAddress.toHex(), strategyAddress.toHex()]
  );
}

// Helper function to ensure AirdropFactory entity exists
// This one is local to this file as it's specific to the factory itself
function loadOrCreateAirdropFactory(factoryAddress: Address): AirdropFactory {
  let factory = AirdropFactory.load(factoryAddress);
  if (!factory) {
    factory = new AirdropFactory(factoryAddress);
    factory.totalAirdropsDeployed = BigInt.fromI32(0); // Use BigInt.fromI32(0)
    factory.save();
  }
  return factory;
}
