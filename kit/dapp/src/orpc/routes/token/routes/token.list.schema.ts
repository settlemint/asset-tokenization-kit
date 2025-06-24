import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import { z } from "zod/v4";

export const TokenListSchema = z.array(TokenSchema);
