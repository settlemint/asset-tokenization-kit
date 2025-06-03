import { FindSchema } from "@/lib/orpc/routes/common/find.schema";
import { ListSchema } from "@/lib/orpc/routes/common/list.schema";
import { PlanetSchema } from "@/lib/orpc/routes/planet/planet.schema";
import { oc } from "@orpc/contract";
import { z } from "zod/v4";

const create = oc
  .route({ method: "POST", path: "/planets" })
  .input(PlanetSchema.omit({ id: true }))
  .output(PlanetSchema);

const find = oc
  .route({ method: "GET", path: "/planets/{id}" })
  .input(FindSchema)
  .output(PlanetSchema);

const list = oc
  .route({ method: "GET", path: "/planets" })
  .input(ListSchema)
  .output(z.array(PlanetSchema));

export const planetContract = {
  list,
  find,
  create,
};
