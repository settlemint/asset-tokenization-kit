import type { Context } from "@/lib/orpc/routes/context/context";
import { contract } from "@/lib/orpc/routes/contract";
import { implement } from "@orpc/server";

export const pr = implement(contract).$context<Context>();
