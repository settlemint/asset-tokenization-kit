import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "../implementations/forwarder"; // Assuming ForwarderModule exists

const PushAirdropModule = buildModule("PushAirdropModule", (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  // Define parameters for constructor arguments
  const tokenAddress = m.getParameter("tokenAddress");
  const merkleRoot = m.getParameter("merkleRoot");
  const owner = m.getParameter("owner");
  // Default distributionCap to 0 (no cap), adjust parameter as needed
  const distributionCap = m.getParameter("distributionCap", 0);

  const pushAirdrop = m.contract("PushAirdrop", [
    tokenAddress,
    merkleRoot,
    owner,
    distributionCap,
    forwarder,
  ]);

  return { pushAirdrop };
});

export default PushAirdropModule;
