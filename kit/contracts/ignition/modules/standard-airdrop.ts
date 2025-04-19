import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder"; // Assuming ForwarderModule exists

const StandardAirdropModule = buildModule("StandardAirdropModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  // Define parameters for constructor arguments
  // These need to be provided during deployment
  const tokenAddress = m.getParameter("tokenAddress");
  const merkleRoot = m.getParameter("merkleRoot");
  const owner = m.getParameter("owner");
  const startTime = m.getParameter("startTime", 0); // Default to 0, adjust as needed
  const endTime = m.getParameter("endTime", 0); // Default to 0, adjust as needed

  const standardAirdrop = m.contract("StandardAirdrop", [
    tokenAddress,
    merkleRoot,
    owner,
    startTime,
    endTime,
    forwarder,
  ]);

  return { standardAirdrop };
});

export default StandardAirdropModule;
