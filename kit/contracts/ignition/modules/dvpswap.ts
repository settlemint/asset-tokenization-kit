// SPDX-License-Identifier: MIT
// SettleMint.com
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
// Import ethers correctly for keccak256
import DvPSwapFactoryModule from "./dvpswap-factory";

const DvPSwapModule = buildModule("DvPSwapModule", (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);

  // Use the DvPSwapFactory module
  const { dvpSwapFactory } = m.useModule(DvPSwapFactoryModule);

  // Create a DvPSwap contract using the factory with a name parameter
  // This follows the pattern used by other factories in the codebase
  const createDvPSwap = m.call(
    dvpSwapFactory,
    "create",
    ["DvPSwap Exchange"], // Pass a name parameter instead of a salt
    {
      id: "createDvPSwap",
      from: deployer,
    }
  );

  // Get the DvPSwap address from the creation event
  const readDvPSwapAddress = m.readEventArgument(
    createDvPSwap,
    "DvPSwapContractCreated",
    "dvpSwapContract",
    {
      id: "readDvPSwapAddress",
    }
  );

  // Get the DvPSwap contract at the created address
  const dvpSwap = m.contractAt("DvPSwap", readDvPSwapAddress, {
    id: "dvpSwap",
  });

  return { dvpSwap, dvpSwapFactory };
});

export default DvPSwapModule; 