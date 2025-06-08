import { ListSchema } from "@/lib/orpc/routes/common/list.schema";
import { ac } from "@/lib/orpc/routes/procedures/auth.contract";
import { z } from "zod";
import { SystemSchema } from "./schemas/system.schema";

const list = ac
  .route({
    method: "GET",
    path: "/systems",
    description: "List the SMART systems",
    successDescription: "List of SMART systems",
    tags: ["system"],
  })
  .input(ListSchema) // Standard list query parameters (pagination, filters, etc.)
  .output(z.array(SystemSchema)); // Return array of planet objects

export const systemContract = {
  list,
};
