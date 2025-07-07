import { depositCreate } from "@/orpc/routes/token/routes/deposit/deposit.create";
import { factoryCreate } from "@/orpc/routes/token/routes/factory.create";
import { factoryList } from "@/orpc/routes/token/routes/factory.list";
import { factoryRead } from "@/orpc/routes/token/routes/factory.read";
import { create } from "@/orpc/routes/token/routes/token.create";
import { list } from "@/orpc/routes/token/routes/token.list";
import { mint } from "@/orpc/routes/token/routes/token.mint";
import { read } from "@/orpc/routes/token/routes/token.read";

const routes = {
  create,
  depositCreate,
  factoryCreate,
  factoryList,
  factoryRead,
  list,
  read,
  mint,
};

export default routes;
