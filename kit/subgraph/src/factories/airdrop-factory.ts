import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  log,
} from "@graphprotocol/graph-ts";

import { ipfs, json, JSONValueKind } from "@graphprotocol/graph-ts";

import {
  AirdropFactory,
  LinearVestingStrategy,
  PushAirdrop,
  StandardAirdrop,
  VestingAirdrop,
} from "../../generated/schema";

import {
  AirdropFactory as AirdropFactoryContract,
  PushAirdropDeployed,
  StandardAirdropDeployed,
  VestingAirdropDeployed,
} from "../../generated/AirdropFactory/AirdropFactory";
import {
  PushAirdropTemplate,
  StandardAirdropTemplate,
  VestingAirdropTemplate,
} from "../../generated/templates";
import { PushAirdrop as PushAirdropContract } from "../../generated/templates/PushAirdropTemplate/PushAirdrop";
import { StandardAirdrop as StandardAirdropContract } from "../../generated/templates/StandardAirdropTemplate/StandardAirdrop";
import { LinearVestingStrategy as LinearVestingStrategyContract } from "../../generated/templates/VestingAirdropTemplate/LinearVestingStrategy";
import { VestingAirdrop as VestingAirdropContract } from "../../generated/templates/VestingAirdropTemplate/VestingAirdrop";
import { fetchAssetDecimals } from "../assets/fetch/asset";
import { fetchAccount } from "../utils/account";
import { fetchAirdropRecipient } from "../utils/airdrop";
import { toDecimals } from "../utils/decimals";

function updateAirdropAllocations(
  ipfsHash: string,
  airdropAddress: Address,
  tokenDecimals: i32
): void {
  if (!ipfsHash) {
    log.warning("No IPFS hash provided for airdrop {}", [
      airdropAddress.toHex(),
    ]);
    return;
  }

  log.info("Fetching IPFS distribution data for airdrop {} with hash: {}", [
    airdropAddress.toHex(),
    ipfsHash,
  ]);

  let ipfsData = ipfs.cat(ipfsHash);
  if (!ipfsData) {
    log.error(
      "Failed to fetch IPFS data for hash: {} - continuing without allocation data",
      [ipfsHash]
    );
    return;
  }

  log.info("Successfully fetched IPFS data. Raw bytes length: {}", [
    ipfsData.length.toString(),
  ]);

  let jsonData = json.fromBytes(ipfsData);
  if (jsonData.isNull()) {
    log.warning(
      "IPFS data is not valid JSON for hash: {} - continuing without allocation data",
      [ipfsHash]
    );
    let stringData = ipfsData.toString();
    log.info("IPFS content as string: {}", [stringData]);
    return;
  }

  log.info("IPFS data parsed successfully as JSON for hash: {}", [ipfsHash]);

  let jsonObject = jsonData.toObject();
  if (!jsonObject) {
    log.warning(
      "IPFS JSON data is not an object for hash: {} - continuing without allocation data",
      [ipfsHash]
    );
    return;
  }

  let totalRecipients = jsonObject.entries.length;
  log.info("IPFS airdrop distribution data contains {} recipients", [
    totalRecipients.toString(),
  ]);

  if (totalRecipients == 0) {
    log.info("No recipients found in distribution data", []);
    return;
  }

  // Process recipients and create AirdropRecipient entities
  let totalAmount = BigInt.zero();
  let validRecipients = 0;

  for (let i = 0; i < totalRecipients; i++) {
    let entry = jsonObject.entries[i];
    let addressStr = entry.key;
    let recipientData = entry.value;

    if (recipientData.kind !== JSONValueKind.OBJECT) {
      log.warning(
        "Invalid recipient data type for address {}: kind {} - skipping",
        [addressStr, recipientData.kind.toString()]
      );
      continue;
    }

    let recipientObject = recipientData.toObject();
    if (!recipientObject) {
      log.warning(
        "Invalid recipient data type for address {}: kind {} - skipping",
        [addressStr, recipientData.kind.toString()]
      );
      continue;
    }

    let amountValue = recipientObject.get("amount");
    if (!amountValue) {
      log.warning("No 'amount' field found for address: {} - skipping", [
        addressStr,
      ]);
      continue;
    }

    let amount = BigInt.fromI32(0);
    if (amountValue.kind !== JSONValueKind.STRING) {
      log.warning("Invalid amount type for address {}: kind {} - skipping", [
        addressStr,
        amountValue.kind.toString(),
      ]);
      continue;
    }

    // Handle potential BigInt parsing errors by checking for valid string format
    let amountString = amountValue.toString();
    if (amountString.length == 0) {
      log.warning("Empty amount string for address: {} - skipping", [
        addressStr,
      ]);
      continue;
    }

    amount = BigInt.fromString(amountString);

    // Validate address format before processing
    if (addressStr.length != 42 || !addressStr.startsWith("0x")) {
      log.warning("Invalid address format: {} - skipping", [addressStr]);
      continue;
    }

    let recipientAddress = Address.fromString(addressStr);
    let recipientAccount = fetchAccount(recipientAddress);

    let airdropRecipient = fetchAirdropRecipient(
      airdropAddress,
      recipientAccount.id
    );

    airdropRecipient.allocatedAmountExact = amount;
    airdropRecipient.allocatedAmount = toDecimals(amount, tokenDecimals);

    airdropRecipient.save();

    totalAmount = totalAmount.plus(amount);
    validRecipients++;
  }

  log.info(
    "Created AirdropRecipient entities for airdrop {}: {} valid recipients, total amount: {} wei",
    [airdropAddress.toHex(), validRecipients.toString(), totalAmount.toString()]
  );
}

export function handleStandardAirdropDeployed(
  event: StandardAirdropDeployed
): void {
  let factoryAddress = event.address;
  let factoryContract = AirdropFactoryContract.bind(factoryAddress);
  let factoryEntity = loadOrCreateAirdropFactory(factoryAddress);

  factoryEntity.totalAirdropsDeployed = factoryEntity.totalAirdropsDeployed + 1;
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
  let owner = fetchAccount(ownerAddress);

  airdrop.factory = factoryEntity.id;
  airdrop.token = tokenAddress;
  airdrop.owner = owner.id;
  airdrop.deployedOn = event.block.timestamp;
  airdrop.deploymentTx = event.transaction.hash;
  airdrop.totalClaimed = BigDecimal.fromString("0");
  airdrop.totalClaimedExact = BigInt.fromI32(0);
  airdrop.totalRecipients = 0;
  airdrop.totalClaims = 0;
  airdrop.isWithdrawn = false;

  // Fetch TrustedForwarder from Factory state
  let trustedForwarderResult = factoryContract.try_trustedForwarder();
  if (!trustedForwarderResult.reverted) {
    airdrop.trustedForwarder = fetchAccount(trustedForwarderResult.value).id;
  } else {
    log.error(
      "Failed to fetch trustedForwarder for Factory {} while creating StandardAirdrop {}",
      [factoryAddress.toHex(), airdropAddress.toHex()]
    );
    airdrop.trustedForwarder = fetchAccount(Address.zero()).id;
  }

  // Fetch details from the newly deployed StandardAirdrop contract
  let airdropContract = StandardAirdropContract.bind(airdropAddress);
  let merkleRootResult = airdropContract.try_merkleRoot();
  let startTimeResult = airdropContract.try_startTime();
  let endTimeResult = airdropContract.try_endTime();
  let nameResult = airdropContract.try_name();
  let distributionIpfsHashResult = airdropContract.try_distributionIpfsHash();

  if (!merkleRootResult.reverted) {
    airdrop.merkleRoot = merkleRootResult.value;
  } else {
    log.error("Failed to fetch merkleRoot for StandardAirdrop {}", [
      airdropAddress.toHex(),
    ]);
    airdrop.merkleRoot = Bytes.fromHexString("0x00");
  }

  if (!startTimeResult.reverted) {
    airdrop.startTime = startTimeResult.value;
  } else {
    log.error("Failed to fetch startTime for StandardAirdrop {}", [
      airdropAddress.toHex(),
    ]);
    airdrop.startTime = BigInt.fromI32(0);
  }

  if (!endTimeResult.reverted) {
    airdrop.endTime = endTimeResult.value;
  } else {
    log.error("Failed to fetch endTime for StandardAirdrop {}", [
      airdropAddress.toHex(),
    ]);
    airdrop.endTime = BigInt.fromI32(0);
  }

  if (!nameResult.reverted) {
    airdrop.name = nameResult.value;
  } else {
    log.error("Failed to fetch name for StandardAirdrop {}", [
      airdropAddress.toHex(),
    ]);
  }

  if (!distributionIpfsHashResult.reverted) {
    airdrop.distributionIpfsHash = distributionIpfsHashResult.value;
    let tokenDecimals = fetchAssetDecimals(tokenAddress);
    updateAirdropAllocations(
      distributionIpfsHashResult.value,
      airdropAddress,
      tokenDecimals
    );
  } else {
    log.error("Failed to fetch distributionIpfsHash for StandardAirdrop {}", [
      airdropAddress.toHex(),
    ]);
  }

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

  factoryEntity.totalAirdropsDeployed = factoryEntity.totalAirdropsDeployed + 1;
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
  let owner = fetchAccount(ownerAddress);
  let strategy = new LinearVestingStrategy(strategyAddress);

  // Fetch TrustedForwarder from Factory state
  let trustedForwarderResult = factoryContract.try_trustedForwarder();
  let trustedForwarderAccountAddress = Address.zero();
  if (!trustedForwarderResult.reverted) {
    trustedForwarderAccountAddress = trustedForwarderResult.value;
  } else {
    log.error(
      "Failed to fetch trustedForwarder for Factory {} while creating VestingAirdrop {}",
      [factoryAddress.toHex(), airdropAddress.toHex()]
    );
  }

  // Fetch details from the newly deployed LinearVestingStrategy contract
  let strategyContract = LinearVestingStrategyContract.bind(strategyAddress);
  let vestingDurationResult = strategyContract.try_vestingDuration();
  let cliffDurationResult = strategyContract.try_cliffDuration();
  let strategyOwnerResult = strategyContract.try_owner();

  strategy.type = "Linear";
  strategy.airdropRef = airdropAddress;

  if (!strategyOwnerResult.reverted) {
    strategy.owner = fetchAccount(strategyOwnerResult.value).id;
  } else {
    log.error(
      "Failed to fetch owner for Strategy {}. Using airdrop owner as fallback.",
      [strategyAddress.toHex()]
    );
    strategy.owner = owner.id;
  }

  if (!vestingDurationResult.reverted) {
    strategy.vestingDuration = vestingDurationResult.value;
  } else {
    log.error("Failed to fetch vestingDuration for Strategy {}", [
      strategyAddress.toHex(),
    ]);
    strategy.vestingDuration = BigInt.fromI32(0);
  }

  if (!cliffDurationResult.reverted) {
    strategy.cliffDuration = cliffDurationResult.value;
  } else {
    log.error("Failed to fetch cliffDuration for Strategy {}", [
      strategyAddress.toHex(),
    ]);
    strategy.cliffDuration = BigInt.fromI32(0);
  }

  strategy.save();

  // Fetch details from the newly deployed VestingAirdrop contract
  let airdropContract = VestingAirdropContract.bind(airdropAddress);
  let merkleRootResult = airdropContract.try_merkleRoot();
  let claimPeriodEndResult = airdropContract.try_claimPeriodEnd();
  let distributionIpfsHashResult = airdropContract.try_distributionIpfsHash();

  airdrop.factory = factoryEntity.id;
  airdrop.token = tokenAddress;
  airdrop.owner = owner.id;
  airdrop.deployedOn = event.block.timestamp;
  airdrop.deploymentTx = event.transaction.hash;
  airdrop.totalClaimed = BigDecimal.fromString("0");
  airdrop.totalClaimedExact = BigInt.fromI32(0);
  airdrop.totalRecipients = 0;
  airdrop.totalClaims = 0;
  airdrop.isWithdrawn = false;
  airdrop.strategy = strategy.id;
  airdrop.trustedForwarder = fetchAccount(trustedForwarderAccountAddress).id;

  if (!merkleRootResult.reverted) {
    airdrop.merkleRoot = merkleRootResult.value;
  } else {
    log.error("Failed to fetch merkleRoot for VestingAirdrop {}", [
      airdropAddress.toHex(),
    ]);
    airdrop.merkleRoot = Bytes.fromHexString("0x00");
  }

  if (!claimPeriodEndResult.reverted) {
    airdrop.claimPeriodEnd = claimPeriodEndResult.value;
  } else {
    log.error("Failed to fetch claimPeriodEnd for VestingAirdrop {}", [
      airdropAddress.toHex(),
    ]);
    airdrop.claimPeriodEnd = BigInt.fromI32(0);
  }

  if (!distributionIpfsHashResult.reverted) {
    let tokenDecimals = fetchAssetDecimals(tokenAddress);
    updateAirdropAllocations(
      distributionIpfsHashResult.value,
      airdropAddress,
      tokenDecimals
    );
  } else {
    log.error("Failed to fetch distributionIpfsHash for VestingAirdrop {}", [
      airdropAddress.toHex(),
    ]);
  }

  airdrop.save();

  // Start indexing the new airdrop contract using the template
  VestingAirdropTemplate.create(airdropAddress);

  log.info(
    "Created VestingAirdrop {} and Strategy {} entities, started template indexing",
    [airdropAddress.toHex(), strategyAddress.toHex()]
  );
}

export function handlePushAirdropDeployed(event: PushAirdropDeployed): void {
  let factoryAddress = event.address;
  let factoryContract = AirdropFactoryContract.bind(factoryAddress);
  let factoryEntity = loadOrCreateAirdropFactory(factoryAddress);

  factoryEntity.totalAirdropsDeployed = factoryEntity.totalAirdropsDeployed + 1;
  factoryEntity.save();

  let airdropAddress = event.params.airdropContract;
  let tokenAddress = event.params.tokenAddress;
  let ownerAddress = event.params.owner;

  log.info(
    "PushAirdropDeployed event processed: Factory {}, Airdrop {}, Token {}, Owner {}",
    [
      factoryAddress.toHex(),
      airdropAddress.toHex(),
      tokenAddress.toHex(),
      ownerAddress.toHex(),
    ]
  );

  // Create entities
  let airdrop = new PushAirdrop(airdropAddress);
  let owner = fetchAccount(ownerAddress);

  airdrop.factory = factoryEntity.id;
  airdrop.token = tokenAddress;
  airdrop.owner = owner.id;
  airdrop.deployedOn = event.block.timestamp;
  airdrop.deploymentTx = event.transaction.hash;
  airdrop.totalClaimed = BigDecimal.fromString("0");
  airdrop.totalClaimedExact = BigInt.fromI32(0);
  airdrop.totalRecipients = 0;
  airdrop.totalClaims = 0;
  airdrop.isWithdrawn = false;
  airdrop.distributionCap = BigInt.fromI32(0);
  airdrop.totalDistributed = BigInt.fromI32(0);

  // Fetch TrustedForwarder from Factory state
  let trustedForwarderResult = factoryContract.try_trustedForwarder();
  if (!trustedForwarderResult.reverted) {
    airdrop.trustedForwarder = fetchAccount(trustedForwarderResult.value).id;
  } else {
    log.error(
      "Failed to fetch trustedForwarder for Factory {} while creating PushAirdrop {}",
      [factoryAddress.toHex(), airdropAddress.toHex()]
    );
    airdrop.trustedForwarder = fetchAccount(Address.zero()).id;
  }

  // Fetch details from the newly deployed PushAirdrop contract
  let airdropContract = PushAirdropContract.bind(airdropAddress);
  let merkleRootResult = airdropContract.try_merkleRoot();
  let distributionCapResult = airdropContract.try_distributionCap();
  let totalDistributedResult = airdropContract.try_totalDistributed();
  let nameResult = airdropContract.try_name();
  let distributionIpfsHashResult = airdropContract.try_distributionIpfsHash();

  if (!merkleRootResult.reverted) {
    airdrop.merkleRoot = merkleRootResult.value;
  } else {
    log.error("Failed to fetch merkleRoot for PushAirdrop {}", [
      airdropAddress.toHex(),
    ]);
    airdrop.merkleRoot = Bytes.fromHexString("0x00");
  }

  if (!distributionCapResult.reverted) {
    airdrop.distributionCap = distributionCapResult.value;
  } else {
    log.error("Failed to fetch distributionCap for PushAirdrop {}", [
      airdropAddress.toHex(),
    ]);
  }

  if (!totalDistributedResult.reverted) {
    airdrop.totalDistributed = totalDistributedResult.value;
  } else {
    log.error("Failed to fetch totalDistributed for PushAirdrop {}", [
      airdropAddress.toHex(),
    ]);
  }

  if (!nameResult.reverted) {
    airdrop.name = nameResult.value;
  } else {
    log.error("Failed to fetch name for PushAirdrop {}", [
      airdropAddress.toHex(),
    ]);
  }

  if (!distributionIpfsHashResult.reverted) {
    airdrop.distributionIpfsHash = distributionIpfsHashResult.value;
    let tokenDecimals = fetchAssetDecimals(tokenAddress);
    updateAirdropAllocations(
      distributionIpfsHashResult.value,
      airdropAddress,
      tokenDecimals
    );
  } else {
    log.error("Failed to fetch distributionIpfsHash for PushAirdrop {}", [
      airdropAddress.toHex(),
    ]);
  }

  airdrop.save();

  // Start indexing the new airdrop contract using the template
  PushAirdropTemplate.create(airdropAddress);

  log.info("Created PushAirdrop entity {} and started template indexing", [
    airdropAddress.toHex(),
  ]);
}

// Helper function to ensure AirdropFactory entity exists
function loadOrCreateAirdropFactory(factoryAddress: Address): AirdropFactory {
  let factory = AirdropFactory.load(factoryAddress);
  if (!factory) {
    factory = new AirdropFactory(factoryAddress);
    factory.totalAirdropsDeployed = 0;
    factory.save();
  }
  return factory;
}
