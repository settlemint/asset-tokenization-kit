"server only";

import { headers } from "next/headers";

(globalThis as unknown as { $headers: () => Promise<Headers> }).$headers =
  headers;
