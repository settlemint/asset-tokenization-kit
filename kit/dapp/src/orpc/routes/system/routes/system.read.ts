import { systemRouter } from "@/orpc/procedures/system.router";

export const read = systemRouter.system.read.handler(
  ({ context: { system } }) => {
    return system;
  }
);
