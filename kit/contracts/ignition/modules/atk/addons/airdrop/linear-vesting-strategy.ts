import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Ignition module for deploying ATKLinearVestingStrategy contract
 *
 * This module deploys a linear vesting strategy contract that can be used
 * with ATK airdrop contracts to implement linear token vesting with cliff periods.
 *
 * @param vestingDuration - Total vesting duration in seconds (default: 1 year)
 * @param cliffDuration - Cliff duration in seconds (default: 3 months)
 */
export default buildModule("ATKLinearVestingStrategy", (m) => {
  // Default vesting parameters
  const DEFAULT_VESTING_DURATION = 365 * 24 * 60 * 60; // 1 year in seconds
  const DEFAULT_CLIFF_DURATION = 90 * 24 * 60 * 60; // 3 months in seconds

  // Module parameters with defaults
  const vestingDuration = m.getParameter(
    "vestingDuration",
    DEFAULT_VESTING_DURATION
  );
  const cliffDuration = m.getParameter("cliffDuration", DEFAULT_CLIFF_DURATION);

  // Deploy the ATKLinearVestingStrategy contract
  const atkLinearVestingStrategy = m.contract("ATKLinearVestingStrategy", [
    vestingDuration,
    cliffDuration,
  ]);

  return {
    atkLinearVestingStrategy,
  };
});
