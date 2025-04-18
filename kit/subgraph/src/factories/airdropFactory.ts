import { Address, Bytes, log } from "@graphprotocol/graph-ts";

import {
  AirdropFactory,
  Asset,
  LinearVestingStrategy,
  StandardAirdrop,
  VestingAirdrop,
} from "../../generated/schema";

import {
  StandardAirdropDeployed,
  VestingAirdropDeployed,
} from "../../generated/AirdropFactory/AirdropFactory";

import {
  StandardAirdropTemplate,
  VestingAirdropTemplate,
} from "../../generated/templates";

// Assuming helper functions exist in utils
import { loadOrCreateAccount } from "../utils/account";
import { ONE_BI, ZERO_BD, ZERO_BI } from "../utils/constants";

export function handleStandardAirdropDeployed(
  event: StandardAirdropDeployed
): void {
  let factoryAddress = event.address;
  let factory = AirdropFactory.load(factoryAddress);
  if (!factory) {
    factory = new AirdropFactory(factoryAddress);
    factory.totalAirdropsDeployed = ZERO_BI;
    // Potentially load other factory details if needed
  }
  factory.totalAirdropsDeployed = factory.totalAirdropsDeployed.plus(ONE_BI);
  factory.save();

  let airdropAddress = event.params.param0; // address indexed airdropAddress
  let tokenAddress = event.params.param1; // address indexed tokenAddress
  let ownerAddress = event.params.param2; // address indexed owner

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
  let owner = loadOrCreateAccount(ownerAddress);
  let token = Asset.load(tokenAddress); // Assuming token is already indexed
  let factoryEntity = loadOrCreateAirdropFactory(factoryAddress); // Helper to ensure factory exists

  if (!token) {
    log.warning(
      "Token {} not found for StandardAirdrop {}. Airdrop indexing might be incomplete.",
      [tokenAddress.toHex(), airdropAddress.toHex()]
    );
    // Decide how to handle missing token: skip airdrop indexing, create placeholder?
    // For now, we'll set it to a placeholder or skip saving.
    return; // Or handle differently
  }

  airdrop.factory = factoryEntity.id;
  airdrop.token = token.id;
  airdrop.merkleRoot = Bytes.empty(); // Need to fetch from contract state
  airdrop.owner = owner.id;
  airdrop.deployedOn = event.block.timestamp;
  airdrop.deploymentTx = event.transaction.hash;
  airdrop.totalClaimed = ZERO_BD;
  airdrop.totalClaimedExact = ZERO_BI;
  airdrop.totalRecipients = 0;
  airdrop.totalClaims = 0;
  airdrop.isWithdrawn = false;
  airdrop.trustedForwarder = loadOrCreateAccount(Address.zero()).id; // Need to fetch from contract state

  // Fetching contract state (Requires ABI in yaml and contract bindings)
  // This requires the ABI to be correctly set up and code generation run
  /*
  let contract = StandardAirdropContract.bind(airdropAddress);
  let merkleRootResult = contract.try_merkleRoot();
  let startTimeResult = contract.try_startTime();
  let endTimeResult = contract.try_endTime();
  let trustedForwarderResult = contract.try_trustedForwarder();

  if (!merkleRootResult.reverted) {
    airdrop.merkleRoot = merkleRootResult.value;
  }
  if (!startTimeResult.reverted) {
    airdrop.startTime = startTimeResult.value;
  } else {
    log.error("Failed to fetch startTime for StandardAirdrop {}", [airdropAddress.toHex()]);
    airdrop.startTime = ZERO_BI; // Default value
  }
  if (!endTimeResult.reverted) {
    airdrop.endTime = endTimeResult.value;
  } else {
    log.error("Failed to fetch endTime for StandardAirdrop {}", [airdropAddress.toHex()]);
    airdrop.endTime = ZERO_BI; // Default value
  }
  if (!trustedForwarderResult.reverted) {
    airdrop.trustedForwarder = loadOrCreateAccount(trustedForwarderResult.value).id;
  } else {
      log.error("Failed to fetch trustedForwarder for StandardAirdrop {}", [airdropAddress.toHex()]);
  }
  */
  // Placeholder values until contract calls are implemented:
  airdrop.startTime = ZERO_BI;
  airdrop.endTime = ZERO_BI;
  airdrop.merkleRoot = Bytes.fromHexString("0x00"); // Placeholder
  airdrop.trustedForwarder = loadOrCreateAccount(Address.zero()).id; // Placeholder

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
  let factory = AirdropFactory.load(factoryAddress);
  if (!factory) {
    factory = new AirdropFactory(factoryAddress);
    factory.totalAirdropsDeployed = ZERO_BI;
  }
  factory.totalAirdropsDeployed = factory.totalAirdropsDeployed.plus(ONE_BI);
  factory.save();

  let airdropAddress = event.params.param0; // address indexed airdropAddress
  let tokenAddress = event.params.param1; // address indexed tokenAddress
  let ownerAddress = event.params.param2; // address indexed owner
  let strategyAddress = event.params.param3; // address strategyAddress

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
  let owner = loadOrCreateAccount(ownerAddress);
  let token = Asset.load(tokenAddress);
  let factoryEntity = loadOrCreateAirdropFactory(factoryAddress);
  let strategy = new LinearVestingStrategy(strategyAddress); // Assuming Linear for now
  let strategyOwner = loadOrCreateAccount(ownerAddress); // Strategy owner might be different, fetch if needed

  if (!token) {
    log.warning(
      "Token {} not found for VestingAirdrop {}. Airdrop indexing might be incomplete.",
      [tokenAddress.toHex(), airdropAddress.toHex()]
    );
    return; // Or handle differently
  }

  // Populate Strategy
  strategy.type = "Linear";
  strategy.airdrop = airdrop.id;
  strategy.owner = strategyOwner.id;

  // Fetch strategy details (requires ABI and contract bindings)
  /*
  let strategyContract = LinearVestingStrategyContract.bind(strategyAddress);
  let vestingDurationResult = strategyContract.try_vestingDuration();
  let cliffDurationResult = strategyContract.try_cliffDuration();
  let strategyOwnerResult = strategyContract.try_owner(); // Fetch actual owner

  if (!vestingDurationResult.reverted) {
      strategy.vestingDuration = vestingDurationResult.value;
  } else {
      log.error("Failed to fetch vestingDuration for Strategy {}", [strategyAddress.toHex()]);
      strategy.vestingDuration = ZERO_BI;
  }
  if (!cliffDurationResult.reverted) {
      strategy.cliffDuration = cliffDurationResult.value;
  } else {
      log.error("Failed to fetch cliffDuration for Strategy {}", [strategyAddress.toHex()]);
      strategy.cliffDuration = ZERO_BI;
  }
  if (!strategyOwnerResult.reverted) {
      strategy.owner = loadOrCreateAccount(strategyOwnerResult.value).id;
  } else {
       log.error("Failed to fetch owner for Strategy {}", [strategyAddress.toHex()]);
  }
  */
  // Placeholder values:
  strategy.vestingDuration = ZERO_BI;
  strategy.cliffDuration = ZERO_BI;

  strategy.save();

  // Populate Airdrop
  airdrop.factory = factoryEntity.id;
  airdrop.token = token.id;
  airdrop.merkleRoot = Bytes.empty(); // Fetch from contract
  airdrop.owner = owner.id;
  airdrop.deployedOn = event.block.timestamp;
  airdrop.deploymentTx = event.transaction.hash;
  airdrop.totalClaimed = ZERO_BD;
  airdrop.totalClaimedExact = ZERO_BI;
  airdrop.totalRecipients = 0;
  airdrop.totalClaims = 0;
  airdrop.isWithdrawn = false;
  airdrop.claimPeriodEnd = ZERO_BI; // Fetch from contract
  airdrop.trustedForwarder = loadOrCreateAccount(Address.zero()).id; // Fetch from contract
  airdrop.strategy = strategy.id;

  // Fetch airdrop details (requires ABI and contract bindings)
  /*
  let airdropContract = VestingAirdropContract.bind(airdropAddress);
  let merkleRootResult = airdropContract.try_merkleRoot();
  let claimPeriodEndResult = airdropContract.try_claimPeriodEnd();
  let trustedForwarderResult = airdropContract.try_trustedForwarder(); // Assuming it has this getter

   if (!merkleRootResult.reverted) {
       airdrop.merkleRoot = merkleRootResult.value;
   }
   if (!claimPeriodEndResult.reverted) {
       airdrop.claimPeriodEnd = claimPeriodEndResult.value;
   } else {
       log.error("Failed to fetch claimPeriodEnd for VestingAirdrop {}", [airdropAddress.toHex()]);
       airdrop.claimPeriodEnd = ZERO_BI;
   }
   if (!trustedForwarderResult.reverted) {
       airdrop.trustedForwarder = loadOrCreateAccount(trustedForwarderResult.value).id;
   } else {
       log.error("Failed to fetch trustedForwarder for VestingAirdrop {}", [airdropAddress.toHex()]);
   }
  */
  // Placeholder values:
  airdrop.merkleRoot = Bytes.fromHexString("0x00"); // Placeholder
  airdrop.claimPeriodEnd = ZERO_BI; // Placeholder
  airdrop.trustedForwarder = loadOrCreateAccount(Address.zero()).id; // Placeholder

  airdrop.save();

  // Start indexing the new airdrop contract using the template
  VestingAirdropTemplate.create(airdropAddress);

  log.info(
    "Created VestingAirdrop {} and Strategy {} entities, started template indexing",
    [airdropAddress.toHex(), strategyAddress.toHex()]
  );
}

// Helper function to ensure AirdropFactory entity exists
function loadOrCreateAirdropFactory(factoryAddress: Address): AirdropFactory {
  let factory = AirdropFactory.load(factoryAddress);
  if (!factory) {
    factory = new AirdropFactory(factoryAddress);
    factory.totalAirdropsDeployed = ZERO_BI;
    factory.save();
  }
  return factory;
}
