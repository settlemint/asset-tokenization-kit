import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../implementations/forwarder"; // Assuming ForwarderModule exists

const VestingAirdropModule = buildModule("VestingAirdropModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  // Parameters for LinearVestingStrategy
  const vestingDuration = m.getParameter("vestingDuration");
  const cliffDuration = m.getParameter("cliffDuration", 0); // Default to 0
  const strategyOwner = m.getParameter("strategyOwner"); // Can be same as airdrop owner

  // Parameters for VestingAirdrop
  const tokenAddress = m.getParameter("tokenAddress");
  const merkleRoot = m.getParameter("merkleRoot");
  const airdropOwner = m.getParameter("airdropOwner");
  const claimPeriodEnd = m.getParameter("claimPeriodEnd");

  // Deploy the strategy first
  const linearVestingStrategy = m.contract("LinearVestingStrategy", [
    vestingDuration,
    cliffDuration,
    strategyOwner,
    forwarder, // Strategy also uses forwarder
  ]);

  // Deploy the airdrop using the deployed strategy
  const vestingAirdrop = m.contract("VestingAirdrop", [
    tokenAddress,
    merkleRoot,
    airdropOwner,
    linearVestingStrategy, // Pass the deployed strategy contract
    claimPeriodEnd,
    forwarder, // Airdrop uses forwarder
  ]);

  // Return both deployed contracts
  return { vestingAirdrop, linearVestingStrategy };
});

export default VestingAirdropModule;
