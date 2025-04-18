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

  // Use a fixed salt value instead of using keccak256 which might have import issues
  // This is a hardcoded valid bytes32 value for consistent CREATE2 addresses
  const salt = "0x1234567890123456789012345678901234567890123456789012345678901234";

  // Create a DvPSwap contract using the factory
  const createDvPSwap = m.call(
    dvpSwapFactory,
    "create",
    [salt],
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