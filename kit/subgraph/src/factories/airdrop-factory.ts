import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  log,
} from "@graphprotocol/graph-ts";

import { ipfs, json } from "@graphprotocol/graph-ts";

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

// Import contract bindings for fetching state
import { PushAirdrop as PushAirdropContract } from "../../generated/templates/PushAirdropTemplate/PushAirdrop";
import { StandardAirdrop as StandardAirdropContract } from "../../generated/templates/StandardAirdropTemplate/StandardAirdrop";
import { LinearVestingStrategy as LinearVestingStrategyContract } from "../../generated/templates/VestingAirdropTemplate/LinearVestingStrategy";
import { VestingAirdrop as VestingAirdropContract } from "../../generated/templates/VestingAirdropTemplate/VestingAirdrop";

// Use fetchAccount instead of loadOrCreateAccount
import { fetchAccount } from "../utils/account";

export function handleStandardAirdropDeployed(
  event: StandardAirdropDeployed
): void {
  let factoryAddress = event.address;
  let factoryContract = AirdropFactoryContract.bind(factoryAddress);
  let factoryEntity = loadOrCreateAirdropFactory(factoryAddress);

  factoryEntity.totalAirdropsDeployed = factoryEntity.totalAirdropsDeployed + 1; // Use standard integer increment
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

  // --- Fetch contract state --- //

  // Fetch TrustedForwarder from Factory state
  let trustedForwarderResult = factoryContract.try_trustedForwarder();
  if (!trustedForwarderResult.reverted) {
    airdrop.trustedForwarder = fetchAccount(trustedForwarderResult.value).id;
  } else {
    log.error(
      "Failed to fetch trustedForwarder for Factory {} while creating StandardAirdrop {}",
      [factoryAddress.toHex(), airdropAddress.toHex()]
    );
    airdrop.trustedForwarder = fetchAccount(Address.zero()).id; // Default/Placeholder
  }

  // Fetch details from the newly deployed StandardAirdrop contract
  let airdropContract = StandardAirdropContract.bind(airdropAddress);
  let merkleRootResult = airdropContract.try_merkleRoot();
  let startTimeResult = airdropContract.try_startTime();
  let endTimeResult = airdropContract.try_endTime();

  // Fetch name and distributionIpfsHash from the newly deployed StandardAirdrop contract
  let nameResult = airdropContract.try_name();
  let distributionIpfsHashResult = airdropContract.try_distributionIpfsHash();

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

    // Fetch and log IPFS content
    let ipfsHash = distributionIpfsHashResult.value;
    log.info("Attempting to fetch IPFS content for hash: {}", [ipfsHash]);

    let ipfsData = ipfs.cat(ipfsHash);
    if (ipfsData) {
      log.info("Successfully fetched IPFS data. Raw bytes length: {}", [
        ipfsData.length.toString(),
      ]);

      // Try to parse as JSON
      let jsonData = json.fromBytes(ipfsData);
      if (jsonData.isNull()) {
        log.warning("IPFS data is not valid JSON for hash: {}", [ipfsHash]);
        // Log as string if not JSON
        let stringData = ipfsData.toString();
        log.info("IPFS content as string: {}", [stringData]);
      } else {
        log.info("IPFS data parsed successfully as JSON for hash: {}", [
          ipfsHash,
        ]);

        // Log the JSON object - specific to airdrop distribution format
        let jsonObject = jsonData.toObject();
        if (jsonObject) {
          let totalRecipients = jsonObject.entries.length;
          log.info("IPFS airdrop distribution data contains {} recipients", [
            totalRecipients.toString(),
          ]);

          // Log first few recipients as examples (limit to 5 to avoid log spam)
          let maxToLog = totalRecipients > 5 ? 5 : totalRecipients;
          log.info("Showing first {} recipients:", [maxToLog.toString()]);

          for (let i = 0; i < maxToLog; i++) {
            let entry = jsonObject.entries[i];
            let address = entry.key;
            let recipientData = entry.value;

            if (recipientData.kind == 5) {
              // OBJECT
              let recipientObject = recipientData.toObject();
              if (recipientObject) {
                let amount = "";
                let proofLength = 0;

                // Extract amount
                let amountValue = recipientObject.get("amount");
                if (amountValue && amountValue.kind == 0) {
                  // STRING
                  amount = amountValue.toString();
                }

                // Extract proof array length
                let proofValue = recipientObject.get("proof");
                if (proofValue && proofValue.kind == 4) {
                  // ARRAY
                  proofLength = proofValue.toArray().length;
                }

                log.info(
                  "Recipient {}: address={}, amount={}, proof_length={}",
                  [(i + 1).toString(), address, amount, proofLength.toString()]
                );
              }
            }
          }

          if (totalRecipients > 5) {
            log.info("... and {} more recipients", [
              (totalRecipients - 5).toString(),
            ]);
          }

          // Calculate total amount being distributed
          let totalAmount = BigInt.fromI32(0);
          let validRecipients = 0;

          for (let i = 0; i < totalRecipients; i++) {
            let entry = jsonObject.entries[i];
            let recipientData = entry.value;

            if (recipientData.kind == 5) {
              // OBJECT
              let recipientObject = recipientData.toObject();
              if (recipientObject) {
                let amountValue = recipientObject.get("amount");
                if (amountValue && amountValue.kind == 0) {
                  // STRING
                  let amountStr = amountValue.toString();
                  let amount = BigInt.fromString(amountStr);
                  totalAmount = totalAmount.plus(amount);
                  validRecipients++;
                }
              }
            }
          }

          log.info(
            "Distribution summary: {} valid recipients, total amount: {} wei",
            [validRecipients.toString(), totalAmount.toString()]
          );
        }
      }
    } else {
      log.error("Failed to fetch IPFS data for hash: {}", [ipfsHash]);
    }
  } else {
    log.error("Failed to fetch distributionIpfsHash for StandardAirdrop {}", [
      airdropAddress.toHex(),
    ]);
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

  factoryEntity.totalAirdropsDeployed = factoryEntity.totalAirdropsDeployed + 1; // Use standard integer increment
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
  let strategy = new LinearVestingStrategy(strategyAddress); // Assuming Linear for now

  // --- Fetch contract state --- //

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
    // Keep trustedForwarderAccountAddress as Address.zero()
  }

  // Fetch details from the newly deployed LinearVestingStrategy contract
  let strategyContract = LinearVestingStrategyContract.bind(strategyAddress);
  let vestingDurationResult = strategyContract.try_vestingDuration();
  let cliffDurationResult = strategyContract.try_cliffDuration();
  let strategyOwnerResult = strategyContract.try_owner();

  strategy.type = "Linear";
  strategy.airdropRef = airdropAddress; // Add direct reference to airdrop

  if (!strategyOwnerResult.reverted) {
    strategy.owner = fetchAccount(strategyOwnerResult.value).id;
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

  airdrop.factory = factoryEntity.id;
  airdrop.token = tokenAddress; // Store token address directly (Bytes)
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
    airdrop.merkleRoot = Bytes.fromHexString("0x00"); // Placeholder
  }
  if (!claimPeriodEndResult.reverted) {
    airdrop.claimPeriodEnd = claimPeriodEndResult.value;
  } else {
    log.error("Failed to fetch claimPeriodEnd for VestingAirdrop {}", [
      airdropAddress.toHex(),
    ]);
    airdrop.claimPeriodEnd = BigInt.fromI32(0);
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
  airdrop.token = tokenAddress; // Store token address directly (Bytes)
  airdrop.owner = owner.id;
  airdrop.deployedOn = event.block.timestamp;
  airdrop.deploymentTx = event.transaction.hash;
  airdrop.totalClaimed = BigDecimal.fromString("0");
  airdrop.totalClaimedExact = BigInt.fromI32(0);
  airdrop.totalRecipients = 0;
  airdrop.totalClaims = 0;
  airdrop.isWithdrawn = false;
  airdrop.distributionCap = BigInt.fromI32(0); // Default, will be updated from contract
  airdrop.totalDistributed = BigInt.fromI32(0);

  // --- Fetch contract state --- //

  // Fetch TrustedForwarder from Factory state
  let trustedForwarderResult = factoryContract.try_trustedForwarder();
  if (!trustedForwarderResult.reverted) {
    airdrop.trustedForwarder = fetchAccount(trustedForwarderResult.value).id;
  } else {
    log.error(
      "Failed to fetch trustedForwarder for Factory {} while creating PushAirdrop {}",
      [factoryAddress.toHex(), airdropAddress.toHex()]
    );
    airdrop.trustedForwarder = fetchAccount(Address.zero()).id; // Default/Placeholder
  }

  // Fetch details from the newly deployed PushAirdrop contract
  let airdropContract = PushAirdropContract.bind(airdropAddress);
  let merkleRootResult = airdropContract.try_merkleRoot();
  let distributionCapResult = airdropContract.try_distributionCap();
  let totalDistributedResult = airdropContract.try_totalDistributed();

  if (!merkleRootResult.reverted) {
    airdrop.merkleRoot = merkleRootResult.value;
  } else {
    log.error("Failed to fetch merkleRoot for PushAirdrop {}", [
      airdropAddress.toHex(),
    ]);
    airdrop.merkleRoot = Bytes.fromHexString("0x00"); // Placeholder
  }

  if (!distributionCapResult.reverted) {
    airdrop.distributionCap = distributionCapResult.value;
  } else {
    log.error("Failed to fetch distributionCap for PushAirdrop {}", [
      airdropAddress.toHex(),
    ]);
    // Keep default zero value
  }

  if (!totalDistributedResult.reverted) {
    airdrop.totalDistributed = totalDistributedResult.value;
  } else {
    log.error("Failed to fetch totalDistributed for PushAirdrop {}", [
      airdropAddress.toHex(),
    ]);
    // Keep default zero value
  }
  // ---------------------------- //

  airdrop.save();

  // Start indexing the new airdrop contract using the template
  PushAirdropTemplate.create(airdropAddress);

  log.info("Created PushAirdrop entity {} and started template indexing", [
    airdropAddress.toHex(),
  ]);
}

// Helper function to ensure AirdropFactory entity exists
// This one is local to this file as it's specific to the factory itself
function loadOrCreateAirdropFactory(factoryAddress: Address): AirdropFactory {
  let factory = AirdropFactory.load(factoryAddress);
  if (!factory) {
    factory = new AirdropFactory(factoryAddress);
    factory.totalAirdropsDeployed = 0; // Use standard integer 0
    factory.save();
  }
  return factory;
}
