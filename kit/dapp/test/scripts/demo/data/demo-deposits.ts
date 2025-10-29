import type { DemoAsset } from "@test/scripts/demo/data/demo-assets";

type DemoDeposit = DemoAsset & {
  isDenominationToken: boolean;
};

export const DEPOSITS = [] satisfies DemoDeposit[];
