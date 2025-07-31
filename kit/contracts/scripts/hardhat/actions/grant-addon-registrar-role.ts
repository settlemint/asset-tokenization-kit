/**
 * Grant REGISTRAR_ROLE for addon registration
 *
 * This script grants the REGISTRAR_ROLE to a user on the system addon registry,
 * which is required to register system addons like airdrops, yield schedules, etc.
 */

import { parseArgs } from "node:util";
import { getAddress } from "viem";
import { owner } from "../constants/actors";
import { ATKContracts } from "../constants/contracts";
import { ATKRoles } from "../constants/roles";
import { atkDeployer } from "../services/deployer";
import { getPublicClient } from "../utils/public-client";

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      user: {
        type: "string",
        short: "u",
        default: undefined,
      },
      system: {
        type: "string",
        short: "s",
        default: undefined,
      },
      help: {
        type: "boolean",
        short: "h",
      },
    },
  });

  if (values.help) {
    console.log(`
Usage: npx hardhat run scripts/hardhat/actions/grant-addon-registrar-role.ts [options]

Options:
  -u, --user <address>     User address to grant REGISTRAR_ROLE (defaults to deployer)
  -s, --system <address>   System contract address (optional - auto-detected)
  -h, --help              Show this help message

Example:
  npx hardhat run scripts/hardhat/actions/grant-addon-registrar-role.ts
  npx hardhat run scripts/hardhat/actions/grant-addon-registrar-role.ts --user 0x1234...
`);
    return;
  }

  console.log("🔐 Granting REGISTRAR_ROLE for addon registration...\n");

  // Initialize the deployer if not already done
  if (!atkDeployer.isDeployed()) {
    console.log("📦 Setting up deployer...");
    await atkDeployer.setUp();
  }

  // Get the system address
  const systemAddress =
    values.system || atkDeployer.getContractAddress("system");
  console.log(`📍 System Address: ${systemAddress}`);

  // Get the system contract
  const systemContract = atkDeployer.getSystemContract();

  // Get the addon registry from the system
  const addonRegistryAddress = await systemContract.read.systemAddonRegistry();
  console.log(`📍 Addon Registry Address: ${addonRegistryAddress}`);

  // Get the addon registry contract
  const addonRegistryContract = owner.getContractInstance({
    address: addonRegistryAddress,
    abi: ATKContracts.systemAddonRegistry,
  });

  // Initialize owner actor
  await owner.initialize();

  // Get the user address (defaults to owner address)
  const userAddress = getAddress(values.user || owner.address);
  console.log(`👤 User Address: ${userAddress}`);

  // Check current roles
  console.log("\n🔍 Checking current roles...");

  const hasDefaultAdminRole = await addonRegistryContract.read.hasRole([
    ATKRoles.defaultAdminRole,
    userAddress,
  ]);

  const hasRegistrarRole = await addonRegistryContract.read.hasRole([
    ATKRoles.registrarRole,
    userAddress,
  ]);

  console.log(
    `   DEFAULT_ADMIN_ROLE: ${hasDefaultAdminRole ? "✅ YES" : "❌ NO"}`
  );
  console.log(`   REGISTRAR_ROLE: ${hasRegistrarRole ? "✅ YES" : "❌ NO"}`);

  if (hasRegistrarRole) {
    console.log("\n✅ User already has REGISTRAR_ROLE! No action needed.");
    return;
  }

  if (!hasDefaultAdminRole) {
    console.log(
      "\n❌ Error: User doesn't have DEFAULT_ADMIN_ROLE on the addon registry."
    );
    console.log("   Only the default admin can grant REGISTRAR_ROLE.");
    console.log(
      "   Contact the system administrator or use the correct admin account."
    );
    return;
  }

  // Grant REGISTRAR_ROLE
  console.log("\n🎯 Granting REGISTRAR_ROLE...");

  const tx = await addonRegistryContract.write.grantRole([
    ATKRoles.registrarRole,
    userAddress,
  ]);

  console.log(`   Transaction Hash: ${tx}`);
  console.log("   Waiting for confirmation...");

  // Wait for transaction confirmation
  const receipt = await getPublicClient().waitForTransactionReceipt({
    hash: tx,
  });

  console.log(`   Gas Used: ${receipt.gasUsed}`);
  console.log(`   Block Number: ${receipt.blockNumber}`);

  // Verify the role was granted
  const hasRoleAfter = await addonRegistryContract.read.hasRole([
    ATKRoles.registrarRole,
    userAddress,
  ]);

  if (hasRoleAfter) {
    console.log("\n✅ SUCCESS! REGISTRAR_ROLE granted successfully.");
    console.log("   You can now register system addons.");
  } else {
    console.log("\n❌ ERROR: Failed to verify role grant.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
