import { implement } from "@orpc/server";
import type { Context } from "../context";
import { contract } from "../contract";

export const br = implement(contract).$context<Context>();
