import type { orpc } from "@/orpc/orpc-client";

type OrpcUtils = typeof orpc;

let orpcInstance: OrpcUtils | null = null;

export function setRouterOrpc(instance: OrpcUtils) {
  orpcInstance = instance;
}

export function getRouterOrpc(): OrpcUtils {
  if (!orpcInstance) {
    throw new Error("ORPC client is not registered");
  }
  return orpcInstance;
}
