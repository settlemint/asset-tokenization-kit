import { create } from "./routes/planet.create";
import { find } from "./routes/planet.find";
import { list } from "./routes/planet.list";

const routes = {
  list,
  find,
  create,
};

export default routes;
